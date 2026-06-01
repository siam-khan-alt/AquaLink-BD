/**
 * Audit Logger
 * Tracks all administrative actions for security and compliance
 */

import { connectDB } from './db';
import mongoose from 'mongoose';

export interface AuditLogEntry {
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  status: 'success' | 'failure';
  errorMessage?: string;
}

const AuditLogSchema = new mongoose.Schema<AuditLogEntry>(
  {
    userId: { type: String, required: true, index: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    method: { type: String, required: true, enum: ['GET', 'POST', 'PATCH', 'DELETE'] },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
    status: { type: String, required: true, enum: ['success', 'failure'] },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ status: 1, timestamp: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model<AuditLogEntry>('AuditLog', AuditLogSchema);

/**
 * Log an administrative action
 */
export const logAuditEvent = async (entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> => {
  try {
    await connectDB();
    await AuditLog.create({
      ...entry,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging failure shouldn't break the main operation
  }
};

/**
 * Get audit logs for a specific user
 */
export const getUserAuditLogs = async (
  userId: string,
  limit: number = 100,
  skip: number = 0
): Promise<AuditLogEntry[]> => {
  try {
    await connectDB();
    return await AuditLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();
  } catch (error) {
    console.error('Failed to fetch user audit logs:', error);
    return [];
  }
};

/**
 * Get audit logs for a specific resource
 */
export const getResourceAuditLogs = async (
  resource: string,
  resourceId?: string,
  limit: number = 100,
  skip: number = 0
): Promise<AuditLogEntry[]> => {
  try {
    await connectDB();
    const query: Record<string, unknown> = { resource };
    if (resourceId) {
      query.resourceId = resourceId;
    }
    return await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();
  } catch (error) {
    console.error('Failed to fetch resource audit logs:', error);
    return [];
  }
};

/**
 * Get recent audit logs across all resources
 */
export const getRecentAuditLogs = async (
  limit: number = 100,
  skip: number = 0
): Promise<AuditLogEntry[]> => {
  try {
    await connectDB();
    return await AuditLog.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();
  } catch (error) {
    console.error('Failed to fetch recent audit logs:', error);
    return [];
  }
};

/**
 * Get audit statistics
 */
export const getAuditStatistics = async (days: number = 30): Promise<{
  totalActions: number;
  successRate: number;
  actionsByType: Record<string, number>;
  actionsByResource: Record<string, number>;
  topUsers: Array<{ userId: string; actionCount: number }>;
}> => {
  try {
    await connectDB();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await AuditLog.find({ timestamp: { $gte: startDate } })
      .lean()
      .exec();

    const totalActions = logs.length;
    const successCount = logs.filter(log => log.status === 'success').length;
    const successRate = totalActions > 0 ? (successCount / totalActions) * 100 : 0;

    const actionsByType: Record<string, number> = {};
    const actionsByResource: Record<string, number> = {};
    const userActionCounts: Record<string, number> = {};

    logs.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      actionsByResource[log.resource] = (actionsByResource[log.resource] || 0) + 1;
      userActionCounts[log.userId] = (userActionCounts[log.userId] || 0) + 1;
    });

    const topUsers = Object.entries(userActionCounts)
      .map(([userId, actionCount]) => ({ userId, actionCount }))
      .sort((a, b) => b.actionCount - a.actionCount)
      .slice(0, 10);

    return {
      totalActions,
      successRate: Number(successRate.toFixed(2)),
      actionsByType,
      actionsByResource,
      topUsers,
    };
  } catch (error) {
    console.error('Failed to fetch audit statistics:', error);
    return {
      totalActions: 0,
      successRate: 0,
      actionsByType: {},
      actionsByResource: {},
      topUsers: [],
    };
  }
};

export default AuditLog;
