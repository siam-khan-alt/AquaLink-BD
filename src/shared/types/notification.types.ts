export enum NotificationType {
  ALERT_WATER_QUALITY = 'alert_water_quality',
  ALERT_DISEASE = 'alert_disease',
  REMINDER_FEEDING = 'reminder_feeding',
  REMEMBER_HARVEST = 'remember_harvest',
  CONSULTATION_UPDATE = 'consultation_update',
  MARKET_PRICE = 'market_price',
  WEATHER_ALERT = 'weather_alert',
  COURSE_ENROLLMENT = 'course_enrollment',
  COURSE_COMPLETED = 'course_completed',
  NEW_COURSE = 'new_course',
  CONSULTATION_REQUEST = 'consultation_request',
  PATIENT_ALERT = 'patient_alert',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  PRESCRIPTION_UPDATE = 'prescription_update',
  EMERGENCY_CASE = 'emergency_case',
  APPLICATION_APPROVED = 'application_approved',
  APPLICATION_REJECTED = 'application_rejected',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  USER_REGISTRATION = 'user_registration',
  REPORT_GENERATED = 'report_generated',
  PAYMENT_RECEIVED = 'payment_received',
  SECURITY_ALERT = 'security_alert',
  DATA_SYNC = 'data_sync',
  CONTACT_MESSAGE = 'contact_message',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum UserRole {
  FARMER = 'farmer',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}