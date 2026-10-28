
import type { NextFunction, Request, Response } from "express";
import bcrypt  from "bcryptjs"
import { StudentModel } from "../../models/studentModel";
import { emailQueue } from "../../queues/emailQueue";
import SuperAdmin from "../../models/SuperAdminfull";


export const createStudentsCrm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      fullname,
      email,
      password,
      phone,subjects,
      studentId,
      coursefees,
      installments
    } = req.body;

    // const admin = req.admin;
const admin = await SuperAdmin.findOne();
  
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

    const  submitedfees= Number(installments?.registration?.amount ?? 0) +Number(installments?.first_installment?.amount ?? 0 )+Number(installments?.second_installment?.amount ?? 0 )
    +Number(installments?.third_installment?.amount ?? 0 )

    const hashedPassword = await bcrypt.hash(password, 10);


    await StudentModel.create({
      fullname,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      studentId,
      subjects,
      coursefees:Number(coursefees),
      installments,
      submitedfees,
      createBy: admin._id,
      createByModel: "superadmin",
    });

 
    await emailQueue.add("sendWelcomeEmail", {
      targetEmail: email.toLowerCase(),
      tempPassword: password,
      studentId
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
    
    });



  } catch (error) {
    next(error);
  }
};

export const getStudentsCrm = async (req:Request,res:Response,next:NextFunction)=>{
  try {

 const now = new Date();

    // Current month start
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
    const sixMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1
    );
 const [students, overviewResult, installmentResult, monthlyResult] =
      await Promise.all([
        // Students list
        StudentModel.find()
          .select(
            "email phone fullname coursefees submitedfees isActive profileImage studentId status installments createdAt"
          )
          .sort({ createdAt: -1 })
          .lean(),

        // Dashboard overview
        StudentModel.aggregate([
          {
            $group: {
              _id: null,

              totalStudents: { $sum: 1 },

              activeStudents: {
                $sum: {
                  $cond: [{ $eq: ["$isActive", true] }, 1, 0],
                },
              },

              inactiveStudents: {
                $sum: {
                  $cond: [{ $eq: ["$isActive", false] }, 1, 0],
                },
              },

              totalCourseFees: {
                $sum: { $ifNull: ["$coursefees", 0] },
              },

              totalCollectedFees: {
                $sum: { $ifNull: ["$submitedfees", 0] },
              },

              totalPendingFees: {
                $sum: {
                  $max: [
                    0,
                    {
                      $subtract: [
                        { $ifNull: ["$coursefees", 0] },
                        { $ifNull: ["$submitedfees", 0] },
                      ],
                    },
                  ],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalStudents: 1,
              activeStudents: 1,
              inactiveStudents: 1,
              totalCourseFees: 1,
              totalCollectedFees: 1,
              totalPendingFees: 1,

              collectionRate: {
                $cond: [
                  { $gt: ["$totalCourseFees", 0] },
                  {
                    $multiply: [
                      {
                        $divide: [
                          "$totalCollectedFees",
                          "$totalCourseFees",
                        ],
                      },
                      100,
                    ],
                  },
                  0,
                ],
              },
            },
          },
        ]),

        // Installment-wise collected amount
        StudentModel.aggregate([
          {
            $group: {
              _id: null,

              registration: {
                $sum: {
                  $ifNull: ["$installments.registration.amount", 0],
                },
              },

              first_installment: {
                $sum: {
                  $ifNull: [
                    "$installments.first_installment.amount",
                    0,
                  ],
                },
              },

              second_installment: {
                $sum: {
                  $ifNull: [
                    "$installments.second_installment.amount",
                    0,
                  ],
                },
              },

              third_installment: {
                $sum: {
                  $ifNull: [
                    "$installments.third_installment.amount",
                    0,
                  ],
                },
              },
            },
          },
          { $project: { _id: 0 } },
        ]),

        // Monthly fee collection graph (last 6 months)
        StudentModel.aggregate([
          {
            $project: {
              payments: [
                {
                  type: "registration",
                  amount: {
                    $ifNull: [
                      "$installments.registration.amount",
                      0,
                    ],
                  },
                  date: "$installments.registration.date",
                },
                {
                  type: "first_installment",
                  amount: {
                    $ifNull: [
                      "$installments.first_installment.amount",
                      0,
                    ],
                  },
                  date: "$installments.first_installment.date",
                },
                {
                  type: "second_installment",
                  amount: {
                    $ifNull: [
                      "$installments.second_installment.amount",
                      0,
                    ],
                  },
                  date: "$installments.second_installment.date",
                },
                {
                  type: "third_installment",
                  amount: {
                    $ifNull: [
                      "$installments.third_installment.amount",
                      0,
                    ],
                  },
                  date: "$installments.third_installment.date",
                },
              ],
            },
          },
          { $unwind: "$payments" },
          {
            $match: {
              "payments.date": {
                $gte: sixMonthsAgo,
                $lt: new Date(
                  now.getFullYear(),
                  now.getMonth() + 1,
                  1
                ),
              },
              "payments.amount": { $gt: 0 },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$payments.date",
                  timezone: "Asia/Kolkata",
                },
              },
              totalCollected: { $sum: "$payments.amount" },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              month: "$_id",
              totalCollected: 1,
            },
          },
        ]),
      ]);

    const overview = overviewResult[0] || {
      totalStudents: 0,
      activeStudents: 0,
      inactiveStudents: 0,
      totalCourseFees: 0,
      totalCollectedFees: 0,
      totalPendingFees: 0,
      collectionRate: 0,
    };

    const installments = installmentResult[0] || {
      registration: 0,
      first_installment: 0,
      second_installment: 0,
      third_installment: 0,
    };

    // Current month's collection
    const currentMonthCollected = monthlyResult
      .filter((item) => item.month ===
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
      .reduce((sum, item) => sum + item.totalCollected, 0);

    // Fill months with zero values for a continuous graph
    const monthlyCollections = Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - 5 + index,
          1
        );

        const month = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        const existing = monthlyResult.find(
          (item) => item.month === month
        );

        return {
          month,
          totalCollected: existing?.totalCollected ?? 0,
        };
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        students,

        dashboard: {
          ...overview,
          currentMonthCollected,
          installments,
          monthlyCollections,
        },
      },
    });



    
  } catch (error) {
    next(error)
  }
}

export const ToggleStudentCrm = async( req: Request,res: Response,next:NextFunction)=>{
try {
  const StudentID = req.params.id;

   const student = await StudentModel.findById(StudentID);
   if(!student){
    return res.status(404).json({success:false,message:"student not Found"})
   }
    
  //  student.isActive = !student?.isActive 
 await student.save()

return res.status(200).json({success:true,message:"student Updated"})
} catch (error) {
  next(error)
}
}
