import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";
import { Users, Phone, Calendar, MapPin, FileText } from "lucide-react";
import Card from "@/components/ui/Card";
import { IDoctorPatient } from "@/shared/types/api-interfaces";

async function DoctorPatients() {
  const session = await getServerSession(authOptions);
  
  await connectDB();
  const doctorId = session?.user?.id as string;

  // Fetch all consultation transactions for this doctor
  const consultations = await Transaction.find({
    doctorId,
    type: "consultation",
    status: "paid",
  })
    .sort({ createdAt: -1 })
    .lean();

  // Group consultations by user (farmer) and aggregate data
  const patientMap = new Map<string, IDoctorPatient>();

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
lastIssue: typeof consultation.metadata?.issue === 'string' 
          ? consultation.metadata.issue 
          : "সাধারণ পরামর্শ",      });
    }

    const patient = patientMap.get(userId);
    if (patient) {
      patient.totalConsultations += 1;
    }
  }

  const patients: IDoctorPatient[] = Array.from(patientMap.values());

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
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface)]">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                        <Users size={20} className="text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text)] font-hind">
                          {patient.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--text)]/80 font-hind">
                      <Phone size={16} />
                      {patient.phone}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--text)]/80 font-hind">
                      <MapPin size={16} />
                      {patient.location}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-sm font-bold font-hind">
                        {patient.totalConsultations}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--text)]/80 font-hind">
                      <Calendar size={16} />
                      {formatDate(patient.lastConsultation)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--text)]/80 font-hind">
                      <FileText size={16} />
                      {patient.lastIssue}
                    </div>
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

export default DoctorPatients;
