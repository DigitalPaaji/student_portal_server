



import type { NextFunction, Request, Response } from "express";
import bcrypt  from "bcryptjs"
import { type IStudent, StudentModel } from "../../models/studentModel";
import { emailQueue } from "../../queues/emailQueue";
import Teacher from "../../models/teachermodel";



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
      coursefees,
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


const teacher = await Teacher.findById(teacherAsign);

if(!teacher){
  return res.status(404).json({
    success:false,message:"Teacher Not Found"
  })
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
      coursefees,
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

   

 const student= await StudentModel.create(payload)

teacher.students.push(student._id)
   await teacher.save()

 
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

 const {
      page = "1",
      limit = "20",
      search = "",
      studentStatus = "",
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      pageNumber < 1 ||
      !Number.isInteger(limitNumber) ||
      limitNumber < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive integers.",
      });
    }
    const safeLimit = Math.min(limitNumber, 100);
    const skip = (pageNumber - 1) * safeLimit;
 const searchText =
      typeof search === "string" ? search.trim() : "";

    const status =
      typeof studentStatus === "string"
        ? studentStatus.trim().toLowerCase()
        : "";

      const allowedStatuses = ["active", "drop", "pass out"];
    
          if (status && status !== "all" && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student status.",
        allowedStatuses,
      });
    }

  const filter: Record<string, any> = {};

    // Search by fullname, email, phone, or studentId
    if (searchText) {
      const escapedSearch = searchText.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const searchRegex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { fullname: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { studentId: searchRegex },
      ];
    }

    // Filter by student status
    if (status && status !== "all") {
      filter.studentStatus = new RegExp(
        `^${status.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        "i"
      );
    }

    // Fetch students and count matching records simultaneously
    const [students, totalStudents] = await Promise.all([
      StudentModel.find(filter)
        .select(
          "email phone fullname coursefees submitedfees studentStatus profileImage studentId"
        )
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),

      StudentModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalStudents / safeLimit);

    return res.status(200).json({
      success: true,
      message: "Students fetched successfully.",

      students,

      pagination: {
        page: pageNumber,
        limit: safeLimit,
        totalStudents,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },

      filters: {
        search: searchText,
        studentStatus: status || "all",
      },
    });
  } catch (error) {
    next(error)
  }
}

export const getStatus= async(req:Request,res:Response,next:NextFunction)=>{
  try {
const [AllStudents,ActiveStudents,DropStudents,PassOutStudent]= await Promise.all([
await StudentModel.countDocuments(),
await StudentModel.countDocuments({studentStatus:"active"}),
await StudentModel.countDocuments({studentStatus:"drop"}),
await StudentModel.countDocuments({studentStatus:"pass out"}),
])
    

return res.status(200).json({success:true,studentStatus:{AllStudents,ActiveStudents,DropStudents,PassOutStudent}})


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
      coursefees,
      coursediscount,
      teacherAsign,
      studentStatus,
      dropoutremark,
      registration,
      installments}= req.body;

const student = await StudentModel.findById(studentModleID);

if(!student){ return res.status(400).json({success:false,message:"student not found"})}
 const  submitedfees= Number(coursediscount?.amount ?? 0 ) +  Number(registration?.amount ?? 0) + installments?.reduce((acc : Number, current:any) => acc + current.amount, 0)

if(teacherAsign !==student.teacherAsign){
  if(student.teacherAsign){
    const OldTeacher = await Teacher.findById(student.teacherAsign);
   if(OldTeacher){

     OldTeacher.students= OldTeacher?.students.filter((itm)=>itm.toString()  !==  student._id.toString() )
     await OldTeacher.save()
   }
  
  const teacher = await Teacher.findById(teacherAsign);

   if(!teacher){
  return res.status(404).json({
    success:false,message:"Teacher Not Found"
  })
   }

  teacher.students.push(student._id)
   await teacher.save()


  }
}
                      
student.fullname=fullname
student.subjects=subjects
student.phone=phone
student.studentId=studentId
student.coursefees=coursefees
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



export const AddFollowUp = async(req:Request,res: Response,next:NextFunction)=>{
  try {
 const {note,nextFollowup} = req.body
  const studentId = req.params.id;


  const student = await StudentModel.findById(studentId);

  if(!student){return res.status(404).json({success:false,message:"Student not Found"})}
  const time = new Date(Date.now())

  student.followups.push({note,time})
  student.nextFollowup=nextFollowup;

   await student.save() 

  return res.status(200).json({success:true,message:"Follow up Add" ,followups:student.followups})



  } catch (error) {
    next(error)
  }
}


export const DeleteFollowUp = async(req:Request,res: Response,next:NextFunction)=>{
  try {
    const StudentId = req.params.id;
    const {followUpId} = req.body;

    const student = await StudentModel.findById(StudentId);
    if(!student){return res.status(404).json({success:false,message:"Student not Found"})}
    student.followups = student?.followups?.filter((itm:any)=>itm._id.toString() !==followUpId.toString() );
     
    await student.save();
   
    return res.status(200).json({success:true,followups:student.followups})

    

  } catch (error) {
    next(error)
  }
}