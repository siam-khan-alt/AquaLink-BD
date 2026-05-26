"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/react";
import { 
  Bell, AlertTriangle, Info, Calendar, DollarSign, Activity, 
  Shield, Database, CreditCard, UserPlus, FileText, X, LucideIcon 
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
  const icons: Record<string, LucideIcon> = {
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
    [NotificationPriority.MEDIUM]: "bg-[var(--primary)]",
    [NotificationPriority.LOW]: "bg-[var(--border)]",
  };
  return colors[priority];
};

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: async (): Promise<NotificationsResponse> => {
      const res = await fetch("/api/notifications?limit=20");
      if (!res.ok) throw new Error("Network error");
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
      <Button 
        isIconOnly 
        variant="primary" 
        className="relative rounded-full text-[var(--text)] hover:bg-[var(--border)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={22} />
        {data && data.unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute top-1 right-1 bg-[var(--secondary)] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold text-white"
          >
            {data.unreadCount > 9 ? "9+" : data.unreadCount}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-3 w-96 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--background)]">
              <h3 className="font-bold text-[var(--text)]">নোটিফিকেশন</h3>
              <Button isIconOnly variant="primary" size="sm" onClick={() => setIsOpen(false)}><X size={18} /></Button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto p-2">
              {isLoading ? (
                <p className="p-8 text-center text-sm text-[var(--text)]/60">লোড হচ্ছে...</p>
              ) : !data?.notifications.length ? (
                <p className="p-8 text-center text-sm text-[var(--text)]/60">কোনো নোটিফিকেশন নেই</p>
              ) : (
                data.notifications.map((n: Notification) => {
                  const Icon = getNotificationIcon(n.type);
                  return (
                    <motion.div key={n._id} whileHover={{ x: 5 }}>
                      <button 
                        onClick={() => { if(!n.isRead) markAsRead.mutate(n._id); if(n.link) router.push(n.link); setIsOpen(false); }}
                        className={cn("w-full p-4 flex gap-4 hover:bg-[var(--background)] rounded-xl transition-all", !n.isRead && "bg-[var(--border)]/30")}
                      >
                        <div className={cn("p-2.5 rounded-full text-white shrink-0", getPriorityColor(n.priority))}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-bold text-[var(--text)]">{n.title}</p>
                          <p className="text-xs text-[var(--text)]/70 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}