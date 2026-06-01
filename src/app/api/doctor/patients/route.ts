import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { Transaction } from "@/models/Transaction";
import { Types } from "mongoose";
import { maskPhone } from "@/shared/lib/pii-masking";
import { logAuditEvent } from "@/shared/lib/audit-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const doctorId = session.user.id as string;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    // Use aggregation pipeline with server-side pagination
    const pipeline = [
      {
        $match: {
          doctorId: new Types.ObjectId(doctorId),
          type: "consultation",
          status: "paid",
        },
      },
    ] as const;

    const fullPipeline: unknown[] = [...pipeline];

    // Add search filter if provided
    if (search) {
      fullPipeline.push({
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      });
      fullPipeline.push({
        $match: {
          "user.name": { $regex: search, $options: "i" },
        },
      });
    }

    fullPipeline.push(
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$userId",
          totalConsultations: { $sum: 1 },
          lastConsultation: { $first: "$createdAt" },
          lastIssue: { $first: "$metadata.issue" },
          consultationIds: { $push: "$_id" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          name: "$user.name",
          phone: "$user.phone",
          location: "$user.district",
          totalConsultations: 1,
          lastConsultation: 1,
          lastIssue: 1,
        },
      }
    );

    // Get total count for pagination
    const countPipeline = [
      {
        $match: {
          doctorId: new Types.ObjectId(doctorId),
          type: "consultation",
          status: "paid",
        },
      },
      {
        $group: {
          _id: "$userId",
        },
      },
      {
        $count: "total",
      },
    ] as const;

    const countResult = await Transaction.aggregate(countPipeline as any);
    const total = countResult[0]?.total || 0;

    // Add pagination to main pipeline
    const skip = (page - 1) * limit;
    fullPipeline.push(
      { $skip: skip },
      { $limit: limit }
    );

    const patients = await Transaction.aggregate(fullPipeline as any);

    // Mask PII in response
    const maskedPatients = patients.map((patient: unknown) => {
      const p = patient as Record<string, unknown>;
      return {
        ...p,
        phone: maskPhone(p.phone as string),
      };
    });

    // Log audit event
    await logAuditEvent({
      userId: doctorId,
      userRole: "doctor",
      action: "view_patients",
      resource: "patient_list",
      method: "GET",
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: "success",
      metadata: { 
        patientCount: patients.length,
        page,
        limit,
        search,
      },
    });

    return NextResponse.json({ 
      patients: maskedPatients,
      total,
      page,
      limit,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching doctor patients:", errorMessage);
    return NextResponse.json(
      { error: "রোগী তালিকা লোড করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
