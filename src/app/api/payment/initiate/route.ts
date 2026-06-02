import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { Course } from "@/models/Course";
import { Types } from "mongoose";
import { z } from "zod";
import crypto from "crypto";
import { Enrollment } from "@/models/Enrollment";

const initiatePaymentSchema = z.object({
  courseId: z.string().min(1, "কোর্স আইডি প্রদান করতে হবে"),
});

const SSLCOMMERZ_STORE_ID = process.env.SSLCOMMERZ_STORE_ID || "test";
const SSLCOMMERZ_STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD || "test";
const SSLCOMMERZ_IS_SANDBOX = process.env.SSLCOMMERZ_IS_SANDBOX !== "false";

const SSLCOMMERZ_GATEWAY_URL = SSLCOMMERZ_IS_SANDBOX
  ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
  : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

interface SSLCommerzResponse {
  status: string;
  GatewayPageURL?: string;
  failedreason?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to continue." },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const parsedData = initiatePaymentSchema.parse(body);

    const course = await Course.findById(parsedData.courseId).lean();
    if (!course) {
      return NextResponse.json(
        { error: "কোর্স পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    const userId = session.user.id as string;

    if (course.price === 0) {
      const existingEnrollment = await Enrollment.findOne({
        userId: new Types.ObjectId(userId),
        courseId: new Types.ObjectId(parsedData.courseId),
      });

      if (existingEnrollment) {
        return NextResponse.json(
          { success: true, alreadyEnrolled: true, message: "আপনি ইতিমধ্যে এই কোর্সে ভর্তি হয়েছেন" },
          { status: 200 }
        );
      }

      const transactionId = `FREE-${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
      
      await Enrollment.create({
        userId: new Types.ObjectId(userId),
        courseId: new Types.ObjectId(parsedData.courseId),
        paymentStatus: "paid",
        transactionId,
        enrolledAt: new Date(),
      });

      return NextResponse.json(
        { success: true, isFree: true, message: "কোর্সে সফলভাবে ভর্তি হয়েছেন" },
        { status: 200 }
      );
    }

    const existingEnrollment = await Enrollment.findOne({
      userId: new Types.ObjectId(userId),
      courseId: new Types.ObjectId(parsedData.courseId),
      paymentStatus: "paid",
    }).lean();

    if (existingEnrollment) {
      return NextResponse.json(
        { success: true, alreadyEnrolled: true, message: "আপনি ইতিমধ্যে এই কোর্সে ভর্তি হয়েছেন" },
        { status: 200 }
      );
    }

    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;

    await Enrollment.create({
      userId: new Types.ObjectId(userId),
      courseId: new Types.ObjectId(parsedData.courseId),
      paymentStatus: "pending",
      transactionId,
      enrolledAt: new Date(),
    });

    const totalAmount = course.price.toFixed(2);
    const currency = "BDT";

    const sslczData = {
      store_id: SSLCOMMERZ_STORE_ID,
      store_passwd: SSLCOMMERZ_STORE_PASSWORD,
      total_amount: totalAmount,
      currency: currency,
      tran_id: transactionId,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/callback`,
      fail_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/callback`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/callback`,
      ipn_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/callback`,
      product_name: course.title,
      product_category: course.category,
      product_profile: "non-physical-goods",
      shipping_method: "NO",
      multi_card_name: "bkash,nagad,rocket",
      value_a: userId,
      value_b: parsedData.courseId,
    };

    const formData = new URLSearchParams();
    Object.entries(sslczData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const response = await fetch(SSLCOMMERZ_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const sslczResponse = await response.json() as SSLCommerzResponse;

    if (sslczResponse.status === "SUCCESS") {
      return NextResponse.json(
        { success: true, gatewayUrl: sslczResponse.GatewayPageURL },
        { status: 200 }
      );
    } else {
      await Enrollment.findOneAndUpdate(
        { transactionId },
        { paymentStatus: "failed" }
      );
      return NextResponse.json(
        { error: "পেমেন্ট গেটওয়ে শুরু করতে ব্যর্থ হয়েছে" },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error initiating payment:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}