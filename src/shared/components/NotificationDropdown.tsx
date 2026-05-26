"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { 
  Bell, AlertTriangle, Info, Calendar, DollarSign, Activity, 
  Shield, Database, CreditCard, UserPlus, FileText, 
  X, LucideIcon 
} from "lucide-react";

import { cn } from "@/lib/utils";
import { NotificationPriority, NotificationType } from "../types/notification.types";


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
    total: number;
    hasNext: boolean;
  };
  unreadCount: number;
}

const getNotificationIcon = (type: NotificationType): LucideIcon => {
  const icons: Record<NotificationType, LucideIcon> = {
    [NotificationType.ALERT_WATER_QUALITY]: AlertTriangle,
    [NotificationType.ALERT_DISEASE]: AlertTriangle,
    [NotificationType.WEATHER_ALERT]: AlertTriangle,
    [NotificationType.REMINDER_FEEDING]: Calendar,
    [NotificationType.REMEMBER_HARVEST]: Calendar,
    [NotificationType.APPOINTMENT_REMINDER]: Calendar,
    [NotificationType.MARKET_PRICE]: DollarSign,
    [NotificationType.CONSULTATION_REQUEST]: Activity,
    [NotificationType.CONSULTATION_UPDATE]: Activity,
    [NotificationType.EMERGENCY_CASE]: Activity,
    [NotificationType.PATIENT_ALERT]: Info,
    [NotificationType.PRESCRIPTION_UPDATE]: Info,
    [NotificationType.SYSTEM_MAINTENANCE]: Shield,
    [NotificationType.SECURITY_ALERT]: Shield,
    [NotificationType.USER_REGISTRATION]: UserPlus,
    [NotificationType.REPORT_GENERATED]: FileText,
    [NotificationType.PAYMENT_RECEIVED]: CreditCard,
    [NotificationType.DATA_SYNC]: Database,
    [NotificationType.COURSE_ENROLLMENT]: Bell,
    [NotificationType.COURSE_COMPLETED]: Bell,
    [NotificationType.NEW_COURSE]: Bell,
    [NotificationType.APPLICATION_APPROVED]: Bell,
    [NotificationType.APPLICATION_REJECTED]: Bell,
    [NotificationType.CONTACT_MESSAGE]: Bell,
  };
  return icons[type] || Bell;
};

const getPriorityColor = (priority: NotificationPriority): string => {
  const colors: Record<NotificationPriority, string> = {
    [NotificationPriority.URGENT]: "bg-red-500",
    [NotificationPriority.HIGH]: "bg-orange-500",
    [NotificationPriority.MEDIUM]: "bg-yellow-500",
    [NotificationPriority.LOW]: "bg-gray-400",
  };
  return colors[priority];
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const diffMins = Math.floor((new Date().getTime() - date.getTime()) / 60000);
  
  if (diffMins < 1) return "এখনই";
  if (diffMins < 60) return `${diffMins} মিনিট আগে`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ঘন্টা আগে`;
  return date.toLocaleDateString("bn-BD", { month: "long", day: "numeric" });
};

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications?limit=20");
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
    refetchInterval: 60000,
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => fetch("/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ notificationId: id }),
      headers: { "Content-Type": "application/json" }
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 hover:bg-slate-100 rounded-full">
        <Bell size={20} />
        {data && data.unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            {data.unreadCount > 9 ? "9+" : data.unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold">নোটিফিকেশন</h3>
            <button onClick={() => setIsOpen(false)}><X size={16} /></button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? <p className="p-4 text-center text-sm">লোড হচ্ছে...</p> : 
             !data?.notifications.length ? <p className="p-4 text-center text-sm text-gray-500">কোনো নোটিফিকেশন নেই</p> :
             data.notifications.map((n) => {
               const Icon = getNotificationIcon(n.type);
               return (
                 <button key={n._id} onClick={() => { if(!n.isRead) markAsRead.mutate(n._id); if(n.link) router.push(n.link); setIsOpen(false); }} className="w-full p-4 flex gap-3 hover:bg-gray-50 text-left">
                   <div className={cn("p-2 rounded-full text-white", getPriorityColor(n.priority))}>
                     <Icon size={14} />
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-semibold">{n.title}</p>
                     <p className="text-xs text-gray-500 truncate">{n.message}</p>
                     <span className="text-[10px] text-gray-400">{formatTimestamp(n.createdAt)}</span>
                   </div>
                 </button>
               );
             })}
          </div>
        </div>
      )}
    </div>
  );
}