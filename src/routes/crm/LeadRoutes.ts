import express from "express";
import { verifyAdmin } from "../../helper/VerifyAgencyAdmin";
import { createLead, GetAllLeads, getLeadsStatusCounsta, getSingleLead, getTeacher } from "../../controller/panal/panalController";
import uploadExcel from "../../middleware/uploadExcel";
import { importLeadsFromExcel } from "../../controller/admin/LeadController";

const routes = express.Router();

routes.get("/get",verifyAdmin,GetAllLeads)
routes.get("/get/:id",verifyAdmin,getSingleLead)
routes.get("/getleadstatus",verifyAdmin,getLeadsStatusCounsta)
routes.post("/create",verifyAdmin,createLead)

routes.get("/getallteachers",verifyAdmin,getTeacher)
routes.post("/import-excel",verifyAdmin,uploadExcel.single("file"),importLeadsFromExcel);

export default routes
