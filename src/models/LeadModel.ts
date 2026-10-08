import mongoose, { Document, Schema } from "mongoose";

export interface IStudentLead extends Document {
  name: string;
  phone: string;
  email?: string;

  qualification?: string;
  city?: string;
  state?: string;

  course?: string;
  interestedCourse?: string;

  source?: string;

  status:
    | "NEW"
    | "CONTACTED"
    | "INTERESTED"
    | "FOLLOW_UP"
    | "CONVERTED"
    | "NOT_INTERESTED"
    | "LOST";

  priority: "LOW" | "MEDIUM" | "HIGH";


  notes?: string;

  converted: boolean;
 

  createdBy?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const StudentLeadSchema = new Schema<IStudentLead>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
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
        "CONTACTED",
        "INTERESTED",
        "FOLLOW_UP",
        "CONVERTED",
        "NOT_INTERESTED",
        "LOST",
      ],
      default: "NEW",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
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

const StudentLead = mongoose.model<IStudentLead>(
  "StudentLead",
  StudentLeadSchema
);

export default StudentLead;