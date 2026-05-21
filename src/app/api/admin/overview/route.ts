import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { User } from "@/models/User";
import { Pond } from "@/models/Pond";
import { Chat } from "@/models/Chat";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access only." },
        { status: 401 }
      );
    }

    await connectDB();

    const totalFarmers = await User.countDocuments({ role: "farmer" });
    const totalPonds = await Pond.countDocuments();
    const activeChatChannels = await Chat.countDocuments();
    const verifiedFarmers = await User.countDocuments({ role: "farmer", isVerified: true });

    const stats = {
      totalFarmers,
      totalPonds,
      activeChatChannels,
      verifiedFarmers,
      notificationDispatchStatus: "active",
    };

    return NextResponse.json({ success: true, stats }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error fetching admin overview:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}
