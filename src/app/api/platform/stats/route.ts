import { NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { User } from "@/models/User";
import { Pond } from "@/models/Pond";
import { FarmerStory } from "@/models/FarmerStory";
import { ExpertConsultant } from "@/models/ExpertConsultant";
import { EmergencyDiseaseAlert } from "@/models/EmergencyDiseaseAlert";
import { CommunityDiscussion } from "@/models/CommunityDiscussion";

export async function GET() {
  try {
    await connectDB();

    // Get real-time statistics from database
    const [
      totalFarmers,
      totalPonds,
      totalStories,
      totalExperts,
      totalVerifiedExperts,
      activeAlerts,
      totalDiscussions,
    ] = await Promise.all([
      User.countDocuments({ role: "farmer" }),
      Pond.countDocuments(),
      FarmerStory.countDocuments({ isPublished: true }),
      ExpertConsultant.countDocuments(),
      ExpertConsultant.countDocuments({ isVerified: true }),
      EmergencyDiseaseAlert.countDocuments({ isActive: true }),
      CommunityDiscussion.countDocuments(),
    ]);

    const stats = {
      totalFarmers,
      totalPonds,
      totalStories,
      totalExperts,
      totalVerifiedExperts,
      activeAlerts,
      totalDiscussions,
      verifiedFarmerPercentage: totalFarmers > 0 
        ? Math.round((totalVerifiedExperts / totalFarmers) * 100) 
        : 0,
    };

    return NextResponse.json({ success: true, stats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform statistics" },
      { status: 500 }
    );
  }
}
