import { NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { EmergencyDiseaseAlert } from "@/models/EmergencyDiseaseAlert";

const SEED_DATA = [
  {
    region: "ঢাকা বিভাগ",
    title: "ত্বক ক্ষত রোগ নজরদারি",
    detail: "পানির মান খারাপ হলে সংক্রমণ বাড়ে। pH, অ্যামোনিয়া, DO নিয়মিত মাপুন।",
    level: "warning" as const
  }
];

export async function GET() {
  try {
    await connectDB();

    const count = await EmergencyDiseaseAlert.countDocuments();

    if (count === 0) {
      await EmergencyDiseaseAlert.insertMany(SEED_DATA);
    }

    const alerts = await EmergencyDiseaseAlert.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
