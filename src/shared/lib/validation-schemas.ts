/**
 * Shared Zod Validation Schemas
 * 
 * This file contains Zod schemas for form validation.
 * These schemas are used both on the client-side for immediate feedback
 * and on the server-side for API validation.
 */

import { z } from "zod";

// ============================================================================
// PRICE UPDATE SCHEMA
// ============================================================================

export const priceUpdateSchema = z.object({
  fishType: z.enum(["Ruhi", "Pangas", "Tilapia", "Katla", "Mrigel", "Koi", "Other"]),
  wholesalePrice: z.number().min(0, "পাইকারি দর নেতিবাচক হতে পারে না"),
  retailPrice: z.number().min(0, "খুচরা দর নেতিবাচক হতে পারে না"),
});

export type PriceUpdateInput = z.infer<typeof priceUpdateSchema>;

// ============================================================================
// COURSE CREATION/UPDATE SCHEMA
// ============================================================================

export const courseSchema = z.object({
  title: z.string().min(5, "কোর্সের শিরোনাম কমপক্ষে ৫ অক্ষর হতে হবে"),
  description: z.string().min(10, "কোর্সের বিবরণ কমপক্ষে ১০ অক্ষর হতে হবে"),
  videoUrl: z.string().url("সঠিক URL দিন"),
  price: z.number().min(0, "মূল্য নেতিবাচক হতে পারে না"),
  category: z.string().min(2, "ক্যাটাগরি কমপক্ষে ২ অক্ষর হতে হবে"),
  image: z.string().optional(),
});

export type CourseInput = z.infer<typeof courseSchema>;

// ============================================================================
// USER ROLE CHANGE SCHEMA
// ============================================================================

export const userRoleChangeSchema = z.object({
  role: z.enum(["admin", "farmer", "doctor"]),
});

export type UserRoleChangeInput = z.infer<typeof userRoleChangeSchema>;

// ============================================================================
// USER VERIFICATION TOGGLE SCHEMA
// ============================================================================

export const userVerificationSchema = z.object({
  isVerified: z.boolean(),
});

export type UserVerificationInput = z.infer<typeof userVerificationSchema>;

// ============================================================================
// ALERT CREATION SCHEMA
// ============================================================================

export const alertSchema = z.object({
  region: z.string().min(2, "অঞ্চল কমপক্ষে ২ অক্ষর হতে হবে"),
  title: z.string().min(5, "শিরোনাম কমপক্ষে ৫ অক্ষর হতে হবে"),
  detail: z.string().min(10, "বিস্তারিত তথ্য কমপক্ষে ১০ অক্ষর হতে হবে"),
  level: z.enum(["info", "warning", "danger"]),
  isActive: z.boolean().default(true),
});

export type AlertInput = z.infer<typeof alertSchema>;

// ============================================================================
// DOCTOR APPLICATION APPROVAL SCHEMA
// ============================================================================

export const doctorApprovalSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

export type DoctorApprovalInput = z.infer<typeof doctorApprovalSchema>;
