"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Phone, Mail, Lock, LogIn, UserCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

export default function LoginPage() {
  const [formData, setFormData] = useState({ identity: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isEmail = (input: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  };

  const handleDemoLogin = (role: "farmer" | "admin" | "doctor") => {
    if (role === "farmer") {
      setFormData({ identity: "01300000000", password: "farmer123" });
      toast.info("চাষি অ্যাকাউন্টের তথ্য দেয়া হয়েছে");
    } else if (role === "doctor") {
      setFormData({ identity: "01711000003", password: "siam12" }); // আপনার ডাটাবেসের ডক্টর পাসওয়ার্ড
      toast.info("ডক্টর অ্যাকাউন্টের তথ্য দেয়া হয়েছে");
    } else {
      setFormData({ identity: "01800000000", password: "admin123" });
      toast.info("অ্যাডমিন অ্যাকাউন্টের তথ্য দেয়া হয়েছে");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.identity.trim() || !formData.password.trim()) {
      toast.error("ফোন/ইমেইল এবং পাসওয়ার্ড দিন");
      return;
    }

    setLoading(true);

    try {
      const isEmailInput = isEmail(formData.identity);

      const res = await signIn("credentials", {
        phone: isEmailInput ? undefined : formData.identity,
        email: isEmailInput ? formData.identity : undefined,
        password: formData.password,
        redirect: false,
      });

      if (res?.ok) {
        toast.success("সফলভাবে প্রবেশ করেছেন!");
        router.push("/dashboard");
      } else {
        toast.error("ফোন/ইমেইল বা পাসওয়ার্ড ভুল দিয়েছেন!");
      }
    } catch (error) {
      toast.error("প্রবেশ করতে ব্যর্থ হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-md bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)] shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-[var(--text)] font-hind">
            ফিরে আসায় স্বাগতম!
          </h1>
          <p className="text-[var(--text)]/60 mt-2 font-hind">
            আপনার অ্যাকাউন্টে প্রবেশ করুন
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-8">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="flex-1 font-hind text-xs"
            onClick={() => handleDemoLogin("farmer")}
          >
            <UserCheck size={14} /> চাষি ডেমো
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="font-hind text-xs"
            onClick={() => handleDemoLogin("doctor")}
          >
            <UserCheck size={14} /> ডক্টর
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 font-hind text-xs"
            onClick={() => handleDemoLogin("admin")}
          >
            <ShieldCheck size={14} /> অ্যাডমিন ডেমো
          </Button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            label="ফোন নাম্বার বা ইমেইল"
            value={formData.identity}
            onChange={(e) =>
              setFormData({ ...formData, identity: e.target.value })
            }
            placeholder="01XXXXXXXXX বা example@email.com"
            icon={
              isEmail(formData.identity) ? (
                <Mail size={18} />
              ) : (
                <Phone size={18} />
              )
            }
          />
          <Input
            label="পাসওয়ার্ড"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="পাসওয়ার্ড দিন"
            icon={<Lock size={18} />}
            type="password"
          />
          <Button className="w-full font-hind" disabled={loading}>
            <LogIn size={18} /> {loading ? "প্রবেশ হচ্ছে..." : "প্রবেশ করুন"}
          </Button>
        </form>

        <div className="relative my-6">
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
          Google দিয়ে প্রবেশ
        </button>

        <p className="text-center mt-8 text-[var(--text)]/60 text-sm font-medium font-hind">
          অ্যাকাউন্ট নেই?{" "}
          <Link
            href="/register"
            className="text-[var(--primary)] font-bold hover:underline"
          >
            নতুন অ্যাকাউন্ট খুলুন
          </Link>
        </p>
      </div>
    </div>
  );
}
