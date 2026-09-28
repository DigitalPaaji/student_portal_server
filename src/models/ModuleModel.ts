import mongoose, { Schema, Document, Model } from "mongoose";

interface IAnswerSubmit {
  user: mongoose.Types.ObjectId;
  totalmarkes: number;
  awneswes: string[];
  pass:Boolean;
}

export interface IModule extends Document {
  subjectId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  order: number;

  createBy: mongoose.Types.ObjectId;
  createByModel: "superadmin" | "Teacher";

  answerSubmite: IAnswerSubmit[];

  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const AnswerSubmitSchema = new Schema<IAnswerSubmit>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    totalmarkes: {
      type: Number,
      default: 0,
    },

    awneswes: {
      type: [String],
      default: [],
    },
    pass:{
      type:Boolean,
      default:false
    }
  },
);

const ModuleSchema = new Schema<IModule>(
  {
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true, 
    },

    slug: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    content: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
    },

    createBy: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "createByModel",
    },

    createByModel: {
      type: String,
      required: true,
      enum: ["superadmin", "Teacher"],
    },

    answerSubmite: {
      type: [AnswerSubmitSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ModuleSchema.index(
  { subjectId: 1, slug: 1 },
  { unique: true }
);

export const ModuleModel: Model<IModule> =
  mongoose.models.Module ||
  mongoose.model<IModule>("Module", ModuleSchema);