import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";

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

    // Fetch consultation transactions for this doctor
    const consultations = await Transaction.find({
      doctorId,
      type: "consultation",
    })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch user details for each consultation
    const consultationsWithDetails = await Promise.all(
      consultations.map(async (consultation) => {
        const user = await User.findById(consultation.userId).select("name phone district division").lean();
        
        // Try to get pond details from metadata if available
        const pondName = consultation.metadata?.pondName || "পুকুর";
        const issue = consultation.metadata?.issue || "সাধারণ পরামর্শ";
        const description = consultation.metadata?.description || "";
        const images = consultation.metadata?.images || [];

        return {
          id: consultation._id.toString(),
          farmerName: user?.name || "অজানা",
          farmerPhone: user?.phone || "",
          pondName,
          issue,
          description,
          images,
          status: consultation.status,
          requestedAt: consultation.createdAt,
          fee: consultation.amount,
          transactionId: consultation.transactionId,
        };
      })
    );

    return NextResponse.json({ consultations: consultationsWithDetails });
  } catch (error) {
    console.error("Error fetching doctor consultations:", error);
    return NextResponse.json(
      { error: "কনসালটেশন লোড করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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
    const { consultationId, status } = body;

    if (!consultationId || !status) {
      return NextResponse.json(
        { error: "কনসালটেশন আইডি এবং স্ট্যাটাস প্রয়োজন" },
        { status: 400 }
      );
    }

    await connectDB();
    const doctorId = session.user.id as string;

    // Update consultation status
    const updatedConsultation = await Transaction.findOneAndUpdate(
      {
        _id: consultationId,
        doctorId,
        type: "consultation",
      },
      { status },
      { new: true }
    );

    if (!updatedConsultation) {
      return NextResponse.json(
        { error: "কনসালটেশন পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "কনসালটেশন স্ট্যাটাস আপডেট করা হয়েছে",
      consultation: updatedConsultation,
    });
  } catch (error) {
    console.error("Error updating consultation status:", error);
    return NextResponse.json(
      { error: "কনসালটেশন আপডেট করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
