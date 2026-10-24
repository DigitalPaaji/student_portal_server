import type { NextFunction, Request, Response } from "express";
import StudentLead,{ LeadStatus} from "../../models/LeadModel";
import { StudentModel  } from "../../models/studentModel";

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

const STUDENT_STATUSES = ["ACTIVE", "INACTIVE", "BLOCKED"] as const;

const LEAD_SOURCES = [
  "WEBSITE",
  "FACEBOOK",
  "INSTAGRAM",
  "GOOGLE",
  "WHATSAPP",
  "REFERRAL",
  "CALL",
  "WALK_IN",
  "OTHER",
] as const;

type CountMap = Record<string, number>;

const createZeroCounts = (
  keys: readonly string[]
): CountMap =>
  Object.fromEntries(keys.map((key) => [key, 0]));

export const GetDashboardData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();

    // Server-local day boundaries
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const [
      totalLeads,
      createdToday,
      updatedToday,
      leadsByStatus,
      createdTodayByStatus,
      updatedTodayByStatus,
      leadsBySource,
      leadsByPriority,
      studentStatsResult,
      studentsByStatus,
      monthlyPayments,
    ] = await Promise.all([
      StudentLead.countDocuments(),

      StudentLead.countDocuments({
        createdAt: { $gte: startOfToday, $lt: startOfTomorrow },
      }),

      StudentLead.countDocuments({
        updatedAt: { $gte: startOfToday, $lt: startOfTomorrow },
      }),

      // All-time status counts
      StudentLead.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Leads CREATED today grouped by status
      StudentLead.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfToday,
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

      // Leads UPDATED today grouped by their current status
      StudentLead.aggregate([
        {
          $match: {
            updatedAt: {
              $gte: startOfToday,
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

      StudentLead.aggregate([
        {
          $group: {
            _id: "$source",
            count: { $sum: 1 },
          },
        },
      ]),

      StudentLead.aggregate([
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
          },
        },
      ]),

      // Student fee totals
      StudentModel.aggregate([
        {
          $group: {
            _id: null,

            totalStudents: { $sum: 1 },

            totalCourseFees: {
              $sum: { $ifNull: ["$coursefees", 0] },
            },

            totalCollectedFees: {
              $sum: { $ifNull: ["$submitedfees", 0] },
            },

            registration: {
              $sum: {
                $ifNull: ["$installments.registration.amount", 0],
              },
            },

            firstInstallment: {
              $sum: {
                $ifNull: ["$installments.first_installment.amount", 0],
              },
            },

            secondInstallment: {
              $sum: {
                $ifNull: ["$installments.second_installment.amount", 0],
              },
            },

            thirdInstallment: {
              $sum: {
                $ifNull: ["$installments.third_installment.amount", 0],
              },
            },

            currentMonthCollected: {
              $sum: {
                $add: [
                  {
                    $cond: [
                      {
                        $and: [
                          {
                            $gte: [
                              "$installments.registration.date",
                              startOfMonth,
                            ],
                          },
                          {
                            $lt: [
                              "$installments.registration.date",
                              startOfTomorrow,
                            ],
                          },
                        ],
                      },
                      {
                        $ifNull: [
                          "$installments.registration.amount",
                          0,
                        ],
                      },
                      0,
                    ],
                  },
                  {
                    $cond: [
                      {
                        $and: [
                          {
                            $gte: [
                              "$installments.first_installment.date",
                              startOfMonth,
                            ],
                          },
                          {
                            $lt: [
                              "$installments.first_installment.date",
                              startOfTomorrow,
                            ],
                          },
                        ],
                      },
                      {
                        $ifNull: [
                          "$installments.first_installment.amount",
                          0,
                        ],
                      },
                      0,
                    ],
                  },
                  {
                    $cond: [
                      {
                        $and: [
                          {
                            $gte: [
                              "$installments.second_installment.date",
                              startOfMonth,
                            ],
                          },
                          {
                            $lt: [
                              "$installments.second_installment.date",
                              startOfTomorrow,
                            ],
                          },
                        ],
                      },
                      {
                        $ifNull: [
                          "$installments.second_installment.amount",
                          0,
                        ],
                      },
                      0,
                    ],
                  },
                  {
                    $cond: [
                      {
                        $and: [
                          {
                            $gte: [
                              "$installments.third_installment.date",
                              startOfMonth,
                            ],
                          },
                          {
                            $lt: [
                              "$installments.third_installment.date",
                              startOfTomorrow,
                            ],
                          },
                        ],
                      },
                      {
                        $ifNull: [
                          "$installments.third_installment.amount",
                          0,
                        ],
                      },
                      0,
                    ],
                  },
                ],
              },
            },

            todayCollected: {
              $sum: {
                $add: [
                  {
                    $cond: [
                      {
                        $and: [
                          {
                            $gte: [
                              "$installments.registration.date",
                              startOfToday,
                            ],
                          },
                          {
                            $lt: [
                              "$installments.registration.date",
                              startOfTomorrow,
                            ],
                          },
                        ],
                      },
                      {
                        $ifNull: [
                          "$installments.registration.amount",
                          0,
                        ],
                      },
                      0,
                    ],
                  },
                  {
                    $cond: [
                      {
                        $and: [
                          {
                            $gte: [
                              "$installments.first_installment.date",
                              startOfToday,
                            ],
                          },
                          {
                            $lt: [
                              "$installments.first_installment.date",
                              startOfTomorrow,
                            ],
                          },
                        ],
                      },
                      {
                        $ifNull: [
                          "$installments.first_installment.amount",
                          0,
                        ],
                      },
                      0,
                    ],
                  },
                  {
                    $cond: [
                      {
                        $and: [
                          {
                            $gte: [
                              "$installments.second_installment.date",
                              startOfToday,
                            ],
                          },
                          {
                            $lt: [
                              "$installments.second_installment.date",
                              startOfTomorrow,
                            ],
                          },
                        ],
                      },
                      {
                        $ifNull: [
                          "$installments.second_installment.amount",
                          0,
                        ],
                      },
                      0,
                    ],
                  },
                  {
                    $cond: [
                      {
                        $and: [
                          {
                            $gte: [
                              "$installments.third_installment.date",
                              startOfToday,
                            ],
                          },
                          {
                            $lt: [
                              "$installments.third_installment.date",
                              startOfTomorrow,
                            ],
                          },
                        ],
                      },
                      {
                        $ifNull: [
                          "$installments.third_installment.amount",
                          0,
                        ],
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      ]),

      StudentModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Monthly payment totals for the current month
      StudentModel.aggregate([
        {
          $project: {
            payments: [
              "$installments.registration",
              "$installments.first_installment",
              "$installments.second_installment",
              "$installments.third_installment",
            ],
          },
        },
        { $unwind: "$payments" },
        {
          $match: {
            "payments.date": {
              $gte: startOfMonth,
              $lt: startOfTomorrow,
            },
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
            totalCollected: {
              $sum: { $ifNull: ["$payments.amount", 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Initialize all known statuses with zero
    const totalLeadsStatus = createZeroCounts(LEAD_STATUSES);
    const createdTodayStatus = createZeroCounts(LEAD_STATUSES);
    const updatedTodayStatus = createZeroCounts(LEAD_STATUSES);
    const studentStatus = createZeroCounts(STUDENT_STATUSES);

    for (const item of leadsByStatus) {
      if (item._id && item._id in totalLeadsStatus) {
        totalLeadsStatus[item._id] = item.count;
      }
    }

    for (const item of createdTodayByStatus) {
      if (item._id && item._id in createdTodayStatus) {
        createdTodayStatus[item._id] = item.count;
      }
    }

    for (const item of updatedTodayByStatus) {
      if (item._id && item._id in updatedTodayStatus) {
        updatedTodayStatus[item._id] = item.count;
      }
    }

    for (const item of studentsByStatus) {
      if (item._id && item._id in studentStatus) {
        studentStatus[item._id] = item.count;
      }
    }

    // Keep the exact keys expected by your frontend
    const leadStauts = totalLeadsStatus;
    const todayStatus = updatedTodayStatus;

    const leadsource = createZeroCounts(LEAD_SOURCES);

    for (const item of leadsBySource) {
      const source = item._id;

      if (source && source in leadsource) {
        leadsource[source] += item.count;
      } else {
        leadsource.OTHER += item.count;
      }
    }

    // Include unknown status counts in the total without losing
    // the fixed status keys used by the dashboard.
    const studentStats = studentStatsResult[0] || {
      totalStudents: 0,
      totalCourseFees: 0,
      totalCollectedFees: 0,
      registration: 0,
      firstInstallment: 0,
      secondInstallment: 0,
      thirdInstallment: 0,
      currentMonthCollected: 0,
      todayCollected: 0,
    };

    const totalCourseFees = studentStats.totalCourseFees;
    const totalCollectedFees = studentStats.totalCollectedFees;

    const totalPendingFees = Math.max(
      0,
      totalCourseFees - totalCollectedFees
    );

    const collectionRate =
      totalCourseFees > 0
        ? (totalCollectedFees / totalCourseFees) * 100
        : 0;

    const totalInstallments =
      studentStats.registration +
      studentStats.firstInstallment +
      studentStats.secondInstallment +
      studentStats.thirdInstallment;

    return res.status(200).json({
      success: true,

      data: {
        date: now.toISOString(),

        // Direct fields compatible with getLeadsStatusCounsta
        leadStauts,
        todayStatus,
        leadsource,

        leads: {
          total: totalLeads,
          createdToday,
          updatedToday,

          byStatus: totalLeadsStatus,
          createdTodayByStatus: createdTodayStatus,
          updatedTodayByStatus: updatedTodayStatus,

          bySource: Object.fromEntries(
            leadsBySource.map((item) => [
              item._id || "OTHER",
              item.count,
            ])
          ),

          byPriority: Object.fromEntries(
            leadsByPriority.map((item) => [
              item._id || "MEDIUM",
              item.count,
            ])
          ),
        },

        students: {
          total: studentStats.totalStudents,
          active: studentStatus.ACTIVE,
          inactive: studentStatus.INACTIVE,
          blocked: studentStatus.BLOCKED,
          byStatus: studentStatus,
        },

        revenue: {
          totalCourseFees,
          totalCollectedFees,
          totalPendingFees,
          collectionRate: Number(collectionRate.toFixed(2)),
          currentMonthCollected: studentStats.currentMonthCollected,
          todayCollected: studentStats.todayCollected,
        },

        installments: {
          registration: studentStats.registration,
          first_installment: studentStats.firstInstallment,
          second_installment: studentStats.secondInstallment,
          third_installment: studentStats.thirdInstallment,
          total: totalInstallments,
        },

        monthlyCollections: monthlyPayments.map((item) => ({
          month: item._id,
          totalCollected: item.totalCollected,
        })),

        profit: null,
      },
    });
  } catch (error) {
    next(error);
  }
};
