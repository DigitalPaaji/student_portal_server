import type { NextFunction, Request, Response } from "express";
import SuperAdmin from "../../models/superAdminModel";
import bcrypt from "bcryptjs";
import redisClient from "../../helper/redisServer";
import JWT from "jsonwebtoken"
import { sendOtpMail } from "../../helper/sendOtpMail";
import { emailQueue } from "../../queues/emailQueue";
import StudentLead from "../../models/LeadModel";
import { ModuleModel } from "../../models/ModuleModel";
import { TeacherAttendance } from "../../models/TeacherAtendence";
  


export const createSuperAdmin = async(req:Request,res:Response,next:NextFunction)=>{
    try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const access = req.body.access || [ ]
    const leadaccess = req.body.leadaccess || [ ]
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

  const superAdmin = await SuperAdmin.create({ name,email,password:hashpass,access,leadaccess});

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



export const EditAdmin = async(req:Request,res:Response,next:NextFunction)=>{
  try {
const adminId = req.params.id;
const {name,access,leadaccess} = req.body;
const admin = await SuperAdmin.findById(adminId)
if(!admin){
  return res.status(401).json({success:false,message:"admin not found"})
}
 admin.name = name ? name : admin.name
 admin.access = access
 admin.leadaccess = leadaccess
await admin.save()

return res.status(200).json({success:true,message:"Admin updated"})
  } catch (error) {
    next(error)
  }
}





export const getAllAdmin = async(req:Request,res:Response,next:NextFunction)=>{
try {

const accesadmin = req.query.admin
let allAdmin=await SuperAdmin.find().select("-password")


// if(accesadmin==="crm"){
// allAdmin = await SuperAdmin.find({access: "crm"}).select("-password");
// }else{
// allAdmin = await SuperAdmin.find({
//     access: { $nin: ["crm"] }
//   }).select("-password");
// }

   

  return res.status(200).json({success:true,admin:allAdmin})

} catch (error) {
  next(error)
}
}


export const getSingleAdmin = async(req:Request,res:Response,next:NextFunction)=>{
try {
const adminId = req.params.id

  const allAdmin = await SuperAdmin.findById(adminId).select("-password");
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



const LEAD_STATUSES = [
  "NEW",
  "COUNSELING",
  "DEMO",
  "DEMODONE",
  "CONVERTED",
  "ACTIVE",
  "INACTIVE",
  "NOT_INTERESTED",
] as const;

const LEAD_SOURCES = [
  "WEBSITE",
  "FACEBOOK",
  "INSTAGRAM",
  "GOOGLE",
  "WHATSAPP",
  "REFERRAL",
  "CALL",
  "WALK_IN",
  "SEMINAR",
  "OTHER",
] as const;

const MODULE_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
] as const;

const ATTENDANCE_STATUSES = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "HALF_DAY",
  "LEAVE",
] as const;



const getCounts = <T extends string>(
  values: readonly T[],
  rows: Array<{ _id: string; count: number }>
) => {
  const counts = new Map(rows.map((row) => [row._id, row.count]));

  return values.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
  }));
};

