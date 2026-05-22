import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import Enrollment from "@/models/Enrollment";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const enrollment = await Enrollment.findByIdAndUpdate(
      params.id,
      {
        completed: true,
        completedAt: new Date(),
      },
      { new: true }
    );

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, enrollment },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return NextResponse.json(
      { error: "Failed to update enrollment" },
      { status: 500 }
    );
  }
}
