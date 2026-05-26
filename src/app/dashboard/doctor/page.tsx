import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { Transaction } from "@/models/Transaction";
import type { ITransaction } from "@/models/Transaction";
import { Stethoscope, Clock, DollarSign, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";

// Interface for Mongoose lean results (plain JS objects without Document methods)
interface TransactionLean {
  _id: { toString(): string };
  transactionId: string;
  userId: string;
  type: "course" | "consultation";
  itemId: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: string;
  paymentGateway?: string;
  doctorId?: string;
  adminCommission?: number;
  doctorEarnings?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

async function DoctorDashboard() {
  const session = await getServerSession(authOptions);
  
  await connectDB();
  const doctorId = session?.user?.id as string;

  // Fetch earnings data server-side
  const transactions = await Transaction.find({
    doctorId,
    type: "consultation",
    status: "paid",
  }).lean();

  const totalEarnings = transactions.reduce((sum, t) => sum + (t.doctorEarnings || 0), 0);
  const totalConsultations = transactions.length;
  const monthlyEarnings = transactions
    .filter((t: TransactionLean) => {
      const transactionDate = new Date(t.createdAt);
      const now = new Date();
      return (
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum: number, t: TransactionLean) => sum + (t.doctorEarnings || 0), 0);

  // Fetch pending consultations count
  const pendingConsultations = await Transaction.countDocuments({
    doctorId,
    type: "consultation",
    status: "pending",
  });

  const formatNumber = (val: number): string => {
    return new Intl.NumberFormat("bn-BD").format(val);
  };

  const earnings = {
    totalEarnings,
    totalConsultations,
    monthlyEarnings,
  };

  const stats = [
    {
      label: "মোট কনসালটেশন",
      value: formatNumber(earnings.totalConsultations),
      icon: <Stethoscope size={24} className="text-[var(--primary)]" />,
      trend: "+১২%",
    },
    {
      label: "পেন্ডিং রিকোয়েস্ট",
      value: formatNumber(pendingConsultations),
      icon: <Clock size={24} className="text-orange-500" />,
      trend: "+৩",
    },
    {
      label: "মাসিক আয়",
      value: `৳ ${formatNumber(earnings.monthlyEarnings)}`,
      icon: <DollarSign size={24} className="text-green-500" />,
      trend: "+২৫%",
    },
    {
      label: "মোট আয়",
      value: `৳ ${formatNumber(earnings.totalEarnings)}`,
      icon: <TrendingUp size={24} className="text-blue-500" />,
      trend: "+৪০%",
    },
  ];

  // Fetch recent consultations
  const recentConsultations = await Transaction.find({
    doctorId,
    type: "consultation",
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const recentConsultationsFormatted = recentConsultations.map((c: TransactionLean) => ({
    id: c._id.toString(),
    farmerName: (c.metadata?.farmerName as string) || "অজানা",
    pondName: (c.metadata?.pondName as string) || "পুকুর",
    issue: (c.metadata?.issue as string) || "সাধারণ পরামর্শ",
    status: c.status,
    date: new Date(c.createdAt).toLocaleDateString("bn-BD"),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[var(--text)] font-hind">
          ড্যাশবোর্ড ওভারভিউ
        </h1>
        <p className="text-sm text-[var(--text)]/60 font-hind mt-1">
          স্বাগতম, {session?.user?.name || "ডাক্তার"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-[var(--primary)]/10 rounded-xl">
                {stat.icon}
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-bold">
                <TrendingUp size={16} />
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-[var(--text)]">{stat.value}</p>
              <p className="text-sm text-[var(--text)]/60 font-hind">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Consultations */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-[var(--text)] font-hind">
            সাম্প্রতিক কনসালটেশন
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  চাষি
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  পুকুর
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  সমস্যা
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  স্ট্যাটাস
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  তারিখ
                </th>
              </tr>
            </thead>
            <tbody>
              {recentConsultationsFormatted.map((consultation) => (
                <tr key={consultation.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface)]">
                  <td className="py-3 px-4 text-sm font-bold text-[var(--text)] font-hind">
                    {consultation.farmerName}
                  </td>
                  <td className="py-3 px-4 text-sm text-[var(--text)]/80 font-hind">
                    {consultation.pondName}
                  </td>
                  <td className="py-3 px-4 text-sm text-[var(--text)]/80 font-hind">
                    {consultation.issue}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-hind ${
                        consultation.status === "pending"
                          ? "bg-orange-500/10 text-orange-500"
                          : consultation.status === "paid"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-green-500/10 text-green-500"
                      }`}
                    >
                      {consultation.status === "pending"
                        ? "পেন্ডিং"
                        : consultation.status === "paid"
                        ? "অনুমোদিত"
                        : "সম্পন্ন"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-[var(--text)]/80 font-hind">
                    {consultation.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default DoctorDashboard;
