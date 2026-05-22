import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmergencyDiseaseAlert {
  region: string;
  title: string;
  detail: string;
  level: "info" | "warning" | "danger";
  isActive: boolean;
  createdAt: Date;
}

type EmergencyDiseaseAlertDoc = IEmergencyDiseaseAlert & Document;

const EmergencyDiseaseAlertSchema = new Schema<EmergencyDiseaseAlertDoc>({
  region: { type: String, required: true },
  title: { type: String, required: true },
  detail: { type: String, required: true },
  level: { type: String, enum: ["info", "warning", "danger"], required: true },
  isActive: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

EmergencyDiseaseAlertSchema.index({ isActive: 1, createdAt: -1 });
EmergencyDiseaseAlertSchema.index({ level: 1, isActive: 1 });

export const EmergencyDiseaseAlert: Model<EmergencyDiseaseAlertDoc> = 
  mongoose.models.EmergencyDiseaseAlert || mongoose.model<EmergencyDiseaseAlertDoc>("EmergencyDiseaseAlert", EmergencyDiseaseAlertSchema);
