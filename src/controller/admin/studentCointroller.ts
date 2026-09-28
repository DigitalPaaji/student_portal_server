



import type { NextFunction, Request, Response } from "express";
import bcrypt  from "bcryptjs"
import { StudentModel } from "../../models/studentModel";
import { emailQueue } from "../../queues/emailQueue";

export const createStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      fullname,
      email,
      password,
      phone,subjects,
      studentId,
    } = req.body;

    const admin = req.admin;

  
    if (!admin?._id) {
      return res.status(401).json({ 
        success: false,
        message: "admin not authenticated",
      });
    }

    // Required fields
    if (!fullname || !email || !password || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Fullname, email, password and studentId are required",
      });
    }

    // Check existing student
    const existingStudent = await StudentModel.findOne({
      $or: [
        { email: email.toLowerCase() },
        { studentId },
      ],
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message:
          existingStudent.email === email.toLowerCase()
            ? "Email already exists"
            : "Student ID already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await StudentModel.create({
      fullname,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      studentId,
      subjects,
      createBy: admin._id,
      createByModel: "superadmin",
    });

 
    await emailQueue.add("sendWelcomeEmail", {
      targetEmail: email.toLowerCase(),
      tempPassword: password,
      studentId
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
    
    });
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req:Request,res:Response,next:NextFunction)=>{
  try {
    const students = await StudentModel.find() .select("email phone fullname isActive profileImage studentId status")
      .sort({ createdAt: -1 });
return res.status(200).json({success:true,students})
  } catch (error) {
    next(error)
  }
}

export const ToggleStudent = async( req: Request,res: Response,next:NextFunction)=>{
try {
  const StudentID = req.params.id;

   const student = await StudentModel.findById(StudentID);
   if(!student){
    return res.status(404).json({success:false,message:"student not Found"})
   }
    
   student.isActive = !student?.isActive 
 await student.save()

return res.status(200).json({success:true,message:"student Updated"})
} catch (error) {
  next(error)
}
}