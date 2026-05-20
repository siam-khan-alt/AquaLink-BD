import { NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { MarketPrice } from "@/models/MarketPrice";
import { fetchMarketDataWithAI } from "@/shared/lib/ai-market";
import { ScrapedFishData } from "@/shared/types/market";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";

  // Authorization rules:
  // - Vercel scheduled cron requests are allowed via the `x-vercel-cron` header.
  // - Manual / external triggers must provide the correct `?secret=...`.
  if (!isVercelCron && (!secret || !cronSecret || secret !== cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const newData: ScrapedFishData[] = await fetchMarketDataWithAI();

    if (!newData || newData.length === 0) {
      return NextResponse.json({ message: "AI could not retrieve data." });
    }

    const bulkOps = newData.map((item: ScrapedFishData) => ({
      updateOne: {
        filter: { fishName: item.fishName, location: item.location },
        update: {
          $set: {
            currentPrice: item.price,
            category: item.category,
            lastUpdated: new Date(),
          },
          $push: {
            history: {
              $each: [{ date: new Date(), price: item.price }],
              $slice: -30,
            },
          },
        },
        upsert: true,
      },
    }));

    await MarketPrice.bulkWrite(bulkOps);

    return NextResponse.json({
      success: true,
      count: newData.length,
      source: "Gemini-3-Flash Intelligence",
    });
  } catch {
    return NextResponse.json(
      { error: "AI Automation failed" },
      { status: 500 }
    );
  }
}
