import type { NextFunction, Request, Response } from "express";
import bcrypt  from "bcryptjs"
import { StudentModel } from "../../models/studentModel";
import { emailQueue } from "../../queues/emailQueue";
import Module from "module";
import { ModuleModel } from "../../models/ModuleModel";
import { Question } from "../../models/Question";

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

    const teacher = req.teacher;

    // Check teacher
    if (!teacher?._id) {
      return res.status(401).json({
        success: false,
        message: "Teacher not authenticated",
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
      createBy: teacher._id,
      createByModel: "Teacher",
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


export const getAnswers = async(req:Request,res:Response,next:NextFunction)=>{
  try{
const moduleId = req.params.id
const fullmodule = await ModuleModel.findById(moduleId).populate({path:"answerSubmite.user",select:"studentId fullname email "})
if(!fullmodule){
  return res.status(401).json({success:false,message:"Module Not found"})
}

const questions = await Question.find({moduleId})


return res.status(200).json({success:true,fullmodule:fullmodule.answerSubmite,questions})

  }
  catch(error){

  }
}

export const UpdateAnswers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const action = req.params.action;
    const moduleId = req.params.id;

    const { recordid, recorduser } = req.body;

    const moduleget = await ModuleModel.findById(moduleId);

    if (!moduleget) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    if (action === "pass") {
      moduleget.answerSubmite = moduleget.answerSubmite.map((itm) =>
        itm.user.toString() === recorduser.toString()
          ? { ...itm, pass: true }
          : itm
      );
    } else if (action === "retry") {
       moduleget.answerSubmite = moduleget.answerSubmite.filter(
        (itm) => String(itm.user) !== String(recorduser)
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    await moduleget.save();

    return res.status(200).json({
      success: true,
      message:
        action === "pass"
          ? "Answer marked as passed"
          : "Answer marked for retry",
   
      moduleget,
    
    });
  } catch (error) {
    next(error);
  }
};
