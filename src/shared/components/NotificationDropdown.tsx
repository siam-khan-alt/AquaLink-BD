"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, AlertTriangle, Info, Calendar, DollarSign, Activity, Shield, Settings, Database, CreditCard, UserPlus, FileText, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationType, NotificationPriority } from "@/models/Notification";
import { useRouter } from "next/navigation";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  unreadCount: number;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.ALERT_WATER_QUALITY:
    case NotificationType.ALERT_DISEASE:
    case NotificationType.WEATHER_ALERT:
      return AlertTriangle;
    case NotificationType.REMINDER_FEEDING:
    case NotificationType.REMEMBER_HARVEST:
    case NotificationType.APPOINTMENT_REMINDER:
      return Calendar;
    case NotificationType.MARKET_PRICE:
      return DollarSign;
    case NotificationType.CONSULTATION_REQUEST:
    case NotificationType.CONSULTATION_UPDATE:
    case NotificationType.EMERGENCY_CASE:
      return Activity;
    case NotificationType.PATIENT_ALERT:
    case NotificationType.PRESCRIPTION_UPDATE:
      return Info;
    case NotificationType.SYSTEM_MAINTENANCE:
    case NotificationType.SECURITY_ALERT:
      return Shield;
    case NotificationType.USER_REGISTRATION:
      return UserPlus;
    case NotificationType.REPORT_GENERATED:
      return FileText;
    case NotificationType.PAYMENT_RECEIVED:
      return CreditCard;
    case NotificationType.DATA_SYNC:
      return Database;
    default:
      return Bell;
  }
};

const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case NotificationPriority.URGENT:
      return "bg-red-500";
    case NotificationPriority.HIGH:
      return "bg-orange-500";
    case NotificationPriority.MEDIUM:
      return "bg-yellow-500";
    case NotificationPriority.LOW:
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "এখনই";
  if (diffMins < 60) return `${diffMins} মিনিট আগে`;
  if (diffHours < 24) return `${diffHours} ঘন্টা আগে`;
  if (diffDays < 7) return `${diffDays} দিন আগে`;
  
  return date.toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"unread" | "all">("unread");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<NotificationsResponse>({
    queryKey: ["notifications", activeTab],
    queryFn: async () => {
      const response = await fetch(
        `/api/notifications?unreadOnly=${activeTab === "unread"}&limit=20`
      );
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
    refetchInterval: 60000, // Poll every 60 seconds
    staleTime: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (!response.ok) throw new Error("Failed to mark all as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    setIsOpen(false);
  };

  const unreadNotifications = data?.notifications.filter((n) => !n.isRead) || [];
  const allNotifications = data?.notifications || [];
  const notifications = activeTab === "unread" ? unreadNotifications : allNotifications;
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-[var(--text)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="font-semibold text-lg">নোটিফিকেশন</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-[var(--border)] rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[var(--border)]">
            <button
              onClick={() => setActiveTab("unread")}
              className={cn(
                "flex-1 py-3 px-4 text-sm font-medium transition-colors",
                activeTab === "unread"
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--text)] hover:bg-[var(--border)]"
              )}
            >
              অপঠিত ({unreadCount})
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex-1 py-3 px-4 text-sm font-medium transition-colors",
                activeTab === "all"
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--text)] hover:bg-[var(--border)]"
              )}
            >
              সব ({data?.pagination.total || 0})
            </button>
          </div>

          {/* Mark all as read button */}
          {unreadCount > 0 && (
            <div className="p-3 border-b border-[var(--border)]">
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[var(--border)] hover:bg-[var(--primary)] hover:text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCheck size={16} />
                {markAllAsReadMutation.isPending ? "চিহ্নিত হচ্ছে..." : "সব পঠিত হিসেবে চিহ্নিত করুন"}
              </button>
            </div>
          )}

          {/* Notifications list */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-[var(--text-muted)]">
                <Clock size={32} className="mx-auto mb-2 animate-spin" />
                <p>লোড হচ্ছে...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                <AlertTriangle size={32} className="mx-auto mb-2" />
                <p>নোটিফিকেশন লোড করতে ব্যর্থ হয়েছে</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-muted)]">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>
                  {activeTab === "unread"
                    ? "কোনো অপঠিত নোটিফিকেশন নেই"
                    : "কোনো নোটিফিকেশন নেই"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <button
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "w-full p-4 text-left hover:bg-[var(--border)] transition-colors",
                        !notification.isRead && "bg-[var(--border)]/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            getPriorityColor(notification.priority)
                          )}
                        >
                          <Icon size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm truncate">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-[var(--primary)] rounded-full shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-2">
                            {formatTimestamp(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {data?.pagination.hasNext && (
            <div className="p-3 border-t border-[var(--border)] text-center">
              <button className="text-sm text-[var(--primary)] hover:underline">
                আরও দেখুন
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
