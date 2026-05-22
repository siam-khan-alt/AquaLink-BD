import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Enrollment } from "@/models/Enrollment";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { tran_id, status } = body;

    if (!tran_id || !status) {
      return NextResponse.redirect(
        new URL("/dashboard/farmer/courses?error=invalid_response", req.url)
      );
    }

    const enrollment = await Enrollment.findOne({ transactionId: tran_id });

    if (!enrollment) {
      return NextResponse.redirect(
        new URL("/dashboard/farmer/courses?error=enrollment_not_found", req.url)
      );
    }

    if (status === "VALID" || status === "VALIDATED") {
      enrollment.paymentStatus = "paid";
      await enrollment.save();

      return NextResponse.redirect(
        new URL("/dashboard/farmer/courses?success=true", req.url)
      );
    } else {
      enrollment.paymentStatus = "failed";
      await enrollment.save();

      return NextResponse.redirect(
        new URL("/dashboard/farmer/courses?error=payment_failed", req.url)
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error processing payment callback:", message);
    return NextResponse.redirect(
      new URL("/dashboard/farmer/courses?error=server_error", req.url)
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const tran_id = searchParams.get("tran_id");
    const status = searchParams.get("status");

    if (!tran_id || !status) {
      return NextResponse.redirect(
        new URL("/dashboard/farmer/courses?error=invalid_response", req.url)
      );
    }

    await connectDB();
    const enrollment = await Enrollment.findOne({ transactionId: tran_id });

    if (!enrollment) {
      return NextResponse.redirect(
        new URL("/dashboard/farmer/courses?error=enrollment_not_found", req.url)
      );
    }

    if (status === "VALID" || status === "VALIDATED") {
      enrollment.paymentStatus = "paid";
      await enrollment.save();

      return NextResponse.redirect(
        new URL("/dashboard/farmer/courses?success=true", req.url)
      );
    } else {
      enrollment.paymentStatus = "failed";
      await enrollment.save();

      return NextResponse.redirect(
        new URL("/dashboard/farmer/courses?error=payment_failed", req.url)
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error processing payment callback:", message);
    return NextResponse.redirect(
      new URL("/dashboard/farmer/courses?error=server_error", req.url)
    );
  }
}
