import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { Transaction } from "@/models/Transaction";

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

    const transactions = await Transaction.find({
      doctorId,
      type: "consultation",
      status: "paid",
    });

    const totalEarnings = transactions.reduce((sum, t) => sum + (t.doctorEarnings || 0), 0);
    const totalConsultations = transactions.length;
    const monthlyEarnings = transactions
      .filter(t => {
        const transactionDate = new Date(t.createdAt);
        const now = new Date();
        return (
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, t) => sum + (t.doctorEarnings || 0), 0);

    return NextResponse.json({
      totalEarnings,
      totalConsultations,
      monthlyEarnings,
    });
  } catch (error) {
    console.error("Error fetching doctor earnings:", error);
    return NextResponse.json(
      { error: "উপার্জন লোড করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
