import  type { NextFunction, Request, Response } from "express";
import Teacher from "../../models/teachermodel";
import bcrypt  from "bcryptjs"
import JWT from "jsonwebtoken"
import { Subject } from "../../models/SubjectModel";

export  const loginTeacher= async (req:Request,res:Response,next:NextFunction)=>{
    try {
     const {email,password}=req.body;
     
     if(!email || !password){
       return res.status(404).json({success:false,message:"email and password required"})
     }

   const findTeacher = await Teacher.findOne({email:email.trim().toLowerCase()}).select("+password");
      if(!findTeacher){return res.status(200).json({success:false,message:"Invalid email and password"})}
      

      const compaier_password= await bcrypt.compare(password,findTeacher.password);
      if(!compaier_password){
        return res.status(404).json({success:false,message:"Invalid email and password"})
      }

 if(!findTeacher.isActive){
return res.status(401).json({
    success:false,message:"Teacher InActive Contact Admin"
})
 }

const token = await JWT.sign({id:findTeacher._id ,role: "teacher"},  process.env.JWT_SECRET as string,{
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
      message: "Teacher LogIn successfully",
      
    });

        
    } catch (error) {
        next(error)
    }
}


export const getTeacher = async(req:Request,res:Response,next:NextFunction)=>{
try {
   
const teacher  = req.teacher
const subjects = await Subject.find()
return res.status(200).json({success:true,teacher,subjects})

} catch (error) {
  next(error) 
}
}





export const logoutTeacher = async(req:Request,res:Response,next:NextFunction)=>{
try {
   const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("super_admin", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Super Admin logged out successfully",
    });
} catch (error) {
  next(error)
}

}
