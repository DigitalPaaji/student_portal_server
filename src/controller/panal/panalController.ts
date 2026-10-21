import type { NextFunction, Request, Response } from "express";
import StudentLead from "../../models/LeadModel";








export const GetAllLeads = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // const { leadaccess = [] } = req.admin;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = limit * (page - 1);

    const status = req.query.status || "";
    const source = req.query.source || "";
    const search = req.query.search || "";

    // Map lead access permissions to database statuses
    const accessStatusMap: Record<string, string> = {
      newlead: "NEW",
      demolead: "DEMO",
      demodonelead: "DEMODONE",
      activelead: "ACTIVE",
      inactivelead: "INACTIVE",
      convertedlead: "CONVERTED",
      notinterestedlead: "NOT_INTERESTED",
    };

 

    const filters: any = {
     
    };

    if (source) {
      filters.source = source;
    }

    if (status) {
      filters.status = status;
    }
    if (search) {
      filters.$or = [{ name: { $regex: search, $options: "i" } }];
    }
    const [leads, totalCount] = await Promise.all([
      StudentLead.find(filters)
        .skip(skip)
        .limit(limit)
        .select("name phone email city source status priority createdAt")
        .sort({ createdAt: -1 })
        .lean(),

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

export const getLeadsStatusCounsta =async( req: Request,res: Response,next: NextFunction)=>{
try {
  const [NEW,COUNSELING,DEMO,DEMODONE,CONVERTED,ACTIVE,INACTIVE,NOT_INTERESTED]= await  Promise.all([
     StudentLead.countDocuments({status:"NEW"}),
     StudentLead.countDocuments({status:"COUNSELING"}),
     StudentLead.countDocuments({status:"DEMO"}),
     StudentLead.countDocuments({status:"DEMODONE"}),
     StudentLead.countDocuments({status:"CONVERTED"}),
     StudentLead.countDocuments({status:"ACTIVE"}),
     StudentLead.countDocuments({status:"INACTIVE"}),
     StudentLead.countDocuments({status:"NOT_INTERESTED"}),

  ])

const [WEBSITE,FACEBOOK,INSTAGRAM,GOOGLE,WHATSAPP,REFERRAL,CALL,WALK_IN,OTHER] = await Promise.all([
  StudentLead.countDocuments({source:"WEBSITE"}), 
  StudentLead.countDocuments({source:"FACEBOOK"}), 
  StudentLead.countDocuments({source:"INSTAGRAM"}), 
  StudentLead.countDocuments({source:"GOOGLE"}), 
  StudentLead.countDocuments({source:"WHATSAPP"}), 
  StudentLead.countDocuments({source:"REFERRAL"}), 
  StudentLead.countDocuments({source:"CALL"}), 
  StudentLead.countDocuments({source:"WALK_IN"}), 
  StudentLead.countDocuments({source:"OTHER"}), 
])


return res.status(200).json({success:true,leadStauts:{NEW,COUNSELING,DEMO,DEMODONE,CONVERTED,ACTIVE,INACTIVE,NOT_INTERESTED},leadsource:{WEBSITE,FACEBOOK,INSTAGRAM,GOOGLE,WHATSAPP,REFERRAL,CALL,WALK_IN,OTHER}      })

} catch (error) {
  next(error)
}
}



export const getSingleLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
 
    const lead = await StudentLead.findById(id).populate("createdBy","name email");

    return res.status(200).json({ lead });
  } catch (error) {
    next(error);
  }
};
