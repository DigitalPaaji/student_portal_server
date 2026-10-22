import mongoose, { Document, Schema, Model } from "mongoose";
import { learningDB } from "../helper/database";


interface IInstallmentPayment {
  amount: number;
  date: Date;
  mode:"online" | "offline";
}

interface IInstallments {
  registration: IInstallmentPayment;
  first_installment: IInstallmentPayment;
  second_installment: IInstallmentPayment;
  third_installment: IInstallmentPayment;
  mode:"online" | "offline";
}

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
  coursefees:number;
  submitedfees:number;

  
  studentId?: string;

  status: "ACTIVE" | "INACTIVE" | "BLOCKED";

    createBy: mongoose.Types.ObjectId;
    createByModel: "superadmin" | "Teacher";
 installments:IInstallments ;
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

   
  coursefees:{
    type:Number,
    required:true
  },  

 submitedfees:{
    type:Number,
    default:0
  },  

 installments: {
  registration: {
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    date: {
      type: Date,
      default: null,
    },
    mode:{
      type:String,
      enum:["online","offline"]
    },
  },

  first_installment: {
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    date: {
      type: Date,
      default: null,
    },
     mode:{
      type:String,
      enum:["online","offline"]
    }
  },

  second_installment: {
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    date: {
      type: Date,
      default: null,
    },
     mode:{
      type:String,
      enum:["online","offline"]
    }
  },

  third_installment: {
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    date: {
      type: Date,
      default: null,
    },
     mode:{
      type:String,
      enum:["online","offline"]
    }
  },  
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
  learningDB.model<IStudent>("Student", StudentSchema);


