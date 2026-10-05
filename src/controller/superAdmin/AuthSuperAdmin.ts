import type { NextFunction, Request, Response } from "express";
import SuperAdmin from "../../models/SuperAdminfull";
import bcrypt from "bcryptjs"
import JWT from "jsonwebtoken"


export const createSuperAdminall = async(req:Request,res:Response,next:NextFunction)=>{
    try {
       const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

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

     const superAdmin = await SuperAdmin.create({ name,email,password:hashpass});
    res.status(201).json({
      success: true,
      message: "Super Admin created successfully",
      superAdmin,
    });
    } catch (error) {
        next(error)
    }
    }



export const loginSuperAdmin = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {email,password}=  req.body;
        if (!email ||  !password) { throw new Error("Email and password are required"); }
        const superAdmin = await SuperAdmin.findOne({email});
       
        if(!superAdmin){throw new Error("Invalid email or password")}

        const compairPassword = await bcrypt.compare(password,superAdmin.password)

        if(!compairPassword){throw new Error("Invalid email or password" );}
        const token = await JWT.sign({id:superAdmin._id ,role: "superadmin"},  process.env.JWT_SECRET as string,{
         expiresIn:"60d"})
 


   
const  isProduction = process.env.NODE_ENV === "production";
res.cookie("super_admin",token, {
     httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
})  

    

 return  res.status(200).json({success:true,message:"login success"})


    } catch (error) {
        next(error)
    }

}


