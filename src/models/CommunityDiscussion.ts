import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICommunityDiscussion {
  title: string;
  replies: number;
  views: number;
  category: string;
  authorName: string;
  createdAt: Date;
}

type CommunityDiscussionDoc = ICommunityDiscussion & Document;

const CommunityDiscussionSchema = new Schema<CommunityDiscussionDoc>({
  title: { type: String, required: true },
  replies: { type: Number, required: true, default: 0 },
  views: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  authorName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

CommunityDiscussionSchema.index({ createdAt: -1 });
CommunityDiscussionSchema.index({ category: 1 });

export const CommunityDiscussion: Model<CommunityDiscussionDoc> = 
  mongoose.models.CommunityDiscussion || mongoose.model<CommunityDiscussionDoc>("CommunityDiscussion", CommunityDiscussionSchema);
