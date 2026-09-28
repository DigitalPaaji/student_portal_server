import mongoose, { Schema, Document } from "mongoose";

export interface ITeacherAttendance extends Document {
  teacherId: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status:
    | "PRESENT"
    | "ABSENT"
    | "LATE"
    | "HALF_DAY"
    | "LEAVE";
  remarks?: string;
}

const TeacherAttendanceSchema = new Schema<ITeacherAttendance>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    checkIn: {
      type: Date,
    },

    checkOut: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "PRESENT",
        "ABSENT",
        "LATE",
        "HALF_DAY",
        "LEAVE",
      ],
      default: "PRESENT",
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

TeacherAttendanceSchema.index(
  {
    teacherId: 1,
    date: 1,
  },
  { unique: true }
);

export const TeacherAttendance = mongoose.model(
  "TeacherAttendance",
  TeacherAttendanceSchema
);