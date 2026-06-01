/**
 * Permission Middleware Helper
 * Used in API routes to check for granular permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { hasPermission, Permission, UserRole } from './rbac';

export interface PermissionCheckResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    role: UserRole;
  };
}

/**
 * Check if the current user has the required permission
 */
export const requirePermission = async (
  req: NextRequest,
  requiredPermission: Permission
): Promise<PermissionCheckResult> => {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.id) {
      return {
        success: false,
        error: 'Unauthorized: No valid token',
      };
    }

    const userRole = token.role as UserRole;

    if (!hasPermission(userRole, requiredPermission)) {
      return {
        success: false,
        error: `Forbidden: Missing required permission '${requiredPermission}'`,
        user: {
          id: token.id as string,
          role: userRole,
        },
      };
    }

    return {
      success: true,
      user: {
        id: token.id as string,
        role: userRole,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Internal server error during permission check',
    };
  }
};

/**
 * Helper to return unauthorized response
 */
export const unauthorizedResponse = (message: string): NextResponse => {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
};

/**
 * Helper to return forbidden response
 */
export const forbiddenResponse = (message: string): NextResponse => {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
};

/**
 * Middleware wrapper that checks permission before executing handler
 */
export const withPermission = (
  requiredPermission: Permission,
  handler: (req: NextRequest, context: { userId: string; userRole: UserRole }) => Promise<NextResponse>
) => {
  return async (req: NextRequest, context: unknown): Promise<NextResponse> => {
    const permissionCheck = await requirePermission(req, requiredPermission);

    if (!permissionCheck.success) {
      if (permissionCheck.error?.includes('Unauthorized')) {
        return unauthorizedResponse(permissionCheck.error);
      }
      return forbiddenResponse(permissionCheck.error || 'Forbidden');
    }

    if (!permissionCheck.user) {
      return unauthorizedResponse('User information not available');
    }

    return handler(req, {
      userId: permissionCheck.user.id,
      userRole: permissionCheck.user.role,
    });
  };
};
