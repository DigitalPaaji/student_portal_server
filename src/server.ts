import "dotenv/config";
import express from "express";
import type { Request, Response }  from "express";
import cookieParser from "cookie-parser"
import  SuperAdminAuthRoutes from "./routes/superadmin/AdminAuthRoutes"






import  AdminAuthRoutes from "./routes/admin/AdminAuthRoutes"
import  teacherRoutes from "./routes/admin/teacherRoutes"
import  SubjectRoutesadmin from "./routes/admin/subjectRoutes"
import  studentsRoutesAdmin from "./routes/admin/studentsRoutes"
import  LeadRoute from "./routes/admin/LeadRoute"




import  AuthRoutes from "./routes/teachers/AuthRoutes"
import  SubjectRoutes from "./routes/teachers/SubjectRoutes"
import  studentsRoutes from "./routes/teachers/studentsRoutes"
import  demoRoutes from "./routes/teachers/demoRoutes"



import  studentAuth from "./routes/student/studentAuth"








import errorHandler from "./helper/errorHandler";
import { connectRedis } from "./helper/redisServer";
import cors from "cors"
import path from "path"
import mongoose from "mongoose";
import { verifyAuth } from "./helper/verifyRoute";
import { logoutTeacher } from "./controller/teachers/teacherAuth";
const app = express()
   

const allowedOrigins = [
  ...(process.env.FRONTEND_URL?.split(",") || []),
  "app://-",
].map((origin) => origin.trim());


app.use(cors({
  origin: (origin, callback) => {
      // Allow requests without an Origin header
      // (Electron / server-side requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,               
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],

  })) 
  app.use(cookieParser())


    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use( "/uploads", express.static(path.join(process.cwd(), "uploads"), {
    maxAge: "7d",              
    etag: true,               
    lastModified: true,        
    immutable: true}));

    app.get("/ping",async(req:Request,res:Response)=>{return res.status(200).send("Pong")})

    app.get("/api/v1/routeverify",verifyAuth)

    

//superAdmin 


app.use("/api/v1/super/auth",SuperAdminAuthRoutes)







//admin



app.use("/api/v1/admin/auth",AdminAuthRoutes)
app.use("/api/v1/admin/teacher",teacherRoutes)
app.use("/api/v1/admin/subject",SubjectRoutesadmin)
app.use("/api/v1/admin/students",studentsRoutesAdmin)
app.use("/api/v1/admin/lead",LeadRoute)

/// teacher ////



app.use("/api/v1/teacher/auth",AuthRoutes)
app.use("/api/v1/teacher/subject",SubjectRoutes)
app.use("/api/v1/teacher/students",studentsRoutes)
app.use("/api/v1/teacher/demo",demoRoutes)




////students ////////
app.use("/api/v1/student/auth",studentAuth)
 



app.use(errorHandler) 





const PORT = process.env.PORT || 8001;


mongoose.connect(process.env.DATABASE_URL!).then(async()=>{
  try {
    await connectRedis()
        app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
        console.error("Server startup failed:", error);
    process.exit(1);
  }
})

   