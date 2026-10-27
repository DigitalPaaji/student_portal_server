import express from "express";
import { verifyAdmin } from "../../helper/VerifyAgencyAdmin";
import { createStudentsCrm, getStudentsCrm, ToggleStudentCrm } from "../../controller/crm/studentController";
import { getSingleStudent, updateAdmin } from "../../controller/admin/studentCointroller";

const routes = express.Router();


 

routes.post("/create",verifyAdmin,createStudentsCrm)
routes.get("/get-all",verifyAdmin,getStudentsCrm)
routes.patch("/update-status/:id",verifyAdmin,ToggleStudentCrm)
routes.get("/getstudent/:id",verifyAdmin,getSingleStudent)
routes.put("/update-user/:id",verifyAdmin,updateAdmin)






export default routes;