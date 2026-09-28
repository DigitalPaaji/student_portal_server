// types/express.d.ts

import type { IStudent } from "../models/studentModel";
import type { ISuperAdmin } from "../models/superAdminModel";
import  type { ITeacher } from "../models/teachermodel";

declare global {
  namespace Express {
    interface Request {
      admin?: ISuperAdmin;
      teacher?: ITeacher;
      student?:IStudent
    }
  }
}

export {};