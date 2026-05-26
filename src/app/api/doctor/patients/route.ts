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

    // Fetch all consultation transactions for this doctor
    const consultations = await Transaction.find({
      doctorId,
      type: "consultation",
      status: "paid",
    })
      .sort({ createdAt: -1 })
      .lean();

    // Group consultations by user (farmer) and aggregate data
    const patientMap = new Map<string, any>();

    for (const consultation of consultations) {
      const userId = consultation.userId.toString();
      
      if (!patientMap.has(userId)) {
        const user = await User.findById(userId).select("name phone district division").lean();
        
        patientMap.set(userId, {
          id: userId,
          name: user?.name || "অজানা",
          phone: user?.phone || "",
          location: user?.district || "অজানা",
          totalConsultations: 0,
          lastConsultation: consultation.createdAt,
          lastIssue: consultation.metadata?.issue || "সাধারণ পরামর্শ",
          consultations: [],
        });
      }

      const patient = patientMap.get(userId);
      patient.totalConsultations += 1;
      patient.consultations.push({
        id: consultation._id.toString(),
        issue: consultation.metadata?.issue || "সাধারণ পরামর্শ",
        status: consultation.status,
        date: consultation.createdAt,
        fee: consultation.amount,
      });
    }

    const patients = Array.from(patientMap.values());

    return NextResponse.json({ patients });
  } catch (error) {
    console.error("Error fetching doctor patients:", error);
    return NextResponse.json(
      { error: "রোগী তালিকা লোড করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
