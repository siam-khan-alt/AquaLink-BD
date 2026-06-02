import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { getToken } from "next-auth/jwt";
import Subscriber from "@/models/Subscriber";
import { logAuditEvent } from "@/shared/lib/audit-logger";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id || token.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();

    // Log audit event for subscriber access
    await logAuditEvent({
      userId: token.id as string,
      userRole: token.role as string,
      action: 'view_subscribers',
      resource: 'subscriber',
      method: 'GET',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: 'success',
      metadata: { count: subscribers.length },
    });

    return NextResponse.json({ subscribers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    
    // Log failed audit event
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token?.id) {
      await logAuditEvent({
        userId: token.id as string,
        userRole: token.role as string,
        action: 'view_subscribers',
        resource: 'subscriber',
        method: 'GET',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}
