/**
 * Farm Logic - Predictive Analytics Functions
 * Transforms reactive monitoring into predictive intelligence
 */

import { IPond, IWaterQuality } from "@/models/Pond";

// Growth periods in days for different fish types
const GROWTH_PERIODS: Record<string, number> = {
  'Ruhi': 180,
  'Katla': 210,
  'Mrigel': 195,
  'Pangas': 120,
  'Tilapia': 150,
  'Koi': 240,
  'Magur': 270,
};

/**
 * Water Quality Log Interface for trend analysis
 */
export interface WaterQualityLog {
  pH: number;
  dissolvedO2: number;
  timestamp: Date;
}

/**
 * Calculate Pond Health Index (0-100)
 * Composite score based on pH and DO (temperature not available in current schema)
 */
export const calculatePondHealth = (waterQuality: IWaterQuality): number => {
  if (!waterQuality) return 0;

  let phScore = 0;
  let doScore = 0;

  // pH Score (50% weight - increased since temperature not available)
  if (waterQuality.pH >= 6.5 && waterQuality.pH <= 8.5) {
    phScore = 100;
  } else if (waterQuality.pH >= 6.0 && waterQuality.pH <= 9.0) {
    phScore = 60;
  } else {
    phScore = 30;
  }

  // Dissolved Oxygen Score (50% weight - increased since temperature not available)
  const dissolvedOxygen = waterQuality.dissolvedO2 || 0;
  if (dissolvedOxygen >= 5) {
    doScore = 100;
  } else if (dissolvedOxygen >= 3) {
    doScore = 60;
  } else {
    doScore = 30;
  }

  const healthIndex = Math.round((phScore * 0.5) + (doScore * 0.5));
  return Math.min(Math.max(healthIndex, 0), 100);
};

/**
 * Predict Harvest Date based on fish type and stocking date
 */
