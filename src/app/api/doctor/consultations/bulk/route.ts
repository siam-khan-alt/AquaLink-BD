/**
 * Bulk Action API Route for Consultations
 * Allows doctors to approve/reject multiple consultations at once
 */

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { Transaction } from "@/models/Transaction";
import { logAuditEvent } from "@/shared/lib/audit-logger";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { consultationIds, status, action } = body;

    if (!consultationIds || !Array.isArray(consultationIds) || consultationIds.length === 0) {
      return NextResponse.json(
        { error: "কনসালটেশন আইডি তালিকা প্রয়োজন" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: "স্ট্যাটাস প্রয়োজন" },
        { status: 400 }
      );
    }

    await connectDB();
    const doctorId = session.user.id as string;

    // Validate all consultation IDs belong to this doctor
    const consultations = await Transaction.find({
      _id: { $in: consultationIds },
      doctorId,
      type: "consultation",
    }).lean();

    if (consultations.length !== consultationIds.length) {
      return NextResponse.json(
        { error: "কিছু কনসালটেশন পাওয়া যায়নি বা অনুমোদিত নয়" },
        { status: 403 }
      );
    }

    // Bulk update consultations
    const updateResult = await Transaction.updateMany(
      {
        _id: { $in: consultationIds },
        doctorId,
        type: "consultation",
      },
      { status }
    );

    // Log audit event for bulk action
    await logAuditEvent({
      userId: doctorId,
      userRole: "doctor",
      action: action || "bulk_update_consultations",
      resource: "consultation_bulk",
      method: "PATCH",
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: "success",
      metadata: { 
        consultationIds,
        newStatus: status,
        action,
        updatedCount: updateResult.modifiedCount,
      },
    });

    return NextResponse.json({
      message: `${updateResult.modifiedCount} কনসালটেশন আপডেট করা হয়েছে`,
      updatedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error bulk updating consultations:", errorMessage);
    return NextResponse.json(
      { error: "বাল্ক আপডেট করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
