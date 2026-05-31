import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Message } from "@/models/Message";
import { Chat } from "@/models/Chat";
import { getToken } from "next-auth/jwt";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify user is a participant in the chat before fetching messages
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    const userId = new Types.ObjectId(token.id);
    const isParticipant = chat.participants.some((participant: Types.ObjectId) => 
      participant.toString() === userId.toString()
    );

    if (!isParticipant) {
      console.error(`Unauthorized access attempt detected for chat ${chatId}`);
      return NextResponse.json(
        { error: "Unauthorized. You are not a participant in this chat." },
        { status: 403 }
      );
    }

    const messages = await Message.find({ chatId })
      .populate("sender", "name email phone image role")
      .sort({ createdAt: 1 });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error fetching messages:", message);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
