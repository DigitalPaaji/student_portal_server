import express from "express";
import { verifyAdmin } from "../../helper/verifyAdmin";
import { AddFollowup, createLead, deleteLead, deleteLeadFollowup, EditLead, GetAllLeads, getLeadsStatusCounsta, getSingleLead, getTeacher, getUpcommingFolowup, importLeadsFromExcel } from "../../controller/admin/LeadController";
import uploadExcel from "../../middleware/uploadExcel";

const routes = express.Router();

routes.post("/create",verifyAdmin,createLead)
routes.post("/import-excel",verifyAdmin,uploadExcel.single("file"),importLeadsFromExcel);


routes.get("/get",verifyAdmin,GetAllLeads)
routes.get("/get/upcomingfollowps",verifyAdmin,getUpcommingFolowup)
routes.get("/getleadstatus",verifyAdmin,getLeadsStatusCounsta)

routes.get("/getsingle/:id",verifyAdmin,getSingleLead)
routes.put("/edit/:id",verifyAdmin,EditLead)
routes.put("/add/followup/:id",verifyAdmin,AddFollowup)
routes.delete("/delete/:id",verifyAdmin,deleteLead)
routes.delete("/followup/delete/:id/:followupId",verifyAdmin,deleteLeadFollowup)

routes.get("/getallteachers",verifyAdmin,getTeacher)



export default routes


