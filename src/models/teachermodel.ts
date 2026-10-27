import mongoose, { Document, Schema } from "mongoose";
import { learningDB } from "../helper/database";

// Teacher Interface
export interface ITeacher extends Document {
  fullname: string;
  email: string;
  password: string;
  phone?: string;
  profileImage?: string;
  designation?: string;
  specialization?: string;

  bio?: string;
  qualification?: string;
  experience?: number;

   subjects: string[];
   modules: mongoose.Types.ObjectId[];
   demos: mongoose.Types.ObjectId[];
  students:mongoose.Types.ObjectId[];
  isVerified: boolean;
  isActive: boolean;

  role: "teacher";

  createdAt: Date;
  updatedAt: Date;
}

// Teacher Schema
const teacherSchema = new Schema<ITeacher>(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      default: "",
    },

    specialization: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    qualification: {
      type: String,
      default: "",
    },

    experience: {
      type: Number,
      default: 0,
    },

    subjects: {
      type: [String],
      default: [],
    },

    modules: [
      {
        type: Schema.Types.ObjectId,
        ref: "Module",
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },
     demos:[
      {type:mongoose.Schema.Types.ObjectId,
        ref:"StudentLead"

      }
     ],
    isActive: {
      type: Boolean,
      default: true,
    },
  students:[
    {type:mongoose.Schema.Types.ObjectId,
      ref:"Student"
    }
   ]
   
  },
  {
    timestamps: true,
  }
);

// Export Model
const Teacher = learningDB.model<ITeacher>(
  "Teacher",
  teacherSchema
);

export default Teacher;