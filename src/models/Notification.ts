import { Schema, model, models, Document, Model, Types } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  title: { 
    type: String, 
    required: [true, "নোটিফিকেশন শিরোনাম অবশ্যই দিতে হবে"],
    trim: true
  },
  message: { 
    type: String, 
    required: [true, "নোটিফিকেশন বার্তা অবশ্যই দিতে হবে"],
    trim: true
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { type: Date, default: Date.now }
});

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = (models.Notification as Model<INotification>) || model<INotification>("Notification", NotificationSchema);
