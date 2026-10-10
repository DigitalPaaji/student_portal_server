import express from "express";
import { verifyTeacher } from "../../helper/verifyTeacher";
import { demoSubmit, GetDemos, getLead } from "../../controller/teachers/demoController";
const routes = express.Router();


routes.get("/getall",verifyTeacher,GetDemos);
routes.get("/get/:id",verifyTeacher,getLead);
routes.post("/note/:id",verifyTeacher,demoSubmit)







export default routes;