import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { EmergencyDiseaseAlert } from "@/models/EmergencyDiseaseAlert";
import { z } from "zod";

const createAlertSchema = z.object({
  region: z.string().min(2, "অঞ্চল অবশ্যই দিতে হবে"),
  title: z.string().min(5, "শিরোনাম অবশ্যই দিতে হবে"),
  detail: z.string().min(10, "বিস্তারিত তথ্য অবশ্যই দিতে হবে"),
  level: z.enum(["info", "warning", "danger"]),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access only." },
        { status: 401 }
      );
    }

    await connectDB();

    const alerts = await EmergencyDiseaseAlert.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, alerts },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error fetching alerts:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access only." },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const parsedData = createAlertSchema.parse(body);

    const newAlert = await EmergencyDiseaseAlert.create({
      region: parsedData.region,
      title: parsedData.title,
      detail: parsedData.detail,
      level: parsedData.level,
      isActive: parsedData.isActive,
    });

    return NextResponse.json(
      { success: true, alert: newAlert },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error creating alert:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access only." },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Alert ID is required" },
        { status: 400 }
      );
    }

    const updatedAlert = await EmergencyDiseaseAlert.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedAlert) {
      return NextResponse.json(
        { error: "Alert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, alert: updatedAlert },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error updating alert:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}
