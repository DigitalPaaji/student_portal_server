import mongoose, { Schema, Document } from "mongoose";

export interface IStudentAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  date: Date;
  status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE";
  remarks?: string;
}

const StudentAttendanceSchema = new Schema<IStudentAttendance>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LATE", "LEAVE"],
      default: "PRESENT",
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

StudentAttendanceSchema.index(
  {
    studentId: 1,
    subjectId: 1,
    date: 1,
  },
  { unique: true }
);

export const StudentAttendance = mongoose.model(
  "StudentAttendance",
  StudentAttendanceSchema
);