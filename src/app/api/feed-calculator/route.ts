import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const feedCalculationSchema = z.object({
  fishType: z.string(),
  fishCount: z.number().min(1, "মাছের সংখ্যা ১ এর চেয়ে বেশি হতে হবে"),
  avgWeight: z.number().min(0.1, "গড় ওজন ০.১ গ্রামের চেয়ে বেশি হতে হবে"),
  waterTemp: z.number().optional(),
});

const FISH_TYPES: Record<string, { feedRate: number; feedPricePerKg: number }> = {
  "রুই": { feedRate: 3.0, feedPricePerKg: 45 },
  "কাতল": { feedRate: 2.8, feedPricePerKg: 48 },
  "মৃগেল": { feedRate: 2.5, feedPricePerKg: 50 },
  "তেলাপিয়া": { feedRate: 4.0, feedPricePerKg: 35 },
  "পাঙ্গাস": { feedRate: 3.5, feedPricePerKg: 40 },
  "সর্পুতি": { feedRate: 3.2, feedPricePerKg: 42 },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = feedCalculationSchema.parse(body);

    const fishConfig = FISH_TYPES[parsedData.fishType] || FISH_TYPES["রুই"];
    const temp = parsedData.waterTemp || 28;

    // Calculate biomass in kg
    const biomass = (parsedData.fishCount * parsedData.avgWeight) / 1000;

    // Adjust feed rate based on water temperature
    let adjustedFeedRate = fishConfig.feedRate;
    if (temp < 20) {
      adjustedFeedRate *= 0.7; // Reduce feed in cold water
    } else if (temp > 32) {
      adjustedFeedRate *= 0.8; // Reduce feed in hot water
    }

    // Calculate daily feed required in kg
    const dailyFeedKg = (biomass * adjustedFeedRate) / 100;

    // Calculate costs
    const dailyFeedCost = dailyFeedKg * fishConfig.feedPricePerKg;
    const monthlyFeedCost = dailyFeedCost * 30;

    const result = {
      biomass,
      dailyFeedKg,
      dailyFeedCost,
      monthlyFeedCost,
      feedRate: adjustedFeedRate,
    };

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error calculating feed:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}
