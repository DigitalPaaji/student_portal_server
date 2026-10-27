import express from "express";

import { verifyAdmin } from "../../helper/verifyAdmin";
import { addStudent, createTeacherAttendance, getAllTeachers, getTeacher, signupTeacher, ToggleTeacher } from "../../controller/admin/TeacherController";
const routes = express.Router()

routes.post("/create",verifyAdmin,signupTeacher)
routes.get("/get-all",verifyAdmin,getAllTeachers)
routes.patch("/update-status/:id",verifyAdmin,ToggleTeacher)
routes.get("/get/:id",verifyAdmin,getTeacher)
routes.post("/attendance",verifyAdmin,createTeacherAttendance)
routes.put("/addstudent/:id",verifyAdmin,addStudent)




export default routes