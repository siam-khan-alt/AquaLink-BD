import { Schema, model, models, Document, Model } from "mongoose";


export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  image?: string;
  firebaseUid?: string; 
  role: "farmer" | "admin" | "doctor";
  isVerified: boolean;
  district?: string;
  division?: string;
  // Doctor-specific fields
  specialization?: string;
  degree?: string;           
  experience?: number;        
  certificateUrl?: string;
  licenseNumber?: string;
  consultationFee?: number;
  bio?: string;
  availability?: {
    isAvailable: boolean;
    weeklySchedule?: {
      monday?: { start: string; end: string };
      tuesday?: { start: string; end: string };
      wednesday?: { start: string; end: string };
      thursday?: { start: string; end: string };
      friday?: { start: string; end: string };
      saturday?: { start: string; end: string };
      sunday?: { start: string; end: string };
    };
  };
  createdAt: Date;
}


const UserSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: [true, "নাম অবশ্যই দিতে হবে"] 
  },
  email: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  phone: { 
    type: String, 
    unique: true, 
    sparse: true,
    index: true 
  },
  password: { 
    type: String, 
    select: false 
  },
  image: { type: String },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  role: { 
    type: String, 
    enum: ["farmer", "admin", "doctor"], 
    default: "farmer" 
  },
  isVerified: { type: Boolean, default: false },
  district: { type: String },
  division: { type: String },
  // Doctor-specific fields
  specialization: { type: String },
  degree: { type: String },          
  experience: { type: Number },        
  certificateUrl: { type: String },
  licenseNumber: { type: String },
  consultationFee: { type: Number },
  bio: { type: String },
  availability: {
    isAvailable: { type: Boolean, default: true },
    weeklySchedule: {
      monday: { start: String, end: String },
      tuesday: { start: String, end: String },
      wednesday: { start: String, end: String },
      thursday: { start: String, end: String },
      friday: { start: String, end: String },
      saturday: { start: String, end: String },
      sunday: { start: String, end: String },
    },
  },
  createdAt: { type: Date, default: Date.now },
});


export const User = (models.User as Model<IUser>) || model<IUser>("User", UserSchema);