export const getDashboardData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    // Last 7 days, including today
    const startOfLast7Days = new Date(startOfToday);
    startOfLast7Days.setDate(startOfLast7Days.getDate() - 6);

    const [
      totalLeads,
      todayLeads,
      convertedLeads,
      interestedLeads,
      pendingDemos,
      todayDemos,
      totalModules,
      publishedModules,
      totalQuizSubmissions,
      passedQuizSubmissions,
      attendanceThisMonth,
      recentLeads,
      leadsByStatusRaw,
      leadsBySourceRaw,
      dailyLeadsRaw,
      modulesByStatusRaw,
      attendanceByStatusRaw,
    ] = await Promise.all([
     
      StudentLead.countDocuments(),

      StudentLead.countDocuments({
        createdAt: {
          $gte: startOfToday,
          $lt: startOfTomorrow,
        },
      }),

      StudentLead.countDocuments({
        $or: [
          { converted: true },
          { status: "CONVERTED" },
        ],
      }),

      StudentLead.countDocuments({
        status: "COUNSELING",
      }),

      StudentLead.countDocuments({
        "demo.status": "active",
      }),

      StudentLead.countDocuments({
        "demo.demodate": {
          $gte: startOfToday,
          $lt: startOfTomorrow,
        },
        "demo.status": "active",
      }),

      // Module summary
      ModuleModel.countDocuments(),

      ModuleModel.countDocuments({
        status: "PUBLISHED",
        isActive: true,
      }),

      ModuleModel.aggregate([
        {
          $project: {
            total: { $size: "$answerSubmite" },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: "$total" },
          },
        },
      ]).then((rows) => rows[0]?.count ?? 0),

      ModuleModel.aggregate([
        { $unwind: "$answerSubmite" },
        { $match: { "answerSubmite.pass": true } },
        { $count: "count" },
      ]).then((rows) => rows[0]?.count ?? 0),

      // Attendance records created during the current month
      TeacherAttendance.countDocuments({
        date: {
          $gte: startOfMonth,
          $lt: startOfTomorrow,
        },
      }),

      // Latest leads
      StudentLead.find()
        .select(
          "name phone email course interestedCourse status priority source createdAt demo"
        )
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Lead status chart
      StudentLead.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Lead source chart
      StudentLead.aggregate([
        {
          $group: {
            _id: "$source",
            count: { $sum: 1 },
          },
        },
      ]),

      // Daily leads chart, last 7 days
      StudentLead.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfLast7Days,
              $lt: startOfTomorrow,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "Asia/Kolkata",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Module status chart
      ModuleModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Monthly attendance status chart
      TeacherAttendance.aggregate([
        {
          $match: {
            date: {
              $gte: startOfMonth,
              $lt: startOfTomorrow,
            },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Fill missing dates with zero
    const dailyLeadsMap = new Map(
      dailyLeadsRaw.map((item) => [item._id, item.count])
    );

    const dailyLeads = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfLast7Days);
      date.setDate(date.getDate() + index);

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      return {
        date: key,
        count: dailyLeadsMap.get(key) ?? 0,
      };
    });

    const leadsByStatus = getCounts(
      LEAD_STATUSES,
      leadsByStatusRaw
    );

    const leadsBySource = getCounts(
      LEAD_SOURCES,
      leadsBySourceRaw
    );

    const modulesByStatus = getCounts(
      MODULE_STATUSES,
      modulesByStatusRaw
    );

    const attendanceByStatus = getCounts(
      ATTENDANCE_STATUSES,
      attendanceByStatusRaw
    );

    const totalAttendance = attendanceByStatus.reduce(
      (sum, item) => sum + item.count,
      0
    );

    const presentAttendance =
      attendanceByStatus.find(
        (item) => item.label === "PRESENT"
      )?.count ?? 0;

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",

      summary: {
        totalLeads,
        todayLeads,
        convertedLeads,
        interestedLeads,
        pendingDemos,
        todayDemos,

        totalModules,
        publishedModules,

        totalQuizSubmissions,
        passedQuizSubmissions,
        failedQuizSubmissions:
          totalQuizSubmissions - passedQuizSubmissions,

        attendanceThisMonth,
        presentAttendance,
        attendanceRate:
          totalAttendance > 0
            ? Number(
                ((presentAttendance / totalAttendance) * 100).toFixed(2)
              )
            : 0,
      },

      charts: {
        leadsByStatus: {
          labels: leadsByStatus.map((item) => item.label),
          datasets: [
            {
              label: "Leads by Status",
              data: leadsByStatus.map((item) => item.count),
            },
          ],
        },

        leadsBySource: {
          labels: leadsBySource.map((item) => item.label),
          datasets: [
            {
              label: "Leads by Source",
              data: leadsBySource.map((item) => item.count),
            },
          ],
        },

        dailyLeads: {
          labels: dailyLeads.map((item) => item.date),
          datasets: [
            {
              label: "New Leads",
              data: dailyLeads.map((item) => item.count),
              fill: false,
              tension: 0.3,
            },
          ],
        },

        modulesByStatus: {
          labels: modulesByStatus.map((item) => item.label),
          datasets: [
            {
              label: "Modules",
              data: modulesByStatus.map((item) => item.count),
            },
          ],
        },

        attendanceByStatus: {
          labels: attendanceByStatus.map((item) => item.label),
          datasets: [
            {
              label: "Attendance This Month",
              data: attendanceByStatus.map((item) => item.count),
            },
          ],
        },
      },

      recentLeads,
    });
  } catch (error) {
    next(error);
  }
};