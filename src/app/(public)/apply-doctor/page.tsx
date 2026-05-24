"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, GraduationCap, FileText, DollarSign, Send, Loader2, Lock, Image as ImageIcon, FileCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ImageUpload from "@/components/ui/ImageUpload";
import { toast } from "sonner";

export default function ApplyDoctorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    degree: "",
    specialization: "",
    licenseNumber: "",
    experience: "",
    consultationFee: "",
    bio: "",
    avatarUrl: "",
    certificateUrl: "",
    district: "",
    division: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "নাম প্রয়োজন";
    if (!formData.email.trim()) newErrors.email = "ইমেইল প্রয়োজন";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "সঠিক ইমেইল দিন";
    if (!formData.phone.trim()) newErrors.phone = "ফোন নম্বর প্রয়োজন";
    if (!formData.password.trim()) newErrors.password = "পাসওয়ার্ড প্রয়োজন";
    else if (formData.password.length < 6) newErrors.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে";
    if (!formData.degree.trim()) newErrors.degree = "ডিগ্রি প্রয়োজন";
    if (!formData.specialization.trim()) newErrors.specialization = "বিশেষীকরণ প্রয়োজন";
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "লাইসেন্স নম্বর প্রয়োজন";
    if (!formData.experience || parseInt(formData.experience) < 0) newErrors.experience = "অভিজ্ঞতা প্রয়োজন";
    if (!formData.consultationFee || parseInt(formData.consultationFee) < 0) newErrors.consultationFee = "কনসালটেশন ফি প্রয়োজন";
    if (!formData.bio.trim()) newErrors.bio = "বায়োগ্রাফি প্রয়োজন";
    else if (formData.bio.length < 10) newErrors.bio = "বায়োগ্রাফি কমপক্ষে ১০ অক্ষরের হতে হবে";
    else if (formData.bio.length > 1000) newErrors.bio = "বায়োগ্রাফি ১০০০ অক্ষরের বেশি হতে পারবে না";
    if (!formData.avatarUrl.trim()) newErrors.avatarUrl = "অ্যাভাটার ছবি প্রয়োজন";
    if (!formData.certificateUrl.trim()) newErrors.certificateUrl = "সার্টিফিকেট প্রয়োজন";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/doctor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          experience: parseInt(formData.experience),
          consultationFee: parseInt(formData.consultationFee),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "আবেদন জমা দিতে ব্যর্থ হয়েছে");
      }

      toast.success("আবেদন সফলভাবে জমা হয়েছে! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "আবেদন জমা দিতে ব্যর্থ হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[var(--text)] font-hind mb-2">
            বিশেষজ্ঞ হিসেবে যোগ দিন
          </h1>
          <p className="text-lg text-[var(--text)]/60 font-hind">
            মৎস্য চাষের ডিজিটাল প্ল্যাটফর্মে আপনার দক্ষতা শেয়ার করুন
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-bold text-[var(--text)] font-hind mb-4 flex items-center gap-2">
                <User size={20} className="text-[var(--primary)]" />
                ব্যক্তিগত তথ্য
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
                    নাম *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="আপনার পূর্ণ নাম"
                    error={errors.name}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
                    ইমেইল *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    error={errors.email}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
                    ফোন নম্বর *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+8801XXXXXXXXX"
                    error={errors.phone}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
                    পাসওয়ার্ড *
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    error={errors.password}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
                    জেলা
                  </label>
                  <Input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="আপনার জেলা"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
                    বিভাগ
                  </label>
                  <Input
                    type="text"
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    placeholder="আপনার বিভাগ"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-xl font-bold text-[var(--text)] font-hind mb-4 flex items-center gap-2">
                <GraduationCap size={20} className="text-[var(--primary)]" />
                পেশাগত তথ্য
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
                    ডিগ্রি *
                  </label>
                  <Input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    placeholder="আপনার ডিগ্রি"
                    error={errors.degree}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
                    বিশেষীকরণ *
                  </label>
                  <Input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="আপনার বিশেষীকরণ"
                    error={errors.specialization}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
                    লাইসেন্স নম্বর *
                  </label>
                  <Input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="LIC-XXXXX"
                    error={errors.licenseNumber}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
                    অভিজ্ঞতা (বছর) *
                  </label>
                  <Input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="কত বছরের অভিজ্ঞতা"
                    error={errors.experience}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--text)] font-hind mb-2 block">
                    কনসালটেশন ফি (টাকা) *
                  </label>
                  <div className="flex items-center gap-2">
                    <DollarSign size={20} className="text-[var(--text)]/60" />
                    <Input
                      type="number"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleChange}
                      placeholder="ফি পরিমাণ"
                      error={errors.consultationFee}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Picture & Certificate */}
            <div>
              <h3 className="text-xl font-bold text-[var(--text)] font-hind mb-4 flex items-center gap-2">
                <ImageIcon size={20} className="text-[var(--primary)]" />
                প্রোফাইল ছবি ও সার্টিফিকেট
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ImageUpload
                    value={formData.avatarUrl}
                    onChange={(url) => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
                    label="প্রোফাইল ছবি *"
                  />
                  {errors.avatarUrl && (
                    <p className="text-red-500 text-xs mt-1 font-hind">{errors.avatarUrl}</p>
                  )}
                </div>
                <div>
                  <ImageUpload
                    value={formData.certificateUrl}
                    onChange={(url) => setFormData((prev) => ({ ...prev, certificateUrl: url }))}
                    label="মেডিকেল সার্টিফিকেট *"
                  />
                  {errors.certificateUrl && (
                    <p className="text-red-500 text-xs mt-1 font-hind">{errors.certificateUrl}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-xl font-bold text-[var(--text)] font-hind mb-4 flex items-center gap-2">
                <FileText size={20} className="text-[var(--primary)]" />
                বায়োগ্রাফি
              </h3>
              <div>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={6}
                  placeholder="আপনার সম্পর্কে সংক্ষিপ্ত বর্ণনা দিন..."
                  className={`w-full px-4 py-3 bg-[var(--surface)] border rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none ${
                    errors.bio ? "border-red-500" : "border-[var(--border)]"
                  }`}
                />
                {errors.bio && (
                  <p className="text-red-500 text-xs mt-1 font-hind">{errors.bio}</p>
                )}
                <p className="text-xs text-[var(--text)]/40 font-hind mt-1">
                  {formData.bio.length}/1000 অক্ষর
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-8 py-3 rounded-lg font-hind font-bold flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    জমা দিচ্ছে...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    আবেদন জমা দিন
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
