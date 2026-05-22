import { NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { MarketPrice } from "@/models/MarketPrice";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fishName = searchParams.get("fishName") || "রুই";
    const days = parseInt(searchParams.get("days") || "7", 10);

    await connectDB();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await MarketPrice.aggregate([
      {
        $match: {
          fishName: { $regex: fishName, $options: "i" },
          lastUpdated: { $gte: startDate },
        },
      },
      {
        $sort: { lastUpdated: 1 },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$lastUpdated",
            },
          },
          avgPrice: { $avg: "$currentPrice" },
          minPrice: { $min: "$currentPrice" },
          maxPrice: { $max: "$currentPrice" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          date: "$_id",
          avgPrice: { $round: ["$avgPrice", 2] },
          minPrice: { $round: ["$minPrice", 2] },
          maxPrice: { $round: ["$maxPrice", 2] },
          count: 1,
          _id: 0,
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        fishName,
        days,
        trends,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching market trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch market trends" },
      { status: 500 }
    );
  }
}
