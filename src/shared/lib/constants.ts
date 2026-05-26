/**
 * Application Constants
 * 
 * Centralized constants for magic numbers, query configurations, and API settings.
 * This file is safe to import in both client and server components.
 */

export const QUERY_CONFIG = {
  // Time in milliseconds
  DEFAULT_STALE_TIME: 60000, // 1 minute
  DEFAULT_REFETCH_INTERVAL: 60000, // 1 minute
  REALTIME_REFETCH_INTERVAL: 30000, // 30 seconds
  NOTIFICATION_REFETCH_INTERVAL: 60000, // 1 minute
  WATER_QUALITY_REFETCH_INTERVAL: 60000, // 1 minute
  ALERTS_REFETCH_INTERVAL: 60000, // 1 minute
  DOCTOR_APPLICATIONS_REFETCH_INTERVAL: 30000, // 30 seconds
  PUBLIC_COURSES_STALE_TIME: 300000, // 5 minutes
} as const;

export const API_CONFIG = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_PAGE: 1,
  
  // Rate limiting
  CONTACT_RATE_LIMIT: 5, // requests per hour
  CONTACT_RATE_LIMIT_WINDOW: 3600000, // 1 hour in milliseconds
  
  // File uploads
  MAX_IMAGE_SIZE: 5242880, // 5MB in bytes
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  
  // Commission rates
  ADMIN_COMMISSION_RATE: 0.1, // 10%
  DOCTOR_EARNINGS_RATE: 0.9, // 90%
} as const;

export const VALIDATION_CONFIG = {
  // Phone numbers
  PHONE_MIN_LENGTH: 11,
  PHONE_MAX_LENGTH: 14,
  PHONE_PREFIX: '+880',
  
  // Passwords
  PASSWORD_MIN_LENGTH: 6,
  
  // Text fields
  NAME_MIN_LENGTH: 2,
  MESSAGE_MIN_LENGTH: 10,
  MESSAGE_MAX_LENGTH: 2000,
  SUBJECT_MIN_LENGTH: 5,
} as const;

export const UI_CONFIG = {
  // Animation durations (in milliseconds)
  ANIMATION_DURATION_FAST: 200,
  ANIMATION_DURATION_NORMAL: 300,
  ANIMATION_DURATION_SLOW: 500,
  
  // Debounce times (in milliseconds)
  DEBOUNCE_NORMAL: 300,
  DEBOUNCE_SLOW: 500,
} as const;
