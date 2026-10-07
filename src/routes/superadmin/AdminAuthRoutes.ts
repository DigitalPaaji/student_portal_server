import express from "express";
import { createSuperAdminall, loginSuperAdmin, logoutSuperAdmin } from "../../controller/superAdmin/AuthSuperAdmin";
import { createSuperAdmin, deleteAdmin, EditAdmin, getAllAdmin, getSingleAdmin } from "../../controller/admin/AuthController";
import { verifySuperAdmin } from "../../helper/verifySuperAdmin";


const route = express.Router();



route.post("/create",createSuperAdminall)
route.post("/login",loginSuperAdmin)
route.get("/logout",verifySuperAdmin,logoutSuperAdmin)
route.post("/admin/create",verifySuperAdmin,createSuperAdmin)
route.patch("/admin/edit/:id",verifySuperAdmin,EditAdmin)
route.get("/admin/get",verifySuperAdmin,getAllAdmin)
route.get("/admin/get/:id",verifySuperAdmin,getSingleAdmin)
route.delete("/admin/delete/:id",verifySuperAdmin,deleteAdmin)


export default route