import express from "express"
import { verifyAdmin } from "../../helper/verifyAdmin"
import { AddnewModules, addQuestions, CreateSubject, deleteModules, deleteQuestion, deleteSubject, EditSubject, getModules, getModulesCompleted, getQuestion, getSubject, updateModules, UpdateQuestion, updaterecoderModules } from "../../controller/admin/SubjectController"


const routes = express.Router()




routes.post("/create",verifyAdmin,CreateSubject)
routes.get("/get",verifyAdmin, getSubject)
routes.put("/update/:id",verifyAdmin, EditSubject)
routes.delete("/delete/:id",verifyAdmin, deleteSubject)


routes.post("/modules/create",verifyAdmin,AddnewModules)
routes.get("/modules/get/:id",verifyAdmin,getModules)
routes.get("/modules/completed",verifyAdmin,getModulesCompleted)
routes.put("/modules/update/:id",verifyAdmin,updateModules)
routes.put("/modules/reorder",verifyAdmin,updaterecoderModules)
routes.delete("/modules/delete/:id",verifyAdmin,deleteModules)




routes.post("/question/create",verifyAdmin,addQuestions);
routes.get("/question/get/:id",verifyAdmin,getQuestion);
routes.delete("/question/delete/:id",verifyAdmin,deleteQuestion);
routes.put("/question/update/:id",verifyAdmin,UpdateQuestion);




export default routes
