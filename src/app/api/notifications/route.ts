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
    if (!session?.user?.id) {
      console.error('[Notifications API] No session or user ID found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type') as NotificationType | null;
    const priority = searchParams.get('priority') as NotificationPriority | null;

    // Safely convert userId to ObjectId, handle invalid IDs gracefully
    let userId: Types.ObjectId | null = null;
    try {
      userId = new Types.ObjectId(session.user.id);
    } catch (error) {
      console.error('[Notifications API] Invalid ObjectId for userId:', session.user.id, error);
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const userRole = session.user.role as UserRole;

    // Build query with proper structure to avoid MongoDB errors
    const baseConditions: Record<string, unknown>[] = [
      { $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }] },
    ];

    if (unreadOnly) {
      baseConditions.push({ isRead: false });
    }

    if (type) {
      baseConditions.push({ type });
    }

    if (priority) {
      baseConditions.push({ priority });
    }

    const query = {
      $or: [
        { userId },
        { userId: null, role: userRole }
      ],
      $and: baseConditions
    };

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .catch(err => {
          console.error('[Notifications API] Error fetching notifications:', err);
          throw err;
        }),
      Notification.countDocuments(query).catch(err => {
        console.error('[Notifications API] Error counting notifications:', err);
        throw err;
      }),
    ]);

    const unreadCount = await Notification.countDocuments({
      $or: [
        { userId },
        { userId: null, role: userRole }
      ],
      $and: [
        { $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }] },
        { isRead: false }
      ]
    }).catch(err => {
      console.error('[Notifications API] Error counting unread notifications:', err);
      // Return 0 if count fails, don't break the entire response
      return 0;
    });

    return NextResponse.json({ 
      success: true, 
      notifications, 
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      unreadCount 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Notifications API] Internal server error:', errorMessage, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('[Notifications API PATCH] No session or user ID found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body: PatchRequestBody = await request.json();
    const { notificationId, markAll } = body;

    // Safely convert userId to ObjectId
    let userId: Types.ObjectId | null = null;
    try {
      userId = new Types.ObjectId(session.user.id);
    } catch (error) {
      console.error('[Notifications API PATCH] Invalid ObjectId for userId:', session.user.id, error);
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const userRole = session.user.role as UserRole;

    const baseQuery = {
      $or: [{ userId }, { userId: null, role: userRole }],
      $and: [{ $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }] }]
    };

    if (markAll) {
      await Notification.updateMany(
        { ...baseQuery, isRead: false }, 
        { $set: { isRead: true, readAt: new Date() } }
      ).catch(err => {
        console.error('[Notifications API PATCH] Error marking all as read:', err);
        throw err;
      });
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      let notificationObjectId: Types.ObjectId;
      try {
        notificationObjectId = new Types.ObjectId(notificationId);
      } catch (error) {
        console.error('[Notifications API PATCH] Invalid ObjectId for notificationId:', notificationId, error);
        return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
      }

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationObjectId, ...baseQuery },
        { $set: { isRead: true, readAt: new Date() } },
        { new: true }
      ).catch(err => {
        console.error('[Notifications API PATCH] Error updating notification:', err);
        throw err;
      });

      if (!notification) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true, notification });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Notifications API PATCH] Internal server error:', errorMessage, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}