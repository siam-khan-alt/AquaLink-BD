import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";
import { getToken } from "next-auth/jwt";
import { Document, Types } from "mongoose";

interface IPopulatedParticipant {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  role: string;
}

interface IChatDocument extends Document {
  _id: Types.ObjectId;
  isGroup: boolean;
  isAdminSupport: boolean;
  participants: Types.ObjectId[] | IPopulatedParticipant[];
  groupAdmin?: Types.ObjectId | IPopulatedParticipant;
  createdAt: Date;
  updatedAt: Date;
}

type ChatResponseObject = {
  _id: string;
  isGroup: boolean;
  isAdminSupport: boolean;
  participants: IPopulatedParticipant[];
  groupAdmin?: IPopulatedParticipant;
  createdAt: Date;
  updatedAt: Date;
  lastMessage: Record<string, unknown> | null;
};

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
    const type = searchParams.get("type");

    await connectDB();

    const userId = token.id as string;
    let chats: IChatDocument[];

    if (type === "direct") {
      chats = await Chat.find({
        isGroup: false,
        isAdminSupport: false,
        participants: userId,
      })
        .populate("participants", "name email phone image role")
        .sort({ updatedAt: -1 }) as unknown as IChatDocument[];
    } else if (type === "groups") {
      chats = await Chat.find({
        isGroup: true,
        participants: userId,
      })
        .populate("participants", "name email phone image role")
        .populate("groupAdmin", "name email phone image role")
        .sort({ updatedAt: -1 }) as unknown as IChatDocument[];
    } else if (type === "support") {
      chats = await Chat.find({
        isAdminSupport: true,
        participants: userId,
      })
        .populate("participants", "name email phone image role")
        .sort({ updatedAt: -1 }) as unknown as IChatDocument[];
    } else {
      chats = await Chat.find({
        participants: userId,
      })
        .populate("participants", "name email phone image role")
        .populate("groupAdmin", "name email phone image role")
        .sort({ updatedAt: -1 }) as unknown as IChatDocument[];
    }

    const chatsWithLastMessage: ChatResponseObject[] = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await Message.findOne({ chatId: chat._id })
          .sort({ createdAt: -1 })
          .limit(1);

        const rawObject = chat.toObject();
        
        const plainChat = {
          ...rawObject,
          _id: rawObject._id.toString(),
          groupAdmin: rawObject.groupAdmin 
            ? { ...rawObject.groupAdmin, _id: rawObject.groupAdmin._id.toString() }
            : undefined,
          participants: (rawObject.participants || []).map((p: Record<string, unknown>) => ({
            ...p,
            _id: p._id ? p._id.toString() : "",
          })),
        } as unknown as Omit<ChatResponseObject, "lastMessage">;

        return {
          ...plainChat,
          lastMessage: lastMessage ? (lastMessage.toObject() as unknown as Record<string, unknown>) : null,
        };
      })
    );

    return NextResponse.json({ chats: chatsWithLastMessage }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}