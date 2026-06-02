import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/shared/lib/db";
import { DoctorApplication } from "@/models/DoctorApplication";
import { User } from "@/models/User";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { z } from "zod";
import mongoose from "mongoose";
import { createNotification } from "@/shared/lib/notificationHelpers";
import { NotificationType, NotificationPriority, UserRole } from "@/shared/types/notification.types";

const approveSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await getServerSession(authOptions);

    if (!authSession || authSession.user?.role !== "admin") {
      return NextResponse.json({ error: "অনুমতি নেই" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = approveSchema.parse(body);

    await connectDB();

    const { id } = await params;
    const application = await DoctorApplication.findById(id).lean();

    if (!application) {
      return NextResponse.json({ error: "আবেদন পাওয়া যায়নি" }, { status: 404 });
    }

    if (application.status !== "pending") {
      return NextResponse.json({ error: "ইতিমধ্যে প্রক্রিয়া করা হয়েছে" }, { status: 400 });
    }

    if (validatedData.action === "reject") {
      application.status = "rejected";
      application.rejectionReason = validatedData.rejectionReason;
      application.reviewedBy = authSession.user.id;
      application.reviewedAt = new Date();
      await application.save();

      // Create notification for rejected applicant
      await createNotification({
        role: UserRole.DOCTOR,
        type: NotificationType.APPLICATION_REJECTED,
        priority: NotificationPriority.MEDIUM,
        title: "আবেদন বাতিল",
        message: `আপনার ডাক্তার আবেদন বাতিল করা হয়েছে। কারণ: ${validatedData.rejectionReason || "প্রদত্ত নয়"}`,
        link: "/",
        metadata: {
          applicationId: application._id.toString(),
          name: application.name,
          rejectionReason: validatedData.rejectionReason,
        },
      });

      return NextResponse.json({ message: "আবেদন বাতিল করা হয়েছে" });
    }

    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
      application.status = "approved";
      application.reviewedBy = authSession.user.id;
      application.reviewedAt = new Date();
      await application.save({ session: mongoSession });

      const existingUser = await User.findOne({ email: application.email }).session(mongoSession).lean();
      if (existingUser) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json({ error: "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে" }, { status: 400 });
      }

      const newUser = await User.create(
        [
          {
            name: application.name,
            email: application.email,
            phone: application.phone,
            role: "doctor",
            isVerified: true,
            image: application.avatarUrl,
            certificateUrl: application.certificateUrl,
            degree: application.degree,
            experience: application.experience,
            specialization: application.specialization,
            licenseNumber: application.licenseNumber,
            consultationFee: application.consultationFee,
            bio: application.bio,
            district: application.district,
            division: application.division,
            password: application.password,
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
        { session: mongoSession }
      );

      await mongoSession.commitTransaction();
      mongoSession.endSession();

      // Create notification for approved doctor
      await createNotification({
        userId: newUser[0]._id.toString(),
        type: NotificationType.APPLICATION_APPROVED,
        priority: NotificationPriority.HIGH,
        title: "আবেদন অনুমোদিত",
        message: "আপনার ডাক্তার আবেদন সফলভাবে অনুমোদিত হয়েছে। এখন আপনি লগইন করতে পারবেন।",
        link: "/login",
        metadata: {
          applicationId: application._id.toString(),
          userId: newUser[0]._id.toString(),
          name: application.name,
          specialization: application.specialization,
        },
      });

      return NextResponse.json({
        message: "আবেদন অনুমোদিত হয়েছে",
        userId: newUser[0]._id,
      });
    } catch (transactionError) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      throw transactionError;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error:", error);
    return NextResponse.json({ error: "সিস্টেম এরর" }, { status: 500 });
  }
}