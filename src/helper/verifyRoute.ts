import type { Request,Response } from "express";
import JWT from  "jsonwebtoken"

export  const  verifyAuth=async (req:Request,res:Response)=>{
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
 



return res.status(200).json({success:true,role})
} catch (error) {
    
}
}