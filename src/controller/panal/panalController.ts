import type { NextFunction, Request, Response } from "express";
import StudentLead from "../../models/LeadModel";
import Teacher from "../../models/teachermodel";
import XLSX from "xlsx";
import fs from "fs";


export const createLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    

    

    const {
      name,
      father,
      mother,
      dob,
      marital,
      gender,
      phone,
      guardianphone,
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
      demo,
      converted,
    } = req.body;

    // Required fields
    if (!name || !phone) {
      res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
      return;
    }

    if (demo) {
      demo.status = "active";
    }

    const lead = await StudentLead.create({
      name: name.trim(),

      father: father?.trim(),
      mother: mother?.trim(),

      dob: dob || null,

      marital: marital || "single",
      gender: gender || "male",

      phone: phone.trim(),
      guardianPhone: guardianphone.trim(),

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
      demo,
     
    });

    if (demo) {
      const teacher = await Teacher.findById(demo.assignto);
      if (!teacher) {
        res.status(200).json({
          success: true,
          message: "Lead created successfully",
          lead,
        });
        return;
      }
      teacher.demos.push(lead._id);

      await teacher.save();
    }

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
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
    // const { leadaccess = [] } = req.admin;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = limit * (page - 1);

    const status = req.query.status || "";
    const source = req.query.source || "";
    const search = req.query.search || "";
    const todaydate  = req.query.date  || "";

    // Map lead access permissions to database statuses
    const accessStatusMap: Record<string, string> = {
      newlead: "NEW",
      demolead: "DEMO",
      demodonelead: "DEMODONE",
      activelead: "ACTIVE",
      inactivelead: "INACTIVE",
      convertedlead: "CONVERTED",
      notinterestedlead: "NOT_INTERESTED",
    };

 

    const filters: any = {};

    if (source) {
      filters.source = source;
    }

    if (status) {
      filters.status = status;
    }

    if (search) {
      filters.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    if (todaydate === "today") {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      filters.createdAt = {
        $gte: startOfToday,
        $lt: startOfTomorrow,
      };
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

export const getLeadsStatusCounsta =async( req: Request,res: Response,next: NextFunction)=>{
try {

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);
const startOfTomorrow = new Date(startOfToday);
startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

const statuses = [
  "NEW",
  "COUNSELING",
  "DEMO",
  "DEMODONE",
  "CONVERTED",
  "ACTIVE",
  "INACTIVE",
  "NOT_INTERESTED",
];

  const [NEW,COUNSELING,DEMO,DEMODONE,CONVERTED,ACTIVE,INACTIVE,NOT_INTERESTED]= await  Promise.all([
     StudentLead.countDocuments({status:"NEW"}),
     StudentLead.countDocuments({status:"COUNSELING"}),
     StudentLead.countDocuments({status:"DEMO"}),
     StudentLead.countDocuments({status:"DEMODONE"}),
     StudentLead.countDocuments({status:"CONVERTED"}),
     StudentLead.countDocuments({status:"ACTIVE"}),
     StudentLead.countDocuments({status:"INACTIVE"}),
     StudentLead.countDocuments({status:"NOT_INTERESTED"}),

  ])

  const [NEWToday,COUNSELINGToday,DEMOToday,DEMODONEToday,CONVERTEDToday,ACTIVEToday,INACTIVEToday,NOT_INTERESTEDToday]= await Promise.all([
  StudentLead.countDocuments({status:"NEW", updatedAt: { $gte: startOfToday, $lt: startOfTomorrow },}),
     StudentLead.countDocuments({status:"COUNSELING", updatedAt: { $gte: startOfToday, $lt: startOfTomorrow }}),
     StudentLead.countDocuments({status:"DEMO", updatedAt: { $gte: startOfToday, $lt: startOfTomorrow }}),
     StudentLead.countDocuments({status:"DEMODONE", updatedAt: { $gte: startOfToday, $lt: startOfTomorrow }}),
     StudentLead.countDocuments({status:"CONVERTED", updatedAt: { $gte: startOfToday, $lt: startOfTomorrow }}),
     StudentLead.countDocuments({status:"ACTIVE", updatedAt: { $gte: startOfToday, $lt: startOfTomorrow }}),
     StudentLead.countDocuments({status:"INACTIVE", updatedAt: { $gte: startOfToday, $lt: startOfTomorrow }}),
     StudentLead.countDocuments({status:"NOT_INTERESTED", updatedAt: { $gte: startOfToday, $lt: startOfTomorrow }}),

  ])




const [WEBSITE,FACEBOOK,INSTAGRAM,GOOGLE,WHATSAPP,REFERRAL,CALL,WALK_IN,OTHER] = await Promise.all([
  StudentLead.countDocuments({source:"WEBSITE"}), 
  StudentLead.countDocuments({source:"FACEBOOK"}), 
  StudentLead.countDocuments({source:"INSTAGRAM"}), 
  StudentLead.countDocuments({source:"GOOGLE"}), 
  StudentLead.countDocuments({source:"WHATSAPP"}), 
  StudentLead.countDocuments({source:"REFERRAL"}), 
  StudentLead.countDocuments({source:"CALL"}), 
  StudentLead.countDocuments({source:"WALK_IN"}), 
  StudentLead.countDocuments({source:"OTHER"}), 
])


return res.status(200).json({success:true,leadStauts:{NEW,COUNSELING,DEMO,DEMODONE,CONVERTED,ACTIVE,INACTIVE,NOT_INTERESTED},
  todayStatus:{NEW:NEWToday,COUNSELING:COUNSELINGToday,DEMO:DEMOToday,DEMODONE:DEMODONEToday,CONVERTED:CONVERTEDToday,ACTIVE:ACTIVEToday,INACTIVE:INACTIVEToday,NOT_INTERESTED:NOT_INTERESTEDToday}
  ,leadsource:{WEBSITE,FACEBOOK,INSTAGRAM,GOOGLE,WHATSAPP,REFERRAL,CALL,WALK_IN,OTHER}})

} catch (error) {
  next(error)
}
}



export const getSingleLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
 
    const lead = await StudentLead.findById(id).populate("createdBy","name email");

    return res.status(200).json({ lead });
  } catch (error) {
    next(error);
  }
};



