"use client";

import React, { useMemo } from "react";
import { Check, X, Clock, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useConsultations, useUpdateConsultationStatus } from "../hooks/useConsultations";
import { STATUS_CONFIG, ConsultationStatus } from "../lib/consultation-state-machine";
import { maskPhone } from "@/shared/lib/pii-masking";

export default function DoctorConsultations() {
  const { data: consultationsData, isLoading, error } = useConsultations('pending');
  const updateStatus = useUpdateConsultationStatus();

  const consultations = consultationsData?.consultations || [];

  const handleStatusChange = useMemo(() => (id: string, newStatus: ConsultationStatus) => {
    updateStatus.mutate({
      consultationId: id,
      status: newStatus,
      action: newStatus === 'in-progress' ? 'start_consultation' : 'cancel_request',
    });
  }, [updateStatus]);

  const getStatusBadge = (status: ConsultationStatus) => {
    const config = STATUS_CONFIG[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold font-hind ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <p className="text-red-600 font-hind">কনসালটেশন লোড করতে ব্যর্থ হয়েছে</p>
      </Card>
    );
  }

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
        {consultations.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-[var(--text)]/60 font-hind">কোনো পেন্ডিং কনসালটেশন নেই</p>
          </Card>
        ) : (
          consultations.map((request) => (
            <Card key={request.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text)] font-hind">
                        {request.farmerName}
                      </h3>
                      <p className="text-sm text-[var(--text)]/60 font-hind">
                        {maskPhone(request.farmerPhone)}
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
                      <span className="font-hind">{formatDate(request.requestedAt)}</span>
                    </div>
                    <div className="font-bold text-[var(--primary)] font-hind">
                      ফি: ৳ {request.fee}
                    </div>
                  </div>
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleStatusChange(request.id, 'in-progress')}
                      disabled={updateStatus.isPending}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-hind font-bold"
                    >
                      <Check size={16} className="mr-1" />
                      অনুমোদন
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(request.id, 'cancelled')}
                      disabled={updateStatus.isPending}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-hind font-bold"
                    >
                      <X size={16} className="mr-1" />
                      বাতিল
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
