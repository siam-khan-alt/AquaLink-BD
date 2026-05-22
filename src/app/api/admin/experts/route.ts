import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { ExpertConsultant } from "@/models/ExpertConsultant";
import { z } from "zod";

const createExpertSchema = z.object({
  name: z.string().min(2, "নাম অবশ্যই দিতে হবে"),
  designation: z.string().min(2, "পদবী অবশ্যই দিতে হবে"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন").optional(),
  phone: z.string().min(10, "ফোন নম্বর অবশ্যই দিতে হবে"),
  specialization: z.string().min(2, "বিশেষীকরণ অবশ্যই দিতে হবে"),
  avatarUrl: z.string().optional(),
  isVerified: z.boolean().default(false),
});

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

    const experts = await ExpertConsultant.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, experts },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error fetching experts:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
    const parsedData = createExpertSchema.parse(body);

    const newExpert = await ExpertConsultant.create({
      name: parsedData.name,
      designation: parsedData.designation,
      email: parsedData.email,
      phone: parsedData.phone,
      specialization: parsedData.specialization,
      avatarUrl: parsedData.avatarUrl || "",
      isVerified: parsedData.isVerified,
    });

    return NextResponse.json(
      { success: true, expert: newExpert },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error creating expert:", message);
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
    const { id, isVerified } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Expert ID is required" },
        { status: 400 }
      );
    }

    const updatedExpert = await ExpertConsultant.findByIdAndUpdate(
      id,
      { isVerified },
      { new: true }
    );

    if (!updatedExpert) {
      return NextResponse.json(
        { error: "Expert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, expert: updatedExpert },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error updating expert:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}
