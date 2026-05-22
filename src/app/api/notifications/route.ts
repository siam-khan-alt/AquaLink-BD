import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { Notification } from "@/models/Notification";
import { Types } from "mongoose";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = session.user.id as string;

    const notifications = await Notification.find({
      $or: [
        { userId: new Types.ObjectId(userId) },
        { userId: null },
      ],
      isRead: false,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json(
      { success: true, notifications },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error fetching notifications:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = session.user.id as string;

    await Notification.updateMany(
      {
        $or: [
          { userId: new Types.ObjectId(userId) },
          { userId: null },
        ],
      },
      { isRead: true }
    );

    return NextResponse.json(
      { success: true, message: "Notifications marked as read" },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error marking notifications as read:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}
