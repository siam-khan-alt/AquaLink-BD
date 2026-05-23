import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import { getToken } from "next-auth/jwt";
import { Document, Types } from "mongoose";
import { ChatMessage } from "@/shared/types/chat";

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
  type: "direct" | "group" | "support" | "community";
  isGroup: boolean;
  isAdminSupport: boolean;
  isPublic?: boolean;
  participants: Types.ObjectId[] | IPopulatedParticipant[];
  groupAdmin?: Types.ObjectId | IPopulatedParticipant;
  groupName?: string;
  createdAt: Date;
  updatedAt: Date;
}

type ChatResponseObject = {
  _id: string;
  type: "direct" | "group" | "support" | "community";
  isGroup: boolean;
  isAdminSupport: boolean;
  isPublic?: boolean;
  participants: IPopulatedParticipant[];
  groupAdmin?: IPopulatedParticipant;
  groupName?: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage: ChatMessage | null;
  unreadCount?: number;
  memberCount?: number;
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
    const userRole = token.role as string;
    let chats: IChatDocument[];

    // ADMIN VIEW
    if (userRole === "admin") {
      if (type === "support") {
        // Support inbox: all farmer support tickets
        chats = await Chat.find({
          isAdminSupport: true,
        })
          .populate("participants", "name email phone image role")
          .sort({ updatedAt: -1 }) as unknown as IChatDocument[];
      } else if (type === "direct") {
        // Direct messages with farmers
        const farmers = await User.find({ role: "farmer" }).select("_id");
        const farmerIds = farmers.map((f) => f._id);
        
        chats = await Chat.find({
          type: "direct",
          isGroup: false,
          isAdminSupport: false,
          participants: { $in: farmerIds },
        })
          .populate("participants", "name email phone image role")
          .sort({ updatedAt: -1 }) as unknown as IChatDocument[];
      } else if (type === "community") {
        // Community channels for moderation
        chats = await Chat.find({
          type: "community",
          isPublic: true,
        })
          .populate("participants", "name email phone image role")
          .populate("groupAdmin", "name email phone image role")
          .sort({ updatedAt: -1 }) as unknown as IChatDocument[];
      } else {
        // All chats for admin
        chats = await Chat.find({
          $or: [
            { isAdminSupport: true },
            { type: "community", isPublic: true },
            { 
              type: "direct",
              isGroup: false, 
              isAdminSupport: false,
              participants: { $in: await User.find({ role: "farmer" }).select("_id").then(f => f.map(u => u._id)) },
            },
          ],
        })
          .populate("participants", "name email phone image role")
          .populate("groupAdmin", "name email phone image role")
          .sort({ updatedAt: -1 }) as unknown as IChatDocument[];
      }
    } 
    // FARMER VIEW
    else {
      if (type === "direct") {
        // Direct messages (farmer-to-farmer and farmer-to-admin)
        chats = await Chat.find({
          type: "direct",
          isGroup: false,
          isAdminSupport: false,
          participants: userId,
        })
          .populate("participants", "name email phone image role")
          .sort({ updatedAt: -1 }) as unknown as IChatDocument[];
      } else if (type === "community") {
        // Public community channels
        chats = await Chat.find({
          type: "community",
          isPublic: true,
        })
          .populate("participants", "name email phone image role")
          .populate("groupAdmin", "name email phone image role")
          .sort({ updatedAt: -1 }) as unknown as IChatDocument[];
      } else if (type === "support") {
        // Support tickets with admin
        chats = await Chat.find({
          isAdminSupport: true,
          participants: userId,
        })
          .populate("participants", "name email phone image role")
          .sort({ updatedAt: -1 }) as unknown as IChatDocument[];
      } else {
        // All chats for farmer
        chats = await Chat.find({
          $or: [
            { participants: userId },
            { type: "community", isPublic: true },
          ],
        })
          .populate("participants", "name email phone image role")
          .populate("groupAdmin", "name email phone image role")
          .sort({ updatedAt: -1 }) as unknown as IChatDocument[];
      }
    }

    // OPTIMIZATION: Fetch all last messages in a single query instead of N+1
    const chatIds = chats.map(c => c._id);
    const lastMessages = await Message.find({ chatId: { $in: chatIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Create a map for quick lookup with proper type conversion
    const lastMessageMap = new Map<string, ChatMessage>();
    lastMessages.forEach(msg => {
      const chatId = msg.chatId.toString();
      if (!lastMessageMap.has(chatId)) {
        // Convert Mongoose lean document to ChatMessage interface
        const chatMessage: ChatMessage = {
          _id: msg._id.toString(),
          chatId: chatId,
          sender: msg.sender.toString(),
          text: msg.text,
          createdAt: msg.createdAt,
        };
        lastMessageMap.set(chatId, chatMessage);
      }
    });

    // Calculate unread counts
    const unreadCounts = await Message.aggregate([
      { $match: { chatId: { $in: chatIds }, sender: { $ne: userId } } },
      { $group: { _id: "$chatId", count: { $sum: 1 } } }
    ]);
    const unreadCountMap = new Map(unreadCounts.map(u => [u._id.toString(), u.count]));

    const chatsWithLastMessage: ChatResponseObject[] = chats.map((chat) => {
      const rawObject = chat.toObject();
      const chatId = rawObject._id.toString();
      
      const plainChat = {
        ...rawObject,
        _id: chatId,
        type: rawObject.type || (rawObject.isGroup ? "group" : "direct"),
        groupAdmin: rawObject.groupAdmin 
          ? { ...rawObject.groupAdmin, _id: rawObject.groupAdmin._id?.toString() || rawObject.groupAdmin._id }
          : undefined,
        participants: (rawObject.participants || []).map((p: Record<string, unknown>) => ({
          ...p,
          _id: p._id ? p._id.toString() : "",
        })),
        lastMessage: lastMessageMap.get(chatId) || null,
        unreadCount: unreadCountMap.get(chatId) || 0,
        memberCount: rawObject.isPublic ? (rawObject.participants || []).length : undefined,
      } as ChatResponseObject;

      return plainChat;
    });

    return NextResponse.json({ chats: chatsWithLastMessage }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}