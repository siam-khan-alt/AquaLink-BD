/**
 * Centralized Messages
 * 
 * Centralized Bengali strings for error messages, success messages, and UI text.
 * This file is safe to import in both client and server components.
 */

export const ERROR_MESSAGES = {
  // Generic error messages
  LOAD_FAILED: "লোড করতে ব্যর্থ হয়েছে",
  INTERNAL_SERVER_ERROR: "সার্ভার ত্রুটি",
  UNKNOWN_ERROR: "অজানা ত্রুটি",
  UNAUTHORIZED: "অনুমতিহীন",
  FORBIDDEN: "অ্যাক্সেস নিষিদ্ধ",
  NOT_FOUND: "পাওয়া যায়নি",
  INVALID_REQUEST: "অবৈধ অনুরোধ",
  
  // Specific error messages
  FAILED_TO_FETCH: "ডেটা আনতে ব্যর্থ হয়েছে",
  FAILED_TO_LOAD_STATS: "পরিসংখ্যান লোড করতে ব্যর্থ হয়েছে",
  FAILED_TO_LOAD_PONDS: "পুকুরের তথ্য লোড করতে ব্যর্থ হয়েছে",
  FAILED_TO_LOAD_ALERTS: "সতর্কতা লোড করতে ব্যর্থ হয়েছে",
  FAILED_TO_LOAD_CHART_DATA: "চার্ট ডেটা লোড করতে ব্যর্থ হয়েছে",
  FAILED_TO_LOAD_COURSES: "কোর্স লোড করতে ব্যর্থ হয়েছে",
  FAILED_TO_LOAD_ENROLLMENT: "এনরোলমেন্ট লোড করতে ব্যর্থ হয়েছে",
  FAILED_TO_LOAD_EXPERTS: "বিশেষজ্ঞ লোড করতে ব্যর্থ হয়েছে",
  FAILED_TO_LOAD_MARKET_DATA: "বাজার দর তথ্য লোড করতে ব্যর্থ হয়েছে",
  
  // Action-specific error messages
  FAILED_TO_CREATE: "তৈরি করতে ব্যর্থ হয়েছে",
  FAILED_TO_CREATE_POND: "পুকুর তৈরি করতে ব্যর্থ হয়েছে",
  FAILED_TO_ADD_POND: "পুকুর যোগ করতে ব্যর্থ হয়েছে",
  FAILED_TO_UPDATE: "আপডেট করতে ব্যর্থ হয়েছে",
  FAILED_TO_DELETE: "মুছে ফেলতে ব্যর্থ হয়েছে",
  FAILED_TO_SAVE: "সংরক্ষণ করতে ব্যর্থ হয়েছে",
  FAILED_TO_ANALYZE: "বিশ্লেষণ করতে ব্যর্থ হয়েছে",
  FAILED_TO_CALCULATE: "হিসাব করতে ব্যর্থ হয়েছে",
  
  // Payment-related error messages
  PAYMENT_FAILED: "পেমেন্ট ব্যর্থ হয়েছে",
  PAYMENT_INIT_FAILED: "পেমেন্ট শুরু করতে ব্যর্থ হয়েছে",
  PAYMENT_INITIATE_FAILED: "পেমেন্ট ইনিশিয়েট ব্যর্থ হয়েছে",
  ENROLLMENT_NOT_FOUND: "এনরোলমেন্ট পাওয়া যায়নি",
  INVALID_RESPONSE: "অবৈধ প্রতিক্রিয়া",
  
  // Image upload error messages
  IMAGE_UPLOAD_FAILED: "ইমেজ আপলোড করতে ব্যর্থ হয়েছে",
  IMAGE_UPLOAD_FAILED_CLOUDINARY: "ক্লাউডিনারিতে ইমেজ আপলোড করতে ব্যর্থ হয়েছে",
  
  // Form validation error messages
  NAME_REQUIRED: "নাম অবশ্যই দিতে হবে",
  EMAIL_REQUIRED: "ইমেইল অবশ্যই দিতে হবে",
  PHONE_REQUIRED: "ফোন নম্বর অবশ্যই দিতে হবে",
  PASSWORD_REQUIRED: "পাসওয়ার্ড প্রয়োজন",
  PHONE_OR_EMAIL_REQUIRED: "ফোন বা ইমেইল প্রয়োজন",
  
  // Authentication error messages
  ACCOUNT_NOT_FOUND: "এই তথ্যে কোনো অ্যাকাউন্ট পাওয়া যায়নি",
  INVALID_PASSWORD: "পাসওয়ার্ড সঠিক নয়",
  GOOGLE_EMAIL_NOT_FOUND: "গুগল অ্যাকাউন্ট থেকে ইমেইল পাওয়া যায়নি",
  
  // Application-specific error messages
  APPLICATION_SUBMIT_FAILED: "আবেদন জমা দিতে ব্যর্থ হয়েছে",
  REPORT_DOWNLOAD_FAILED: "রিপোর্ট ডাউনলোড ব্যর্থ হয়েছে",
  COMPLETE_UPDATE_FAILED: "সম্পূর্ণতা আপডেট করতে ব্যর্থ হয়েছে",
  
  // Contact form error messages
  MESSAGE_SEND_FAILED: "বার্তা পাঠাতে ব্যর্থ হয়েছে",
  
  // Dashboard error messages
  DASHBOARD_LOAD_FAILED: "ড্যাশবোর্ড লোড করতে ব্যর্থ হয়েছে",
  
  // Network error messages
  NETWORK_ERROR: "নেটওয়ার্ক ত্রুটি",
  
  // Environment error messages
  MONGODB_URI_REQUIRED: "অনুগ্রহ করে .env.local ফাইলে MONGODB_URI প্রদান করুন",
  CLOUDINARY_CONFIG_MISSING: "Cloudinary configuration is missing. Please check environment variables.",
} as const;

