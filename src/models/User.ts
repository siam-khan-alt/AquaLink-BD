import { Schema, model, models, Document, Model } from "mongoose";
import { encryptPatientData, decryptPatientData, isEncrypted } from "@/app/dashboard/doctor/lib/encryption";


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
  // Encrypted fields storage
  _phoneEncrypted?: string;
  _districtEncrypted?: string;
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
  // Store encrypted phone in _phoneEncrypted, provide virtual getter/setter for phone
  _phoneEncrypted: { type: String, select: false },
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
  // Store encrypted district in _districtEncrypted
  _districtEncrypted: { type: String, select: false },
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

// Virtual getter for phone - decrypts on read
UserSchema.virtual('phone').get(function(this: IUser) {
  if (!this._phoneEncrypted) return undefined;
  try {
    return decryptPatientData(this._phoneEncrypted);
  } catch (error) {
    console.error('Failed to decrypt phone:', error);
    return this._phoneEncrypted; // Return encrypted if decryption fails
  }
});

// Virtual setter for phone - encrypts on write
UserSchema.virtual('phone').set(function(this: IUser, value: string | undefined) {
  if (!value) {
    this._phoneEncrypted = undefined;
    return;
  }
  try {
    this._phoneEncrypted = encryptPatientData(value);
  } catch (error) {
    console.error('Failed to encrypt phone:', error);
    this._phoneEncrypted = value; // Fallback to plain text if encryption fails
  }
});

// Virtual getter for district - decrypts on read
UserSchema.virtual('district').get(function(this: IUser) {
  if (!this._districtEncrypted) return undefined;
  try {
    return decryptPatientData(this._districtEncrypted);
  } catch (error) {
    console.error('Failed to decrypt district:', error);
    return this._districtEncrypted;
  }
});

// Virtual setter for district - encrypts on write
UserSchema.virtual('district').set(function(this: IUser, value: string | undefined) {
  if (!value) {
    this._districtEncrypted = undefined;
    return;
  }
  try {
    this._districtEncrypted = encryptPatientData(value);
  } catch (error) {
    console.error('Failed to encrypt district:', error);
    this._districtEncrypted = value;
  }
});

// Ensure virtuals are included in JSON output
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    const retObj = ret as unknown as Record<string, unknown>;
    delete retObj._phoneEncrypted;
    delete retObj._districtEncrypted;
    delete retObj.__v;
    return retObj;
  },
});

// Ensure virtuals are included in Object output
UserSchema.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    const retObj = ret as unknown as Record<string, unknown>;
    delete retObj._phoneEncrypted;
    delete retObj._districtEncrypted;
    delete retObj.__v;
    return retObj;
  },
});


export const User = (models.User as Model<IUser>) || model<IUser>("User", UserSchema);