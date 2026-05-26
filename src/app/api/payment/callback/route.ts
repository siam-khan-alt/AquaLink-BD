import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { Enrollment } from "@/models/Enrollment";
import { Course } from "@/models/Course";
import { NotificationType, NotificationPriority } from "@/shared/types/notification.types";
import { createNotification } from "@/shared/lib/notificationHelpers";

interface PaymentCallbackBody {
  tran_id: string;
  status: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      console.error("Unauthorized payment callback attempt: No session");
      return NextResponse.redirect(
        new URL("/dashboard/farmer/courses?error=unauthorized", req.url)
      );
    }

    await connectDB();
    const body = await req.json() as PaymentCallbackBody;

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

    // IDOR Fix: Verify the authenticated user owns this enrollment
    if (enrollment.userId.toString() !== session.user.id) {
      console.error(`IDOR attempt: User ${session.user.id} tried to access enrollment ${enrollment._id} owned by ${enrollment.userId}`);
      return NextResponse.redirect(
        new URL("/dashboard/farmer/courses?error=unauthorized", req.url)
      );
    }

    if (status === "VALID" || status === "VALIDATED") {
      enrollment.paymentStatus = "paid";
      await enrollment.save();

      // Fetch course details for notification
      const course = await Course.findById(enrollment.courseId);
      if (course) {
        await createNotification({
          userId: enrollment.userId.toString(),
          type: NotificationType.COURSE_ENROLLMENT,
          priority: NotificationPriority.MEDIUM,
          title: "কোর্স ভর্তি সফল",
          message: `আপনি সফলভাবে ${course.title} কোর্সে ভর্তি হয়েছেন।`,
          link: `/dashboard/farmer/courses/${course._id}`,
          metadata: {
            courseId: course._id.toString(),
            courseTitle: course.title,
            enrollmentId: enrollment._id.toString(),
            transactionId: enrollment.transactionId,
          },
        });
      }

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
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      console.error("Unauthorized payment callback attempt: No session");
      return NextResponse.redirect(
        new URL("/dashboard/farmer/courses?error=unauthorized", req.url)
      );
    }

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

    // IDOR Fix: Verify the authenticated user owns this enrollment
    if (enrollment.userId.toString() !== session.user.id) {
      console.error(`IDOR attempt: User ${session.user.id} tried to access enrollment ${enrollment._id} owned by ${enrollment.userId}`);
      return NextResponse.redirect(
        new URL("/dashboard/farmer/courses?error=unauthorized", req.url)
      );
    }

    if (status === "VALID" || status === "VALIDATED") {
      enrollment.paymentStatus = "paid";
      await enrollment.save();

      // Fetch course details for notification
      const course = await Course.findById(enrollment.courseId);
      if (course) {
        await createNotification({
          userId: enrollment.userId.toString(),
          type: NotificationType.COURSE_ENROLLMENT,
          priority: NotificationPriority.MEDIUM,
          title: "কোর্স ভর্তি সফল",
          message: `আপনি সফলভাবে ${course.title} কোর্সে ভর্তি হয়েছেন।`,
          link: `/dashboard/farmer/courses/${course._id}`,
          metadata: {
            courseId: course._id.toString(),
            courseTitle: course.title,
            enrollmentId: enrollment._id.toString(),
            transactionId: enrollment.transactionId,
          },
        });
      }

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
