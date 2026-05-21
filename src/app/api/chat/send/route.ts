import { NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Message } from "@/models/Message";
import { Chat } from "@/models/Chat";
import { getToken } from "next-auth/jwt";
import { pusherServer } from "@/shared/lib/pusher";
import type { NextRequest } from "next/server";
import { Types, Document } from "mongoose";

interface IChatSchema extends Document {
  isGroup: boolean;
  isAdminSupport: boolean;
  participants: Types.ObjectId[];
  groupAdmin?: Types.ObjectId;
}

interface IMessageSchema {
  chatId: Types.ObjectId | string;
  sender: Types.ObjectId;
  text: string;
  createdAt?: Date;
}

interface IMessageResponse {
  _id: string;
  chatId: string;
  sender: string;
  text: string;
  createdAt: Date;
}

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
    const { chatId, text } = body as { chatId?: string; text?: string };

    if (!chatId || !text) {
      return NextResponse.json(
        { error: "Chat ID and message text are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const chat = await Chat.findById(chatId) as IChatSchema | null;
    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    const senderId = token.id as string;
    const isParticipant = chat.participants.some(
      (participant: Types.ObjectId) => participant.toString() === senderId
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: "You are not a participant in this chat" },
        { status: 403 }
      );
    }

    const messagePayload: IMessageSchema = {
      chatId,
      sender: new Types.ObjectId(senderId),
      text,
    };

    const message = await Message.create(messagePayload);

    const messageData: IMessageResponse = {
      _id: (message._id as Types.ObjectId).toString(),
      chatId: message.chatId.toString(),
      sender: message.sender.toString(),
      text: message.text,
      createdAt: message.createdAt || new Date(),
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