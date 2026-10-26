import express from "express";
import { createSuperAdmin, getAdmin, getDashboardData, loginSuperAdmin, logoutAdmin, verifyOtp } from "../../controller/admin/AuthController";
import { verifyAdmin } from "../../helper/verifyAdmin";

const routes = express.Router()



routes.post("/create",createSuperAdmin)
routes.post("/login",loginSuperAdmin)
routes.post("/verify",verifyOtp)
routes.get("/logout",verifyAdmin,logoutAdmin)
routes.get("/verify",verifyAdmin,getAdmin)
routes.get("/dashboard",verifyAdmin,getDashboardData)  


export default routes

