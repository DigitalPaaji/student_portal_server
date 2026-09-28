import { Document, model, Schema } from "mongoose";


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


const SuperAdmin = model<ISuperAdmin>("superadmin",superAdminSchema);

export default SuperAdmin;

