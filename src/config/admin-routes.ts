/**
 * Declarative Admin Routes Configuration
 * Single source of truth for admin route permissions, labels, and API endpoints
 */

import { LayoutDashboard, Users, FileText, UserCheck, AlertTriangle, BookOpen, Mail, ShieldCheck, Activity, TrendingUp, LucideIcon } from "lucide-react";
import { Permission } from "@/shared/lib/rbac";

export interface RouteConfig {
  label: string;
  href: string;
  icon: LucideIcon;
  permissions: Permission[];
  api?: {
    endpoint: string;
    methods: {
      [key in 'GET' | 'POST' | 'PATCH' | 'DELETE']?: {
        permission: Permission;
        audit: boolean;
      };
    };
  };
}

export const ADMIN_ROUTES: Record<string, RouteConfig> = {
  '/dashboard/admin': {
    label: 'সিস্টেম ওভারভিউ',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
    permissions: ['analytics:read'],
    api: {
      endpoint: '/api/admin/overview',
      methods: {
        GET: { permission: 'analytics:read', audit: true },
      },
    },
  },
  '/dashboard/admin/command-center': {
    label: 'কমান্ড সেন্টার',
    href: '/dashboard/admin/command-center',
    icon: Activity,
    permissions: ['system:health'],
    api: {
      endpoint: '/api/admin/health',
      methods: {
        GET: { permission: 'system:health', audit: true },
      },
    },
  },
  '/dashboard/admin/users': {
    label: 'চাষি ব্যবস্থাপনা',
    href: '/dashboard/admin/users',
    icon: Users,
    permissions: ['users:read'],
    api: {
      endpoint: '/api/admin/users',
      methods: {
        GET: { permission: 'users:read', audit: true },
        POST: { permission: 'users:write', audit: true },
        PATCH: { permission: 'users:write', audit: true },
        DELETE: { permission: 'users:delete', audit: true },
      },
    },
  },
  '/dashboard/admin/experts': {
    label: 'বিশেষজ্ঞ ব্যবস্থাপনা',
    href: '/dashboard/admin/experts',
    icon: UserCheck,
    permissions: ['experts:read'],
    api: {
      endpoint: '/api/admin/experts',
      methods: {
        GET: { permission: 'experts:read', audit: true },
        PATCH: { permission: 'experts:write', audit: true },
      },
    },
  },
  '/dashboard/admin/stories': {
    label: 'চাষি গল্প ব্যবস্থাপনা',
    href: '/dashboard/admin/stories',
    icon: FileText,
    permissions: ['stories:read'],
    api: {
      endpoint: '/api/admin/stories',
      methods: {
        GET: { permission: 'stories:read', audit: true },
        POST: { permission: 'stories:write', audit: true },
        PATCH: { permission: 'stories:write', audit: true },
        DELETE: { permission: 'stories:delete', audit: true },
      },
    },
  },
  '/dashboard/admin/alerts': {
    label: 'জরুরি সতর্কতা',
    href: '/dashboard/admin/alerts',
    icon: AlertTriangle,
    permissions: ['alerts:read'],
    api: {
      endpoint: '/api/admin/alerts',
      methods: {
        GET: { permission: 'alerts:read', audit: true },
        POST: { permission: 'alerts:write', audit: true },
        PATCH: { permission: 'alerts:write', audit: true },
        DELETE: { permission: 'alerts:delete', audit: true },
      },
    },
  },
  '/dashboard/admin/courses': {
    label: 'বুটক্যাম্প ব্যবস্থাপনা',
    href: '/dashboard/admin/courses',
    icon: BookOpen,
    permissions: ['courses:read'],
    api: {
      endpoint: '/api/admin/courses',
      methods: {
        GET: { permission: 'courses:read', audit: true },
        POST: { permission: 'courses:write', audit: true },
        PATCH: { permission: 'courses:write', audit: true },
        DELETE: { permission: 'courses:delete', audit: true },
      },
    },
  },
  '/dashboard/admin/newsletter': {
    label: 'নিউজলেটার ব্যবস্থাপনা',
    href: '/dashboard/admin/newsletter',
    icon: Mail,
    permissions: ['newsletter:read'],
    api: {
      endpoint: '/api/admin/newsletter',
      methods: {
        GET: { permission: 'newsletter:read', audit: true },
        POST: { permission: 'newsletter:write', audit: true },
        DELETE: { permission: 'newsletter:delete', audit: true },
      },
    },
  },
  '/dashboard/admin/audit-logs': {
    label: 'অডিট লগ',
    href: '/dashboard/admin/audit-logs',
    icon: ShieldCheck,
    permissions: ['system:audit'],
    api: {
      endpoint: '/api/admin/audit-logs',
      methods: {
        GET: { permission: 'system:audit', audit: true },
      },
    },
  },
  '/dashboard/admin/incidents': {
    label: 'ইনসিডেন্ট ম্যানেজমেন্ট',
    href: '/dashboard/admin/incidents',
    icon: AlertTriangle,
    permissions: ['incidents:read'],
    api: {
      endpoint: '/api/admin/incidents',
      methods: {
        GET: { permission: 'incidents:read', audit: true },
        POST: { permission: 'incidents:write', audit: true },
        PATCH: { permission: 'incidents:write', audit: true },
        DELETE: { permission: 'incidents:delete', audit: true },
      },
    },
  },
  '/dashboard/admin/analytics': {
    label: 'অ্যানালিটিক্স',
    href: '/dashboard/admin/analytics',
    icon: TrendingUp,
    permissions: ['analytics:read'],
    api: {
      endpoint: '/api/admin/analytics',
      methods: {
        GET: { permission: 'analytics:read', audit: true },
      },
    },
  },
};

/**
 * Generate navigation items based on user permissions
 * This replaces the hardcoded ADMIN_NAV_CONFIG array
 */
export const generateNavigation = (userPermissions: Permission[]): Array<{
  label: string;
  href: string;
  icon: LucideIcon;
  permissions: Permission[];
}> => {
  return Object.entries(ADMIN_ROUTES)
    .filter(([_, config]) => 
      config.permissions.some(permission => userPermissions.includes(permission))
    )
    .map(([_, config]) => ({
      label: config.label,
      href: config.href,
      icon: config.icon,
      permissions: config.permissions,
    }));
};

/**
 * Get route configuration by path
 */
export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return ADMIN_ROUTES[path];
};

/**
 * Check if a user has permission for a specific route
 */
export const hasRoutePermission = (path: string, userPermissions: Permission[]): boolean => {
  const config = ADMIN_ROUTES[path];
  if (!config) return false;
  
  return config.permissions.some(permission => userPermissions.includes(permission));
};
