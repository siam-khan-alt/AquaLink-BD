import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { Types } from "mongoose";

import { Notification } from "@/models/Notification"; 
import { NotificationPriority, NotificationType, UserRole } from "@/shared/types/notification.types";

interface PatchRequestBody {
  notificationId?: string;
  markAll?: boolean;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type') as NotificationType | null;
    const priority = searchParams.get('priority') as NotificationPriority | null;

    const userId = new Types.ObjectId(session.user.id);
    const userRole = session.user.role as UserRole;

    const query = {
      $or: [{ userId }, { userId: null, role: userRole }],
      $and: [
        { $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }] },
        ...(unreadOnly ? [{ isRead: false }] : []),
        ...(type ? [{ type }] : []),
        ...(priority ? [{ priority }] : [])
      ]
    };

    const [notifications, total] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Notification.countDocuments(query),
    ]);

    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false
    });

    return NextResponse.json({ 
      success: true, 
      notifications, 
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      unreadCount 
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const body: PatchRequestBody = await request.json();
    const { notificationId, markAll } = body;
    const userId = new Types.ObjectId(session.user.id);
    const userRole = session.user.role as UserRole;

    const baseQuery = {
      $or: [{ userId }, { userId: null, role: userRole }],
      $and: [{ $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }] }]
    };

    if (markAll) {
      await Notification.updateMany(
        { ...baseQuery, isRead: false }, 
        { $set: { isRead: true, readAt: new Date() } }
      );
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      const notification = await Notification.findOneAndUpdate(
        { _id: new Types.ObjectId(notificationId), ...baseQuery },
        { $set: { isRead: true, readAt: new Date() } },
        { new: true }
      );
      if (!notification) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true, notification });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}