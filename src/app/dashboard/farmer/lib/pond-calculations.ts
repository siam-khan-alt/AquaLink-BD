/**
 * Pond Calculations - Validation and Business Logic
 * Ensures data integrity and prevents invalid pond configurations
 */

import { IPond } from "@/models/Pond";

/**
 * Pond Form Data Interface
 */
export interface PondFormData {
  name: string;
  area: string;
  fishType: string[];
  initialPh: string;
  depth: string;
}

/**
 * Validation Error Interface
 */
export interface ValidationError {
  name?: string;
  area?: string;
  fishTypes?: string;
  initialPh?: string;
  depth?: string;
}

/**
 * Incompatible fish pairs that should not be co-cultured
 */
const INCOMPATIBLE_FISH_PAIRS: Array<[string, string]> = [
  ['Ruhi', 'Pangas'], // Pangas are aggressive
  ['Katla', 'Tilapia'], // Competition for food
  ['Mrigel', 'Pangas'], // Size difference issues
];

/**
 * pH requirements for different fish types
 */
const PH_REQUIREMENTS: Record<string, { min: number; max: number }> = {
  'Ruhi': { min: 6.5, max: 8.5 },
  'Pangas': { min: 7.0, max: 8.0 },
  'Tilapia': { min: 6.0, max: 9.0 },
  'Katla': { min: 6.5, max: 8.5 },
  'Mrigel': { min: 6.5, max: 8.5 },
  'Koi': { min: 7.0, max: 8.5 },
  'Magur': { min: 6.0, max: 8.0 },
};

/**
 * Validate Pond Data
 * Checks for duplicate names, fish compatibility, pH ranges, and realistic values
 */
export const validatePondData = (
  data: PondFormData,
  existingPonds: IPond[]
): ValidationError => {
  const errors: ValidationError = {};

  // Name validation
  if (!data.name || !data.name.trim()) {
    errors.name = "পুকুরের নাম অবশ্যই দিতে হবে";
  } else if (data.name.length < 3) {
    errors.name = "পুকুরের নাম অন্তত ৩ অক্ষর হতে হবে";
  } else if (existingPonds.some((pond) => pond.name === data.name.trim())) {
    errors.name = "এই নামের পুকুর ইতিমধ্যে আছে";
  }

  // Area validation
  const areaNum = parseFloat(data.area);
  if (isNaN(areaNum) || areaNum <= 0) {
    errors.area = "সঠিক ইতিবাচক পুকুরের আয়তন শতাংশে লিখুন";
  } else if (areaNum < 10) {
    errors.area = "পুকুরের আয়তন অন্তত ১০ শতাংশ হতে হবে";
  } else if (areaNum > 5000) {
    errors.area = "পুকুরের আয়তন ৫০০০ শতাংশের বেশি হতে পারে না";
  }

  // Fish types validation
  if (!data.fishType || data.fishType.length === 0) {
    errors.fishTypes = "অন্তত একটি মাছের প্রজাতি নির্বাচন করুন";
  } else {
    // Check for incompatible pairs
    for (const [fish1, fish2] of INCOMPATIBLE_FISH_PAIRS) {
      if (data.fishType.includes(fish1) && data.fishType.includes(fish2)) {
        errors.fishTypes = `${fish1} এবং ${fish2} একসাথে চাষ করা উচিত নয়`;
        break;
      }
    }
  }

  // pH validation
  const phNum = parseFloat(data.initialPh);
  if (isNaN(phNum) || phNum <= 0) {
    errors.initialPh = "সঠিক pH মান লিখুন";
  } else if (phNum < 4 || phNum > 11) {
    errors.initialPh = "pH মান ৪ থেকে ১১ এর মধ্যে হতে হবে";
  } else if (data.fishType && data.fishType.length > 0) {
    // Validate pH for selected fish types
    for (const fish of data.fishType) {
      const req = PH_REQUIREMENTS[fish];
      if (req && (phNum < req.min || phNum > req.max)) {
        errors.initialPh = `${fish} এর জন্য pH ${req.min}-${req.max} এর মধ্যে হওয়া প্রয়োজন`;
        break;
      }
    }
  }

  // Depth validation
  const depthNum = parseFloat(data.depth);
  if (isNaN(depthNum) || depthNum <= 0) {
    errors.depth = "সঠিক গভীরতা মিটারে লিখুন";
  } else if (depthNum < 0.5) {
    errors.depth = "পুকুরের গভীরতা অন্তত ০.৫ মিটার হতে হবে";
  } else if (depthNum > 10) {
    errors.depth = "পুকুরের গভীরতা ১০ মিটারের বেশি হতে পারে না";
  }

  return errors;
};

/**
 * Calculate Optimal Feed Amount
 * Based on pond area, fish count, and fish type
 */
