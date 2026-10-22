import type { NextFunction, Request, Response } from "express";
import { Subject } from "../../models/SubjectModel";
import { ModuleModel } from "../../models/ModuleModel";
import SuperAdmin from "../../models/SuperAdminfull";



export const CreateSubjectCrm=async(req:Request,res:Response,next:NextFunction)=>{
    try {


       const {subject}=req.body;
     
       const FineSubject = subject.trim().toLowerCase();
         
       const AllreadySubject = await Subject.findOne({title:FineSubject})

        if(AllreadySubject){return res.status(401).json({success:false,message:"Subject Allready exist"});}
         
        const createSubject = await Subject.create({title:FineSubject})
        

createSubject.populate("createBy","email");


        return res.status(201).json({success:true,message:"Subject Created",subject:createSubject})



    } catch (error) {
        next(error)
    }
}

export const getSubjectCrm = async(req:Request,res:Response,next:NextFunction)=>{
    try {


    const subjects = await Subject.find().populate("createBy","email");
 return res.status(200).json({success:true,subjects})
     



    } catch (error) {
       next(error) 
    }
}



export const EditSubjectCrm = async(req:Request,res:Response,next:NextFunction)=>{
    try {

 const { id } = req.params;
    const { subject } = req.body;       
    if (!subject?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject title is required",
      });
    }
const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      {
        title: subject.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("createBy", "email");
   if (!updatedSubject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }


     return res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      subject: updatedSubject,
    });
    } catch (error) {
        next(error)
    }
}

export const deleteSubjectCrm = async (req:Request,res:Response,next:NextFunction) => {
try {
  
    const { id } = req.params;

    const subject = await Subject.findByIdAndDelete(id);
     if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }
       return res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });

      }catch(error){
  next(error)
      }
}



export const getModulesCrm = async(req:Request,res:Response,next:NextFunction)=>{
    try {

 


   const subjectId = req.params.id;
   const modules = await Subject.findById(subjectId).populate("subjectmodules");
   return res.status(200).json({success:true,modules:modules?.subjectmodules})



        
    } catch (error) {
        next(error)
    }
}

const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};


export const AddnewModulesCrm = async (req:Request,res:Response,next:NextFunction) => {
    try {


      
    const { title,description,content,status,subjectId,assignteacher,level,assignStudent}=req.body;
    const Admin = await SuperAdmin.findOne();

     if (!Admin?._id) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }
  
    if (!title || !subjectId) {
      return res.status(400).json({
        success: false,
        message: "Title and subjectId are required",
      });
    }    
    const slug = `${createSlug(title)}-${Date.now()}`;
    const subject = await Subject.findById(subjectId)
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }
    
    
    const newmodule = await ModuleModel.create({
      subjectId,
      title,
      slug,
      description,
      content,
      assignteacher,
      assignStudent:assignStudent,
      level:level,
      createBy: Admin._id,
      createByModel:"superadmin",
      status: status || "DRAFT",
    });
    
    
    
    subject.subjectmodules.push(newmodule._id);
    
    await subject.save()
    
   

    return res.status(201).json({
      success: true,
      message: "Module created successfully",
      module:newmodule,
    });








    } catch (error) {
        next(error)
    }
}



export const updateModulesCrm = async(req:Request,res:Response,next:NextFunction)=>{
try {



const moduleId = req.params.id;

 const {title,description,content,status,assignteacher,level,assignStudent} = req.body
    
    const module = await ModuleModel.findById(moduleId)
    if(!module){
     return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }
module.title= title
module.description= description
module.content= content
module.status= status 
module.assignteacher= assignteacher 
module.level= level 
module.assignStudent= assignStudent 

 await module.save();

    return res.status(200).json({
      success: true,
      message: "Module updated successfully",
      module,
    });
} catch (error) {
    next(error)
}
}


export const deleteModulesCrm = async(req:Request,res:Response,next:NextFunction)=>{
try {


const moduleId = req.params.id;



    const module = await ModuleModel.findById(moduleId)
    if(!module){
   return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }




 await module.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Module delete successfully",

    });
} catch (error) {
    next(error)
}
}
