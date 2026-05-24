"use client";

import React, { useState } from "react";
import { Check, X, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface ConsultationRequest {
  id: string;
  farmerName: string;
  farmerPhone: string;
  pondName: string;
  issue: string;
  description: string;
  images?: string[];
  status: "pending" | "approved" | "rejected" | "completed";
  requestedAt: string;
  fee: number;
}

export default function DoctorConsultations() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([
    {
      id: "1",
      farmerName: "রহিম উদ্দিন",
      farmerPhone: "+8801712345678",
      pondName: "পুকুর-১",
      issue: "মাছের ক্ষত",
      description: "মাছের গায়ে ক্ষত দেখা যাচ্ছে, সম্ভবত ভাইরাল আক্রমণ",
      status: "pending",
      requestedAt: "২০২৬-০৫-২৪",
      fee: 500,
    },
    {
      id: "2",
      farmerName: "করিম শেখ",
      farmerPhone: "+8801712345679",
      pondName: "পুকুর-২",
      issue: "পানির গুণমান",
      description: "পানির pH মাত্রা কমে গেছে, মাছ অস্বাভাবিক আচরণ করছে",
      status: "pending",
      requestedAt: "২০২৬-০৫-২৩",
      fee: 500,
    },
    {
      id: "3",
      farmerName: "আব্দুল হাকিম",
      farmerPhone: "+8801712345680",
      pondName: "পুকুর-৩",
      issue: "খাবার সমস্যা",
      description: "মাছ খাবার খাচ্ছে না, সম্ভবত পোষণ ঘাটতি",
      status: "approved",
      requestedAt: "২০২৬-০৫-২২",
      fee: 500,
    },
    {
      id: "4",
      farmerName: "জাহাঙ্গীর আলম",
      farmerPhone: "+8801712345681",
      pondName: "পুকুর-৪",
      issue: "অক্সিজেন সমস্যা",
      description: "পুকুরে অক্সিজেনের মাত্রা খুব কম, মাছ মরে যাচ্ছে",
      status: "completed",
      requestedAt: "২০২৬-০৫-২১",
      fee: 500,
    },
  ]);

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "approved" as const } : req
      )
    );
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "rejected" as const } : req
      )
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "পেন্ডিং",
        className: "bg-orange-500/10 text-orange-500",
      },
      approved: {
        label: "অনুমোদিত",
        className: "bg-blue-500/10 text-blue-500",
      },
      rejected: {
        label: "বাতিল",
        className: "bg-red-500/10 text-red-500",
      },
      completed: {
        label: "সম্পন্ন",
        className: "bg-green-500/10 text-green-500",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold font-hind ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[var(--text)] font-hind">
          কনসালটেশন রিকোয়েস্ট
        </h1>
        <p className="text-sm text-[var(--text)]/60 font-hind mt-1">
          চাষিদের কনসালটেশন রিকোয়েস্ট পর্যালোচনা করুন
        </p>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text)] font-hind">
                      {request.farmerName}
                    </h3>
                    <p className="text-sm text-[var(--text)]/60 font-hind">
                      {request.farmerPhone}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-[var(--text)]/60 font-hind mb-1">পুকুর</p>
                    <p className="text-sm font-bold text-[var(--text)] font-hind">
                      {request.pondName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text)]/60 font-hind mb-1">সমস্যা</p>
                    <p className="text-sm font-bold text-[var(--text)] font-hind">
                      {request.issue}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-[var(--text)]/60 font-hind mb-1">বিস্তারিত</p>
                  <p className="text-sm text-[var(--text)]/80 font-hind">
                    {request.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-[var(--text)]/60">
                    <Clock size={16} />
                    <span className="font-hind">{request.requestedAt}</span>
                  </div>
                  <div className="font-bold text-[var(--primary)] font-hind">
                    ফি: ৳ {request.fee}
                  </div>
                </div>
              </div>

              {request.status === "pending" && (
                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => handleApprove(request.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-hind font-bold"
                  >
                    <Check size={16} className="mr-1" />
                    অনুমোদন
                  </Button>
                  <Button
                    onClick={() => handleReject(request.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-hind font-bold"
                  >
                    <X size={16} className="mr-1" />
                    বাতিল
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
