/**
 * API Error Handler
 * 
 * Standardized error handling and success response utilities for API routes.
 * This file is for SERVER-SIDE ONLY - uses NextResponse from next/server.
 * DO NOT import this file in client components.
 */

import { NextResponse } from 'next/server';
import { ERROR_MESSAGES } from './messages';

/**
 * Standardized API error handler
 * @param error - The error object (unknown type for safety)
 * @param context - Context string for logging (e.g., "fetching ponds", "creating pond")
 * @param statusCode - HTTP status code (default: 500)
 * @returns NextResponse with error details
 */
export function handleApiError(
  error: unknown,
  context: string,
  statusCode: number = 500
): NextResponse {
  const message = error instanceof Error ? error.message : 'Unknown Error';
  console.error(`Error ${context}:`, message);
  
  return NextResponse.json(
    { error: `Internal server error: ${message}` },
    { status: statusCode }
  );
}

/**
 * Standardized API error handler with custom error message
 * @param error - The error object (unknown type for safety)
 * @param context - Context string for logging (e.g., "fetching ponds", "creating pond")
 * @param customMessage - Custom error message to return to client
 * @param statusCode - HTTP status code (default: 500)
 * @returns NextResponse with error details
 */
export function handleApiErrorWithMessage(
  error: unknown,
  context: string,
  customMessage: string,
  statusCode: number = 500
): NextResponse {
  const message = error instanceof Error ? error.message : 'Unknown Error';
  console.error(`Error ${context}:`, message);
  
  return NextResponse.json(
    { error: customMessage },
    { status: statusCode }
  );
}

/**
 * Standardized API error handler using centralized error messages
 * @param error - The error object (unknown type for safety)
 * @param context - Context string for logging (e.g., "fetching ponds", "creating pond")
 * @param errorMessageKey - Key from ERROR_MESSAGES object
 * @param statusCode - HTTP status code (default: 500)
 * @returns NextResponse with error details
 */
export function handleApiErrorWithKey(
  error: unknown,
  context: string,
  errorMessageKey: keyof typeof ERROR_MESSAGES,
  statusCode: number = 500
): NextResponse {
  const message = error instanceof Error ? error.message : 'Unknown Error';
  console.error(`Error ${context}:`, message);
  
  const errorMessage = ERROR_MESSAGES[errorMessageKey];
  
  return NextResponse.json(
    { error: errorMessage },
    { status: statusCode }
  );
}

/**
 * Standardized success response handler
 * @param data - The data to return in the response
 * @param statusCode - HTTP status code (default: 200)
 * @returns NextResponse with success data
 */
export function handleSuccess<T>(
  data: T,
  statusCode: number = 200
): NextResponse<T> {
  return NextResponse.json(data, { status: statusCode });
}

/**
 * Standardized success response handler with success flag
 * @param data - The data to return in the response
 * @param statusCode - HTTP status code (default: 200)
 * @returns NextResponse with success flag and data
 */
export function handleSuccessWithFlag<T>(
  data: T,
  statusCode: number = 200
): NextResponse<{ success: true } & T> {
  return NextResponse.json({ success: true, ...data }, { status: statusCode });
}

/**
 * Standardized validation error handler
 * @param errors - Array of error messages or Zod error issues
 * @param statusCode - HTTP status code (default: 400)
 * @returns NextResponse with validation errors
 */
export function handleValidationError(
  errors: string[] | { message: string }[],
  statusCode: number = 400
): NextResponse {
  const errorMessages = errors.map(err => 
    typeof err === 'string' ? err : err.message
  );
  
  return NextResponse.json(
    { error: errorMessages[0] || 'Validation failed', details: errorMessages },
    { status: statusCode }
  );
}

/**
 * Standardized unauthorized error handler
 * @param message - Custom error message (optional)
 * @returns NextResponse with unauthorized error
 */
export function handleUnauthorized(message: string = ERROR_MESSAGES.UNAUTHORIZED): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Standardized forbidden error handler
 * @param message - Custom error message (optional)
 * @returns NextResponse with forbidden error
 */
export function handleForbidden(message: string = ERROR_MESSAGES.FORBIDDEN): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Standardized not found error handler
 * @param message - Custom error message (optional)
 * @returns NextResponse with not found error
 */
export function handleNotFound(message: string = ERROR_MESSAGES.NOT_FOUND): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * Standardized bad request error handler
 * @param message - Custom error message (optional)
 * @returns NextResponse with bad request error
 */
export function handleBadRequest(message: string = ERROR_MESSAGES.INVALID_REQUEST): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}
