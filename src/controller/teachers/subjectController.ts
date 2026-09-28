import type { NextFunction, Request, Response } from "express";
import { Subject } from "../../models/SubjectModel";
import { ModuleModel } from "../../models/ModuleModel";
import OpenAI from "openai"
import mongoose from "mongoose";
import { Question } from "../../models/Question";
import "dotenv/config";
export const CreateSubject=async(req:Request,res:Response,next:NextFunction)=>{
    try {
       const {subject}=req.body;
       const Teacher = req.teacher
       const FineSubject = subject.trim().toLowerCase();
         
       const AllreadySubject = await Subject.findOne({title:FineSubject})

        if(AllreadySubject){return res.status(401).json({success:false,message:"Subject Allready exist"});}
         
        const createSubject = await Subject.create({title:FineSubject,createBy:Teacher?._id ,createByModel:"Teacher"})
        

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
         const Teacher = req.teacher
     if (!Teacher?._id) {
      return res.status(401).json({
        success: false,
        message: "Teacher not authenticated",
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


 const module = await ModuleModel.create({
      subjectId,
      title,
      slug,
      description,
      content,
      createBy: Teacher._id,
      createByModel:"Teacher",
      status: status || "DRAFT",
    });
    


    
 return res.status(201).json({
      success: true,
      message: "Module created successfully",
      module,
    });








    } catch (error) {
        next(error)
    }
}


export const getModules = async(req:Request,res:Response,next:NextFunction)=>{
    try {
  const subjectId = req.params.id;

const subject = await Subject.findById(subjectId);

if(!subject){
  return res.status(401).json({success:false,message:"Subject not found"})
}

 const modules = await ModuleModel.find({subjectId});

return res.status(200).json({success:true,modules,subject})



        
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


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1'
});




const htmlToText = (html: string): string => {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n\s*\n/g, "\n")
    .trim();
};
export const generateMCQsFromModule = async (
  moduleContent: string,
  moduleId: string
) => {
  const prompt = `
You are an educational MCQ generator.

Create 9 multiple-choice questions based ONLY on the module content below.

Rules:
- Every question must be directly related to the content.
- Each question must have exactly 4 options.
- Exactly ONE option must be correct.
- Include a short explanation.
- Assign difficulty: EASY, MEDIUM, or HARD.
- Each question should have marks = 1.
- Do not create duplicate or nearly duplicate questions.
- Do not use information that is not present in the module content.

Return ONLY valid JSON in this exact format:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        {
          "text": "Option A",
          "isCorrect": false
        },
        {
          "text": "Option B",
          "isCorrect": true
        },
        {
          "text": "Option C",
          "isCorrect": false
        },
        {
          "text": "Option D",
          "isCorrect": false
        }
      ],
      "explanation": "Short explanation",
      "marks": 1,
      "difficulty": "EASY"
    }
  ]
}


`;
// Module Content:
// ${htmlToText(moduleContent).slice(0, 10)}


  const response = await openai.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "system",
        content: "You generate high-quality educational MCQs and return valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_object",
    },
  });

  const result = JSON.parse(
    response.choices[0].message.content || '{"questions":[]}'
  );

  return result.questions;
};


export const ModuleCompleted = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subjectId = req.params.id;
    const { moduleId } = req.body;

    // -----------------------------
    // Validate IDs
    // -----------------------------

    if (
      !mongoose.Types.ObjectId.isValid(subjectId as any) ||
      !mongoose.Types.ObjectId.isValid(moduleId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid subjectId or moduleId",
      });
    }

    // -----------------------------
    // Find Module
    // -----------------------------

    const moduleExist = await ModuleModel.findById(moduleId);

    if (!moduleExist) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // -----------------------------
    // Find Subject
    // -----------------------------

    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // -----------------------------
    // Check module belongs to subject
    // -----------------------------

    if (
      !moduleExist.subjectId ||
      moduleExist.subjectId.toString() !== subjectId
    ) {
      return res.status(400).json({
        success: false,
        message: "Module does not belong to this subject",
      });
    }

    // -----------------------------
    // Check already completed
    // -----------------------------

    const alreadyCompleted = subject.completemodule.some(
      (id: mongoose.Types.ObjectId) => id.toString() === moduleId
    );

    if (alreadyCompleted) {
      return res.status(400).json({
        success: false,
        message: "Module already completed",
      });
    }

    // -----------------------------
    // Check module content
    // -----------------------------

    if (!moduleExist.content || moduleExist.content.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: "Module content is too short to generate questions",
      });
    }

    // -----------------------------
    // Generate MCQs using AI
    // -----------------------------

    const mcqsData = await generateMCQsFromModule(
      moduleExist.content,
      moduleId
    );

    if (!mcqsData || mcqsData.length < 5) {
      return res.status(500).json({
        success: false,
        message: "AI could not generate enough questions",
      });
    }

    // -----------------------------
    // Validate and prepare questions
    // -----------------------------

    const questions = mcqsData.slice(0, 8).map((item: any) => ({
      moduleId: new mongoose.Types.ObjectId(moduleId),

      question: item.question,

      options: item.options.map((option: any) => ({
        text: option.text,
        isCorrect: option.isCorrect,
      })),

      explanation: item.explanation || "",

      marks: 1,

      difficulty: ["EASY", "MEDIUM", "HARD"].includes(item.difficulty)
        ? item.difficulty
        : "EASY",

      isActive: true,
    }));

    // -----------------------------
    // Extra validation
    // -----------------------------

    for (const question of questions) {
      if (!question.question) {
        return res.status(500).json({
          success: false,
          message: "AI generated an invalid question",
        });
      }

      if (question.options.length !== 4) {
        return res.status(500).json({
          success: false,
          message: "AI generated invalid options",
        });
      }

      const correctAnswers = question.options.filter(
        (option : any) => option.isCorrect
      );

      if (correctAnswers.length !== 1) {
        return res.status(500).json({
          success: false,
          message: "AI generated invalid correct answer",
        });
      }
    }

    

    await Question.insertMany(questions);

   

    subject.completemodule.push(
      new mongoose.Types.ObjectId(moduleId)
    );

    await subject.save();

  

    return res.status(200).json({
      success: true,
      message: "Module completed and MCQs generated successfully",
      data: {
        moduleId,
        questionsGenerated: questions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};