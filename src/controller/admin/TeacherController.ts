



import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

import Teacher from "../../models/teachermodel";
import { emailQueue } from "../../queues/emailQueue";
import { TeacherAttendance } from "../../models/TeacherAtendence";


export const signupTeacher = async (req: Request,res: Response,next:NextFunction) => {
  try {
    const {fullname,email,password,phone,designation,specialization,bio,qualification,experience,subjects,
    } = req.body;
      
    // Validate required fields
    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Fullname, email and password are required",
      });
    }

    // Check existing teacher
    const existingTeacher = await Teacher.findOne({
      email: email.toLowerCase(),
    });

    if (existingTeacher) {
      return res.status(409).json({
        success: false,
        message: "Teacher already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create teacher
    const teacher = await Teacher.create({
      fullname,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      designation,
      specialization,
      bio,
      qualification,
      experience,
      subjects,
    });
await emailQueue.add("sendWelcomeEmail", {
  targetEmail: email.toLowerCase(),
  tempPassword: password,
});
    return res.status(201).json({
      success: true,
      message: "Teacher registered successfully",
     
    });
  } catch (error) {
    console.error("Signup Teacher Error:", error);
   next(error)
  }
};


export const getAllTeachers = async (
  req: Request,
  res: Response,
  next:NextFunction
) => {
  try {
    const teachers = await Teacher.find()
      .select("email experience fullname isActive profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    console.error("Get All Teachers Error:", error);

    next(error)
  }
};


export const ToggleTeacher = async( req: Request,res: Response,next:NextFunction)=>{
try {
  const teacherID = req.params.id;

   const teacher = await Teacher.findById(teacherID);
   if(!teacher){
    return res.status(404).json({success:false,message:"Teacher not Found"})
   }

   teacher.isActive = !teacher.isActive 
 await teacher.save()

return res.status(200).json({success:true,message:"Teacher Updated"})
} catch (error) {
  next(error)
}
}



export const getTeacher = async(req: Request,res: Response,next:NextFunction)=>{
try {

  
  const TeacherId = await req.params.id;
  const teacher = await Teacher.findById(TeacherId);
  if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

        const {
      status = "ALL",
      month,
      year,
    } = req.query;
   const now = new Date();

    // Default current month/year
    const selectedMonth = month
      ? Number(month)
      : now.getMonth() + 1;

    const selectedYear = year
      ? Number(year)
      : now.getFullYear();

    // Month range
    // month is 1-12
    const startDate = new Date(
      selectedYear,
      selectedMonth - 1,
      1
    );

    const endDate = new Date(
      selectedYear,
      selectedMonth,
      1
    );

    // -----------------------------
    // Build Attendance Query
    // -----------------------------

    const attendanceQuery: any = {
      teacherId: TeacherId,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    };

    // Status filter
    if (
      status !== "ALL" &&
      [
        "PRESENT",
        "ABSENT",
        "LATE",
        "HALF_DAY",
        "LEAVE",
      ].includes(String(status))
    ) {
      attendanceQuery.status = status;
    }

    // -----------------------------
    // Get Attendance
    // -----------------------------

    const attendance = await TeacherAttendance.find(
      attendanceQuery
    ).sort({
      date: -1,
    });

    // -----------------------------
    // Attendance Summary
    // -----------------------------

    const summary = {
      total: attendance.length,

      present: attendance.filter(
        (item) => item.status === "PRESENT"
      ).length,

      absent: attendance.filter(
        (item) => item.status === "ABSENT"
      ).length,

      late: attendance.filter(
        (item) => item.status === "LATE"
      ).length,

      halfDay: attendance.filter(
        (item) => item.status === "HALF_DAY"
      ).length,

      leave: attendance.filter(
        (item) => item.status === "LEAVE"
      ).length,
    };

    return res.status(200).json({
      success: true,

      teacher,

      attendance,

      filter: {
        status,
        month: selectedMonth,
        year: selectedYear,
      },

      summary,
    });

} catch (error) {
  next(error)
}
}


export const createTeacherAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { teacherId, date, status, remarks } = req.body;

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const attendance = await TeacherAttendance.create({
      teacherId,
      date: new Date(date),
      status,
      remarks,
    });

    return res.status(201).json({
      success: true,
      message: "Teacher attendance created successfully",
      attendance,
    });
  } catch (error: any) {
  
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Attendance already exists for this teacher on this date",
      });
    }

    next(error);
  }
};