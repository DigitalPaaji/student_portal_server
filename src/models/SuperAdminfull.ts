import { Document, Schema } from "mongoose";
import { learningDB } from "../helper/database";


interface ISuperAdmin extends Document{
    name:string;
    email:string;
    password:string;
}


const superAdminSchema= new Schema({
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

},{timestamps:true})


const SuperAdmin = learningDB.model<ISuperAdmin>("superadminall",superAdminSchema);

export default SuperAdmin;

