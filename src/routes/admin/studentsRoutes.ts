import express from "express";
import { createStudents, getSingleStudent, getStudents, ToggleStudent, updateAdmin } from "../../controller/admin/studentCointroller";
import { verifyAdmin } from "../../helper/verifyAdmin";


const route = express.Router();

route.post("/create",verifyAdmin,createStudents)
route.get("/get-all",verifyAdmin,getStudents)
route.patch("/update-status/:id",verifyAdmin,ToggleStudent)
route.get("/getstudent/:id",verifyAdmin,getSingleStudent)
route.put("/update-user/:id",verifyAdmin,updateAdmin)
   

export default route;
