import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { DoctorApplication } from "@/models/DoctorApplication";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access only." },
        { status: 401 }
      );
    }

    await connectDB();

    const applications = await DoctorApplication.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, applications },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error fetching doctor applications:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access only." },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { id, action, rejectionReason } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: "Application ID and action are required" },
        { status: 400 }
      );
    }

    const application = await DoctorApplication.findById(id);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // Hash the password
      const hashedPassword = await bcrypt.hash(application.password, 10);
      
      // Create user in users collection
      const existingUser = await User.findOne({ email: application.email });
      if (!existingUser) {
        await User.create({
          name: application.name,
          email: application.email,
          phone: application.phone,
          password: hashedPassword,
          role: "doctor",
          specialization: application.specialization,
          consultationFee: application.consultationFee,
          bio: application.bio,
          image: application.avatarUrl,
          district: application.district,
          division: application.division,
          isVerified: true,
        });
      }
      
      application.status = "approved";
      application.reviewedBy = session.user?.id as string;
      application.reviewedAt = new Date();
      await application.save();
    } else if (action === "reject") {
      application.status = "rejected";
      application.rejectionReason = rejectionReason;
      application.reviewedBy = session.user?.id as string;
      application.reviewedAt = new Date();
      await application.save();
    }

    return NextResponse.json(
      { success: true, application },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error updating application:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}
