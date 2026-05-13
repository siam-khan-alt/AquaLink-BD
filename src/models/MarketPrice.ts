import mongoose, { Schema, Document, Model } from "mongoose";
import { IMarketPrice } from "@/shared/types/market";

type MarketPriceDoc = IMarketPrice & Document;

const MarketPriceSchema = new Schema<MarketPriceDoc>({
  fishName: { type: String, required: true, index: true },
  category: { type: String, enum: ['carp', 'catfish', 'prawn', 'others'], required: true },
  currentPrice: { type: Number, required: true },
  unit: { type: String, default: "kg" },
  trend: { type: String, enum: ['up', 'down', 'stable'], default: "stable" },
  location: { type: String, required: true, index: true },
  lastUpdated: { type: Date, default: Date.now },
  history: [{
    date: { type: Date, default: Date.now },
    price: { type: Number, required: true }
  }]
}, { timestamps: true });

MarketPriceSchema.index({ location: 1, lastUpdated: -1 });

export const MarketPrice: Model<MarketPriceDoc> = 
  mongoose.models.MarketPrice || mongoose.model<MarketPriceDoc>("MarketPrice", MarketPriceSchema);
  MarketPriceSchema.index({ fishName: 1, category: 1 });
MarketPriceSchema.index({ lastUpdated: -1 });