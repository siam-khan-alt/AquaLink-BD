"use client";

import { useState, useEffect, useRef } from "react";
import { auth } from "@/shared/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User as UserIcon, Phone, Lock, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

interface FirebaseError {
  code: string;
  message: string;
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 11)
      return toast.error("সঠিক ১১ ডিজিটের নাম্বার দিন");
    setLoading(true);
    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          }
        );
      }
      const formattedPhone = `+88${formData.phone}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current
      );
      setConfirmationResult(confirmation);
      setStep(2);
      toast.success("ফোনে ওটিপি পাঠানো হয়েছে!");
    } catch (error) {
      const firebaseError = error as FirebaseError;
      if (firebaseError.code === "auth/billing-not-enabled") {
        toast.error("বিলিংস সমস্যা। টেস্টিং নাম্বার ব্যবহার করুন।");
      } else {
        toast.error("কোড পাঠানো যায়নি।");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (!confirmationResult || otp.length < 6)
      return toast.error("সঠিক ওটিপি দিন");
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      if (result.user) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            password: formData.password,
            firebaseUid: result.user.uid,
          }),
        });
        if (res.ok) {
          toast.success("অ্যাকাউন্ট তৈরি সফল হয়েছে!");
          router.push("/login");
        } else {
          const data = await res.json();
          toast.error(data.error || "নিবন্ধন ব্যর্থ হয়েছে!");
        }
      }
    } catch {
      toast.error("ভুল ওটিপি কোড দিয়েছেন!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div id="recaptcha-container"></div>
      <div className="w-full max-w-md bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)] shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[var(--text)] font-hind">
            নতুন অ্যাকাউন্ট খুলুন
          </h1>
          <p className="text-[var(--text)]/60 text-sm mt-1 font-hind">
            মৎস্য বন্ধুতে আপনাকে স্বাগতম
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <Input
              label="আপনার নাম"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              icon={<UserIcon size={18} />}
              placeholder="নাম লিখুন"
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
              required
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
              required
            />
            <Button className="w-full font-hind h-12" disabled={loading}>
              {loading ? "অপেক্ষা করুন..." : "কোড পাঠান"}
            </Button>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="bg-[var(--primary)]/10 p-4 rounded-2xl border border-[var(--primary)]/20 text-center">
              <p className="text-sm text-[var(--text)]/60 font-hind">
                কোড পাঠানো হয়েছে:{" "}
                <span className="font-bold text-[var(--primary)]">
                  {formData.phone}
                </span>
              </p>
            </div>
            <Input
              label="ওটিপি কোড"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              icon={<CheckCircle2 size={18} />}
              placeholder="৬ ডিজিটের কোড"
              maxLength={6}
            />
            <Button
              className="w-full font-hind h-12"
              onClick={handleVerifyAndRegister}
              disabled={loading}
            >
              অ্যাকাউন্ট নিশ্চিত করুন
            </Button>
            <button
              onClick={() => setStep(1)}
              className="w-full text-xs text-[var(--primary)] font-bold italic underline font-hind"
            >
              নাম্বার পরিবর্তন করুন
            </button>
          </div>
        )}
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
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            className="w-5 h-5"
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
