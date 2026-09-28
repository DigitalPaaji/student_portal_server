import express from "express";
import { getTeacher, loginTeacher } from "../../controller/teachers/teacherAuth";
import { verifyTeacher } from "../../helper/verifyTeacher";
const routes = express.Router();


routes.post("/login",loginTeacher)
routes.get("/verify",verifyTeacher,getTeacher)


export default routes;