import { Schema, model, models, Document, Model } from "mongoose";


export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  image?: string;
  firebaseUid?: string; 
  role: "farmer" | "expert" | "business" | "admin";
  isVerified: boolean;
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
  image: { type: String },firebaseUid: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  role: { 
    type: String, 
    enum: ["farmer", "expert", "business", "admin"], 
    default: "farmer" 
  },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});


export const User = (models.User as Model<IUser>) || model<IUser>("User", UserSchema);