import mongoose, { Schema } from "mongoose";
import { learningDB } from "../helper/database";

export interface ISubject extends Document {
  title: string;
  createBy: mongoose.Types.ObjectId;
  createByModel: "superadmin" | "Teacher";
  subjectmodules:mongoose.Types.ObjectId[];
  completemodule:mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}



 const SubjectModel = new Schema<ISubject>({
     title:{
    type:String,
    required:true,
    trim:true,
    unique:true
            },
   createBy: {
      type: mongoose.Schema.Types.ObjectId,
      
      refPath: "createByModel",
    },
  createByModel: {
      type: String,
      
      enum: ["superadmin", "Teacher"],
    },
    subjectmodules: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module",
  },
],
    completemodule: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module",
  },
],

},{timestamps:true})

export const Subject = learningDB.model<ISubject>(
  "Subject",
  SubjectModel
);