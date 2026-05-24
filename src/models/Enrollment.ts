import { Schema, model, models, Document, Model, Types } from "mongoose";

export interface IEnrollment extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  paymentStatus: "pending" | "paid" | "failed";
  transactionId: string;
  completed: boolean;
  completedAt?: Date;
  enrolledAt: Date;
  createdAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, "ব্যবহারকারী আইডি অবশ্যই দিতে হবে"] 
  },
  courseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course',
    required: [true, "কোর্স আইডি অবশ্যই দিতে হবে"] 
  },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "paid", "failed"], 
    default: "pending" 
  },
  transactionId: { 
    type: String, 
    required: [true, "ট্রানজ্যাকশন আইডি অবশ্যই দিতে হবে"],
    unique: true
  },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  enrolledAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

EnrollmentSchema.index({ userId: 1, courseId: 1 });
EnrollmentSchema.index({ paymentStatus: 1 });

export const Enrollment = (models.Enrollment as Model<IEnrollment>) || model<IEnrollment>("Enrollment", EnrollmentSchema);