export const predictHarvestDate = (
  fishTypes: string[],
  stockingDate: Date
): Array<{
  fishType: string;
  harvestDate: Date;
  daysUntilHarvest: number;
  readiness: 'ready' | 'approaching' | 'growing';
}> => {
  const predictions = fishTypes.map((fishType) => {
    const growthPeriod = GROWTH_PERIODS[fishType] || 180;
    const harvestDate = new Date(stockingDate.getTime() + growthPeriod * 24 * 60 * 60 * 1000);
    const daysUntilHarvest = Math.ceil((harvestDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

    let readiness: 'ready' | 'approaching' | 'growing';
    if (daysUntilHarvest <= 7) {
      readiness = 'ready';
    } else if (daysUntilHarvest <= 30) {
      readiness = 'approaching';
    } else {
      readiness = 'growing';
    }

    return {
      fishType,
      harvestDate,
      daysUntilHarvest,
      readiness,
    };
  });

  return predictions.sort((a, b) => a.daysUntilHarvest - b.daysUntilHarvest);
};

/**
 * Analyze Water Quality Trend using Linear Regression
 * Predicts pH issues before they occur
 */
export const analyzeWaterQualityTrend = (
  logs: WaterQualityLog[]
): {
  trend: 'stable' | 'declining' | 'rising' | 'insufficient_data';
  prediction: string;
  severity: 'low' | 'medium' | 'high';
  nextValue?: number;
} => {
  if (!logs || logs.length < 3) {
    return {
      trend: 'insufficient_data',
      prediction: 'Insufficient data for trend analysis',
      severity: 'low',
    };
  }

  const recentLogs = logs.slice(-7); // Last 7 readings
  const phValues = recentLogs.map((log) => log.pH);

  // Linear regression: y = mx + b
  const n = phValues.length;
  const sumX = n * (n - 1) / 2;
  const sumY = phValues.reduce((a, b) => a + b, 0);
  const sumXY = phValues.reduce((sum, y, i) => sum + i * y, 0);
  const sumX2 = Array.from({ length: n }, (_, i) => i * i).reduce((a, b) => a + b, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const currentPH = phValues[phValues.length - 1];
  const nextPH = currentPH + slope;

  if (nextPH < 6.5) {
    return {
      trend: 'declining',
      prediction: `pH will drop below 6.5 in 2-3 days (current: ${currentPH.toFixed(2)}, predicted: ${nextPH.toFixed(2)})`,
      severity: 'high',
      nextValue: nextPH,
    };
  }

  if (nextPH > 8.5) {
    return {
      trend: 'rising',
      prediction: `pH will exceed 8.5 in 2-3 days (current: ${currentPH.toFixed(2)}, predicted: ${nextPH.toFixed(2)})`,
      severity: 'high',
      nextValue: nextPH,
    };
  }

  if (Math.abs(slope) > 0.1) {
    return {
      trend: slope > 0 ? 'rising' : 'declining',
      prediction: `pH is ${slope > 0 ? 'increasing' : 'decreasing'} but within safe range`,
      severity: 'medium',
      nextValue: nextPH,
    };
  }

  return {
    trend: 'stable',
    prediction: 'pH will remain stable',
    severity: 'low',
    nextValue: nextPH,
  };
};

/**
 * Environmental Data Interface for Disease Risk Calculation
 */
export interface EnvironmentalData {
  temperature: number;
  humidity: number;
  rainfall?: number;
  season: 'summer' | 'monsoon' | 'winter' | 'spring';
}

/**
 * Calculate Disease Risk Score based on water quality and environmental factors
 */
export const calculateDiseaseRisk = (
  pond: IPond,
  environmentalFactors: EnvironmentalData
): {
  score: number;
  level: 'critical' | 'high' | 'medium' | 'low';
  factors: string[];
} => {
  let riskScore = 0;
  const riskFactors: string[] = [];

  const waterQuality = pond.waterQuality || {};

  // Water quality factors
  if (waterQuality.pH && (waterQuality.pH < 6.0 || waterQuality.pH > 9.0)) {
    riskScore += 30;
    riskFactors.push('Extreme pH levels');
  }

  if (waterQuality.dissolvedO2 && waterQuality.dissolvedO2 < 3) {
    riskScore += 25;
    riskFactors.push('Low dissolved oxygen');
  }

  // Environmental factors
  if (environmentalFactors.temperature > 35) {
    riskScore += 20;
    riskFactors.push('High ambient temperature');
  }

  if (environmentalFactors.humidity > 80) {
    riskScore += 15;
    riskFactors.push('High humidity (disease prone)');
  }

  // Seasonal factors
  if (environmentalFactors.season === 'monsoon') {
    riskScore += 10;
    riskFactors.push('Monsoon season risk');
  }

  if (environmentalFactors.season === 'summer' && environmentalFactors.temperature > 32) {
    riskScore += 10;
    riskFactors.push('Summer heat stress');
  }

  const finalScore = Math.min(riskScore, 100);

  let level: 'critical' | 'high' | 'medium' | 'low';
  if (finalScore > 70) {
    level = 'critical';
  } else if (finalScore > 40) {
    level = 'high';
  } else if (finalScore > 20) {
    level = 'medium';
  } else {
    level = 'low';
  }

  return {
    score: finalScore,
    level,
    factors: riskFactors,
  };
};

/**
 * Calculate Feed Efficiency Ratio
 * Feed consumed vs fish weight gain
 */
export const calculateFeedEfficiency = (
  feedAmountKg: number,
  fishWeightGainKg: number
): {
  ratio: number;
  efficiency: 'excellent' | 'good' | 'fair' | 'poor';
  recommendation: string;
} => {
  if (fishWeightGainKg <= 0) {
    return {
      ratio: 0,
      efficiency: 'poor',
      recommendation: 'No weight gain detected. Review feeding schedule and water quality.',
    };
  }

  const ratio = feedAmountKg / fishWeightGainKg;

  let efficiency: 'excellent' | 'good' | 'fair' | 'poor';
  let recommendation: string;

  if (ratio < 1.5) {
    efficiency = 'excellent';
    recommendation = 'Excellent feed conversion. Maintain current feeding strategy.';
  } else if (ratio < 2.0) {
    efficiency = 'good';
    recommendation = 'Good feed conversion. Minor optimization possible.';
  } else if (ratio < 2.5) {
    efficiency = 'fair';
    recommendation = 'Fair feed conversion. Consider reducing feed amount or improving water quality.';
  } else {
    efficiency = 'poor';
    recommendation = 'Poor feed conversion. Review feeding practices and pond conditions.';
  }

  return {
    ratio: Number(ratio.toFixed(2)),
    efficiency,
    recommendation,
  };
};

/**
 * Calculate Monthly ROI
 * (Revenue - Expenses) / Expenses * 100
 */
export const calculateMonthlyROI = (
  monthlyRevenue: number,
  monthlyExpenses: number
): {
  roi: number;
  profit: number;
  margin: number;
  status: 'profitable' | 'break-even' | 'loss';
} => {
  const profit = monthlyRevenue - monthlyExpenses;
  const roi = monthlyExpenses > 0 ? (profit / monthlyExpenses) * 100 : 0;
  const margin = monthlyRevenue > 0 ? (profit / monthlyRevenue) * 100 : 0;

  let status: 'profitable' | 'break-even' | 'loss';
  if (profit > 0) {
    status = 'profitable';
  } else if (profit === 0) {
    status = 'break-even';
  } else {
    status = 'loss';
  }

  return {
    roi: Number(roi.toFixed(2)),
    profit: Number(profit.toFixed(2)),
    margin: Number(margin.toFixed(2)),
    status,
  };
};
