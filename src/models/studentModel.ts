import mongoose, { Document, Schema, Model } from "mongoose";

export interface IStudent extends Document {
  fullname: string;
  email: string;
  password: string;
  phone?: string;
  profileImage?: string;

  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: Date;
  address?: string;
  subjects:mongoose.Schema.Types.ObjectId[];


  
  studentId?: string;

  status: "ACTIVE" | "INACTIVE" | "BLOCKED";

    createBy: mongoose.Types.ObjectId;
    createByModel: "superadmin" | "Teacher";

  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    subjects:[{
      type:  mongoose.Schema.Types.ObjectId,
      ref:"Subject"
    }
    ],

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
      minlength: 6,
    },

    phone: {
      type: String,
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },

    dateOfBirth: {
      type: Date,
    },

    address: {
      type: String,
      trim: true,
    },

    studentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

   
   

    
 isActive: {
      type: Boolean,
      default: true,
    },

   

    

    lastLogin: {
      type: Date,
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

  },
  {
    timestamps: true,
  }
);

export const StudentModel: Model<IStudent> =
  mongoose.model<IStudent>("Student", StudentSchema);


