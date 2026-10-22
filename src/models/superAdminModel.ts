import { Document, Schema } from "mongoose";
import { learningDB } from "../helper/database";


interface ISuperAdmin extends Document{
    name:string;
    email:string;
    password:string;
    access:string[];
    leadaccess:string[];
}


const superAdminSchema= new Schema<ISuperAdmin>({
    
    name:{
        type:String,
        required:true,
    },
    
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    access:{
  type: [String],
  default: []},
   leadaccess: {
  type: [String],
  default: [],
},

},{timestamps:true})


const SuperAdmin = learningDB.model<ISuperAdmin>("superadmin",superAdminSchema);

export default SuperAdmin;

