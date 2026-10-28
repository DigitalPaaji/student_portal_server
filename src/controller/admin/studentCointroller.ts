



import type { NextFunction, Request, Response } from "express";
import bcrypt  from "bcryptjs"
import { type IStudent, StudentModel } from "../../models/studentModel";
import { emailQueue } from "../../queues/emailQueue";



export const createStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      fullname,
      email,
      password,
      phone,
      subjects,
      studentId,
      totalcoursefees,
      coursediscount,
      teacherAsign,
      studentStatus,
      dropoutremark,
      registration,
      installments
    } = req.body;

    const admin = req.admin;

  
    if (!admin?._id) {
      return res.status(401).json({ 
        success: false,
        message: "admin not authenticated",
      });
    }

    
    if (!fullname || !email || !password || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Fullname, email, password and studentId are required",
      });
    }

   
    const existingStudent = await StudentModel.findOne({
      $or: [
        { email: email.toLowerCase() },
        { studentId },
      ],
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message:
          existingStudent.email === email.toLowerCase()
            ? "Email already exists"
            : "Student ID already exists",
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

 const  submitedfees= Number(coursediscount?.amount ?? 0 ) +  Number(registration?.amount ?? 0) + installments?.reduce((acc : Number, current:any) => acc + current.amount, 0)
const payload={
    fullname,
      email,
      password:hashedPassword,
      phone,
      subjects,
      studentId,
      totalcoursefees,
      teacherAsign,
      coursediscount,
      studentStatus,
      dropoutremark,
      registration,
      installments,
      submitedfees,
      createBy: admin._id,
      createByModel: "superadmin" as const,
}

   

await StudentModel.create(payload)

   

 
    // await emailQueue.add("sendWelcomeEmail", {
    //   targetEmail: email.toLowerCase(),
    //   tempPassword: password,
    //   studentId
    // });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
    
    });



  } catch (error) {
    next(error);
  }
};


export const getStudents = async (req:Request,res:Response,next:NextFunction)=>{
  try {
const {access} = req.admin;

    if(!access.includes("getstudent")){
  return res.status(401).json({
    success:false,message:"you don`t have access"
  })
}

    const students = await StudentModel.find() .select("email phone fullname totalcoursefees submitedfees  studentStatus profileImage studentId ")
      .sort({ createdAt: -1 });
return res.status(200).json({success:true,students})
  } catch (error) {
    next(error)
  }
}





export const getSingleStudent= async( req: Request,res: Response,next:NextFunction)=>{
  try {
 const StudentId = req.params.id;

 const student = await StudentModel.findById(StudentId).select("-password");


 return res.status(200).json({success:true,student})
    

  } catch (error) {
    next(error)
  }
}

export const updateAdmin = async( req: Request,res: Response,next:NextFunction)=>{
try {

const studentModleID = req.params.id;
const {fullname,

      phone,
      subjects,
      studentId,
      totalcoursefees,
      coursediscount,
      teacherAsign,
      studentStatus,
      dropoutremark,
      registration,
      installments}= req.body;

const student = await StudentModel.findById(studentModleID);

if(!student){ return res.status(400).json({success:false,message:"student not found"})}
 const  submitedfees= Number(coursediscount?.amount ?? 0 ) +  Number(registration?.amount ?? 0) + installments?.reduce((acc : Number, current:any) => acc + current.amount, 0)


                      
student.fullname=fullname
student.subjects=subjects
student.phone=phone
student.studentId=studentId
student.totalcoursefees=totalcoursefees
student.installments=installments
student.submitedfees=submitedfees
student.registration=registration
student.coursediscount=coursediscount
student.teacherAsign=teacherAsign
student.studentStatus=studentStatus
student.dropoutremark=dropoutremark

await student.save();

return res.status(200).json({success:true,message:"Student Updated"});

} catch (error) {
next(error)  
}
}


export const searchStudent = async(req: Request,res: Response,next:NextFunction)=>{
  try {
    const { search } = req.params;


  const filter  : any = {
      $or: [
        { fullname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };


    const students = await StudentModel.find(filter)
      .select("fullname email")
      .lean();

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    next(error)
  }
}