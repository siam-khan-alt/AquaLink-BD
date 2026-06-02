import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import Subscriber from "@/models/Subscriber";
import { pusherServer } from "@/shared/lib/pusher";
import { z } from "zod";
import { logAuditEvent } from "@/shared/lib/audit-logger";
import { requirePermission, forbiddenResponse } from "@/shared/lib/require-permission";

const broadcastSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export async function POST(req: NextRequest) {
  try {
    // Permission check using requirePermission
    const permissionCheck = await requirePermission(req, 'newsletter:write');
    if (!permissionCheck.success) {
      return forbiddenResponse(permissionCheck.error || 'Forbidden');
    }

    const body = await req.json();
    const validationResult = broadcastSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid message", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { message } = validationResult.data;

    await connectDB();

    const subscribers = await Subscriber.find().lean();
    const subscriberEmails = subscribers.map((s) => s.email);

    if (subscriberEmails.length === 0) {
      return NextResponse.json(
        { message: "No subscribers to broadcast to" },
        { status: 200 }
      );
    }

    await pusherServer.trigger(
      "newsletter-broadcast",
      "new-broadcast",
      {
        message,
        recipientCount: subscriberEmails.length,
        recipients: subscriberEmails,
        sentAt: new Date().toISOString(),
      }
    );

    // Log audit event for broadcast
    await logAuditEvent({
      userId: permissionCheck.user!.id,
      userRole: permissionCheck.user!.role,
      action: 'broadcast_newsletter',
      resource: 'newsletter',
      method: 'POST',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: 'success',
      metadata: { recipientCount: subscriberEmails.length },
    });

    return NextResponse.json(
      {
        message: "Broadcast sent successfully",
        recipientCount: subscriberEmails.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error broadcasting message:", error);
    
    // Log failed audit event
    const permissionCheck = await requirePermission(req, 'newsletter:write');
    if (permissionCheck.success && permissionCheck.user?.id) {
      await logAuditEvent({
        userId: permissionCheck.user.id,
        userRole: permissionCheck.user.role,
        action: 'broadcast_newsletter',
        resource: 'newsletter',
        method: 'POST',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return NextResponse.json(
      { error: "Failed to broadcast message" },
      { status: 500 }
    );
  }
}
