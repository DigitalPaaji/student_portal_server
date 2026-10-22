
import type { NextFunction, Request, Response } from "express";
import bcrypt  from "bcryptjs"
import { StudentModel } from "../../models/studentModel";
import { emailQueue } from "../../queues/emailQueue";
import SuperAdmin from "../../models/SuperAdminfull";


export const createStudentsCrm = async (
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
      coursefees,
      installments
    } = req.body;

    // const admin = req.admin;
const admin = await SuperAdmin.findOne();
  
    if (!admin?._id) {
      return res.status(401).json({ 
        success: false,
        message: "admin not authenticated",
      });
    }

    
    if (!fullname || !email || !password || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Fullname, email, password and studentId are required",
      });
    }

   
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

    const  submitedfees= Number(installments?.registration?.amount ?? 0) +Number(installments?.first_installment?.amount ?? 0 )+Number(installments?.second_installment?.amount ?? 0 )
    +Number(installments?.third_installment?.amount ?? 0 )

    const hashedPassword = await bcrypt.hash(password, 10);


    await StudentModel.create({
      fullname,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      studentId,
      subjects,
      coursefees:Number(coursefees),
      installments,
      submitedfees,
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

export const getStudentsCrm = async (req:Request,res:Response,next:NextFunction)=>{
  try {


    const students = await StudentModel.find() .select("email phone fullname coursefees submitedfees  isActive profileImage studentId status")
      .sort({ createdAt: -1 });
return res.status(200).json({success:true,students})
  } catch (error) {
    next(error)
  }
}

export const ToggleStudentCrm = async( req: Request,res: Response,next:NextFunction)=>{
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
