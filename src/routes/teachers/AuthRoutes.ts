import express from "express";
import { getTeacher, loginTeacher, logoutTeacher } from "../../controller/teachers/teacherAuth";
import { verifyTeacher } from "../../helper/verifyTeacher";
const routes = express.Router();


routes.post("/login",loginTeacher)
routes.get("/verify",verifyTeacher,getTeacher)
routes.get("/logout",verifyTeacher,logoutTeacher)


export default routes;