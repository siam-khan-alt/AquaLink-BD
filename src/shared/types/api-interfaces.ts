/**
 * Shared API Interface Types
 * 
 * This file contains type definitions for API responses and requests.
 * These types are decoupled from database models and can be safely used in client components.
 * No Mongoose models or server-side code should be imported here.
 */

// ============================================================================
// POND TYPES
// ============================================================================

export type WaterQuality = {
  pH: number;
  dissolvedO2?: number;
  lastTested?: string;
};

export type Expense = {
  _id: string;
  type: string;
  amount: number;
  date: string;
};

export type Pond = {
  _id: string;
  name: string;
  area: number;
  fishType: string[];
  waterQuality?: WaterQuality;
  expenses?: Expense[];
  createdAt: string;
};

export type PondsResponse = {
  ponds: Pond[];
};

export type DashboardStats = {
  totalPonds: number;
  totalActiveSpecies: number;
  totalExpenses: number;
  averagePH: number;
};

export type StatsResponse = {
  stats: DashboardStats;
};

// ============================================================================
// CHART DATA TYPES
// ============================================================================

export type ChartMonth = {
  key: string;
  name: string;
};

export type MonthExpenseAccumulator = {
  Feed: number;
  Fertilizer: number;
  Other: number;
};

export type ChartDataRow = {
  name: string;
  "খাদ্য (Feed)": number;
  "সার (Fertilizer)": number;
  "অন্যান্য (Other)": number;
};

export type ChartDataResponse = {
  data: ChartDataRow[];
};

// ============================================================================
// ALERT TYPES
// ============================================================================

export type AlertSeverity = "info" | "warning" | "danger";

export type Alert = {
  _id: string;
  title: string;
  region: string;
  severity: AlertSeverity;
  detail: string;
  isActive: boolean;
  createdAt: string;
};

export type AlertsResponse = {
  alerts: Alert[];
};

// ============================================================================
// COURSE TYPES
// ============================================================================

export type Course = {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  price: number;
  category: string;
  isEnrolled: boolean;
  createdAt: string;
};

export type CoursesResponse = {
  courses: Course[];
};

// ============================================================================
// EXPENSE TRACKER TYPES
// ============================================================================

export type ExpenseTrackerItem = {
  _id: string;
  pondId: string;
  pondName: string;
  type: string;
  amount: number;
  date: string;
  note?: string;
};

export type ExpenseTrackerResponse = {
  expenses: ExpenseTrackerItem[];
};

export type PondListItem = {
  _id: string;
  name: string;
};

export type PondListResponse = {
  ponds: PondListItem[];
};

// ============================================================================
// FEED CALCULATOR TYPES
// ============================================================================

export type FeedCalculationRequest = {
  fishType: string;
  fishCount: number;
  avgWeight: number;
  waterTemp?: number;
};

export type FeedCalculationResult = {
  biomass: number;
  dailyFeedKg: number;
  dailyFeedCost: number;
  monthlyFeedCost: number;
  feedRate: number;
};

export type FeedCalculationResponse = {
  result: FeedCalculationResult;
};

export type FishTypeConfig = {
  name: string;
  feedRate: number;
  feedPricePerKg: number;
};

// ============================================================================
// ADMIN TYPES
// ============================================================================

export type AdminStats = {
  totalFarmers: number;
  totalPonds: number;
  activeChatChannels: number;
  verifiedFarmers: number;
  notificationDispatchStatus: string;
};

export type AdminStatsResponse = {
  stats: AdminStats;
};

export type Farmer = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
};

export type FarmersResponse = {
  farmers: Farmer[];
};

export type DoctorApplication = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  degree: string;
  specialization: string;
  licenseNumber: string;
  experience: number;
  consultationFee: number;
  bio: string;
  district?: string;
  division?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type DoctorApplicationsResponse = {
  applications: DoctorApplication[];
};

export type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
};

export type UsersResponse = {
  success: boolean;
  farmers: User[];
};

export type AdminAlert = {
  _id: string;
  region: string;
  title: string;
  detail: string;
  level: "info" | "warning" | "danger";
  isActive: boolean;
  createdAt: string;
};

export type AdminAlertsResponse = {
  alerts: AdminAlert[];
};

export type AdminCourse = {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  price: number;
  category: string;
  image?: string;
  createdAt: string;
};

export type AdminCoursesResponse = {
  success: boolean;
  courses: AdminCourse[];
};
