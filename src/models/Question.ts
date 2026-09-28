import mongoose, { Document, Schema } from "mongoose";

export interface IQuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface IQuestion extends Document {
  moduleId: mongoose.Types.ObjectId;
  question: string;
  options: IQuestionOption[];
  explanation?: string;
  marks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionOptionSchema = new Schema<IQuestionOption>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },

    
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestion>(
  {
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: true,
      index: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [QuestionOptionSchema],
      required: true,
      validate: {
        validator: function (value: IQuestionOption[]) {
          return (
            value.length >= 2 &&
            value.filter((option) => option.isCorrect).length === 1
          );
        },
        message:
          "Question must have at least 2 options and exactly 1 correct answer.",
      },
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
    },

    marks: {
      type: Number,
      default: 1,
      min: 1,
    },

    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "EASY",
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

QuestionSchema.index({
  moduleId: 1,
  isActive: 1,
});

export const Question = mongoose.model<IQuestion>(
  "Question",
  QuestionSchema
);