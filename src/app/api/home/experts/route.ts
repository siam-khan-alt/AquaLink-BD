import { NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { ExpertConsultant } from "@/models/ExpertConsultant";

const SEED_DATA = [
  {
    name: "ড. মোহাম্মদ আব্দুল করিম",
    designation: "সিনিয়র উপজেলা মৎস্য কর্মকর্তা",
    email: "karim.fish@example.com",
    phone: "+880 1712-345678",
    specialization: "পুকুর ব্যবস্থাপনা",
    avatarUrl: ""
  },
  {
    name: "ড. ফাতেমা জাহান",
    designation: "অ্যাকুয়াকালচার স্পেশালিস্ট",
    email: "fatema.aqua@example.com",
    phone: "+880 1812-345678",
    specialization: "রোগ নির্ণয়",
    avatarUrl: ""
  },
  {
    name: "ড. রহিম উদ্দিন",
    designation: "মৎস্য রোগ বিশেষজ্ঞ",
    email: "rahim.fish@example.com",
    phone: "+880 1912-345678",
    specialization: "পানির গুণমান",
    avatarUrl: ""
  }
];

export async function GET() {
  try {
    await connectDB();
    
    const count = await ExpertConsultant.countDocuments();
    
    if (count === 0) {
      await ExpertConsultant.insertMany(SEED_DATA);
    }
    
    const experts = await ExpertConsultant.find({ isVerified: true })
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
