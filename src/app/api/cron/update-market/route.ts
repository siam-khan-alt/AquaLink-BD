import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/shared/lib/db";
import { MarketPrice } from "@/models/MarketPrice";
import { fetchMarketDataWithAI } from "@/shared/lib/ai-market";
import { ScrapedFishData } from "@/shared/types/market";

// IP Whitelisting Helper Function
const isIPWhitelisted = (requestIP: string | null): boolean => {
  // If no allowed IPs are configured, deny all requests for security
  const allowedIPsEnv = process.env.CRON_ALLOWED_IPS;
  if (!allowedIPsEnv) {
    console.error("CRON_ALLOWED_IPS not configured - denying request");
    return false;
  }

  const allowedIPs = allowedIPsEnv.split(",").map((ip: string) => ip.trim());
  
  // If request IP is null/undefined, deny
  if (!requestIP) {
    console.error("Request IP is null/undefined - denying request");
    return false;
  }

  // Check if the request IP is in the whitelist
  const isAllowed = allowedIPs.some((allowedIP: string) => {
    // Support both exact match and CIDR notation (basic implementation)
    if (allowedIP === requestIP) return true;
    // Add CIDR support here if needed
    return false;
  });

  if (!isAllowed) {
    console.error(`IP ${requestIP} not in whitelist: ${allowedIPs.join(", ")}`);
  }

  return isAllowed;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;
  
  // Secret validation
  if (!cronSecret || secret !== cronSecret) {
    console.error("Invalid cron secret attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // IP Whitelisting
  const requestIP = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                    req.headers.get("x-real-ip") || 
                    null;
  
  if (!isIPWhitelisted(requestIP)) {
    return NextResponse.json({ error: "Unauthorized - IP not whitelisted" }, { status: 403 });
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

    // Revalidate cached pages to reflect new market data
    revalidatePath("/");
    revalidatePath("/market");

    return NextResponse.json({
      success: true,
      count: newData.length,
      source: "Gemini-3-Flash Intelligence",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown Error";
    console.error("AI Automation failed:", errorMessage);
    return NextResponse.json(
      { error: "AI Automation failed" },
      { status: 500 }
    );
  }
}
