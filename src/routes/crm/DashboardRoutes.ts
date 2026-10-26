import express from "express";
import { verifyAdmin } from "../../helper/VerifyAgencyAdmin";
import { GetDashboardData } from "../../controller/crm/dashboardContoller";
const routes = express.Router();


routes.get("/get",verifyAdmin,GetDashboardData)



export default routes