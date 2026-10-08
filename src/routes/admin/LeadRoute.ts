import express from "express";
import { verifyAdmin } from "../../helper/verifyAdmin";
import { createLead, EditLead, GetAllLeads, getSingleLead } from "../../controller/admin/LeadController";

const routes = express.Router();

routes.post("/create",verifyAdmin,createLead)
routes.get("/get",verifyAdmin,GetAllLeads)
routes.get("/getsingle/:id",verifyAdmin,getSingleLead)
routes.put("/edit/:id",verifyAdmin,EditLead)





export default routes


