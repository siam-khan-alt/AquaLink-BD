/**
 * Audit Logs API Endpoint
 * Provides searchable/filterable audit log entries
 * Uses MongoDB aggregation pipelines for efficient querying
 */

import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/shared/lib/db';
import { getToken } from 'next-auth/jwt';
import { PipelineStage } from 'mongoose';
import AuditLog from '@/models/AuditLog';
import { requirePermission, forbiddenResponse } from '@/shared/lib/require-permission';
import { maskUserPII } from '@/shared/lib/pii-masking';

export interface AuditLogEntry {
  _id: string;
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

export interface AuditLogsResponse {
  logs: AuditLogEntry[];
  total: number;
  limit: number;
  skip: number;
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id || token.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Permission check
    const permissionCheck = await requirePermission(req, 'system:audit');
    if (!permissionCheck.success) {
      return forbiddenResponse(permissionCheck.error || 'Forbidden');
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const actorId = searchParams.get('actorId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Validate and parse pagination parameters
    const limitParam = searchParams.get('limit');
    const skipParam = searchParams.get('skip');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const skip = skipParam ? parseInt(skipParam, 10) : 0;

    // Ensure limit and skip are valid numbers
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be between 1 and 100.' },
        { status: 400 }
      );
    }

    if (isNaN(skip) || skip < 0) {
      return NextResponse.json(
        { error: 'Invalid skip parameter. Must be a non-negative integer.' },
        { status: 400 }
      );
    }

    // Build aggregation pipeline
    const pipeline: PipelineStage[] = [];

    // Match stage for filtering
    const matchStage: Record<string, unknown> = {};
    if (action) matchStage.action = action;
    if (resource) matchStage.resource = resource;
    if (status) matchStage.status = status;
    if (userId) matchStage.userId = userId;
    if (actorId) matchStage.userId = actorId;
    
    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) (matchStage.timestamp as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (matchStage.timestamp as Record<string, unknown>).$lte = new Date(endDate);
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Sort by timestamp descending
    pipeline.push({ $sort: { timestamp: -1 } });

    // Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const logs = await AuditLog.aggregate(pipeline);

    // Mask PII in logs before sending to frontend
    const maskedLogs = logs.map((log: AuditLogEntry) => ({
      ...log,
      userId: maskUserPII({ userId: log.userId, email: log.userId }, ['userId', 'email']).userId,
      ipAddress: log.ipAddress ? `${log.ipAddress.substring(0, 3)}***` : log.ipAddress,
    }));

    // Get total count for pagination
    const totalPipeline: PipelineStage[] = [];
    if (Object.keys(matchStage).length > 0) {
      totalPipeline.push({ $match: matchStage });
    }
    totalPipeline.push({ $count: 'total' });
    
    const countResult = await AuditLog.aggregate(totalPipeline);
    const total = countResult[0]?.total || 0;

    return NextResponse.json(
      { logs: maskedLogs, total, limit, skip } as AuditLogsResponse,
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('Error fetching audit logs:', errorMessage);
    console.error('Stack trace:', errorStack);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs', details: errorMessage },
      { status: 500 }
    );
  }
}
