import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFarmerStory {
  farmerName: string;
  location: string;
  title: string;
  description: string;
  thumbnail: string;
  achievement: string;
  contentType: "video" | "text"; 
  videoUrl?: string;           
  isFeatured: boolean;          
  isPublished: boolean;
  createdAt: Date;
}

type FarmerStoryDoc = IFarmerStory & Document;

const FarmerStorySchema = new Schema<FarmerStoryDoc>({
  farmerName: { type: String, required: true },
  location: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  achievement: { type: String, required: true },
  contentType: { type: String, enum: ["video", "text"], required: true, default: "video" },
  videoUrl: { type: String, default: "" },
  isFeatured: { type: Boolean, required: true, default: false },
  isPublished: { type: Boolean, required: true, default: true },
}, { timestamps: true });

FarmerStorySchema.index({ isFeatured: 1, contentType: 1 });
FarmerStorySchema.index({ isPublished: 1, createdAt: -1 });

export const FarmerStory: Model<FarmerStoryDoc> = 
  mongoose.models.FarmerStory || mongoose.model<FarmerStoryDoc>("FarmerStory", FarmerStorySchema);