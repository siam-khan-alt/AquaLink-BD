import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/shared/lib/db";
import { DoctorApplication } from "@/models/DoctorApplication";
import { authOptions } from "../../auth/[...nextauth]/route";
import { logAuditEvent } from "@/shared/lib/audit-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "অনুমতি নেই" },
        { status: 403 }
      );
    }

    await connectDB();

    const applications = await DoctorApplication.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();

    // Log audit event for application access
    await logAuditEvent({
      userId: session.user.id as string,
      userRole: session.user.role as string,
      action: 'view_doctor_applications',
      resource: 'doctor_application',
      method: 'GET',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: 'success',
      metadata: { count: applications.length },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching doctor applications:", error);
    
    // Log failed audit event
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await logAuditEvent({
        userId: session.user.id as string,
        userRole: session.user.role as string,
        action: 'view_doctor_applications',
        resource: 'doctor_application',
        method: 'GET',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return NextResponse.json(
      { error: "আবেদন লোড করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
