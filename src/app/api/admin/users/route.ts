import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { User } from "@/models/User";
import { maskUserPII } from "@/shared/lib/pii-masking";
import { logAuditEvent } from "@/shared/lib/audit-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access only." },
        { status: 401 }
      );
    }

    await connectDB();

    const farmers = await User.find({ role: "farmer" })
      .select("name email phone isVerified createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Mask PII in user data
    const maskedFarmers = farmers.map(farmer => 
      maskUserPII(farmer as unknown as Record<string, unknown>, ['email', 'phone'])
    );

    // Log audit event for user data access
    await logAuditEvent({
      userId: session.user.id as string,
      userRole: session.user.role as string,
      action: 'view_users',
      resource: 'user',
      method: 'GET',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: 'success',
      metadata: { count: farmers.length },
    });

    return NextResponse.json({ success: true, farmers: maskedFarmers }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error fetching farmers:", message);
    
    // Log failed audit event
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await logAuditEvent({
        userId: session.user.id as string,
        userRole: session.user.role as string,
        action: 'view_users',
        resource: 'user',
        method: 'GET',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        errorMessage: message,
      });
    }

    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}
