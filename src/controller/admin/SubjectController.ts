import type { NextFunction, Request, Response } from "express";
import { Subject } from "../../models/SubjectModel";
import { ModuleModel } from "../../models/ModuleModel";
import { Question } from "../../models/Question";
import mongoose from "mongoose";


export const CreateSubject=async(req:Request,res:Response,next:NextFunction)=>{
    try {
       const {subject}=req.body;
       const admin = req.admin
       const FineSubject = subject.trim().toLowerCase();
         
       const AllreadySubject = await Subject.findOne({title:FineSubject})

        if(AllreadySubject){return res.status(401).json({success:false,message:"Subject Allready exist"});}
         
        const createSubject = await Subject.create({title:FineSubject,createBy:admin?._id ,createByModel:"superadmin"})
        

createSubject.populate("createBy","email");


        return res.status(201).json({success:true,message:"Subject Created",subject:createSubject})



    } catch (error) {
        next(error)
    }
}


export const getSubject = async(req:Request,res:Response,next:NextFunction)=>{
    try {
    const subjects = await Subject.find().populate("createBy","email");
 return res.status(200).json({success:true,subjects})
     



    } catch (error) {
       next(error) 
    }
}

export const EditSubject = async(req:Request,res:Response,next:NextFunction)=>{
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


export const deleteSubject = async (req:Request,res:Response,next:NextFunction) => {
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


const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const AddnewModules = async (req:Request,res:Response,next:NextFunction) => {
    try {
         const { title,description,content,status,subjectId}=req.body;
         const Admin = req.admin
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


export const getModules = async(req:Request,res:Response,next:NextFunction)=>{
    try {
  const subjectId = req.params.id;

 const modules = await ModuleModel.find({subjectId});

return res.status(200).json({success:true,modules})



        
    } catch (error) {
        next(error)
    }
}

export const updateModules = async(req:Request,res:Response,next:NextFunction)=>{
try {
const moduleId = req.params.id;

 const {title,description,content,status} = req.body

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

export const deleteModules = async(req:Request,res:Response,next:NextFunction)=>{
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


export const addQuestions = async(req:Request,res:Response,next:NextFunction)=>{
  try {
     const {moduleId,question,options,explanation,marks,difficulty,} = req.body;

         if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: "Module ID is required",
      });
    }

    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least 2 options are required",
      });
    }
 const correctOptions = options.filter(
      (option: any) => option.isCorrect === true
    );
      if (correctOptions.length !== 1) {
      return res.status(400).json({
        success: false,
        message: "Exactly one option must be correct",
      });
    }
  const module = await ModuleModel.findById(moduleId);


    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }
const subject = await Subject.findById(module.subjectId)
if(!subject){
return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
}

  const newQuestion = await Question.create({
      moduleId,
      question: question.trim(),
      options,
      explanation: explanation?.trim() || "",
      marks: marks || 1,
      difficulty: difficulty || "EASY",
      isActive: true,
    });


if(!subject?.completemodule?.includes(module._id)){
subject?.completemodule.push(new mongoose.Types.ObjectId(moduleId))
 await  subject.save()
}

 return res.status(201).json({
      success: true,
      message: "Question created successfully",
      question: newQuestion,
    });

  } catch (error) {
    
  }
}

export const getQuestion = async(req:Request,res:Response,next:NextFunction)=>{
  try {
    
const moduleId = req.params.id;

const module = await ModuleModel.findById(moduleId);
if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }
   const questions = await Question.find({
      moduleId,
      isActive: true,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      module,
      totalQuestions: questions.length,
      questions,
    });

  } catch (error) {
    next(error)
  }
}

export const deleteQuestion = async(req:Request,res:Response,next:NextFunction)=>{
  try {
    
const questionid = req.params.id;

   const question = await Question.findById(questionid)
    
if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

await question.deleteOne()

return res.status(200).json({success:true,message:"Question deleted"})



  } catch (error) {
    next(error)
  }
}


export const UpdateQuestion = async(req:Request,res:Response,next:NextFunction)=>{
  try {
    
const questionid = req.params.id;
const {question,options,explanation,marks,difficulty,moduleId} = req.body

   const getquestion = await Question.findOne({_id:questionid,moduleId} )
    
if (!getquestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }
getquestion.question= question
getquestion.options= options
getquestion.explanation= explanation
getquestion.marks= marks
getquestion.difficulty= difficulty

await getquestion.save()


return res.status(200).json({success:true,message:"Question Updated"})



  } catch (error) {
    next(error)
  }
}