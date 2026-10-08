import express from "express";
import { verifyAdmin } from "../../helper/verifyAdmin";
import { createLead, deleadLead, EditLead, GetAllLeads, getSingleLead, importLeadsFromExcel } from "../../controller/admin/LeadController";
import uploadExcel from "../../middleware/uploadExcel";

const routes = express.Router();

routes.post("/create",verifyAdmin,createLead)
routes.post("/import-excel",verifyAdmin,uploadExcel.single("file"),importLeadsFromExcel);


routes.get("/get",verifyAdmin,GetAllLeads)
routes.get("/getsingle/:id",verifyAdmin,getSingleLead)
routes.put("/edit/:id",verifyAdmin,EditLead)
routes.delete("/delete/:id",verifyAdmin,deleadLead)





export default routes


