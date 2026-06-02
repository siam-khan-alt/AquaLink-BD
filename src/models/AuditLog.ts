import { Schema, model, models, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: String, required: true, index: true },
    userRole: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String, index: true },
    method: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    status: { type: String, enum: ['success', 'failure'], required: true, index: true },
    errorMessage: { type: String },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, timestamp: -1 });
AuditLogSchema.index({ status: 1, timestamp: -1 });

// TTL index to automatically delete logs after 90 days (7776000 seconds)
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

const AuditLog = models.AuditLog || model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
