import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";
import { z } from "zod";
import crypto from "crypto";

const initiateConsultationPaymentSchema = z.object({
  doctorId: z.string().min(1, "ডাক্তার আইডি প্রদান করতে হবে"),
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
    const parsedData = initiateConsultationPaymentSchema.parse(body);

    const doctor = await User.findOne({ 
      _id: parsedData.doctorId, 
      role: "doctor",
      isVerified: true 
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "ডাক্তার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    const userId = session.user.id as string;
    const consultationFee = doctor.consultationFee || 500;

    const transactionId = `CONS-${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;

    await Transaction.create({
      transactionId,
      userId,
      type: "consultation",
      itemId: parsedData.doctorId,
      doctorId: parsedData.doctorId,
      amount: consultationFee,
      currency: "BDT",
      status: "pending",
      paymentGateway: "sslcommerz",
      metadata: {
        farmerName: session.user.name,
        farmerEmail: session.user.email,
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialization,
      },
    });

    const sslczData = {
      store_id: SSLCOMMERZ_STORE_ID,
      store_passwd: SSLCOMMERZ_STORE_PASSWORD,
      total_amount: consultationFee.toFixed(2),
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/consultation/callback`,
      fail_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/consultation/callback`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/consultation/callback`,
      ipn_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/consultation/callback`,
      product_name: `Consultation with ${doctor.name}`,
      product_category: doctor.specialization,
      product_profile: "non-physical-goods",
      shipping_method: "NO",
      multi_card_name: "bkash,nagad,rocket",
      value_a: userId,
      value_b: parsedData.doctorId,
    };

    // ফিক্সড: URLSearchParams এর মাধ্যমে x-www-form-urlencoded ফরম্যাটে ডাটা পাঠানো
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
      await Transaction.findOneAndUpdate(
        { transactionId },
        { status: "failed" }
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
    console.error("Error initiating consultation payment:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}