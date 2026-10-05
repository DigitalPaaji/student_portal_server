import express from "express";
import { createSuperAdminall, loginSuperAdmin } from "../../controller/superAdmin/AuthSuperAdmin";
import { createSuperAdmin, deleteAdmin, getAllAdmin } from "../../controller/admin/AuthController";
import { verifySuperAdmin } from "../../helper/verifySuperAdmin";


const route = express.Router();



route.post("/create",createSuperAdminall)
route.post("/login",loginSuperAdmin)
route.post("/admin/create",verifySuperAdmin,createSuperAdmin)
route.get("/admin/get",verifySuperAdmin,getAllAdmin)
route.delete("/admin/delete/:id",verifySuperAdmin,deleteAdmin)


export default route