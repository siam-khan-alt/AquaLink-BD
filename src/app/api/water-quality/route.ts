import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { getToken } from "next-auth/jwt";
import { WaterQualityLog } from "@/models/WaterQualityLog";
import { Pond } from "@/models/Pond";
import { z } from "zod";
import { Types } from "mongoose";
import { NotificationType, NotificationPriority } from "@/shared/types/notification.types";
import { createNotification } from "@/shared/lib/notificationHelpers";

interface WaterQualityInput {
  pondId: string;
  ph: number;
  dissolvedOxygen: number;
  ammonia: number;
}

const waterQualitySchema = z.object({
  pondId: z.string().min(1, "Pond ID is required"),
  ph: z.number().min(0, "pH cannot be negative").max(14, "pH cannot exceed 14"),
  dissolvedOxygen: z.number().min(0, "Dissolved Oxygen cannot be negative"),
  ammonia: z.number().min(0, "Ammonia cannot be negative"),
});

type WaterQualityData = z.infer<typeof waterQualitySchema>;

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id || token.role !== "farmer") {
      return NextResponse.json(
        { error: "Unauthorized. Farmer access only." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const pondId = searchParams.get("pondId");
    const days = parseInt(searchParams.get("days") || "30", 10);

    await connectDB();

    if (!pondId) {
      return NextResponse.json(
        { error: "Pond ID is required" },
        { status: 400 }
      );
    }

    // Verify pond ownership before fetching logs
    const pond = await Pond.findById(pondId).lean();
    if (!pond) {
      return NextResponse.json(
        { error: "Pond not found" },
        { status: 404 }
      );
    }

    if (pond.owner.toString() !== token.id) {
      console.error(`Unauthorized access attempt detected for pond ${pondId}`);
      return NextResponse.json(
        { error: "Unauthorized. You do not own this pond." },
        { status: 403 }
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await WaterQualityLog.find({
      pondId,
      loggedAt: { $gte: startDate },
    }).sort({ loggedAt: 1 });

    return NextResponse.json(
      { success: true, logs },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error fetching water quality logs:", message);
    return NextResponse.json(
      { error: "Failed to fetch water quality logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id || token.role !== "farmer") {
      return NextResponse.json(
        { error: "Unauthorized. Farmer access only." },
        { status: 401 }
      );
    }

    const body = await req.json() as WaterQualityInput;
    const validationResult = waterQualitySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data: WaterQualityData = validationResult.data;

    await connectDB();

    // Verify pond exists and user owns it
    const pond = await Pond.findById(new Types.ObjectId(data.pondId)).lean();
    if (!pond) {
      return NextResponse.json(
        { error: "Pond not found" },
        { status: 404 }
      );
    }

    if (pond.owner.toString() !== token.id) {
      console.error(`Unauthorized access attempt detected for pond ${data.pondId}`);
      return NextResponse.json(
        { error: "Unauthorized. You do not own this pond." },
        { status: 403 }
      );
    }

    const log = await WaterQualityLog.create({
      pondId: data.pondId,
      ph: data.ph,
      dissolvedOxygen: data.dissolvedOxygen,
      ammonia: data.ammonia,
      loggedAt: new Date(),
    });

    // Check for critical water quality parameters
    const isCritical = data.ph < 6 || data.ph > 9 || data.dissolvedOxygen < 4 || data.ammonia > 1;
    
    if (isCritical) {
      await createNotification({
        userId: token.id as string,
        type: NotificationType.ALERT_WATER_QUALITY,
        priority: NotificationPriority.URGENT,
        title: "পানির গুণমান সতর্কতা",
        message: `পুকুর #${data.pondId}-এ pH/অক্সিজেন/অ্যামোনিয়া মাত্রা বিপজ্জনক। দ্রুত ব্যবস্থা নিন।`,
        link: `/dashboard/farmer/ponds/${data.pondId}/analytics`,
        metadata: {
          pondId: data.pondId,
          ph: data.ph,
          dissolvedOxygen: data.dissolvedOxygen,
          ammonia: data.ammonia,
          loggedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      { success: true, log },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error creating water quality log:", message);
    return NextResponse.json(
      { error: "Failed to create water quality log" },
      { status: 500 }
    );
  }
}
