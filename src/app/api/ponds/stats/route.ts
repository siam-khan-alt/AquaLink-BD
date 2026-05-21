import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Pond } from "@/models/Pond";
import { getToken } from "next-auth/jwt";
import { Types } from "mongoose";

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

    const ponds = await Pond.find({ owner: new Types.ObjectId(farmerId) });

    // Aggregate statistics
    const totalPonds = ponds.length;

    const activeSpeciesSet = new Set<string>();
    let totalExpenses = 0;
    let totalPH = 0;

    ponds.forEach((pond) => {
      // Collect unique species
      if (pond.fishType) {
        pond.fishType.forEach((species) => {
          if (species && species.trim()) {
            activeSpeciesSet.add(species.trim());
          }
        });
      }
      
      // Calculate total expenses
      if (pond.expenses) {
        pond.expenses.forEach((expense) => {
          totalExpenses += expense.amount;
        });
      }

      // Sum up pH for average
      if (pond.waterQuality && typeof pond.waterQuality.pH === "number") {
        totalPH += pond.waterQuality.pH;
      }
    });

    const averagePH = totalPonds > 0 ? Number((totalPH / totalPonds).toFixed(2)) : 0;

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalPonds,
          totalActiveSpecies: activeSpeciesSet.size,
          totalExpenses,
          averagePH,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error fetching stats:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}
