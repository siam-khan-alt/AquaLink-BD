import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { User } from "@/models/User";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  phone: z.string().optional(),
  specialization: z.string().min(2, "বিশেষীকরণ কমপক্ষে ২ অক্ষরের হতে হবে"),
  licenseNumber: z.string().optional(),
  consultationFee: z.number().min(0, "কনসালটেশন ফি অবশ্যই দিতে হবে"),
  bio: z.string().optional(),
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
    const validatedData = updateProfileSchema.parse(body);

    await connectDB();
    const doctorId = session.user.id as string;

    const updatedUser = await User.findByIdAndUpdate(
      doctorId,
      {
        name: validatedData.name,
        phone: validatedData.phone,
        specialization: validatedData.specialization,
        licenseNumber: validatedData.licenseNumber,
        consultationFee: validatedData.consultationFee,
        bio: validatedData.bio,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "ব্যবহারকারী পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "প্রোফাইল সফলভাবে আপডেট করা হয়েছে",
      user: {
        name: updatedUser.name,
        phone: updatedUser.phone,
        specialization: updatedUser.specialization,
        consultationFee: updatedUser.consultationFee,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error updating doctor profile:", error);
    return NextResponse.json(
      { error: "প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
