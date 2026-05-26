import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { DoctorApplication } from "@/models/DoctorApplication";
import { User } from "@/models/User";
import mongoose from "mongoose";

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
      // Use transaction for atomicity
      const dbSession = await mongoose.startSession();
      dbSession.startTransaction();

      try {
        // Check if user already exists with this email
        const existingUser = await User.findOne({ email: application.email }).session(dbSession);
        if (existingUser) {
          await dbSession.abortTransaction();
          dbSession.endSession();
          return NextResponse.json(
            { error: "এই ইমেইল দিয়ে ইতিমধ্যে একটি ইউজার অ্যাকাউন্ট রয়েছে" },
            { status: 400 }
          );
        }

        // Create user with the doctor's already-hashed password from application
        await User.create(
          [
            {
              name: application.name,
              email: application.email,
              phone: application.phone,
              password: application.password, // Already hashed from application
              role: "doctor",
              specialization: application.specialization,
              consultationFee: application.consultationFee,
              bio: application.bio,
              image: application.avatarUrl,
              district: application.district,
              division: application.division,
              isVerified: true,
              certificateUrl: application.certificateUrl,
              degree: application.degree,
              experience: application.experience,
              licenseNumber: application.licenseNumber,
              availability: {
                isAvailable: true,
                weeklySchedule: {
                  monday: { start: "09:00", end: "17:00" },
                  tuesday: { start: "09:00", end: "17:00" },
                  wednesday: { start: "09:00", end: "17:00" },
                  thursday: { start: "09:00", end: "17:00" },
                  friday: { start: "09:00", end: "17:00" },
                  saturday: { start: "09:00", end: "13:00" },
                  sunday: { start: "", end: "" },
                },
              },
            },
          ],
          { session: dbSession }
        );

        // Update application status
        application.status = "approved";
        application.reviewedBy = session.user?.id as string;
        application.reviewedAt = new Date();
        await application.save({ session: dbSession });

        await dbSession.commitTransaction();
        dbSession.endSession();
      } catch (transactionError) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        throw transactionError;
      }
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
