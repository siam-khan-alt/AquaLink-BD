import { NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { User } from "@/models/User";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const specialization = searchParams.get("specialization");

    await connectDB();

    const query: Record<string, unknown> = {
      role: "doctor",
      isVerified: true,
    };

    if (specialization) {
      query.specialization = { $regex: specialization, $options: "i" };
    }

    const experts = await User.find(query)
      .select("name email phone specialization consultationFee bio image district division availability")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ experts });
  } catch (error) {
    console.error("Error fetching experts:", error);
    return NextResponse.json(
      { error: "বিশেষজ্ঞ লোড করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
