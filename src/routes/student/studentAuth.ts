import express from "express";
import { getStudent, getSubjectData, loginStudent, SubmitQuize } from "../../controller/students/StudentAuth";
import { verifyStudent } from "../../helper/verifyStudent";

const routes = express.Router();


routes.post("/login",loginStudent)
routes.get("/verify",verifyStudent,getStudent)
routes.get("/subjectdata/:id",verifyStudent,getSubjectData)
routes.patch("/submit-answers/:id",verifyStudent,SubmitQuize)

export default routes;   