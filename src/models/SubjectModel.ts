import mongoose, { Schema } from "mongoose";

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
      required: true,
      refPath: "createByModel",
    },
  createByModel: {
      type: String,
      required: true,
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

export const Subject = mongoose.model<ISubject>(
  "Subject",
  SubjectModel
);