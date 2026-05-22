"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Waves,
  Droplets,
  Fish,
  Calendar,
  Trash2,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface IPond {
  _id: string;
  name: string;
  area: number;
  fishType: string[];
  waterQuality: {
    pH: number;
    dissolvedO2: number;
    lastTested: string;
  };
  createdAt: string;
}

interface IPondsResponse {
  success: boolean;
  ponds: IPond[];
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function PondsPage() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    area: "",
    fishTypesInput: "",
    initialPh: "",
  });

  const { data: pondsData, isLoading: isPondsLoading } = useQuery<IPondsResponse>({
    queryKey: ["ponds"],
    queryFn: async () => {
      const res = await fetch("/api/ponds");
      if (!res.ok) throw new Error("পুকুরের তথ্য লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const addPondMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/ponds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          area: parseFloat(data.area),
          fishType: data.fishTypesInput.split(",").map((t) => t.trim()),
          initialPh: parseFloat(data.initialPh),
        }),
      });
      if (!res.ok) throw new Error("পুকুর তৈরি করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ponds"] });
      setIsModalOpen(false);
      setFormData({ name: "", area: "", fishTypesInput: "", initialPh: "" });
      toast.success("পুকুর সফলভাবে তৈরি হয়েছে");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "পুকুর তৈরি করতে ব্যর্থ হয়েছে");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.area || !formData.fishTypesInput || !formData.initialPh) {
      toast.error("সকল তথ্য প্রদান করতে হবে");
      return;
    }
    addPondMutation.mutate(formData);
  };

  if (status === "loading" || isPondsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] font-hind">
            পুকুর ও পানির গুণমান
          </h1>
          <p className="text-[var(--text)]/60 mt-1 font-hind">
            আপনার সকল পুকুরের তথ্য পরিচালনা করুন
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="font-hind font-semibold"
        >
          <Plus size={20} className="mr-2" />
          নতুন পুকুর যোগ করুন
        </Button>
      </div>

      {/* Ponds Grid */}
      {pondsData?.ponds && pondsData.ponds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pondsData.ponds.map((pond) => (
            <Card
              key={pond._id}
              className="bg-[var(--surface)] border border-[var(--border)] hover:shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300"
            >
              <div className="p-6 space-y-4">
                {/* Pond Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
                      <Waves size={24} className="text-[var(--primary)]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text)] font-hind">
                        {pond.name}
                      </h3>
                      <p className="text-xs text-[var(--text)]/60 font-hind">
                        {formatDate(pond.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors">
                      <Edit size={16} className="text-[var(--text)]" />
                    </button>
                    <button className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors">
                      <Trash2 size={16} className="text-[var(--text)]" />
                    </button>
                  </div>
                </div>

                {/* Pond Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                    <Fish size={20} className="text-[var(--primary)]" />
                    <div className="flex-1">
                      <p className="text-xs text-[var(--text)]/60 font-hind">মাছের প্রজাতি</p>
                      <p className="text-sm font-semibold text-[var(--text)] font-hind">
                        {pond.fishType.join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                    <Droplets size={20} className="text-[var(--primary)]" />
                    <div className="flex-1">
                      <p className="text-xs text-[var(--text)]/60 font-hind">আয়তন</p>
                      <p className="text-sm font-semibold text-[var(--text)] font-hind">
                        {pond.area} একর
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                    <Calendar size={20} className="text-[var(--primary)]" />
                    <div className="flex-1">
                      <p className="text-xs text-[var(--text)]/60 font-hind">pH মান</p>
                      <p className="text-sm font-semibold text-[var(--text)] font-hind">
                        {pond.waterQuality.pH}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Waves size={40} className="text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text)] font-hind mb-2">
            কোনো পুকুর নেই
          </h3>
          <p className="text-[var(--text)]/60 font-hind mb-6">
            আপনার প্রথম পুকুর যোগ করতে বাটনে ক্লিক করুন
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="font-hind font-semibold"
          >
            <Plus size={20} className="mr-2" />
            নতুন পুকুর যোগ করুন
          </Button>
        </div>
      )}

      {/* Add Pond Modal */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-[var(--border)]">
                <h2 className="text-xl font-bold text-[var(--text)] font-hind">
                  নতুন পুকুর যোগ করুন
                </h2>
                <p className="text-sm text-[var(--text)]/60 mt-1 font-hind">
                  আপনার পুকুরের তথ্য প্রদান করুন
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <Input
                  label="পুকুরের নাম"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="পুকুরের নাম লিখুন"
                  required
                />

                <Input
                  label="আয়তন (একর)"
                  type="number"
                  step="0.01"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="আয়তন দিন (যেমন: 2.5)"
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2 font-hind">
                    মাছের প্রজাতি
                  </label>
                  <input
                    type="text"
                    value={formData.fishTypesInput}
                    onChange={(e) => setFormData({ ...formData, fishTypesInput: e.target.value })}
                    placeholder="কমা দিয়ে আলাদা করুন (যেমন: Ruhi, Pangas)"
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--text)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent font-hind"
                    required
                  />
                  <p className="text-xs text-[var(--text)]/40 mt-1 font-hind">
                    উপলব্ধ প্রজাতি: Ruhi, Pangas, Tilapia, Katla, Mrigel, Koi, Other
                  </p>
                </div>

                <Input
                  label="প্রাথমিক pH মান"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  value={formData.initialPh}
                  onChange={(e) => setFormData({ ...formData, initialPh: e.target.value })}
                  placeholder="pH মান দিন (0-14)"
                  required
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 font-hind font-semibold"
                  >
                    বাতিল
                  </Button>
                  <Button
                    type="submit"
                    disabled={addPondMutation.isPending}
                    className="flex-1 font-hind font-semibold"
                  >
                    {addPondMutation.isPending ? "যোগ হচ্ছে..." : "যোগ করুন"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
