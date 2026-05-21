import { NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Chat } from "@/models/Chat";
import { getToken } from "next-auth/jwt";
import { Types } from "mongoose";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { isGroup, groupName, participants, isAdminSupport } = body;

    await connectDB();

    const userId = token.id as string;

    if (isAdminSupport) {
      const existingSupportChat = await Chat.findOne({
        isAdminSupport: true,
        participants: userId,
      });

      if (existingSupportChat) {
        return NextResponse.json(
          { chat: existingSupportChat },
          { status: 200 }
        );
      }

      const { User } = await import("@/models/User");
      const admins = await User.find({ role: "admin" }).limit(1);
      const adminId = admins.length > 0 ? admins[0]._id : userId;

      const chat = await Chat.create({
        isGroup: false,
        participants: [userId, adminId],
        isAdminSupport: true,
      });

      return NextResponse.json({ chat }, { status: 201 });
    }

    if (isGroup) {
      if (!groupName || !participants || participants.length < 2) {
        return NextResponse.json(
          { error: "Group name and at least 2 participants required" },
          { status: 400 }
        );
      }

      const chat = await Chat.create({
        isGroup: true,
        groupName,
        groupAdmin: userId,
        participants: [userId, ...participants],
        isAdminSupport: false,
      });

      return NextResponse.json({ chat }, { status: 201 });
    }

    if (!participants || participants.length !== 1) {
      return NextResponse.json(
        { error: "Direct message requires exactly 1 participant" },
        { status: 400 }
      );
    }

    const existingChat = await Chat.findOne({
      isGroup: false,
      isAdminSupport: false,
      participants: { $all: [userId, participants[0]], $size: 2 },
    });

    if (existingChat) {
      return NextResponse.json({ chat: existingChat }, { status: 200 });
    }

    const chat = await Chat.create({
      isGroup: false,
      participants: [userId, participants[0]],
      isAdminSupport: false,
    });

    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
