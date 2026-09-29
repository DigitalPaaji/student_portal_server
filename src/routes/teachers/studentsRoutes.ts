import express from "express";
import { createStudents, getAnswers, getStudents, ToggleStudent } from "../../controller/teachers/studentsController";
import { verifyTeacher } from "../../helper/verifyTeacher";
const route = express.Router();



route.post("/create",verifyTeacher,createStudents)
route.get("/get-all",verifyTeacher,getStudents)
route.patch("/update-status/:id",verifyTeacher,ToggleStudent)
route.get("/getqna/:id",verifyTeacher,getAnswers)




export default route;