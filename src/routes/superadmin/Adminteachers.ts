import express from "express";
import { verifySuperAdmin } from "../../helper/verifySuperAdmin";
import { createTeacherAttendance, getAllTeachers, getTeacher, signupTeacher, ToggleTeacher } from "../../controller/superAdmin/TeacherAdminController";
const routes = express.Router();

routes.post("/create",verifySuperAdmin,signupTeacher)
routes.get("/get-all",verifySuperAdmin,getAllTeachers)
routes.patch("/update-status/:id",verifySuperAdmin,ToggleTeacher)
routes.get("/get/:id",verifySuperAdmin,getTeacher)
routes.post("/attendance",verifySuperAdmin,createTeacherAttendance)


export default routes