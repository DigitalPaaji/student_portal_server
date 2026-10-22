import express from "express";
import { createSuperAdmin, deleteAdmin, EditAdmin, getAllAdmin, getSingleAdmin } from "../../controller/admin/AuthController";

import { verifyAdmin } from "../../helper/VerifyAgencyAdmin";


const route = express.Router();



// route.post("/create",createSuperAdminall)
// route.post("/login",loginSuperAdmin)
// route.get("/logout",verifySuperAdmin,logoutSuperAdmin)
route.post("/admin/create",verifyAdmin,createSuperAdmin)
route.patch("/admin/edit/:id",verifyAdmin,EditAdmin)
route.get("/admin/get",verifyAdmin,getAllAdmin)
route.get("/admin/get/:id",verifyAdmin,getSingleAdmin)
route.delete("/admin/delete/:id",verifyAdmin,deleteAdmin)




export default route