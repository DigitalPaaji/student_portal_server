import type { NextFunction, Request,Response } from "express";
import JWT from  "jsonwebtoken"
import SuperAdmin from "../models/SuperAdminfull";

export  const  verifySuperAdmin=async (req:Request,res:Response,next:NextFunction)=>{
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
      process.env.JWT_SECRET as string) as any;


   if (!decoded.id  || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      }); }
    const role = decoded.role;
  if(role !="superadmin"){
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      }

  const admin = await SuperAdmin.findById(decoded.id).select("-password")

if(!admin){
    return res.status(401).json({
        success: false,
        message: "Admin account not found",
      });
    }
 (req as any).superadmin = admin;
  next();
} catch (error) {
      console.error("verifyAdmin error:", error);

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