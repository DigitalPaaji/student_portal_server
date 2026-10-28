import mongoose, { Document, Schema, Model } from "mongoose";
import { learningDB } from "../helper/database";


// interface IInstallmentPayment {
//   amount: number;

// }

// interface IInstallments {
//   registration: IInstallmentPayment;
//   first_installment: IInstallmentPayment;
//   second_installment: IInstallmentPayment;
//   third_installment: IInstallmentPayment;
//   mode:"online" | "offline";
// }


interface IDiscount{
amount:Number;
remark:string
}


interface IRegisteration {
  amount:Number;
  date: Date;
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
  studentStatus:"active" | "drop"|"pass out";
  studentId?: string;
  coursediscount:IDiscount;
  dropoutremark:String
  totalcoursefees:number;
  submitedfees:number;
  createBy: mongoose.Types.ObjectId;
  createByModel: "superadmin" | "Teacher";
  registration:IRegisteration
  lastLogin?: Date;
  installments:IRegisteration[];
  teacherAsign :mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}



const StudentSchema = new Schema<IStudent>({
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
    studentStatus :{
      type:String,
      enum:["active","drop","pass out"]
    },
     totalcoursefees:{
    type:Number,
    required:true
   },  

 submitedfees:{
    type:Number,
    default:0
  },
coursediscount: {
  amount: {
    type: Number,
    default: 0,
  },
  remark: {
    type: String,
    default: "",
  },
},
dropoutremark:{
  type:String,
  default:""
},

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

installments:[

  { amount: {
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
    },}
],

teacherAsign:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"Teacher"
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
    lastLogin: {
      type: Date,
    },
},{
  timestamps:true
})



export const StudentModel: Model<IStudent> =
  learningDB.model<IStudent>("Student", StudentSchema);