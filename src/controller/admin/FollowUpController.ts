import type { NextFunction, Request, Response } from "express";
import FollowUp from "../../models/Followups";




 export const createFollowup = async(req:Request,res:Response,next:NextFunction)=>{
    try {
const { access, _id } = req.admin;

    // CRM permission
    if (!access.includes("crm")) {
      return res.status(403).json({
        success: false,
        message: "You don't have CRM access",
      });
    }

      const {leadId,followupData,upcomingfoll,leadStatus,note} = req.body
       
      if(!leadId || !followupData){
           return res.status(400).json({message:"Lead ID and Followup Data required"})
        }
        
     const followup = await FollowUp.create({
        leadId,followupData,upcomingfoll,leadStatus,note,createBy:_id
       })

       return res.status(201).json({
        message:"Follow up successful",
        followup
       })

    } catch (error) {
        next(error)
    }
}


export const allFollowup = async(req:Request,res:Response,next:NextFunction)=>{
try {
   const { access, _id } = req.admin;

    // CRM permission 
    if (!access.includes("crm")) {
      return res.status(403).json({
        success: false,
        message: "You don't have CRM access",
      });
    }
    const leadId = req.params.id

 const allFollowup = await FollowUp.find({leadId})

return res.status(200).json({allFollowup})
} catch (error) {
    next(error)
}


}



export const deleteFollowup = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const { access, _id } = req.admin;

    // CRM permission 
    if (!access.includes("crm")) {
      return res.status(403).json({
        success: false,
        message: "You don't have CRM access",
      });
    }
    const followupId = req.params.id
    
    const allFollowup = await FollowUp.findByIdAndDelete(followupId)

return res.status(200).json({message:"Follow UP Deleted"})


    } catch (error) {
        next(error)
    }
}





