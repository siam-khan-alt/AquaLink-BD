import { NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    
    const experts = await User.find({ 
      role: "doctor",
      isVerified: true 
    })
      .select("name email phone specialization consultationFee bio image")
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ experts });
  } catch (error) {
    console.error("Error fetching experts:", error);
    return NextResponse.json(
      { error: "Failed to fetch experts" },
      { status: 500 }
    );
  }
}
