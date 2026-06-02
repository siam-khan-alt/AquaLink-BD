/**
 * Incident Management API Routes
 * CRUD operations for system incidents
 */

import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/shared/lib/db';
import { getToken } from 'next-auth/jwt';
import Incident from '@/models/Incident';
import { requirePermission, forbiddenResponse } from '@/shared/lib/require-permission';
import { withRateLimit } from '@/shared/lib/rate-limit';
import { logAuditEvent } from '@/shared/lib/audit-logger';
import { maskUserPII } from '@/shared/lib/pii-masking';
import { z } from 'zod';

// Input validation schema for incident creation
const incidentCreateSchema = z.object({
  title: z.string().min(1).max(200).transform(val => val.trim()),
  description: z.string().min(1).max(5000).transform(val => val.trim()),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['open', 'investigating', 'resolved', 'closed']).optional(),
  category: z.enum(['system', 'database', 'api', 'security', 'performance', 'user-reported']),
  affectedServices: z.array(z.string()).optional(),
  rootCause: z.string().optional(),
  resolution: z.string().optional(),
  assignedTo: z.string().optional(),
  estimatedResolution: z.string().optional(),
  metadata: z.any().optional(),
});

export async function GET(req: NextRequest) {
  try {
    // Permission check
    const permissionCheck = await requirePermission(req, 'incidents:read');
    if (!permissionCheck.success) {
      return forbiddenResponse(permissionCheck.error || 'Forbidden');
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (category) query.category = category;

    const incidents = await Incident.find(query)
      .sort({ startedAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Incident.countDocuments(query);

    // Mask PII in incidents before sending to frontend
    const maskedIncidents = incidents.map((incident: Record<string, unknown>) => 
      maskUserPII(incident, ['reportedBy'])
    );

    return NextResponse.json(
      { incidents: maskedIncidents, total, limit, skip },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching incidents:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitResult = await withRateLimit(req, 'strict');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    // Permission check
    const permissionCheck = await requirePermission(req, 'incidents:write');
    if (!permissionCheck.success) {
      return forbiddenResponse(permissionCheck.error || 'Forbidden');
    }

    const userId = permissionCheck.user!.id;
    const userRole = permissionCheck.user!.role;

    await connectDB();
    const body = await req.json();

    // Validate and sanitize input
    const validatedData = incidentCreateSchema.parse(body);

    const incident = await Incident.create({
      ...validatedData,
      reportedBy: userId,
    });

    // Log audit event
    await logAuditEvent({
      userId,
      userRole,
      action: 'create_incident',
      resource: 'incident',
      resourceId: incident._id.toString(),
      method: 'POST',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: 'success',
      metadata: { 
        incidentTitle: incident.title,
        severity: incident.severity,
      },
    });

    return NextResponse.json(
      { incident },
      { status: 201, headers: rateLimitResult.headers }
    );
  } catch (error) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log failed audit event
    if (token?.id) {
      await logAuditEvent({
        userId: token.id as string,
        userRole: token.role as string,
        action: 'create_incident',
        resource: 'incident',
        method: 'POST',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        errorMessage,
      });
    }
    
    console.error('Error creating incident:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}
