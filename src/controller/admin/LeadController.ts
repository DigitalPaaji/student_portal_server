import type { NextFunction, Request, Response } from "express";
import StudentLead from "../../models/LeadModel";
import mongoose from "mongoose";
import XLSX from "xlsx";
import fs from "fs";

export const createLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { access, _id } = req.admin;

    // Check CRM access
    if (!access.includes("crm")) {
      res.status(401).json({
        success: false,
        message: "You don't have access",
      });
      return;
    }

    const {
      name,
      father,
      mother,
      dob,
      marital,
      gender,
      phone,
      guardianPhone,
      email,
      qualification,
      address,
      city,
      state,
      course,
      interestedCourse,
      source,
      status,
      priority,
      preferredMode,
      notes,
      converted,
    } = req.body;

    // Required fields
    if (!name || !phone || !email || !guardianPhone) {
      res.status(400).json({
        success: false,
        message: "Name, phone, email and guardian phone are required",
      });
      return;
    }

    // Create lead
    const lead = await StudentLead.create({
      name: name.trim(),

      father: father?.trim(),
      mother: mother?.trim(),

      dob: dob || null,

      marital: marital || "single",
      gender: gender || "male",

      phone: phone.trim(),
      guardianPhone: guardianPhone.trim(),

      email: email.trim().toLowerCase(),

      qualification: qualification?.trim(),

      address: address?.trim(),
      city: city?.trim(),
      state: state?.trim(),

      course: course?.trim(),
      interestedCourse: interestedCourse?.trim(),

      source: source || "OTHER",
      status: status || "NEW",
      priority: priority || "MEDIUM",

      preferredMode: preferredMode || "offline",

      notes: notes?.trim(),

      converted: converted ?? false,

      createdBy: _id,
    });

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead,
    });
  } catch (error) {
    next(error);
  }
};

const SOURCES = [
  "WEBSITE",
  "FACEBOOK",
  "INSTAGRAM",
  "GOOGLE",
  "WHATSAPP",
  "REFERRAL",
  "CALL",
  "WALK_IN",
  "OTHER",
];

const STATUSES = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "CONVERTED",
  "NOT_INTERESTED",
  "LOST",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const MARITAL = ["single", "married"];
const GENDERS = ["male", "female"];
const MODES = ["online", "offline"];

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */

// "Guardian Phone" / "guardian_phone" / "guardianPhone" -> "guardianphone"
const normalizeKey = (key: string) =>
  key
    .toString()
    .toLowerCase()
    .replace(/[\s_\-]/g, "");

const normalizeRow = (row: Record<string, any>) => {
  const out: Record<string, any> = {};
  for (const key of Object.keys(row)) {
    out[normalizeKey(key)] = row[key];
  }
  return out;
};

const str = (v: any): string | undefined => {
  const s = String(v ?? "").trim();
  return s ? s : undefined;
};

