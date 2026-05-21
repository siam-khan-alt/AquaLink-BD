import { NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Message } from "@/models/Message";
import { Chat } from "@/models/Chat";
import { getToken } from "next-auth/jwt";
import { pusherServer } from "@/shared/lib/pusher";
import type { NextRequest } from "next/server";
import { Types } from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { chatId, text } = body;

    if (!chatId || !text) {
      return NextResponse.json(
        { error: "Chat ID and message text are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    const senderId = token.id as string;
    const isParticipant = chat.participants.some(
      (participant: any) => participant.toString() === senderId
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: "You are not a participant in this chat" },
        { status: 403 }
      );
    }

    const message = await Message.create({
      chatId,
      sender: new Types.ObjectId(senderId) as any,
      text,
    });

    const messageData = {
      _id: message._id.toString(),
      chatId: message.chatId.toString(),
      sender: message.sender.toString(),
      text: message.text,
      createdAt: message.createdAt,
    };

    await pusherServer.trigger(
      `chat-${chatId}`,
      "new-message",
      messageData
    );

    return NextResponse.json(
      {
        success: true,
        message: messageData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
