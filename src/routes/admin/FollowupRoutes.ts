import express from "express";
import { verifyAdmin } from "../../helper/verifyAdmin";
import { allFollowup, createFollowup, deleteFollowup } from "../../controller/admin/FollowUpController";

const routes = express.Router();



routes.post("/create",verifyAdmin,createFollowup)
routes.get("/get/:id",verifyAdmin,allFollowup)
routes.delete("/delete/:id",verifyAdmin,deleteFollowup)





export default routes;


