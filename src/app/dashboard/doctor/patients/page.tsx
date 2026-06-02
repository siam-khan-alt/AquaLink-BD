import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { Transaction } from "@/models/Transaction";
import { Types } from "mongoose";
import { Users, Phone, Calendar, MapPin, FileText } from "lucide-react";
import Card from "@/components/ui/Card";
import { maskPhone } from "@/shared/lib/pii-masking";
import { logAuditEvent } from "@/shared/lib/audit-logger";

async function DoctorPatients() {
  const session = await getServerSession(authOptions);
  
  await connectDB();
  const doctorId = session?.user?.id as string;

  // Use aggregation pipeline to resolve N+1 query problem
  const patients = await Transaction.aggregate([
    {
      $match: {
        doctorId: new Types.ObjectId(doctorId),
        type: "consultation",
        status: "paid",
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: "$userId",
        totalConsultations: { $sum: 1 },
        lastConsultation: { $first: "$createdAt" },
        lastIssue: { $first: "$metadata.issue" },
        consultationIds: { $push: "$_id" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: 1,
        name: "$user.name",
        phone: "$user.phone",
        location: "$user.district",
        totalConsultations: 1,
        lastConsultation: 1,
        lastIssue: 1,
      },
    },
  ]);

  // Log audit event for patient data access
  await logAuditEvent({
    userId: doctorId,
    userRole: "doctor",
    action: "view_patients",
    resource: "patient_list",
    method: "GET",
    ipAddress: "server-side",
    userAgent: "server-side",
    status: "success",
    metadata: { patientCount: patients.length },
  });

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("bn-BD");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[var(--text)] font-hind">
          রোগী ইতিহাস
        </h1>
        <p className="text-sm text-[var(--text)]/60 font-hind mt-1">
          আপনার সহায়তা প্রাপ্ত চাষিদের তালিকা
        </p>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  নাম
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  ফোন
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  অবস্থান
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  মোট কনসালটেশন
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  শেষ কনসালটেশন
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/60 font-hind">
                  শেষ সমস্যা
                </th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient: unknown) => {
                const p = patient as {
                  _id: string;
                  name: string;
                  phone: string;
                  location: string;
                  totalConsultations: number;
                  lastConsultation: Date;
                  lastIssue: string;
                };
                return (
                  <tr key={p._id} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface)]">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                          <Users size={20} className="text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text)] font-hind">
                            {p.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--text)]/80 font-hind">
                        <Phone size={16} />
                        {maskPhone(p.phone)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--text)]/80 font-hind">
                        <MapPin size={16} />
                        {p.location || "অজানা"}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-sm font-bold font-hind">
                          {p.totalConsultations}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--text)]/80 font-hind">
                        <Calendar size={16} />
                        {formatDate(p.lastConsultation)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--text)]/80 font-hind">
                        <FileText size={16} />
                        {typeof p.lastIssue === 'string' ? p.lastIssue : "সাধারণ পরামর্শ"}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default DoctorPatients;
