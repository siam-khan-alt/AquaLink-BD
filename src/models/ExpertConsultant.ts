import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExpertConsultant {
  name: string;
  designation: string;
  email: string;
  phone: string;
  specialization: string;
  isVerified: boolean;
  avatarUrl: string;
  createdAt: Date;
}

type ExpertConsultantDoc = IExpertConsultant & Document;

const ExpertConsultantSchema = new Schema<ExpertConsultantDoc>({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  specialization: { type: String, required: true },
  isVerified: { type: Boolean, required: true, default: true },
  avatarUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

ExpertConsultantSchema.index({ isVerified: 1, createdAt: -1 });

export const ExpertConsultant: Model<ExpertConsultantDoc> = 
  mongoose.models.ExpertConsultant || mongoose.model<ExpertConsultantDoc>("ExpertConsultant", ExpertConsultantSchema);
