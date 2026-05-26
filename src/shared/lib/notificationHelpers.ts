import { Notification } from "@/models/Notification";
import {  NotificationType, NotificationPriority, UserRole } from "@/shared/types/notification.types";
import { Types } from "mongoose";

interface CreateNotificationParams {
  userId?: string;
  role?: UserRole;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  link?: string;
  metadata: Record<string, unknown>;
}

async function checkDuplicateNotification(
  userId: string | null,
  role: UserRole | null,
  type: NotificationType,
  metadata: Record<string, unknown>
): Promise<boolean> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const query: Record<string, unknown> = {
    type,
    createdAt: { $gte: fiveMinutesAgo },
  };

  if (userId) {
    query.userId = new Types.ObjectId(userId);
  }

  if (role) {
    query.role = role;
    query.userId = null;
  }

  const existingNotification = await Notification.findOne(query).lean();

  if (existingNotification) {
    const existingMetadata = existingNotification.metadata as Record<string, unknown>;
    const metadataKeys = Object.keys(metadata);
    
    for (const key of metadataKeys) {
      if (existingMetadata[key] !== metadata[key]) {
        return false;
      }
    }
    
    return true;
  }

  return false;
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const { userId, role, type, priority, title, message, link, metadata } = params;

  const isDuplicate = await checkDuplicateNotification(userId || null, role || null, type, metadata);

  if (isDuplicate) {
    return;
  }

  await Notification.create({
    userId: userId ? new Types.ObjectId(userId) : null,
    role: role || null,
    type,
    priority,
    title,
    message,
    link: link || null,
    metadata,
    isRead: false,
    readAt: null,
    expiresAt: null,
  });
}
