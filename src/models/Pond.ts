import { Schema, model, models, Document, Model } from "mongoose";

export interface IExpense {
  type: string;
  amount: number;
  date: Date;
  note?: string;
}

export interface IWaterQuality {
  pH: number;
  dissolvedO2: number;
  lastTested: Date;
}

export interface IPond extends Document {
  owner: Schema.Types.ObjectId;
  name: string;
  area: number;
  fishType: string[];
  expenses: IExpense[];
  waterQuality: IWaterQuality;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  type: { 
    type: String, 
    required: [true, "খরচের ধরন অবশ্যই দিতে হবে"] 
  },
  amount: { 
    type: Number, 
    required: [true, "পরিমাণ অবশ্যই দিতে হবে"],
    min: [0, "পরিমাণ নেতিবাচক হতে পারবে না"]
  },
  date: { 
    type: Date, 
    required: [true, "তারিখ অবশ্যই দিতে হবে"],
    default: Date.now
  },
  note: { type: String }
});

const WaterQualitySchema = new Schema<IWaterQuality>({
  pH: { 
    type: Number, 
    required: [true, "pH মান অবশ্যই দিতে হবে"],
    min: [0, "pH মান ০ এর কম হতে পারবে না"],
    max: [14, "pH মান ১৪ এর বেশি হতে পারবে না"]
  },
  dissolvedO2: { 
    type: Number, 
    required: [true, "দ্রবীভূত অক্সিজেন মান অবশ্যই দিতে হবে"],
    min: [0, "দ্রবীভূত অক্সিজেন মান নেতিবাচক হতে পারবে না"]
  },
  lastTested: { 
    type: Date, 
    required: [true, "শেষ পরীক্ষার তারিখ অবশ্যই দিতে হবে"],
    default: Date.now
  }
});

const PondSchema = new Schema<IPond>({
  owner: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, "মালিকের তথ্য অবশ্যই দিতে হবে"] 
  },
  name: { 
    type: String, 
    required: [true, "পুকুরের নাম অবশ্যই দিতে হবে"],
    trim: true
  },
  area: { 
    type: Number, 
    required: [true, "পুকুরের আয়তন অবশ্যই দিতে হবে"],
    min: [0, "আয়তন নেতিবাচক হতে পারবে না"]
  },
  fishType: { 
    type: [String], 
    required: [true, "মাছের ধরন অবশ্যই দিতে হবে"],
    default: []
  },
  expenses: { 
    type: [ExpenseSchema], 
    default: []
  },
  waterQuality: { 
    type: WaterQualitySchema,
    required: [true, "পানির গুণমানের তথ্য অবশ্যই দিতে হবে"]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

PondSchema.index({ owner: 1 });
PondSchema.index({ name: 1 });

export const Pond = (models.Pond as Model<IPond>) || model<IPond>("Pond", PondSchema);
