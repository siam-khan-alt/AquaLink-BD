import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { User } from "@/models/User";
import { z } from "zod";

const availabilitySchema = z.object({
  isAvailable: z.boolean(),
  weeklySchedule: z.object({
    monday: z.object({ start: z.string(), end: z.string() }),
    tuesday: z.object({ start: z.string(), end: z.string() }),
    wednesday: z.object({ start: z.string(), end: z.string() }),
    thursday: z.object({ start: z.string(), end: z.string() }),
    friday: z.object({ start: z.string(), end: z.string() }),
    saturday: z.object({ start: z.string(), end: z.string() }),
    sunday: z.object({ start: z.string(), end: z.string() }),
  }),
});

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = availabilitySchema.parse(body);

    await connectDB();
    const doctorId = session.user.id as string;

    const updatedUser = await User.findByIdAndUpdate(
      doctorId,
      {
        availability: {
          isAvailable: validatedData.isAvailable,
          weeklySchedule: validatedData.weeklySchedule,
        },
      },
      { new: true }
    ).select("availability");

    if (!updatedUser) {
      return NextResponse.json(
        { error: "ব্যবহারকারী পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "উপলব্ধতা সফলভাবে আপডেট করা হয়েছে",
      availability: updatedUser.availability,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "উপলব্ধতা আপডেট করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await connectDB();
    const doctorId = session.user.id as string;

    const user = await User.findById(doctorId).select("availability").lean();

    if (!user) {
      return NextResponse.json(
        { error: "ব্যবহারকারী পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({ availability: user.availability });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "উপলব্ধতা লোড করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
