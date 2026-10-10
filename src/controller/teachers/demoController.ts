import type { NextFunction, Request, Response } from "express";
import StudentLead from "../../models/LeadModel";
import Teacher from "../../models/teachermodel";

export const GetDemos = async(req:Request,res:Response,next:NextFunction)=>{
try {
      const teacher = req.teacher;

    if (!teacher?._id) {
      return res.status(401).json({
        success: false,
        message: "Teacher not authenticated",
      });
    }
    
  

    const leads = await StudentLead.find({
      "demo.assignto" : teacher._id,
      "demo.status" : "active",
    }).select("email source  interestedCourse name qualification preferredMode demo.demodate").sort({"demo.demodate" : 1});



return res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });


    



} catch (error) {
    next(error)
}
}

export const getLead = async(req:Request,res:Response,next:NextFunction)=>{
  try {
  const leadId = req.params.id;

  const lead = await StudentLead.findById(leadId);



  return res.status(200).json({
    lead
  })


    
  } catch (error) {
    next(error)
  }
}

export const demoSubmit= async(req:Request,res:Response,next:NextFunction)=>{
  try {

     const teacher = req.teacher;

    if (!teacher?._id) {
      return res.status(401).json({
        success: false,
        message: "Teacher not authenticated",
      });
    }
    const leadId =req.params.id;
    

    const lead = await StudentLead.findById(leadId);
if(!lead){
  return res.status(400).json({success:false,message:"Lead not found"})
}
const {note}= req.body

lead.demo.status="done"
lead.status="DEMODONE"
lead.demo.note=note

const getteacher = await Teacher.findById(teacher._id)
if(!getteacher){
  return res.status(400).json({success:false,message:"Teacher not found"})
}

getteacher.demos = getteacher.demos.filter((item)=>item.toString() != lead._id.toString())
await getteacher.save();

await lead.save();



return res.status(200).json({message:"Demo Updated",teacher:getteacher})

  } catch (error) {
    next(error)
  }
}