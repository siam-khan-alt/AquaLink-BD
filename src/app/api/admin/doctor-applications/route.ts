import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/shared/lib/db";
import { DoctorApplication } from "@/models/DoctorApplication";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "অনুমতি নেই" },
        { status: 403 }
      );
    }

    await connectDB();

    const applications = await DoctorApplication.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching doctor applications:", error);
    return NextResponse.json(
      { error: "আবেদন লোড করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
