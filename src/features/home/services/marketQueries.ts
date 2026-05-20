import { connectDB } from "@/shared/lib/db";
import { MarketPrice } from "@/models/MarketPrice";
import type { IMarketPrice } from "@/shared/types/market";

export async function getTickerMarketPrices(limit = 12): Promise<IMarketPrice[]> {
  await connectDB();
  const raw = await MarketPrice.find().sort({ lastUpdated: -1 }).limit(limit).lean();
  return JSON.parse(JSON.stringify(raw)) as IMarketPrice[];
}

export async function getCategorySnapshot(limit = 5): Promise<IMarketPrice[]> {
  await connectDB();

  // Pick the latest item per category first
  let raw = await MarketPrice.aggregate([
    { $sort: { lastUpdated: -1 } },
    { $group: { _id: "$category", doc: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$doc" } },
    { $limit: limit },
  ]);

  // If we still don't have enough items (e.g., empty DB), fill from latest overall
  if (raw.length < limit) {
    const existingIds = raw.map((d) => d._id);
    const fill = await MarketPrice.find({ _id: { $nin: existingIds } })
      .sort({ lastUpdated: -1 })
      .limit(limit - raw.length)
      .lean();
    raw = [...raw, ...fill];
  }

  return JSON.parse(JSON.stringify(raw)) as IMarketPrice[];
}

