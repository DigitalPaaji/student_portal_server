import type { NextFunction, Request,Response } from "express";
import JWT from  "jsonwebtoken"
import { StudentModel } from "../models/studentModel";

export  const  verifyStudent=async (req:Request,res:Response,next:NextFunction)=>{
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
  if(role !="student"){
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
  }

  const student = await StudentModel.findById(decoded.id).select("-password")

if(!student){
    return res.status(401).json({
        success: false,
        message: "student account not found",
      });
}
 if(!student.isActive){
return res.status(401).json({
    success:false,message:"student InActive Contact Admin"
})
 }

 
 (req as any).student = student;

   next();
} catch (error) {
      console.error("student error:", error);

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