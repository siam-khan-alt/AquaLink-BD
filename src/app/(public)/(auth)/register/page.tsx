"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User as UserIcon, Phone, Mail, Lock, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import Image from "next/image";
import ImageUpload from "@/components/ui/ImageUpload";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    image: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "নাম প্রয়োজন";
    if (!formData.phone.trim() && !formData.email.trim()) {
      newErrors.phone = "ফোন বা ইমেইল অন্তত একটি প্রয়োজন";
      newErrors.email = "ফোন বা ইমেইল অন্তত একটি প্রয়োজন";
    }
    if (formData.phone && formData.phone.length !== 11) {
      newErrors.phone = "সঠিক ১১ ডিজিটের নাম্বার দিন";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "সঠিক ইমেইল দিন";
    }
    if (!formData.password.trim()) newErrors.password = "পাসওয়ার্ড প্রয়োজন";
    else if (formData.password.length < 6) newErrors.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          password: formData.password,
          image: formData.image || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("অ্যাকাউন্ট তৈরি সফল হয়েছে!");
        router.push("/login");
      } else {
        toast.error(data.error || "নিবন্ধন ব্যর্থ হয়েছে!");
      }
    } catch (error) {
      toast.error("নিবন্ধন ব্যর্থ হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-md bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)] shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[var(--text)] font-hind">
            নতুন অ্যাকাউন্ট খুলুন
          </h1>
          <p className="text-[var(--text)]/60 text-sm mt-1 font-hind">
            মৎস্য বন্ধুতে আপনাকে স্বাগতম
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="আপনার নাম"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            icon={<UserIcon size={18} />}
            placeholder="নাম লিখুন"
            error={errors.name}
            required
          />
          <Input
            label="ফোন নাম্বার"
            maxLength={11}
            value={formData.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value.replace(/\D/g, ""),
              })
            }
            placeholder="01XXXXXXXXX"
            icon={<Phone size={18} />}
            error={errors.phone}
          />
          <Input
            label="ইমেইল"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="example@email.com"
            icon={<Mail size={18} />}
            error={errors.email}
          />
          <Input
            label="পাসওয়ার্ড"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            icon={<Lock size={18} />}
            placeholder="পাসওয়ার্ড দিন"
            error={errors.password}
            required
          />
          <div>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              label="প্রোফাইল ছবি"
            />
          </div>
          <Button className="w-full font-hind h-12" disabled={loading}>
            {loading ? "অপেক্ষা করুন..." : "নিবন্ধন করুন"}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--surface)] px-2 text-[var(--text)]/40 font-hind">
              অথবা
            </span>
          </div>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full h-12 flex items-center justify-center gap-3 bg-white text-black rounded-xl font-bold hover:bg-gray-50 transition-all border border-gray-200 font-hind"
        >
          <Image
            src="https://www.svgrepo.com/show/355037/google.svg"
            width={20}
            height={20}
            alt="Google"
          />{" "}
          Google দিয়ে খুলুন
        </button>

        <p className="text-center mt-8 text-[var(--text)]/60 text-sm font-medium font-hind">
          আগে অ্যাকাউন্ট খুলেছেন?{" "}
          <Link
            href="/login"
            className="text-[var(--primary)] font-bold hover:underline"
          >
            প্রবেশ করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
