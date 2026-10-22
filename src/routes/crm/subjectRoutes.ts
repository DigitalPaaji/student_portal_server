import express from "express";
import { verifyAdmin } from "../../helper/VerifyAgencyAdmin";
import { AddnewModulesCrm, CreateSubjectCrm, deleteModulesCrm, deleteSubjectCrm, EditSubjectCrm, getModulesCrm, getSubjectCrm, updateModulesCrm } from "../../controller/crm/subjectController";

const routes = express.Router();




     routes.post("/create",verifyAdmin,CreateSubjectCrm)
     routes.get("/get",verifyAdmin, getSubjectCrm)

     routes.put("/update/:id",verifyAdmin, EditSubjectCrm)
     routes.delete("/delete/:id",verifyAdmin, deleteSubjectCrm)


routes.post("/modules/create",verifyAdmin,AddnewModulesCrm)
routes.get("/modules/get/:id",verifyAdmin,getModulesCrm) 
// routes.get("/modules/completed",verifyAdmin,getModulesCompleted)
routes.put("/modules/update/:id",verifyAdmin,updateModulesCrm)
// routes.put("/modules/reorder",verifyAdmin,updaterecoderModules)
routes.delete("/modules/delete/:id",verifyAdmin,deleteModulesCrm)




// routes.post("/question/create",verifyAdmin,addQuestions);
// routes.get("/question/get/:id",verifyAdmin,getQuestion);
// routes.delete("/question/delete/:id",verifyAdmin,deleteQuestion);
// routes.put("/question/update/:id",verifyAdmin,UpdateQuestion);




export default routes