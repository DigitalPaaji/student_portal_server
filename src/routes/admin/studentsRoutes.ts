import express from "express";
// import { createStudents, getSingleStudent, getStudents, searchStudent, ToggleStudent, updateAdmin } from "../../controller/admin/studentCointroller";
import { verifyAdmin } from "../../helper/verifyAdmin";
import { AddFollowUp, createStudents, DeleteFollowUp, getSingleStudent, getStatus, getStudents, searchStudent, updateAdmin } from "../../controller/admin/studentCointroller";


const route = express.Router();


route.post("/create",verifyAdmin,createStudents)
route.get("/get-all",verifyAdmin,getStudents)
route.get("/get-status",verifyAdmin,getStatus)
// route.patch("/update-status/:id",verifyAdmin,ToggleStudent)
route.get("/getstudent/:id",verifyAdmin,getSingleStudent)
route.put("/update-user/:id",verifyAdmin,updateAdmin)
route.get("/search/:search",verifyAdmin,searchStudent)   
route.put("/add/followup/:id",verifyAdmin,AddFollowUp)
route.put("/remove/followup/:id",verifyAdmin,DeleteFollowUp)


export default route;
