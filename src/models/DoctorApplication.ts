import { Schema, model, models, Document, Model } from "mongoose";

export interface IDoctorApplication extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  degree: string;
  specialization: string;
  licenseNumber: string;
  experience: number; // years
  consultationFee: number;
  bio: string;
  avatarUrl: string;
  certificateUrl: string;
  district?: string;
  division?: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string; // admin user ID
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
}

const DoctorApplicationSchema = new Schema<IDoctorApplication>({
  name: {
    type: String,
    required: [true, "নাম অবশ্যই দিতে হবে"],
  },
  email: {
    type: String,
    required: [true, "ইমেইল অবশ্যই দিতে হবে"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "ফোন নম্বর অবশ্যই দিতে হবে"],
  },
  password: {
    type: String,
    required: [true, "পাসওয়ার্ড অবশ্যই দিতে হবে"],
  },
  degree: {
    type: String,
    required: [true, "ডিগ্রি অবশ্যই দিতে হবে"],
  },
  specialization: {
    type: String,
    required: [true, "বিশেষীকরণ অবশ্যই দিতে হবে"],
  },
  licenseNumber: {
    type: String,
    required: [true, "লাইসেন্স নম্বর অবশ্যই দিতে হবে"],
    unique: true,
  },
  experience: {
    type: Number,
    required: [true, "অভিজ্ঞতা অবশ্যই দিতে হবে"],
    min: 0,
  },
  consultationFee: {
    type: Number,
    required: [true, "কনসালটেশন ফি অবশ্যই দিতে হবে"],
    min: 0,
  },
  bio: {
    type: String,
    required: [true, "বায়োগ্রাফি অবশ্যই দিতে হবে"],
    maxlength: 1000,
  },
  avatarUrl: {
    type: String,
    required: [true, "অ্যাভাটার ছবি অবশ্যই দিতে হবে"],
  },
  certificateUrl: {
    type: String,
    required: [true, "সার্টিফিকেট অবশ্যই দিতে হবে"],
  },
  district: { type: String },
  division: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const DoctorApplication =
  (models.DoctorApplication as Model<IDoctorApplication>) ||
  model<IDoctorApplication>("DoctorApplication", DoctorApplicationSchema);

export { DoctorApplication };
export default DoctorApplication;
