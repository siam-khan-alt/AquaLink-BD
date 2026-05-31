import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import { getToken } from "next-auth/jwt";
import { Types } from "mongoose";
import { ChatMessage } from "@/shared/types/chat";
import { chatResponseSchema } from "@/shared/lib/chatValidation";

// Participant Interface
interface IParticipant {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  role: string;
}

// Chat Document Interface for Lean query
interface IChatLean {
  _id: Types.ObjectId;
  type: "direct" | "group" | "support" | "community";
  isGroup: boolean;
  isAdminSupport: boolean;
  isPublic?: boolean;
  participants: IParticipant[];
  groupAdmin?: IParticipant;
  groupName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    await connectDB();

    const userId = token.id as string;
    const userRole = token.role as string;
    
    let chats: IChatLean[] = [];

    // Base query options
    const populateFields = ["participants", "groupAdmin"];

    if (userRole === "admin") {
      if (type === "support") {
        chats = await Chat.find({ isAdminSupport: true }).populate(populateFields).lean<IChatLean[]>();
      } else if (type === "direct") {
        const farmerIds = await User.find({ role: "farmer" }).distinct("_id");
        chats = await Chat.find({
          type: "direct",
          isGroup: false,
          isAdminSupport: false,
          participants: { $in: farmerIds },
        }).populate(populateFields).lean<IChatLean[]>();
      } else if (type === "community") {
        chats = await Chat.find({ type: "community", isPublic: true }).populate(populateFields).lean<IChatLean[]>();
      } else {
        const farmerIds = await User.find({ role: "farmer" }).distinct("_id");
        chats = await Chat.find({
          $or: [
            { isAdminSupport: true },
            { type: "community", isPublic: true },
            { type: "direct", isGroup: false, isAdminSupport: false, participants: { $in: farmerIds } },
          ],
        }).populate(populateFields).lean<IChatLean[]>();
      }
    } else {
      // FARMER VIEW
      const query = type === "direct" 
        ? { type: "direct", isGroup: false, isAdminSupport: false, participants: userId }
        : type === "community" 
        ? { type: "community", isPublic: true }
        : type === "support" 
        ? { isAdminSupport: true, participants: userId }
        : { $or: [{ participants: userId }, { type: "community", isPublic: true }] };

      chats = await Chat.find(query).populate(populateFields).lean<IChatLean[]>();
    }

    const chatIds = chats.map(c => c._id);
    const lastMessages = await Message.find({ chatId: { $in: chatIds } })
      .sort({ createdAt: -1 })
      .lean<{ _id: Types.ObjectId, chatId: Types.ObjectId, sender: Types.ObjectId, text: string, createdAt: Date }[]>();

    const lastMessageMap = new Map<string, ChatMessage>();
    lastMessages.forEach(msg => {
      const chatId = msg.chatId.toString();
      if (!lastMessageMap.has(chatId)) {
        lastMessageMap.set(chatId, {
          _id: msg._id.toString(),
          chatId: chatId,
          sender: msg.sender.toString(),
          text: msg.text,
          createdAt: msg.createdAt,
        });
      }
    });

    const unreadCounts = await Message.aggregate<{ _id: Types.ObjectId, count: number }>([
      { $match: { chatId: { $in: chatIds }, sender: { $ne: new Types.ObjectId(userId) } } },
      { $group: { _id: "$chatId", count: { $sum: 1 } } }
    ]);
    const unreadCountMap = new Map(unreadCounts.map(u => [u._id.toString(), u.count]));

    const formattedChats = chats.map((chat) => ({
      ...chat,
      _id: chat._id.toString(),
      participants: chat.participants.map(p => ({ ...p, _id: p._id.toString() })),
      groupAdmin: chat.groupAdmin ? { ...chat.groupAdmin, _id: chat.groupAdmin._id.toString() } : undefined,
      lastMessage: lastMessageMap.get(chat._id.toString()) || null,
      unreadCount: unreadCountMap.get(chat._id.toString()) || 0,
      memberCount: chat.isPublic ? chat.participants.length : undefined,
    }));

    const validatedChats = chatResponseSchema.safeParse(formattedChats);
    
    if (!validatedChats.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 500 });
    }

    return NextResponse.json({ chats: validatedChats.data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}