import express from "express";
import { verifyAdmin } from "../../helper/VerifyAgencyAdmin";
import { createTeacherAttendanceCrm, getAllTeachersCrm, getTeacherCrm, signupTeacherCrm, ToggleTeacherCrm } from "../../controller/crm/teacherController";
const routes = express.Router();




routes.post("/create",verifyAdmin,signupTeacherCrm)
routes.get("/get-all",verifyAdmin,getAllTeachersCrm)
routes.patch("/update-status/:id",verifyAdmin,ToggleTeacherCrm)
routes.get("/get/:id",verifyAdmin,getTeacherCrm)
routes.post("/attendance",verifyAdmin,createTeacherAttendanceCrm)




export default routes;
