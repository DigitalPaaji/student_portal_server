import type { NextFunction, Request, Response } from "express";
import StudentLead from "../../models/LeadModel";
import mongoose from "mongoose";



 export  const createLead = async(req:Request,res:Response,next:NextFunction)=>{
    try {
       const {access,_id} = req.admin;

    if(!access.includes("crm")){
  return res.status(401).json({
    success:false,message:"you don`t have access"
  })
} 

const {name,phone,email,qualification,city,state,course,interestedCourse,source,status,priority,notes,converted} = req.body;

if(!name || !phone || !email ){
return res.status(400).json({message:"Name Phone and email are Required"})
}


const lead = await StudentLead.create({
name,phone,email,qualification,city,state,course,interestedCourse,
source,status,priority,notes,converted,createdBy:_id
})


return res.status(201).json({lead,message:"Lead created"})


    } catch (error) {
     next(error)   
    }
 }

  export  const EditLead = async(req:Request,res:Response,next:NextFunction)=>{
    try {
       const {access,_id} = req.admin;

    if(!access.includes("crm")){
  return res.status(401).json({
    success:false,message:"you don`t have access"
  })
} 
const {id} = req.params;
const {name,phone,email,qualification,city,state,course,interestedCourse,source,status,priority,notes,converted} = req.body;

if(!name || !phone || !email ){
return res.status(400).json({message:"Name Phone and email are Required"})
}

const lead = await StudentLead.findById(id);
if(!lead){
    return res.status(403).json({
message:"Student not Found"
    })}

lead.name  =  name
lead.phone  =  phone
lead.email  =  email
lead.qualification  =  qualification
lead.city  =  city
lead.state  =  state
lead.course  =  course
lead.interestedCourse  =  interestedCourse
lead.source  =  source
lead.status  =  status
lead.priority  =  priority
lead.notes  =  notes
lead.converted  =  converted

 await lead.save()


return res.status(201).json({message:"Lead Updated"})


    } catch (error) {
     next(error)   
    }
 }

 export const GetAllLeads = async ( req: Request, res: Response,next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = limit * (page - 1);

    const status = req.query.status || "";
    const source = req.query.source || "";

    const filters: any = {};

    if (status) {
      filters.status = status;
    }

    if (source) {
      filters.source = source;
    }

    const [leads, totalCount] = await Promise.all([
      StudentLead.find(filters)
        .skip(skip)
        .limit(limit).select("name phone email city source status priority createdAt")
        .sort({ createdAt: -1 }).lean(),

      StudentLead.countDocuments(filters),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      data: {
         leads,
         pagination: {
          currentPage: page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleLead= async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {id} = req.params;
   
        const lead = await StudentLead.findById(id);


return res.status(200).json({lead})

    } catch (error) {
     next(error)   
    }
}




