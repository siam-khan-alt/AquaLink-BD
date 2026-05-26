import { Schema, model, models, Document, Model, Types } from "mongoose";

export enum NotificationType {
  // Farmer types
  ALERT_WATER_QUALITY = 'alert_water_quality',
  ALERT_DISEASE = 'alert_disease',
  REMINDER_FEEDING = 'reminder_feeding',
  REMEMBER_HARVEST = 'remember_harvest',
  CONSULTATION_UPDATE = 'consultation_update',
  MARKET_PRICE = 'market_price',
  WEATHER_ALERT = 'weather_alert',
  
  // Doctor types
  CONSULTATION_REQUEST = 'consultation_request',
  PATIENT_ALERT = 'patient_alert',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  PRESCRIPTION_UPDATE = 'prescription_update',
  EMERGENCY_CASE = 'emergency_case',
  
  // Admin types
  SYSTEM_MAINTENANCE = 'system_maintenance',
  USER_REGISTRATION = 'user_registration',
  REPORT_GENERATED = 'report_generated',
  PAYMENT_RECEIVED = 'payment_received',
  SECURITY_ALERT = 'security_alert',
  DATA_SYNC = 'data_sync',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum UserRole {
  FARMER = 'farmer',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}

export interface INotification extends Document {
  userId: Types.ObjectId | null;
  role: UserRole | null;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  link: string | null;
  // এখানে any এর বদলে Record<string, unknown> ব্যবহার করা হয়েছে
  metadata: Record<string, unknown>; 
  isRead: boolean;
  readAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    default: null,
    index: true
  },
  role: { 
    type: String, 
    enum: Object.values(UserRole),
    default: null,
    index: true
  },
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
  link: { 
    type: String, 
    default: null 
  },
  metadata: { 
    type: Schema.Types.Mixed, 
    default: {} 
  },
  isRead: { 
    type: Boolean, 
    default: false,
    index: true
  },
  readAt: { 
    type: Date, 
    default: null 
  },
  expiresAt: { 
    type: Date, 
    default: null,
    index: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
});

// Compound indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ role: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ priority: 1, isRead: 1, createdAt: -1 });

// TTL index for auto-deletion of expired notifications
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

export const Notification = (models.Notification as Model<INotification>) || model<INotification>("Notification", NotificationSchema);
