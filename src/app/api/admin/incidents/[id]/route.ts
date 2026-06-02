/**
 * Incident Detail API Routes
 * Update and delete specific incidents
 */

import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/shared/lib/db';
import { getToken } from 'next-auth/jwt';
import Incident from '@/models/Incident';
import { requirePermission, forbiddenResponse } from '@/shared/lib/require-permission';
import { withRateLimit } from '@/shared/lib/rate-limit';
import { logAuditEvent } from '@/shared/lib/audit-logger';
import { maskUserPII } from '@/shared/lib/pii-masking';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Permission check
    const permissionCheck = await requirePermission(req, 'incidents:read');
    if (!permissionCheck.success) {
      return forbiddenResponse(permissionCheck.error || 'Forbidden');
    }

    await connectDB();

    const incident = await Incident.findById((await params).id).lean();
    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    // Mask PII in incident before sending to frontend
    const maskedIncident = maskUserPII(incident as Record<string, unknown>, ['reportedBy']);

    return NextResponse.json({ incident: maskedIncident }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching incident:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const incidentId = (await params).id;

    await connectDB();
    const body = await req.json();

    const incident = await Incident.findById(incidentId).lean();
    if (!incident) {
      await logAuditEvent({
        userId,
        userRole,
        action: 'update_incident',
        resource: 'incident',
        resourceId: incidentId,
        method: 'PATCH',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        errorMessage: 'Incident not found',
      });
      
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    // If status is being changed to resolved, set resolvedAt
    if (body.status === 'resolved' && incident.status !== 'resolved') {
      body.resolvedAt = new Date();
    }

    // If adding an update
    if (body.updateMessage) {
      incident.updates.push({
        message: body.updateMessage,
        author: userId,
        timestamp: new Date(),
      });
      delete body.updateMessage;
    }

    Object.assign(incident, body);
    await incident.save();

    // Log audit event
    await logAuditEvent({
      userId,
      userRole,
      action: 'update_incident',
      resource: 'incident',
      resourceId: incidentId,
      method: 'PATCH',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: 'success',
      metadata: { 
        incidentTitle: incident.title,
        statusChange: body.status,
      },
    });

    return NextResponse.json(
      { incident },
      { status: 200, headers: rateLimitResult.headers }
    );
  } catch (error) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log failed audit event
    if (token?.id) {
      await logAuditEvent({
        userId: token.id as string,
        userRole: token.role as string,
        action: 'update_incident',
        resource: 'incident',
        resourceId: (await params).id,
        method: 'PATCH',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        errorMessage,
      });
    }
    
    console.error('Error updating incident:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const permissionCheck = await requirePermission(req, 'incidents:delete');
    if (!permissionCheck.success) {
      return forbiddenResponse(permissionCheck.error || 'Forbidden');
    }

    const userId = permissionCheck.user!.id;
    const userRole = permissionCheck.user!.role;
    const incidentId = (await params).id;

    await connectDB();

    const incident = await Incident.findByIdAndDelete(incidentId);
    if (!incident) {
      await logAuditEvent({
        userId,
        userRole,
        action: 'delete_incident',
        resource: 'incident',
        resourceId: incidentId,
        method: 'DELETE',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        errorMessage: 'Incident not found',
      });
      
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    // Log audit event
    await logAuditEvent({
      userId,
      userRole,
      action: 'delete_incident',
      resource: 'incident',
      resourceId: incidentId,
      method: 'DELETE',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: 'success',
      metadata: { incidentTitle: incident.title },
    });

    return NextResponse.json(
      { message: 'Incident deleted successfully' },
      { status: 200, headers: rateLimitResult.headers }
    );
  } catch (error) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log failed audit event
    if (token?.id) {
      await logAuditEvent({
        userId: token.id as string,
        userRole: token.role as string,
        action: 'delete_incident',
        resource: 'incident',
        resourceId: (await params).id,
        method: 'DELETE',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        errorMessage,
      });
    }
    
    console.error('Error deleting incident:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to delete incident' },
      { status: 500 }
    );
  }
}