export const SUCCESS_MESSAGES = {
  // Generic success messages
  SUCCESS: "সফল",
  OPERATION_SUCCESSFUL: "অপারেশন সফল হয়েছে",
  
  // Creation success messages
  CREATED_SUCCESSFULLY: "সফলভাবে তৈরি হয়েছে",
  POND_CREATED: "পুকুর সফলভাবে তৈরি হয়েছে",
  POND_ADDED: "পুকুর সফলভাবে যোগ হয়েছে",
  
  // Update success messages
  UPDATED_SUCCESSFULLY: "সফলভাবে আপডেট হয়েছে",
  PROFILE_UPDATED: "প্রোফাইল সফলভাবে আপডেট হয়েছে",
  
  // Delete success messages
  DELETED_SUCCESSFULLY: "সফলভাবে মুছে ফেলা হয়েছে",
  STORY_DELETED: "গল্পটি সফলভাবে ডিলিট করা হয়েছে",
  
  // Action-specific success messages
  SAVED_SUCCESSFULLY: "সফলভাবে সংরক্ষণ হয়েছে",
  
  // Image upload success messages
  IMAGE_UPLOADED: "ইমেজ সফলভাবে আপলোড হয়েছে",
  
  // Application success messages
  APPLICATION_SUBMITTED: "আবেদন সফলভাবে জমা হয়েছে! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।",
  
  // Contact form success messages
  MESSAGE_SENT: "বার্তা সফলভাবে পাঠানো হয়েছে!",
  
  // Report success messages
  REPORT_DOWNLOADED: "রিপোর্ট ডাউনলোড সফল হয়েছে!",
  
  // Notification success messages
  NOTIFICATION_SENT: "Consultation notification sent successfully",
  
  // Payment success messages
  PAYMENT_SUCCESSFUL: "পেমেন্ট সফল হয়েছে",
} as const;

