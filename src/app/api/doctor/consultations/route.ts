import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";
import { Types } from "mongoose";
import { maskPhone } from "@/shared/lib/pii-masking";
import { logAuditEvent } from "@/shared/lib/audit-logger";
import { ConsultationStatus } from "@/app/dashboard/doctor/lib/consultation-state-machine";

export async function GET(req: NextRequest) {
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

    await connectDB();
    const doctorId = session.user.id as string;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Use aggregation pipeline to resolve N+1 query problem
    const pipeline = [
      {
        $match: {
          doctorId: new Types.ObjectId(doctorId),
          type: "consultation",
        },
      },
    ] as const;

    const fullPipeline: unknown[] = [...pipeline];

    if (status) {
      fullPipeline.push({ $match: { status } });
    }

    fullPipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          farmerName: "$user.name",
          farmerPhone: "$user.phone",
          farmerId: "$user._id",
          pondName: "$metadata.pondName",
          issue: "$metadata.issue",
          description: "$metadata.description",
          images: "$metadata.images",
          status: 1,
          requestedAt: "$createdAt",
          fee: "$amount",
          transactionId: "$transactionId",
        },
      }
    );

    const consultations = await Transaction.aggregate(fullPipeline as any);

    // Mask PII in response
    const maskedConsultations = consultations.map((consultation: unknown) => {
      const c = consultation as Record<string, unknown>;
      return {
        ...c,
        farmerPhone: maskPhone(c.farmerPhone as string),
      };
    });

    // Get total count for pagination
    const matchStage: Record<string, unknown> = status 
      ? { doctorId: new Types.ObjectId(doctorId), type: "consultation", status }
      : { doctorId: new Types.ObjectId(doctorId), type: "consultation" };
    
    const total = await Transaction.countDocuments(matchStage as any);

    // Log audit event
    await logAuditEvent({
      userId: doctorId,
      userRole: "doctor",
      action: "view_consultations",
      resource: "consultation_list",
      method: "GET",
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: "success",
      metadata: { 
        consultationCount: consultations.length,
        statusFilter: status,
      },
    });

    return NextResponse.json({ 
      consultations: maskedConsultations,
      total,
      page,
      limit,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching doctor consultations:", errorMessage);
    return NextResponse.json(
      { error: "কনসালটেশন লোড করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}

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
    const { consultationId, status, action } = body;

    if (!consultationId || !status) {
      return NextResponse.json(
        { error: "কনসালটেশন আইডি এবং স্ট্যাটাস প্রয়োজন" },
        { status: 400 }
      );
    }

    await connectDB();
    const doctorId = session.user.id as string;

    // Update consultation status
    const updatedConsultation = await Transaction.findOneAndUpdate(
      {
        _id: consultationId,
        doctorId,
        type: "consultation",
      },
      { status },
      { new: true }
    ).lean();

    if (!updatedConsultation) {
      return NextResponse.json(
        { error: "কনসালটেশন পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // Log audit event
    await logAuditEvent({
      userId: doctorId,
      userRole: "doctor",
      action: action || "update_consultation_status",
      resource: "consultation",
      resourceId: consultationId,
      method: "PATCH",
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: "success",
      metadata: { 
        newStatus: status,
        action,
      },
    });

    return NextResponse.json({
      message: "কনসালটেশন স্ট্যাটাস আপডেট করা হয়েছে",
      consultation: updatedConsultation,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating consultation status:", errorMessage);
    return NextResponse.json(
      { error: "কনসালটেশন আপডেট করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
