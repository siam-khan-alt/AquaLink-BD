import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { getToken } from "next-auth/jwt";
import Subscriber from "@/models/Subscriber";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id || token.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({ subscribers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}