export const calculateOptimalFeed = (
  pondArea: number,
  fishCount: number,
  fishType: string
): {
  dailyFeedKg: number;
  monthlyFeedKg: number;
  estimatedCost: number;
  feedRate: number;
} => {
  // Feed rates as percentage of body weight (3-4% typical)
  const feedRates: Record<string, number> = {
    'Ruhi': 0.03,
    'Katla': 0.025,
    'Mrigel': 0.028,
    'Pangas': 0.04,
    'Tilapia': 0.035,
    'Koi': 0.03,
    'Magur': 0.04,
  };

  const avgFishWeight = 500; // grams (should be tracked in production)
  const totalBiomass = fishCount * avgFishWeight; // grams
  const feedRate = feedRates[fishType] || 0.03;
  const dailyFeed = totalBiomass * feedRate; // grams
  const dailyFeedKg = dailyFeed / 1000;
  const monthlyFeedKg = dailyFeedKg * 30;
  const estimatedCost = monthlyFeedKg * 80; // 80 BDT/kg average

  return {
    dailyFeedKg: Number(dailyFeedKg.toFixed(2)),
    monthlyFeedKg: Number(monthlyFeedKg.toFixed(2)),
    estimatedCost: Number(estimatedCost.toFixed(2)),
    feedRate,
  };
};

/**
 * Validate Expense Entry
 * Ensures expense amounts are realistic for pond size
 */
export const validateExpenseEntry = (
  expense: { amount: number; type: string; date: Date },
  pond: IPond
): string[] => {
  const errors: string[] = [];

  if (!expense.amount || expense.amount <= 0) {
    errors.push('ব্যয়ের পরিমাণ অবশ্যই ধনাত্মক হতে হবে');
  }

  if (!expense.type || !expense.type.trim()) {
    errors.push('ব্যয়ের ধরন নির্দিষ্ট করুন');
  }

  if (!expense.date) {
    errors.push('তারিখ নির্দিষ্ট করুন');
  }

  // Check for unusually high expenses
  if (expense.amount > pond.area * 10000) {
    errors.push('ব্যয়ের পরিমাণ পুকুরের আয়তনের তুলনায় অস্বাভাবিক বেশি');
  }

  // Check for unusually low feed expenses
  if (expense.type.toLowerCase().includes('feed') && expense.amount < pond.area * 100) {
    errors.push('খাবারের ব্যয় পুকুরের আয়তনের তুলনায় খুব কম');
  }

  return errors;
};

/**
 * Calculate Stocking Density
 * Fish count per unit area (fish per decimal)
 */
export const calculateStockingDensity = (
  fishCount: number,
  pondArea: number
): {
  density: number;
  status: 'optimal' | 'overstocked' | 'understocked';
  recommendation: string;
} => {
  const density = fishCount / pondArea; // fish per decimal

  let status: 'optimal' | 'overstocked' | 'understocked';
  let recommendation: string;

  if (density < 10) {
    status = 'understocked';
    recommendation = 'মাছের ঘনত্ব কম। আরও মাছ স্টক করা যেতে পারে।';
  } else if (density > 50) {
    status = 'overstocked';
    recommendation = 'মাছের ঘনত্ব বেশি। অক্সিজেন সমস্যা হতে পারে।';
  } else {
    status = 'optimal';
    recommendation = 'মাছের ঘনত্ব উপযুক্ত।';
  }

  return {
    density: Number(density.toFixed(2)),
    status,
    recommendation,
  };
};

/**
 * Calculate Aeration Requirement
 * Based on pond area and stocking density
 */
export const calculateAerationRequirement = (
  pondArea: number,
  fishCount: number
): {
  aeratorsNeeded: number;
  horsepowerNeeded: number;
  recommendation: string;
} => {
  const density = fishCount / pondArea;
  let aeratorsNeeded = 0;
  let horsepowerNeeded = 0;

  // Standard: 1 HP aerator per 2-3 decimals with normal stocking
  if (density > 30) {
    // High stocking density
    aeratorsNeeded = Math.ceil(pondArea / 2);
    horsepowerNeeded = aeratorsNeeded;
  } else if (density > 20) {
    // Medium stocking density
    aeratorsNeeded = Math.ceil(pondArea / 3);
    horsepowerNeeded = aeratorsNeeded;
  } else {
    // Low stocking density
    aeratorsNeeded = Math.ceil(pondArea / 4);
    horsepowerNeeded = aeratorsNeeded;
  }

  const recommendation =
    aeratorsNeeded > 0
      ? `${aeratorsNeeded}টি এরেটর (${horsepowerNeeded} HP) প্রয়োজন`
      : 'এরেটর প্রয়োজন নেই';

  return {
    aeratorsNeeded,
    horsepowerNeeded,
    recommendation,
  };
};
