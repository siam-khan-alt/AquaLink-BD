import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Pond } from "@/models/Pond";
import { getToken } from "next-auth/jwt";
import { Types } from "mongoose";

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

    const ponds = await Pond.find({ owner: new Types.ObjectId(farmerId) })
      .select("expenses")
      .lean();

    // Generate chart data for last 6 months
    const chartDataMap: Record<string, { Feed: number; Fertilizer: number; Other: number }> = {};
    const last6Months: { key: string; name: string }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const name = `${MONTHS_BN[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      last6Months.push({ key, name });
      chartDataMap[key] = { Feed: 0, Fertilizer: 0, Other: 0 };
    }

    ponds.forEach((pond) => {
      if (pond.expenses) {
        pond.expenses.forEach((expense) => {
          const expDate = new Date(expense.date);
          const key = `${expDate.getFullYear()}-${expDate.getMonth()}`;
          if (chartDataMap[key] !== undefined) {
            const type = expense.type.toLowerCase();
            if (type.includes("feed") || type.includes("খাদ্য")) {
              chartDataMap[key].Feed += expense.amount;
            } else if (type.includes("fertilizer") || type.includes("সার")) {
              chartDataMap[key].Fertilizer += expense.amount;
            } else {
              chartDataMap[key].Other += expense.amount;
            }
          }
        });
      }
    });

    const chartData = last6Months.map((m) => ({
      name: m.name,
      "খাদ্য (Feed)": chartDataMap[m.key].Feed,
      "সার (Fertilizer)": chartDataMap[m.key].Fertilizer,
      "অন্যান্য (Other)": chartDataMap[m.key].Other,
    }));

    return NextResponse.json({ data: chartData }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error fetching chart data:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}
