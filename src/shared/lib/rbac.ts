/**
 * Role-Based Access Control (RBAC) System
 * Granular permission mapping for different user roles
 */

export type UserRole = 'admin' | 'farmer' | 'doctor' | 'moderator';

export type Permission =
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'experts:read'
  | 'experts:write'
  | 'experts:delete'
  | 'stories:read'
  | 'stories:write'
  | 'stories:delete'
  | 'alerts:read'
  | 'alerts:write'
  | 'alerts:delete'
  | 'courses:read'
  | 'courses:write'
  | 'courses:delete'
  | 'newsletter:read'
  | 'newsletter:write'
  | 'newsletter:delete'
  | 'incidents:read'
  | 'incidents:write'
  | 'incidents:delete'
  | 'analytics:read'
  | 'system:health'
  | 'system:audit';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'users:read',
    'users:write',
    'users:delete',
    'experts:read',
    'experts:write',
    'experts:delete',
    'stories:read',
    'stories:write',
    'stories:delete',
    'alerts:read',
    'alerts:write',
    'alerts:delete',
    'courses:read',
    'courses:write',
    'courses:delete',
    'newsletter:read',
    'newsletter:write',
    'newsletter:delete',
    'incidents:read',
    'incidents:write',
    'incidents:delete',
    'analytics:read',
    'system:health',
    'system:audit',
  ],
  farmer: [
    'alerts:read',
    'courses:read',
  ],
  doctor: [
    'alerts:read',
    'courses:read',
  ],
  moderator: [
    'users:read',
    'stories:read',
    'stories:write',
    'alerts:read',
    'alerts:write',
    'courses:read',
  ],
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};

/**
 * Check if a role has any of the specified permissions
 */
export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(role, permission));
};

/**
 * Check if a role has all of the specified permissions
 */
export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(role, permission));
};
