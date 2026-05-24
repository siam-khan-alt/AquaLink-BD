import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IWaterQualityLog extends Document {
  pondId: Types.ObjectId;
  ph: number;
  dissolvedOxygen: number;
  ammonia: number;
  loggedAt: Date;
  createdAt: Date;
}

const WaterQualityLogSchema: Schema = new Schema(
  {
    pondId: {
      type: Schema.Types.ObjectId,
      required: [true, "Pond ID is required"],
      index: true,
      ref: "Pond",
    },
    ph: {
      type: Number,
      required: [true, "pH value is required"],
      min: [0, "pH cannot be negative"],
      max: [14, "pH cannot exceed 14"],
    },
    dissolvedOxygen: {
      type: Number,
      required: [true, "Dissolved Oxygen value is required"],
      min: [0, "Dissolved Oxygen cannot be negative"],
    },
    ammonia: {
      type: Number,
      required: [true, "Ammonia value is required"],
      min: [0, "Ammonia cannot be negative"],
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
WaterQualityLogSchema.index({ pondId: 1, loggedAt: -1 });
WaterQualityLogSchema.index({ loggedAt: -1 });

export const WaterQualityLog: Model<IWaterQualityLog> =
  mongoose.models.WaterQualityLog ||
  mongoose.model<IWaterQualityLog>("WaterQualityLog", WaterQualityLogSchema);
