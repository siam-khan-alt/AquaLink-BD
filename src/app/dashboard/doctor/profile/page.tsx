"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { UserCircle, Stethoscope, DollarSign, Save, Camera, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { toast } from "sonner";

export default function DoctorProfile() {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    specialization: "মৎস্য রোগ বিশেষজ্ঞ",
    licenseNumber: "",
    consultationFee: 500,
    bio: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/doctor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber,
          consultationFee: parseInt(formData.consultationFee.toString()),
          bio: formData.bio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে");
      }

      toast.success("প্রোফাইল সফলভাবে আপডেট করা হয়েছে");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[var(--text)] font-hind">
          প্রোফাইল
        </h1>
        <p className="text-sm text-[var(--text)]/60 font-hind mt-1">
          আপনার প্রোফাইল তথ্য আপডেট করুন
        </p>
      </div>

      {/* Profile Picture Card */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
              <UserCircle size={48} className="text-[var(--primary)]" />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary)]/90 transition-colors">
              <Camera size={16} />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              {formData.name}
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              {formData.specialization}
            </p>
          </div>
        </div>
      </Card>

      {/* Basic Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[var(--primary)]/10 rounded-xl">
            <UserCircle size={24} className="text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              মৌলিক তথ্য
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              আপনার ব্যক্তিগত তথ্য
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
              নাম
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
              ইমেইল
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
              ফোন
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+8801XXXXXXXXX"
              className="w-full px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>
      </Card>

      {/* Professional Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[var(--primary)]/10 rounded-xl">
            <Stethoscope size={24} className="text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              পেশাগত তথ্য
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              আপনার বিশেষীকরণ ও লাইসেন্স
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
              বিশেষীকরণ
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
              লাইসেন্স নম্বর
            </label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              placeholder="LIC-XXXXX"
              className="w-full px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
              কনসালটেশন ফি (টাকা)
            </label>
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-[var(--text)]/60" />
              <input
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
            বায়োগ্রাফি
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            placeholder="আপনার সম্পর্কে সংক্ষিপ্ত বর্ণনা..."
            className="w-full px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
          />
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-6 py-2 rounded-lg font-hind font-bold flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              সংরক্ষণ করছে...
            </>
          ) : (
            <>
              <Save size={16} />
              সংরক্ষণ করুন
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
