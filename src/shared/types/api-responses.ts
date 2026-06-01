/**
 * Standardized API Response Interface
 * Ensures consistent response structure across all API endpoints
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    requestId: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode?: number;
}