export const VALIDATION_MESSAGES = {
  // Name validation
  NAME_MIN_LENGTH: "নাম কমপক্ষে ২ অক্ষর হতে হবে",
  
  // Email validation
  INVALID_EMAIL: "সঠিক ইমেইল ঠিকানা দিন",
  
  // Subject validation
  SUBJECT_MIN_LENGTH: "বিষয় কমপক্ষে ৫ অক্ষর হতে হবে",
  
  // Message validation
  MESSAGE_MIN_LENGTH: "বার্তা কমপক্ষে ১০ অক্ষর হতে হবে",
  MESSAGE_MAX_LENGTH: "বার্তা ২০০০ অক্ষরের বেশি হতে পারবে না",
  
  // Course validation
  COURSE_TITLE_REQUIRED: "কোর্সের শিরোনাম অবশ্যই দিতে হবে",
  COURSE_DESCRIPTION_REQUIRED: "কোর্সের বিবরণ অবশ্যই দিতে হবে",
  COURSE_VIDEO_URL_REQUIRED: "সঠিক ভিডিও URL প্রদান করুন",
  COURSE_PRICE_MIN: "মূল্য ০ এর চেয়ে বেশি হতে হবে",
  COURSE_CATEGORY_REQUIRED: "ক্যাটাগরি অবশ্যই দিতে হবে",
  
  // Pond validation
  POND_NAME_REQUIRED: "পুকুরের নাম অবশ্যই দিতে হবে",
  POND_AREA_REQUIRED: "পুকুরের আয়তন অবশ্যই দিতে হবে",
  POND_AREA_NEGATIVE: "আয়তন নেতিবাচক হতে পারবে না",
  POND_FISH_TYPE_REQUIRED: "মাছের ধরন অবশ্যই দিতে হবে",
  POND_EXPENSE_TYPE_REQUIRED: "খরচের ধরন অবশ্যই দিতে হবে",
  POND_EXPENSE_AMOUNT_REQUIRED: "পরিমাণ অবশ্যই দিতে হবে",
  POND_EXPENSE_AMOUNT_NEGATIVE: "পরিমাণ নেতিবাচক হতে পারবে না",
  POND_EXPENSE_DATE_REQUIRED: "তারিখ অবশ্যই দিতে হবে",
  
  // Water quality validation
  WATER_QUALITY_PH_REQUIRED: "pH মান অবশ্যই দিতে হবে",
  WATER_QUALITY_PH_MIN: "pH মান ০ এর কম হতে পারবে না",
  WATER_QUALITY_PH_MAX: "pH মান ১৪ এর বেশি হতে পারবে না",
  WATER_QUALITY_DISSOLVED_O2_REQUIRED: "দ্রবীভূত অক্সিজেন মান অবশ্যই দিতে হবে",
  WATER_QUALITY_DISSOLVED_O2_NEGATIVE: "দ্রবীভূত অক্সিজেন মান নেতিবাচক হতে পারবে না",
  WATER_QUALITY_LAST_TESTED_REQUIRED: "শেষ পরীক্ষার তারিখ অবশ্যই দিতে হবে",
  
  // Notification validation
  NOTIFICATION_TYPE_REQUIRED: "নোটিফিকেশন টাইপ অবশ্যই দিতে হবে",
  NOTIFICATION_TITLE_REQUIRED: "নোটিফিকেশন শিরোনাম অবশ্যই দিতে হবে",
  NOTIFICATION_MESSAGE_REQUIRED: "নোটিফিকেশন বার্তা অবশ্যই দিতে হবে",
} as const;

export const UI_MESSAGES = {
  // Dashboard messages
  DASHBOARD_OVERVIEW: "ড্যাশবোর্ড ওভারভিউ",
  WELCOME: "স্বাগতম",
  DOCTOR: "ডাক্তার",
  
  // Rate limiting messages
  RATE_LIMIT_EXCEEDED: "অতিরিক্ত অনুরোধ। অনুগ্রহ করে ১ ঘণ্টা পর আবার চেষ্টা করুন।",
  
  // Server error messages
  SERVER_ERROR: "সার্ভার ত্রুটি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।",
  
  // Demo login messages
  FARMER_DEMO_DATA: "চাষি অ্যাকাউন্টের তথ্য দেয়া হয়েছে",
  DOCTOR_DEMO_DATA: "ডাক্তার অ্যাকাউন্টের তথ্য দেয়া হয়েছে",
  
  // Placeholder messages
  PHONE_PLACEHOLDER: "01XXXXXXXXX",
  PHONE_PLACEHOLDER_WITH_PREFIX: "+8801XXXXXXXXX",
  EMAIL_OR_PHONE_PLACEHOLDER: "01XXXXXXXXX বা example@email.com",
  LICENSE_PLACEHOLDER: "LIC-XXXXX",
  
  // Loading messages
  LOADING: "লোড হচ্ছে...",
  PROCESSING: "প্রক্রিয়া চলছে...",
  
  // Empty state messages
  NO_DATA: "কোনো তথ্য নেই",
  NO_RESULTS: "কোনো ফলাফল পাওয়া যায়নি",
} as const;
