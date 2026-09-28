import  type { NextFunction, Request, Response } from "express";
import Teacher from "../../models/teachermodel";
import bcrypt  from "bcryptjs"
import JWT from "jsonwebtoken"
import { StudentModel } from "../../models/studentModel";
import { Subject } from "../../models/SubjectModel";
import { ModuleModel } from "../../models/ModuleModel";
import { Question } from "../../models/Question";
import mongoose from "mongoose";

export  const loginStudent= async (req:Request,res:Response,next:NextFunction)=>{
    try {
     const {email,password}=req.body;
     
     if(!email || !password){
       return res.status(404).json({success:false,message:"email and password required"})
     }

   const findStudent = await StudentModel.findOne({email:email.trim().toLowerCase()}).select("+password");

   if(!findStudent){return res.status(200).json({success:false,message:"Invalid email and password"})}
      

      const compaier_password= await bcrypt.compare(password,findStudent.password);
      if(!compaier_password){
        return res.status(404).json({success:false,message:"Invalid email and password"})
      }

 if(!findStudent.isActive){
return res.status(401).json({
    success:false,message:"Student InActive Contact Admin"
})
 }

const token = await JWT.sign({id:findStudent._id ,role: "student"},  process.env.JWT_SECRET as string,{
    expiresIn:"60d"
})

const isProduction = process.env.NODE_ENV === "production";
   res.cookie("super_admin",token, {
     httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
})

 res.status(200).json({
      success: true,
      message: "Student LogIn successfully",
      
    });

        
    } catch (error) {
        next(error)
    }
}


export const getStudent = async(req:Request,res:Response,next:NextFunction)=>{
try {
   
const student  = req.student

const fullStudent = await StudentModel.findById(student?._id).select("-password -createBy -createByModel").populate("subjects","title ")

return res.status(200).json({success:true,student:fullStudent})

} catch (error) {
  next(error) 
}
}


export const getSubjectData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subjectId = req.params.id;

    const subject = await Subject.findById(subjectId)
      .populate("completemodule");


      
      if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }
    
    const modulesWithQuestions = await Promise.all(
      (subject.completemodule || []).filter(item=>item).map(async (item: any) => {
        const questions = await Question.find({
          moduleId: item._id,
        });
        
        return {
          ...item.toObject(),
          questions,
        };
      })
    );
    
   
const fullSubject= {
...subject.toObject(),
        completemodule: modulesWithQuestions,
}


    return res.status(200).json({
      success: true,
      subject:fullSubject,
    });
  } catch (error) {
    next(error);
  }
};

export const SubmitQuize= async(req:Request,res:Response,next:NextFunction)=>{
  try {
    
  const student = req.student ;

    const { totalmarkes, awneswes } = req.body;
    const moduleId = req.params.id;

    // Check student
    if (!student?._id || !mongoose.Types.ObjectId.isValid(student._id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid student",
      });
    }

    // Check module ID
    if (!mongoose.Types.ObjectId.isValid(moduleId as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    // Validate marks
    if (totalmarkes === undefined || awneswes === undefined) {
      return res.status(400).json({
        success: false,
        message: "totalmarkes and awneswes are required",
      });
    }

    const module = await ModuleModel.findById(moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // Add quiz submission
    module.answerSubmite.push({
      totalmarkes: Number(totalmarkes),
      awneswes: awneswes,
      user: student._id,
      pass:false
    });

    await module.save();

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        moduleId: module._id,
        totalmarkes: Number(totalmarkes),
        awneswes: Number(awneswes),
      },
    });






  } catch (error) {
    next(error)
  }

}
