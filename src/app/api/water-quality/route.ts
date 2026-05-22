import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import WaterQualityLog from "@/models/WaterQualityLog";
import { Pond } from "@/models/Pond";
import { z } from "zod";

const waterQualitySchema = z.object({
  pondId: z.string().min(1, "Pond ID is required"),
  ph: z.number().min(0, "pH cannot be negative").max(14, "pH cannot exceed 14"),
  dissolvedOxygen: z.number().min(0, "Dissolved Oxygen cannot be negative"),
  ammonia: z.number().min(0, "Ammonia cannot be negative"),
});

type WaterQualityData = z.infer<typeof waterQualitySchema>;

export async function GET(req: NextRequest) {
  try {
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
    console.error("Error fetching water quality logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch water quality logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = waterQualitySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data: WaterQualityData = validationResult.data;

    await connectDB();

    // Verify pond exists
    const pond = await Pond.findById(data.pondId);
    if (!pond) {
      return NextResponse.json(
        { error: "Pond not found" },
        { status: 404 }
      );
    }

    const log = await WaterQualityLog.create({
      pondId: data.pondId,
      ph: data.ph,
      dissolvedOxygen: data.dissolvedOxygen,
      ammonia: data.ammonia,
      loggedAt: new Date(),
    });

    return NextResponse.json(
      { success: true, log },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating water quality log:", error);
    return NextResponse.json(
      { error: "Failed to create water quality log" },
      { status: 500 }
    );
  }
}
