import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { getToken } from "next-auth/jwt";
import Subscriber from "@/models/Subscriber";
import { requirePermission, forbiddenResponse } from "@/shared/lib/require-permission";
import { withRateLimit } from "@/shared/lib/rate-limit";
import { logAuditEvent } from "@/shared/lib/audit-logger";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting check
    const rateLimitResult = await withRateLimit(req, 'strict');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    // Permission check
    const permissionCheck = await requirePermission(req, 'newsletter:delete');
    if (!permissionCheck.success) {
      return forbiddenResponse(permissionCheck.error || 'Forbidden');
    }

    const userId = permissionCheck.user!.id;
    const userRole = permissionCheck.user!.role;
    const subscriberId = (await params).id;

    await connectDB();

    const subscriber = await Subscriber.findByIdAndDelete(subscriberId);
    if (!subscriber) {
      await logAuditEvent({
        userId,
        userRole,
        action: 'delete_subscriber',
        resource: 'subscriber',
        resourceId: subscriberId,
        method: 'DELETE',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        errorMessage: 'Subscriber not found',
      });
      
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 }
      );
    }

    // Log successful audit event
    await logAuditEvent({
      userId,
      userRole,
      action: 'delete_subscriber',
      resource: 'subscriber',
      resourceId: subscriberId,
      method: 'DELETE',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: 'success',
      metadata: { subscriberEmail: subscriber.email },
    });

    return NextResponse.json(
      { message: "Subscriber deleted successfully" },
      { status: 200, headers: rateLimitResult.headers }
    );
  } catch (error) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Log failed audit event
    if (token?.id) {
      await logAuditEvent({
        userId: token.id as string,
        userRole: token.role as string,
        action: 'delete_subscriber',
        resource: 'subscriber',
        resourceId: (await params).id,
        method: 'DELETE',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        errorMessage,
      });
    }
    
    console.error("Error deleting subscriber:", error);
    return NextResponse.json(
      { error: "Failed to delete subscriber" },
      { status: 500 }
    );
  }
}
