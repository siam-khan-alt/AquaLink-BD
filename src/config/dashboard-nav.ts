import { LayoutDashboard, Users, FileText, UserCheck, AlertTriangle, BookOpen, MessageSquare, DollarSign, Calculator, Calendar, Stethoscope, Waves, Mail, Activity, ShieldCheck, TrendingUp, LucideIcon } from "lucide-react";
import { Permission, UserRole } from "@/shared/lib/rbac";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permissions?: Permission[];
  badge?: string | number;
  badgeColor?: string;
  children?: NavItem[];
}

export const DASHBOARD_NAV = {
  farmer: [
    { label: "ওভারভিউ", href: "/dashboard/farmer", icon: LayoutDashboard },
    { label: "পুকুর ও পানির গুণমান", href: "/dashboard/farmer/ponds", icon: Waves },
    { label: "খরচ ট্র্যাকার", href: "/dashboard/farmer/expenses", icon: DollarSign },
    { label: "স্মার্ট ফিড ক্যালকুলেটর", href: "/dashboard/farmer/feed-calculator", icon: Calculator },
    { label: "মাছ চাষের পাঠশালা", href: "/dashboard/farmer/courses", icon: BookOpen },
    { label: "মেসেজ", href: "/dashboard/chat", icon: MessageSquare },
  ],
  doctor: [
    { label: "ওভারভিউ", href: "/dashboard/doctor", icon: LayoutDashboard },
    { label: "কনসালটেশন রিকোয়েস্ট", href: "/dashboard/doctor/consultations", icon: Stethoscope },
    { label: "রোগী ইতিহাস", href: "/dashboard/doctor/patients", icon: Users },
    {label: "সময়সূচি", href: "/dashboard/doctor/schedule", icon: Calendar },
    { label: "মেসেজ", href: "/dashboard/chat", icon: MessageSquare },
  ]
};

/**
 * Dynamic Admin Navigation Configuration
 * Supports nested items, permission filtering, and badge counts
 */
export const ADMIN_NAV_CONFIG: NavItem[] = [
  {
    label: "সিস্টেম ওভারভিউ",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
    permissions: ['analytics:read'],
  },
  {
    label: "কমান্ড সেন্টার",
    href: "/dashboard/admin/command-center",
    icon: Activity,
    permissions: ['system:health'],
  },
  {
    label: "চাষি ব্যবস্থাপনা",
    href: "/dashboard/admin/users",
    icon: Users,
    permissions: ['users:read'],
  },
  {
    label: "বিশেষজ্ঞ ব্যবস্থাপনা",
    href: "/dashboard/admin/experts",
    icon: UserCheck,
    permissions: ['experts:read'],
  },
  {
    label: "চাষি গল্প ব্যবস্থাপনা",
    href: "/dashboard/admin/stories",
    icon: FileText,
    permissions: ['stories:read'],
  },
  {
    label: "জরুরি সতর্কতা",
    href: "/dashboard/admin/alerts",
    icon: AlertTriangle,
    permissions: ['alerts:read'],
  },
  {
    label: "বুটক্যাম্প ব্যবস্থাপনা",
    href: "/dashboard/admin/courses",
    icon: BookOpen,
    permissions: ['courses:read'],
  },
  {
    label: "নিউজলেটার ব্যবস্থাপনা",
    href: "/dashboard/admin/newsletter",
    icon: Mail,
    permissions: ['newsletter:read'],
  },
  {
    label: "অডিট লগ",
    href: "/dashboard/admin/audit-logs",
    icon: ShieldCheck,
    permissions: ['system:audit'],
  },
  {
    label: "ইনসিডেন্ট ম্যানেজমেন্ট",
    href: "/dashboard/admin/incidents",
    icon: AlertTriangle,
    permissions: ['incidents:read'],
  },
  {
    label: "অ্যানালিটিক্স",
    href: "/dashboard/admin/analytics",
    icon: TrendingUp,
    permissions: ['analytics:read'],
  },
  {
    label: "সাপোর্ট ইনবক্স",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
];

/**
 * Get filtered navigation items based on user permissions
 */
export const getAdminNavigation = (
  userPermissions: Permission[],
  badgeCounts?: Record<string, number>
): NavItem[] => {
  return ADMIN_NAV_CONFIG
    .filter(item => {
      // If no permissions required, show to all
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }
      
      // Check if user has any of the required permissions
      return item.permissions.some(permission => userPermissions.includes(permission));
    })
    .map(item => {
      // Add badge counts if provided
      if (badgeCounts && item.href in badgeCounts) {
        return {
          ...item,
          badge: badgeCounts[item.href],
          badgeColor: 'bg-red-500',
        };
      }
      return item;
    });
};

/**
 * Get navigation items for a specific role
 */
export const getNavigationByRole = (role: UserRole): NavItem[] => {
  switch (role) {
    case 'admin':
      return ADMIN_NAV_CONFIG;
    case 'farmer':
      return DASHBOARD_NAV.farmer;
    case 'doctor':
      return DASHBOARD_NAV.doctor;
    default:
      return [];
  }
};