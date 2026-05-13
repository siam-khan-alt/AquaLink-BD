import { MarketPrice } from "@/models/MarketPrice";
import { connectDB } from "@/shared/lib/db";

export async function getMarketPrices() {
  await connectDB();
  return await MarketPrice.find().sort({ category: 1 }).lean();
}

// Logic for ISR Revalidation (Automation Placeholder)
export async function updateMarketPrice(fishId: string, newPrice: number) {
  await connectDB();
  const fish = await MarketPrice.findById(fishId);
  if (!fish) return null;

  const trend = newPrice > fish.currentPrice ? "up" : newPrice < fish.currentPrice ? "down" : "stable";

  return await MarketPrice.findByIdAndUpdate(fishId, {
    $set: { currentPrice: newPrice, trend, lastUpdated: new Date() },
    $push: { history: { $each: [{ date: new Date(), price: newPrice }], $slice: -30 } } // Keep last 30 days
  }, { new: true });
}