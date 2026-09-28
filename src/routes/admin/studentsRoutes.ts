import express from "express";
import { createStudents, getStudents, ToggleStudent } from "../../controller/admin/studentCointroller";
import { verifyAdmin } from "../../helper/verifyAdmin";

const route = express.Router();

route.post("/create",verifyAdmin,createStudents)
route.get("/get-all",verifyAdmin,getStudents)
route.patch("/update-status/:id",verifyAdmin,ToggleStudent)


export default route;