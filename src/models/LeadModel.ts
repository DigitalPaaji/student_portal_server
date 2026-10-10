import mongoose, { Document, Schema } from "mongoose";



export type LeadStatus =  "NEW" | "COUNSELING" |"DEMO" |"DEMODONE"| "CONVERTED" | "ACTIVE" | "INACTIVE"  | "NOT_INTERESTED";

export type LeadPriority = "LOW" | "MEDIUM" | "HIGH";

export type LeadSource =
  | "WEBSITE"
  | "FACEBOOK"
  | "INSTAGRAM"
  | "GOOGLE"
  | "WHATSAPP"
  | "REFERRAL"
  | "CALL"
  | "WALK_IN"
  | "OTHER";

export type MaritalStatus = "single" | "married";

export type Gender = "male" | "female";

export type PreferredMode = "online" | "offline";

/* ---------------------------------- */
/* Student Lead Interface */
/* ---------------------------------- */

interface IDemo {
assignto:mongoose.Types.ObjectId;
status:"active" | "done";
demodate:Date,
note:String
}


export interface IStudentLead extends Document {
  name: string;

  father?: string;
  mother?: string;

  dob?: Date | null;

  marital: MaritalStatus;
  gender: Gender;

  phone: string;
  guardianPhone: string;

  email?: string;

  qualification?: string;

  address?: string;
  city?: string;
  state?: string;

  course?: string;
  interestedCourse?: string;

  source: LeadSource;

  status: LeadStatus;

  priority: LeadPriority;

  preferredMode: PreferredMode;

  notes?: string;
  
  converted: boolean;
demo:IDemo;
  createdBy?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

/* ---------------------------------- */
/* Schema */
/* ---------------------------------- */

const StudentLeadSchema = new Schema<IStudentLead>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    father: {
      type: String,
      trim: true,
    },

    mother: {
      type: String,
      trim: true,
    },

    dob: {
      type: Date,
      default: null,
    },

    marital: {
      type: String,
      enum: ["single", "married"],
      default: "single",
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    guardianPhone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    qualification: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    course: {
      type: String,
      trim: true,
    },

    interestedCourse: {
      type: String,
      trim: true,
    },
   demo :{
    assignto :{
      type:mongoose.Schema.Types.ObjectId,
       ref:"Teacher"
       },
    status:{
      type:String,
      enum:["active","done"],
      default:"active"
    },
    demodate:{
      type:Date,
   
     },
      note:{
        type:String
      }

   },

   

    source: {
      type: String,
      enum: [
        "WEBSITE",
        "FACEBOOK",
        "INSTAGRAM",
        "GOOGLE",
        "WHATSAPP",
        "REFERRAL",
        "CALL",
        "WALK_IN",
        "OTHER",
      ],
      default: "OTHER",
    },

    status: {
      type: String,
      enum: [
        "NEW",
        "COUNSELING",
        "DEMO",
        "DEMODONE",
        "CONVERTED",
        "ACTIVE",
        "INACTIVE",
        "NOT_INTERESTED",
      
      ],
      default: "NEW",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    preferredMode: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },


    notes: {
      type: String,
      trim: true,
    },

    converted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "superadmin",
    },
  },
  {
    timestamps: true,
  }
);

/* ---------------------------------- */
/* Model */
/* ---------------------------------- */

const StudentLead = mongoose.model<IStudentLead>(
  "StudentLead",
  StudentLeadSchema
);

export default StudentLead;