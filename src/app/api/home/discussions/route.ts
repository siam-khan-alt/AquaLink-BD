import { NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { CommunityDiscussion } from "@/models/CommunityDiscussion";

const SEED_DATA = [
  {
    title: "পুকুরের অ্যামোনিয়া নিয়ন্ত্রণের সেরা উপায়",
    replies: 24,
    views: 156,
    category: "পানির গুণমান",
    authorName: "আব্দুল করিম"
  },
  {
    title: "চলতি সপ্তাহে কার্প জাতীয় মাছের পোনার দাম",
    replies: 18,
    views: 203,
    category: "বাজার দর",
    authorName: "রহিমা বেগম"
  },
  {
    title: "পুকুরে মাছের রোগ প্রতিরোধে প্রাকৃতিক উপায়",
    replies: 31,
    views: 289,
    category: "রোগ নির্ণয়",
    authorName: "মোহাম্মদ আলী"
  }
];

export async function GET() {
  try {
    await connectDB();
    
    const count = await CommunityDiscussion.countDocuments();
    
    if (count === 0) {
      await CommunityDiscussion.insertMany(SEED_DATA);
    }
    
    const discussions = await CommunityDiscussion.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    return NextResponse.json({ discussions });
  } catch (error) {
    console.error("Error fetching discussions:", error);
    return NextResponse.json(
      { error: "Failed to fetch discussions" },
      { status: 500 }
    );
  }
}
