import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/shared/lib/db";
import { DoctorApplication } from "@/models/DoctorApplication";
import { User } from "@/models/User";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { z } from "zod";

const approveSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "অনুমতি নেই" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = approveSchema.parse(body);

    await connectDB();

    const application = await DoctorApplication.findById(params.id);

    if (!application) {
      return NextResponse.json(
        { error: "আবেদন পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    if (application.status !== "pending") {
      return NextResponse.json(
        { error: "এই আবেদনটি ইতিমধ্যে প্রক্রিয়া করা হয়েছে" },
        { status: 400 }
      );
    }

    if (validatedData.action === "reject") {
      application.status = "rejected";
      application.rejectionReason = validatedData.rejectionReason;
      application.reviewedBy = session.user.id;
      application.reviewedAt = new Date();
      await application.save();

      return NextResponse.json({ message: "আবেদন বাতিল করা হয়েছে" });
    }

    // Approve the application
    application.status = "approved";
    application.reviewedBy = session.user.id;
    application.reviewedAt = new Date();
    await application.save();

    // Create a new User with doctor role
    const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    const newUser = await User.create({
      name: application.name,
      email: application.email,
      phone: application.phone,
      role: "doctor",
      isVerified: true,
      specialization: application.specialization,
      licenseNumber: application.licenseNumber,
      consultationFee: application.consultationFee,
      bio: application.bio,
      district: application.district,
      division: application.division,
      password: temporaryPassword,
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
    });

    // TODO: Send email notification to the doctor with their credentials
    // This would require setting up an email service like SendGrid or Nodemailer

    return NextResponse.json({
      message: "আবেদন অনুমোদিত হয়েছে",
      userId: newUser._id,
      temporaryPassword, // In production, send this via email only
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error approving doctor application:", error);
    return NextResponse.json(
      { error: "আবেদন অনুমোদন করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
