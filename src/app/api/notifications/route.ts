import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { Notification, NotificationType, NotificationPriority, UserRole } from "@/models/Notification";
import { Types } from "mongoose";

interface PatchRequestBody {
  notificationId?: string;
  markAll?: boolean;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    const userId = session.user.id as string;
    const userRole = session.user?.role as UserRole | null;

    const baseOrConditions = [
      { userId: new Types.ObjectId(userId) },
      { userId: null, role: userRole }
    ];

    const expiryCondition = {
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null },
      ],
    };

    const query: Record<string, unknown> = {
      $and: [
        { $or: baseOrConditions },
        expiryCondition
      ]
    };

    if (unreadOnly) {
      (query.$and as Array<Record<string, unknown>>).push({ isRead: false });
    }

    if (type && Object.values(NotificationType).includes(type as NotificationType)) {
      (query.$and as Array<Record<string, unknown>>).push({ type });
    }

    if (priority && Object.values(NotificationPriority).includes(priority as NotificationPriority)) {
      (query.$and as Array<Record<string, unknown>>).push({ priority });
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    const unreadCount = await Notification.countDocuments({
      $and: [
        { $or: baseOrConditions },
        { isRead: false },
        expiryCondition
      ],
    });

    return NextResponse.json(
      { 
        success: true, 
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
        unreadCount,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    return NextResponse.json({ error: "Internal server error: " + message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body: PatchRequestBody = await request.json();
    const { notificationId, markAll } = body;

    const userId = session.user.id as string;
    const userRole = session.user?.role as UserRole | null;

    const expiryCondition = {
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null },
      ],
    };

    if (markAll) {
      const markAllQuery = {
        $and: [
          {
            $or: [
              { userId: new Types.ObjectId(userId) },
              ...(userRole ? [{ userId: null, role: userRole }] : []),
            ],
          },
          { isRead: false },
          expiryCondition
        ],
      };
      
      await Notification.updateMany(markAllQuery, { isRead: true, readAt: new Date() });
      return NextResponse.json({ success: true, message: "All marked as read" }, { status: 200 });
    } 
    
    if (notificationId) {
      const notificationQuery = {
        $and: [
          {
            _id: new Types.ObjectId(notificationId),
            $or: [{ userId: new Types.ObjectId(userId) }, { userId: null }],
          },
          expiryCondition
        ],
      };
      
      const notification = await Notification.findOneAndUpdate(
        notificationQuery,
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        return NextResponse.json({ error: "Not found or expired" }, { status: 404 });
      }

      return NextResponse.json({ success: true, notification }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    return NextResponse.json({ error: "Internal server error: " + message }, { status: 500 });
  }
}