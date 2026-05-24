"use client";

import React from "react";
import { Users, Phone, Calendar, MapPin, FileText } from "lucide-react";
import Card from "@/components/ui/Card";

interface Patient {
  id: string;
  name: string;
  phone: string;
  location: string;
  totalConsultations: number;
  lastConsultation: string;
  lastIssue: string;
}

export default function DoctorPatients() {
  const patients: Patient[] = [
    {
      id: "1",
      name: "রহিম উদ্দিন",
      phone: "+8801712345678",
      location: "ঢাকা",
      totalConsultations: 5,
      lastConsultation: "২০২৬-০৫-২৪",
      lastIssue: "মাছের ক্ষত",
    },
    {
      id: "2",
      name: "করিম শেখ",
      phone: "+8801712345679",
      location: "বগুড়া",
      totalConsultations: 3,
      lastConsultation: "২০২৬-০৫-২৩",
      lastIssue: "পানির গুণমান",
    },
    {
      id: "3",
      name: "আব্দুল হাকিম",
      phone: "+8801712345680",
      location: "রাজশাহী",
      totalConsultations: 7,
      lastConsultation: "২০২৬-০৫-২২",
      lastIssue: "খাবার সমস্যা",
    },
    {
      id: "4",
      name: "জাহাঙ্গীর আলম",
      phone: "+8801712345681",
      location: "খুলনা",
      totalConsultations: 2,
      lastConsultation: "২০২৬-০৫-২১",
      lastIssue: "অক্সিজেন সমস্যা",
    },
    {
      id: "5",
      name: "মোহাম্মদ আলী",
      phone: "+8801712345682",
      location: "সিলেট",
      totalConsultations: 4,
      lastConsultation: "২০২৬-০৫-২০",
      lastIssue: "মাছের রোগ",
    },
  ];

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
                      {patient.lastConsultation}
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
