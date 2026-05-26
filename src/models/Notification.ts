import { NotificationPriority, NotificationType, UserRole } from "@/shared/types/notification.types";
import { Schema, model, models, Document, Model, Types } from "mongoose";


export interface INotification extends Document {
  userId: Types.ObjectId | null;
  role: UserRole | null;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  link: string | null;
  metadata: Record<string, unknown>; 
  isRead: boolean;
  readAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  role: { type: String, enum: Object.values(UserRole), default: null, index: true },
  type: { 
    type: String, 
    enum: Object.values(NotificationType), 
    required: [true, "নোটিফিকেশন টাইপ অবশ্যই দিতে হবে"], 
    index: true 
  },
  priority: { 
    type: String, 
    enum: Object.values(NotificationPriority), 
    default: NotificationPriority.MEDIUM, 
    index: true 
  },
  title: { type: String, required: [true, "নোটিফিকেশন শিরোনাম অবশ্যই দিতে হবে"], trim: true },
  message: { type: String, required: [true, "নোটিফিকেশন বার্তা অবশ্যই দিতে হবে"], trim: true },
  link: { type: String, default: null },
  metadata: { type: Schema.Types.Mixed, default: {} },
  isRead: { type: Boolean, default: false, index: true },
  readAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Indexing
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ role: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ priority: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

export const Notification = (models.Notification as Model<INotification>) || model<INotification>("Notification", NotificationSchema);