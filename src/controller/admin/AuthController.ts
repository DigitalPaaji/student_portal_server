import type { NextFunction, Request, Response } from "express";
import SuperAdmin from "../../models/superAdminModel";
import bcrypt from "bcryptjs";
import redisClient from "../../helper/redisServer";
import JWT from "jsonwebtoken"
import { sendOtpMail } from "../../helper/sendOtpMail";
import { emailQueue } from "../../queues/emailQueue";
  

export const createSuperAdmin = async(req:Request,res:Response,next:NextFunction)=>{
    try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const access = req.body.access || [ ]
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
      return;
    }

    if (name.length < 2 || name.length > 100) {
      res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters",
      });
      return;
    }

 const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
      return;
    }

    if (password.length < 6 || password.length > 25) {
      res.status(400).json({
        success: false,
        message: "Password must be between 6 and 25 characters",
      });
      return;
    }

const existingSuperAdmin = await SuperAdmin.findOne({email})
 if (existingSuperAdmin) {
      res.status(409).json({
        success: false,
        message: "Email already exists",
      });
      return;
    }

    const hashpass = await bcrypt.hash(password,10)

  const superAdmin = await SuperAdmin.create({ name,email,password:hashpass,access});

await emailQueue.add("sendWelcomeEmail", {
      targetEmail: email.toLowerCase(),
      tempPassword: password,
    });

    res.status(201).json({
      success: true,
      message: "Super Admin created successfully",
      superAdmin,
    });
    } catch (error) {
        next(error)
    }
}





export const getAllAdmin = async(req:Request,res:Response,next:NextFunction)=>{
try {

  const allAdmin = await SuperAdmin.find().select("-password");

  return res.status(200).json({success:true,admin:allAdmin})

} catch (error) {
  next(error)
}
}

export const loginSuperAdmin = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {email,password}=  req.body;
        if (!email || !password) { throw new Error("Email and password are required"); }
        const superAdmin = await SuperAdmin.findOne({email});
       

   if(!superAdmin){
   throw new Error("Invalid email or password")
  }

   const compairPassword = await bcrypt.compare(password,superAdmin.password)

   if(!compairPassword){
    throw new Error("Invalid email or password" );
   }



const token = await JWT.sign({id:superAdmin._id ,role: "admin"},  process.env.JWT_SECRET as string,{
    expiresIn:"60d"
})



    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = 111111


    //  await sendOtpMail(email, otp);

     await redisClient.set(`token:otp:${token}`, otp, {
      EX: 5 * 60,
      });


 return  res.status(200).json({success:true,message:"login success",token})


    } catch (error) {
        next(error)
    }

  }

export const verifyOtp = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {token,otp} = req.body
      if (!token || !otp) {
      throw new Error("Token and OTP are required");
    }  
     if (!/^\d{6}$/.test(otp)) {
      throw new Error("OTP must contain 6 digits");
    }
      const getOtp = await redisClient.get(`token:otp:${token}`)
       if(!getOtp){
      throw new Error(
        "OTP has expired or has already been used"
      );}

         if(getOtp != otp){
throw new Error("Invalid OTP");
} 


const isProduction = process.env.NODE_ENV === "production";
res.cookie("super_admin",token, {
     httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
})
await redisClient.del(`token:otp:${token}`);
     res.status(200).json({success: true,
         message: "OTP verified successfully",});


  } catch (error) {
        next(error)
    }

  }


export const logoutAdmin = async(req:Request,res:Response,next:NextFunction)=>{
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
      message: "Admin logged out successfully",
    });
} catch (error) {
  next(error)
}

}



export const getAdmin = async(req:Request,res:Response,next:NextFunction)=>{
try {
   
const admin  = req.admin
return res.status(200).json({success:true,admin})

} catch (error) {
  next(error) 
}
}

export const deleteAdmin = async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const  adminId = req.params.id;
    const admin = await SuperAdmin.findById(adminId);

if(!admin){
  return res.status(200).json({success:false,message:"Admin Not Found"})
}
await admin.deleteOne()

 return res.status(200).json({success:true,message:"Admin delete"})

  } catch (error) {
    next(error)
  }
}