import { Schema, model, models, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  transactionId: string;
  userId: string; // The user who made the payment
  type: "course" | "consultation";
  itemId: string; // courseId or doctorId
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: string;
  paymentGateway?: string;
  // Commission fields for consultations
  doctorId?: string;
  adminCommission?: number; // 10% of amount
  doctorEarnings?: number; // 90% of amount
  // Metadata
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["course", "consultation"],
      required: true,
    },
    itemId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "BDT",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: { type: String },
    paymentGateway: { type: String, default: "sslcommerz" },
    // Commission fields for consultations
    doctorId: { type: String },
    adminCommission: { type: Number },
    doctorEarnings: { type: Number },
    // Metadata
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate commission for consultation payments
TransactionSchema.pre("save", function (_next) {
  if (this.type === "consultation" && this.status === "paid" && !this.adminCommission && !this.doctorEarnings) {
    const adminCommission = this.amount * 0.1; // 10% commission
    const doctorEarnings = this.amount * 0.9; // 90% earnings
    
    this.adminCommission = adminCommission;
    this.doctorEarnings = doctorEarnings;
  }
  _next();
});

const Transaction =
  (models.Transaction as Model<ITransaction>) ||
  model<ITransaction>("Transaction", TransactionSchema);

export { Transaction };
export default Transaction;
