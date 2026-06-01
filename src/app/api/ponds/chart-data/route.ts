import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Pond } from "@/models/Pond";
import { getToken } from "next-auth/jwt";
import { Types } from "mongoose";
import { ApiResponse } from "@/shared/types/api-responses";

const MONTHS_BN = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id || token.role !== "farmer") {
      return NextResponse.json(
        { error: "Unauthorized. Farmer access only." },
        { status: 401 }
      );
    }

    await connectDB();
    const farmerId = token.id as string;

    // OPTIMIZED: Use MongoDB aggregation pipeline for server-side grouping
    // Reduces complexity from O(n*m) to O(n) where n=ponds
    const chartData = await Pond.aggregate([
      { $match: { owner: new Types.ObjectId(farmerId) } },
      { $unwind: "$expenses" },
      {
        $project: {
          year: { $year: "$expenses.date" },
          month: { $month: "$expenses.date" },
          type: "$expenses.type",
          amount: "$expenses.amount",
        },
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
          },
          Feed: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: [{ $toLower: "$type" }, "feed"] },
                    { $eq: [{ $toLower: "$type" }, "খাদ্য"] },
                  ],
                },
                "$amount",
                0,
              ],
            },
          },
          Fertilizer: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: [{ $toLower: "$type" }, "fertilizer"] },
                    { $eq: [{ $toLower: "$type" }, "সার"] },
                  ],
                },
                "$amount",
                0,
              ],
            },
          },
          Other: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: [{ $toLower: "$type" }, "feed"] },
                    { $eq: [{ $toLower: "$type" }, "খাদ্য"] },
                    { $eq: [{ $toLower: "$type" }, "fertilizer"] },
                    { $eq: [{ $toLower: "$type" }, "সার"] },
                  ],
                },
                0,
                "$amount",
              ],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 },
    ]);

    // Generate month labels for last 6 months
    const now = new Date();
    const last6Months: { key: string; name: string }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const name = `${MONTHS_BN[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      last6Months.push({ key, name });
    }

    // Create a map for quick lookup
    const chartDataMap = new Map<string, { Feed: number; Fertilizer: number; Other: number }>();
    chartData.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      chartDataMap.set(key, {
        Feed: item.Feed || 0,
        Fertilizer: item.Fertilizer || 0,
        Other: item.Other || 0,
      });
    });

    // Build final response with all months (including zeros)
    const finalChartData = last6Months.map((m) => ({
      name: m.name,
      "খাদ্য (Feed)": chartDataMap.get(m.key)?.Feed || 0,
      "সার (Fertilizer)": chartDataMap.get(m.key)?.Fertilizer || 0,
      "অন্যান্য (Other)": chartDataMap.get(m.key)?.Other || 0,
    }));

    const response: ApiResponse<{ data: typeof finalChartData }> = {
      success: true,
      data: { data: finalChartData },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error fetching chart data:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}
