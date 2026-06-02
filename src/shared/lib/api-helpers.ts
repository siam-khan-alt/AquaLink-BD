/**
 * API Helper Functions
 * Provides reusable utilities for API route protection and audit logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, forbiddenResponse } from './require-permission';
import { logAuditEvent } from './audit-logger';
import { Permission } from './rbac';

export interface RequestContext {
  userId: string;
  userRole: string;
}

export interface HandlerConfig {
  permission: Permission;
  audit: boolean;
  action?: string;
  resource?: string;
}

/**
 * Create a protected API handler with automatic permission checking and audit logging
 * 
 * @param config - Handler configuration with permission and audit settings
 * @param handler - The actual handler function to execute
 * @returns A wrapped handler function with protection and logging
 * 
 * @example
 * export const GET = createProtectedHandler(
 *   { permission: 'users:read', audit: true, action: 'view_users', resource: 'user' },
 *   async (req, context) => {
 *     // Your handler logic here
 *     return NextResponse.json({ data });
 *   }
 * );
 */
export const createProtectedHandler = <T = any>(
  config: HandlerConfig,
  handler: (req: NextRequest, context: RequestContext, ...args: any[]) => Promise<NextResponse>
) => {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    // Permission check
    const permissionCheck = await requirePermission(req, config.permission);
    if (!permissionCheck.success) {
      return forbiddenResponse(permissionCheck.error || 'Forbidden');
    }

    const context: RequestContext = {
      userId: permissionCheck.user!.id,
      userRole: permissionCheck.user!.role,
    };

    try {
      // Execute the handler
      const result = await handler(req, context, ...args);

      // Audit logging on success
      if (config.audit) {
        await logAuditEvent({
          userId: context.userId,
          userRole: context.userRole,
          action: config.action || 'api_request',
          resource: config.resource || 'api',
          method: req.method as 'GET' | 'POST' | 'PATCH' | 'DELETE',
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
          status: 'success',
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update audit status to failure
      if (config.audit) {
        await logAuditEvent({
          userId: context.userId,
          userRole: context.userRole,
          action: config.action || 'api_request',
          resource: config.resource || 'api',
          method: req.method as 'GET' | 'POST' | 'PATCH' | 'DELETE',
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
          status: 'failure',
          errorMessage,
        });
      }

      // Re-throw the error for proper error handling
      throw error;
    }
  };
};

/**
 * Create a protected handler with resource ID extraction for audit logging
 * Useful for routes with dynamic segments like [id]
 */
export const createProtectedHandlerWithId = <T = any>(
  config: HandlerConfig,
  handler: (req: NextRequest, context: RequestContext & { resourceId: string }, ...args: any[]) => Promise<NextResponse>
) => {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    // Permission check
    const permissionCheck = await requirePermission(req, config.permission);
    if (!permissionCheck.success) {
      return forbiddenResponse(permissionCheck.error || 'Forbidden');
    }

    const context: RequestContext = {
      userId: permissionCheck.user!.id,
      userRole: permissionCheck.user!.role,
    };

    // Extract resource ID from args if available (for dynamic routes)
    const resourceId = args[0]?.id || '';

    try {
      // Execute the handler with resource ID
      const result = await handler(req, { ...context, resourceId }, ...args);

      // Audit logging on success
      if (config.audit) {
        await logAuditEvent({
          userId: context.userId,
          userRole: context.userRole,
          action: config.action || 'api_request',
          resource: config.resource || 'api',
          resourceId,
          method: req.method as 'GET' | 'POST' | 'PATCH' | 'DELETE',
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
          status: 'success',
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update audit status to failure
      if (config.audit) {
        await logAuditEvent({
          userId: context.userId,
          userRole: context.userRole,
          action: config.action || 'api_request',
          resource: config.resource || 'api',
          resourceId,
          method: req.method as 'GET' | 'POST' | 'PATCH' | 'DELETE',
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
          status: 'failure',
          errorMessage,
        });
      }

      // Re-throw the error for proper error handling
      throw error;
    }
  };
};
