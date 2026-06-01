/**
 * PatientSummaryCard Component
 * AI-contextual summary logic for patient information
 */

import React, { useMemo } from "react";
import { User, Calendar, FileText, Activity, AlertTriangle } from "lucide-react";
import Card from "@/components/ui/Card";

export interface PatientSummary {
  id: string;
  name: string;
  phone: string;
  location: string;
  totalConsultations: number;
  lastConsultation: Date;
  lastIssue: string;
  consultationHistory?: Array<{
    date: Date;
    issue: string;
    status: string;
  }>;
}

interface PatientSummaryCardProps {
  patient: PatientSummary;
  onViewDetails: (patientId: string) => void;
}

export default function PatientSummaryCard({
  patient,
  onViewDetails,
}: PatientSummaryCardProps) {
  const riskLevel = useMemo(() => {
    // AI-contextual risk assessment based on consultation patterns
    if (patient.totalConsultations > 5) return "high";
    if (patient.totalConsultations > 2) return "medium";
    return "low";
  }, [patient.totalConsultations]);

  const riskConfig = useMemo(() => {
    switch (riskLevel) {
      case "high":
        return {
          color: "bg-red-500/10 text-red-500",
          icon: AlertTriangle,
          label: "উচ্চ ঝুঁকি",
        };
      case "medium":
        return {
          color: "bg-yellow-500/10 text-yellow-500",
          icon: Activity,
          label: "মাঝারি ঝুঁকি",
        };
      default:
        return {
          color: "bg-green-500/10 text-green-500",
          icon: Check,
          label: "স্বাভাবিক",
        };
    }
  }, [riskLevel]);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const daysSinceLastConsultation = useMemo(() => {
    const now = new Date();
    const last = new Date(patient.lastConsultation);
    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [patient.lastConsultation]);

  const followUpNeeded = useMemo(() => {
    return daysSinceLastConsultation > 30;
  }, [daysSinceLastConsultation]);

  return (
    <Card
      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onViewDetails(patient.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text)] font-hind">
              {patient.name}
            </h3>
            <p className="text-xs text-[var(--text)]/60 font-hind">
              {patient.location}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${riskConfig.color}`}>
          <riskConfig.icon className="w-3 h-3" />
          <span className="text-xs font-bold font-hind">{riskConfig.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--text)]/60" />
          <div>
            <p className="text-xs text-[var(--text)]/60 font-hind">মোট কনসালটেশন</p>
            <p className="text-sm font-bold text-[var(--text)] font-hind">
              {patient.totalConsultations}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--text)]/60" />
          <div>
            <p className="text-xs text-[var(--text)]/60 font-hind">শেষ কনসালটেশন</p>
            <p className="text-sm font-bold text-[var(--text)] font-hind">
              {formatDate(patient.lastConsultation)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs text-[var(--text)]/60 font-hind mb-1">শেষ সমস্যা</p>
        <p className="text-sm text-[var(--text)]/80 font-hind line-clamp-2">
          {patient.lastIssue}
        </p>
      </div>

      {followUpNeeded && (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <p className="text-xs text-yellow-700 font-hind">
            ফলো-আপ প্রয়োজন ({daysSinceLastConsultation} দিন আগে)
          </p>
        </div>
      )}
    </Card>
  );
}

function Check({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
