import { NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
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
    let chats;

    if (type === "direct") {
      chats = await Chat.find({
        isGroup: false,
        isAdminSupport: false,
        participants: userId,
      })
        .populate("participants", "name email phone image role")
        .sort({ updatedAt: -1 });
    } else if (type === "groups") {
      chats = await Chat.find({
        isGroup: true,
        participants: userId,
      })
        .populate("participants", "name email phone image role")
        .populate("groupAdmin", "name email phone image role")
        .sort({ updatedAt: -1 });
    } else if (type === "support") {
      chats = await Chat.find({
        isAdminSupport: true,
        participants: userId,
      })
        .populate("participants", "name email phone image role")
        .sort({ updatedAt: -1 });
    } else {
      chats = await Chat.find({
        participants: userId,
      })
        .populate("participants", "name email phone image role")
        .populate("groupAdmin", "name email phone image role")
        .sort({ updatedAt: -1 });
    }

    const chatsWithLastMessage = await Promise.all(
      chats.map(async (chat: any) => {
        const lastMessage = await Message.findOne({ chatId: chat._id })
          .sort({ createdAt: -1 })
          .limit(1);
        return {
          ...chat.toObject(),
          lastMessage: lastMessage ? lastMessage.toObject() : null,
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
