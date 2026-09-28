import express from "express"
import { AddnewModules, CreateSubject, deleteModules, deleteSubject, EditSubject, getModules, getSubject, ModuleCompleted, updateModules } from "../../controller/teachers/subjectController"
import { verifyTeacher } from "../../helper/verifyTeacher"
import { addQuestions, deleteQuestion, getQuestion, UpdateQuestion } from "../../controller/admin/SubjectController"

const routes = express.Router()




routes.post("/create",verifyTeacher,CreateSubject)
routes.get("/get",verifyTeacher, getSubject)
routes.put("/update/:id",verifyTeacher, EditSubject)
routes.delete("/delete/:id",verifyTeacher, deleteSubject)


routes.post("/modules/create",verifyTeacher,AddnewModules)
routes.get("/modules/get/:id",verifyTeacher,getModules)
routes.put("/modules/update/:id",verifyTeacher,updateModules)
routes.delete("/modules/delete/:id",verifyTeacher,deleteModules)
routes.post("/modules/complete/:id",verifyTeacher,ModuleCompleted)


routes.get("/question/get/:id",verifyTeacher,getQuestion);
routes.post("/question/create",verifyTeacher,addQuestions);
routes.delete("/question/delete/:id",verifyTeacher,deleteQuestion);
routes.put("/question/update/:id",verifyTeacher,UpdateQuestion);
export default routes