const cleanPhone = (v: any): string => {
  let digits = String(v ?? "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
};

const parseBoolean = (v: any): boolean => {
  if (typeof v === "boolean") return v;
  return ["true", "yes", "y", "1"].includes(
    String(v ?? "")
      .trim()
      .toLowerCase(),
  );
};

/**
 * Supports: Date objects, Excel serial numbers, DD/MM/YYYY, ISO strings.
 * Returns undefined if empty, null if invalid.
 */
const parseDate = (v: any): Date | null | undefined => {
  if (v === "" || v === null || v === undefined) return undefined;

  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;

  if (typeof v === "number") {
    const p = XLSX.SSF.parse_date_code(v);
    if (!p) return null;
    return new Date(Date.UTC(p.y, p.m - 1, p.d));
  }

  const s = String(v).trim();

  const dmy = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (dmy) {
    const d = new Date(Date.UTC(+dmy[3], +dmy[2] - 1, +dmy[1]));
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Validates a value against allowed enum list.
 * Empty value -> default. Invalid -> null.
 */
const parseEnum = <T extends string>(
  value: any,
  allowed: readonly T[],
  fallback: T,
  upper: boolean,
): T | null => {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;

  const normalized = upper
    ? (raw.toUpperCase().replace(/[\s\-]+/g, "_") as T)
    : (raw.toLowerCase() as T);

  return allowed.includes(normalized) ? normalized : null;
};

/* ---------------------------------- */
/* Controller                         */
/* ---------------------------------- */

export const importLeadsFromExcel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let filePath = "";

  try {
    const { access, _id } = req.admin;

    // CRM permission
    if (!access.includes("crm")) {
      return res.status(403).json({
        success: false,
        message: "You don't have CRM access",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    filePath = req.file.path;

    // cellDates -> real Date objects for date cells
    const workbook = XLSX.readFile(filePath, { cellDates: true });

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({
        success: false,
        message: "Excel sheet not found",
      });
    }

    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(
      workbook.Sheets[sheetName],
      { defval: "" },
    );

    if (!rawRows.length) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty",
      });
    }

    const validLeads: any[] = [];
    const errors: { row: number; field: string; message: string }[] = [];
    const phonesInFile = new Set<string>();

    /* ---------- Row processing ---------- */
    for (let i = 0; i < rawRows.length; i++) {
      const row = normalizeRow(rawRows[i]);
      const excelRow = i + 2; // header is row 1
      const rowErrors: { row: number; field: string; message: string }[] = [];

      const addError = (field: string, message: string) =>
        rowErrors.push({ row: excelRow, field, message });

      const name = str(row.name);
      const phone = cleanPhone(row.phone);
      const guardianPhone = cleanPhone(row.guardianphone);
      const email = str(row.email)?.toLowerCase();

      // Required
      if (!name) addError("name", "Name is required");

      if (!phone) addError("phone", "Phone is required");
      else if (!/^[0-9]{10}$/.test(phone))
        addError("phone", "Phone must contain exactly 10 digits");
      else if (phonesInFile.has(phone))
        addError("phone", "Duplicate phone number in Excel");

      if (!guardianPhone)
        addError("guardianphone", "Guardian phone is required");
      else if (!/^[0-9]{10}$/.test(guardianPhone))
        addError(
          "guardianphone",
          "Guardian phone must contain exactly 10 digits",
        );

      // Optional email
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        addError("email", "Invalid email");

      // DOB
      const dob = parseDate(row.dob);
      if (dob === null) addError("dob", "Invalid date of birth");

      // Enums (accept "martial" header as legacy alias for "marital")
      const marital = parseEnum(
        row.marital ?? row.martial,
        MARITAL,
        "single",
        false,
      );
      if (!marital)
        addError("marital", `Must be one of: ${MARITAL.join(", ")}`);

      const gender = parseEnum(row.gender, GENDERS, "male", false);
      if (!gender) addError("gender", `Must be one of: ${GENDERS.join(", ")}`);

      const source = parseEnum(row.source, SOURCES, "OTHER", true);
      if (!source) addError("source", `Must be one of: ${SOURCES.join(", ")}`);

      const status = parseEnum(row.status, STATUSES, "NEW", true);
      if (!status) addError("status", `Must be one of: ${STATUSES.join(", ")}`);

      const priority = parseEnum(row.priority, PRIORITIES, "MEDIUM", true);
      if (!priority)
        addError("priority", `Must be one of: ${PRIORITIES.join(", ")}`);

      const preferredMode = parseEnum(
        row.preferredmode,
        MODES,
        "offline",
        false,
      );
      if (!preferredMode)
        addError("preferredmode", `Must be one of: ${MODES.join(", ")}`);

      if (rowErrors.length) {
        errors.push(...rowErrors);
        continue;
      }

      phonesInFile.add(phone);

      validLeads.push({
        name,
        father: str(row.father),
        mother: str(row.mother),
        dob: dob ?? null,

        marital,
        gender,

        phone,
        guardianPhone,
        email,

        qualification: str(row.qualification),

        address: str(row.address),
        city: str(row.city),
        state: str(row.state),

        course: str(row.course),
        interestedCourse: str(row.interestedcourse),

        source,
        status,
        priority,
        preferredMode,

        notes: str(row.notes),

        converted: parseBoolean(row.converted) || status === "CONVERTED",

        createdBy: _id,
        _excelRow: excelRow, // temp, removed before insert
      });
    }

    if (!validLeads.length) {
      return res.status(400).json({
        success: false,
        message: "No valid leads found",
        totalRows: rawRows.length,
        imported: 0,
        failed: errors.length,
        errors,
      });
    }

    /* ---------- Check existing phones in DB ---------- */
    const existingLeads = await StudentLead.find({
      phone: { $in: validLeads.map((l) => l.phone) },
    }).select("phone");

    const existingPhones = new Set(existingLeads.map((l) => l.phone));

    const newLeads: any[] = [];

    for (const { _excelRow, ...lead } of validLeads) {
      if (existingPhones.has(lead.phone)) {
        errors.push({
          row: _excelRow,
          field: "phone",
          message: "Lead already exists",
        });
        continue;
      }
      newLeads.push(lead);
    }

    /* ---------- Insert ---------- */
    let importedCount = 0;

    if (newLeads.length) {
      const inserted = await StudentLead.insertMany(newLeads, {
        ordered: false,
      });
      importedCount = inserted.length;
    }

    // Keep errors sorted by row
    errors.sort((a, b) => a.row - b.row);

    if (importedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No new leads were imported",
        totalRows: rawRows.length,
        imported: 0,
        failed: errors.length,
        errors,
      });
    }

    return res.status(201).json({
      success: true,
      message:
        errors.length > 0
          ? "Leads imported with some errors"
          : "Leads imported successfully",
      totalRows: rawRows.length,
      imported: importedCount,
      failed: errors.length,
      errors,
    });
  } catch (error) {
    next(error);
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

export const EditLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { access } = req.admin;

    // Check CRM access
    if (!access.includes("crm")) {
      res.status(401).json({
        success: false,
        message: "You don't have access",
      });
      return;
    }

    const { id } = req.params;

    const {
      name,
      father,
      mother,
      dob,
      marital,
      gender,
      phone,
      guardianPhone,
      email,
      qualification,
      address,
      city,
      state,
      course,
      interestedCourse,
      source,
      status,
      priority,
      preferredMode,
      notes,
      converted,
    } = req.body;

    // Required fields
    if (!name || !phone || !email || !guardianPhone) {
      res.status(400).json({
        success: false,
        message: "Name, phone, email and guardian phone are required",
      });
      return;
    }

    // Find lead
    const lead = await StudentLead.findById(id);

    if (!lead) {
      res.status(404).json({
        success: false,
        message: "Student lead not found",
      });
      return;
    }

    // Update fields
    lead.name = name.trim();

    lead.father = father?.trim();
    lead.mother = mother?.trim();

    lead.dob = dob || null;

    lead.marital = marital || "single";
    lead.gender = gender || "male";

    lead.phone = phone.trim();
    lead.guardianPhone = guardianPhone.trim();

    lead.email = email.trim().toLowerCase();

    lead.qualification = qualification?.trim();

    lead.address = address?.trim();
    lead.city = city?.trim();
    lead.state = state?.trim();

    lead.course = course?.trim();
    lead.interestedCourse = interestedCourse?.trim();

    lead.source = source || "OTHER";
    lead.status = status || "NEW";
    lead.priority = priority || "MEDIUM";

    lead.preferredMode = preferredMode || "offline";

    lead.notes = notes?.trim();

    lead.converted = converted ?? false;

    await lead.save();

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      lead,
    });
  } catch (error) {
    next(error);
  }
};

export const GetAllLeads = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = limit * (page - 1);

    const status = req.query.status || "";
    const source = req.query.source || "";

    const filters: any = {};

    if (status) {
      filters.status = status;
    }

    if (source) {
      filters.source = source;
    }

    const [leads, totalCount] = await Promise.all([
      StudentLead.find(filters)
        .skip(skip)
        .limit(limit)
        .select("name phone email city source status priority createdAt")
        .sort({ createdAt: -1 })
        .lean(),

      StudentLead.countDocuments(filters),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      data: {
        leads,
        pagination: {
          currentPage: page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const lead = await StudentLead.findById(id);

    return res.status(200).json({ lead });
  } catch (error) {
    next(error);
  }
};



export const deleadLead= async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
try {
    const {id} = req.params;
 await StudentLead.findByIdAndDelete(id)

return res.status(200).json({success:true,message:"delete"})

} catch (error) {
    next(error)
}
}