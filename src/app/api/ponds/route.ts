import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Pond } from "@/models/Pond";
import { getToken } from "next-auth/jwt";
import { Types } from "mongoose";
import { z } from "zod";

const createPondSchema = z.object({
  name: z.string().min(2, "পুকুরের নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  area: z.number().min(0.01, "পুকুরের আয়তন ০ এর চেয়ে বেশি হতে হবে"),
  fishType: z.array(z.string()).min(1, "কমপক্ষে একটি মাছের প্রজাতি নির্বাচন করুন"),
  initialPh: z.number().min(0, "pH মান ০ এর নিচে হতে পারবে না").max(14, "pH মান ১৪ এর বেশি হতে পারবে না"),
});

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id || token.role !== "farmer") {
      return NextResponse.json(
        { error: "Unauthorized. Farmer access only." },
        { status: 401 }
      );
    }

    await connectDB();
    const farmerId = token.id as string;

    const ponds = await Pond.find({ owner: new Types.ObjectId(farmerId) })
      .select("name area fishType waterQuality createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, ponds }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error fetching ponds:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
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

    await connectDB();
    const body = await req.json();
    const parsedData = createPondSchema.parse(body);

    const farmerId = token.id as string;

    const newPond = await Pond.create({
      owner: new Types.ObjectId(farmerId),
      name: parsedData.name,
      area: parsedData.area,
      fishType: parsedData.fishType,
      expenses: [],
      waterQuality: {
        pH: parsedData.initialPh,
        dissolvedO2: 5.5, // Standard healthy default value (5.5 mg/L)
        lastTested: new Date(),
      },
    });

    return NextResponse.json({ success: true, pond: newPond }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error creating pond:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}