export const getTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const teachers = await Teacher.find().select("fullname email");

    return res.status(200).json({ teachers });
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



export const importLeadsFromExcel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let filePath = "";

  try {
    const { access,leadaccess, _id } = req.admin;

    // CRM permission
    if (!leadaccess.includes("createlead")) {
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

    const errors: {
      row: number;
      field: string;
      message: string;
    }[] = [];

    const phonesInFile = new Set<string>();

    // Process Excel rows
    for (let i = 0; i < rawRows.length; i++) {
      const row = normalizeRow(rawRows[i]);
      const excelRow = i + 2;

      const rowErrors: {
        row: number;
        field: string;
        message: string;
      }[] = [];

      const addError = (field: string, message: string) =>
        rowErrors.push({
          row: excelRow,
          field,
          message,
        });

      const name = str(row.name);
      const phone = cleanPhone(row.phone);
      const guardianPhone = cleanPhone(row.guardianphone);
      const email = str(row.email)?.toLowerCase();

      // Required: Name
      if (!name) {
        addError("name", "Name is required");
      }

      // Required: Phone
      if (!phone) {
        addError("phone", "Phone is required");
      } else if (!/^[0-9]{10}$/.test(phone)) {
        addError("phone", "Phone must contain exactly 10 digits");
      } else if (phonesInFile.has(phone)) {
        addError("phone", "Duplicate phone number in Excel");
      }

      // Required: Guardian phone
      if (!guardianPhone) {
        addError("guardianphone", "Guardian phone is required");
      } else if (!/^[0-9]{10}$/.test(guardianPhone)) {
        addError(
          "guardianphone",
          "Guardian phone must contain exactly 10 digits",
        );
      }

      // Optional email
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        addError("email", "Invalid email");
      }

      // Optional DOB
      const dobValue = str(row.dob);
      const dob = dobValue ? parseDate(row.dob) : null;

      if (dobValue && dob === null) {
        addError("dob", "Invalid date of birth");
      }

      // Optional enums with defaults
      const marital = parseEnum(
        row.marital ?? row.martial,
        MARITAL,
        "single",
        false,
      );

      const gender = parseEnum(row.gender, GENDERS, "male", false);

      const source = parseEnum(row.source, SOURCES, "OTHER", true);

      const status = parseEnum(row.status, STATUSES, "NEW", true);

      const priority = parseEnum(row.priority, PRIORITIES, "MEDIUM", true);

      const preferredMode = parseEnum(
        row.preferredmode,
        MODES,
        "offline",
        false,
      );

      // Validate enum values only when provided
      if (str(row.marital ?? row.martial) && !marital) {
        addError("marital", `Must be one of: ${MARITAL.join(", ")}`);
      }

      if (str(row.gender) && !gender) {
        addError("gender", `Must be one of: ${GENDERS.join(", ")}`);
      }

      if (str(row.source) && !source) {
        addError("source", `Must be one of: ${SOURCES.join(", ")}`);
      }

      if (str(row.status) && !status) {
        addError("status", `Must be one of: ${STATUSES.join(", ")}`);
      }

      if (str(row.priority) && !priority) {
        addError("priority", `Must be one of: ${PRIORITIES.join(", ")}`);
      }

      if (str(row.preferredmode) && !preferredMode) {
        addError("preferredmode", `Must be one of: ${MODES.join(", ")}`);
      }

      // Skip invalid rows
      if (rowErrors.length) {
        errors.push(...rowErrors);
        continue;
      }

      phonesInFile.add(phone);

      validLeads.push({
        name,

        father: str(row.father),
        mother: str(row.mother),
        dob: dob ?? undefined,

        marital,
        gender,

        phone,
        guardianPhone,
        email: email || undefined,

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

        _excelRow: excelRow,
      });
    }

    // No valid rows
    if (!validLeads.length) {
      errors.sort((a, b) => a.row - b.row);

      return res.status(400).json({
        success: false,
        message: "No valid leads found",
        totalRows: rawRows.length,
        imported: 0,
        failed: errors.length,
        errors,
      });
    }

    // Check existing phone numbers in database
    const existingLeads = await StudentLead.find({
      phone: {
        $in: validLeads.map((lead) => lead.phone),
      },
    }).select("phone");

    const existingPhones = new Set(existingLeads.map((lead) => lead.phone));

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

    let importedCount = 0;

    if (newLeads.length) {
      try {
        const inserted = await StudentLead.insertMany(newLeads, {
          ordered: false,
        });

        importedCount = inserted.length;
      } catch (error: any) {
        // Handle partial insertion errors
        if (error.insertedDocs) {
          importedCount = error.insertedDocs.length;
        }

        // If no documents were inserted, rethrow
        if (!importedCount) {
          throw error;
        }
      }
    }

    // Sort errors by Excel row
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

