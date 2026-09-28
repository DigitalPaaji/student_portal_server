import type { NextFunction, Request,Response } from "express";
import JWT from  "jsonwebtoken"
import Teacher from "../models/teachermodel";

export  const  verifyTeacher=async (req:Request,res:Response,next:NextFunction)=>{
try {
     const token = req.cookies?.super_admin;

       if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

    
 const decoded = JWT.verify(
      token,
      process.env.JWT_SECRET as string
    ) as any;


   if (!decoded.id  || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }
    const role = decoded.role;
  if(role !="teacher"){
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
  }

  const teacher = await Teacher.findById(decoded.id).select("-password")

if(!teacher){
    return res.status(401).json({
        success: false,
        message: "Teacher account not found",
      });
}
 if(!teacher.isActive){
return res.status(401).json({
    success:false,message:"Teacher InActive Contact Admin"
})
 }

 
 (req as any).teacher = teacher;

   next();
} catch (error) {
      console.error("teacher error:", error);

    if (error instanceof JWT.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired",
      });
    }

    if (error instanceof JWT.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
}
}