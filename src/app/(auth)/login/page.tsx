"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { auth } from "@/shared/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Phone,
  Lock,
  LogIn,
  Smartphone,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface FirebaseError {
  code: string;
  message: string;
}

export default function LoginPage() {
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ phone: "", password: "" });
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

  const setDummyData = (role: "farmer" | "admin") => {
    if (role === "farmer") {
      setFormData({ phone: "01300000000", password: "farmer123" });
      toast.info("চাষি অ্যাকাউন্টের তথ্য দেয়া হয়েছে");
    } else {
      setFormData({ phone: "01800000000", password: "admin123" });
      toast.info("অ্যাডমিন অ্যাকাউন্টে তথ্য দেয়া হয়েছে");
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      phone: formData.phone,
      password: formData.password,
      redirect: false,
    });

    if (res?.ok) {
      toast.success("সফলভাবে প্রবেশ করেছেন!");
      router.push("/dashboard");
    } else {
      toast.error("ফোন নাম্বার বা পাসওয়ার্ড ভুল দিয়েছেন!");
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
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
        toast.error("কোড পাঠানো সম্ভব হয়নি।");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async () => {
    if (!confirmationResult || otp.length < 6) return;
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      if (result.user) {
        const nextAuthRes = await signIn("otp-login", {
          phone: formData.phone,
          redirect: false,
        });
        if (nextAuthRes?.ok) {
          toast.success("সফলভাবে প্রবেশ করেছেন!");
          router.push("/dashboard");
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
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-[var(--text)] font-hind">
            ফিরে আসায় স্বাগতম!
          </h1>
          <p className="text-[var(--text)]/60 mt-2 font-hind">
            {isOtpMode
              ? "কোড দিয়ে প্রবেশ করুন"
              : "আপনার অ্যাকাউন্টে প্রবেশ করুন"}
          </p>
        </div>

        {!isOtpMode && (
          <div className="flex gap-3 mb-8">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1 font-hind text-xs"
              onClick={() => setDummyData("farmer")}
            >
              <UserCheck size={16} /> চাষি তথ্য
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 font-hind text-xs"
              onClick={() => setDummyData("admin")}
            >
              <ShieldCheck size={16} /> অ্যাডমিন তথ্য
            </Button>
          </div>
        )}

        {!isOtpMode ? (
          <form onSubmit={handlePasswordLogin} className="space-y-5">
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
        ) : (
          <div className="space-y-5">
            {step === 1 ? (
              <>
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
                />
                <Button
                  className="w-full font-hind"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  <Smartphone size={18} />{" "}
                  {loading ? "কোড পাঠানো হচ্ছে..." : "কোড পাঠান"}
                </Button>
              </>
            ) : (
              <>
                <div className="bg-[var(--primary)]/10 p-3 rounded-xl border border-[var(--primary)]/20 text-center mb-4">
                  <p className="text-xs text-[var(--text)]/60 font-hind">
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
                  placeholder="৬ ডিজিটের কোড"
                  icon={<ShieldCheck size={18} />}
                  maxLength={6}
                />
                <Button
                  className="w-full font-hind"
                  onClick={handleOtpLogin}
                  disabled={loading}
                >
                  নিশ্চিত করুন
                </Button>
                <button
                  onClick={() => setStep(1)}
                  className="w-full text-xs text-[var(--primary)] font-bold italic underline font-hind"
                >
                  নাম্বার পরিবর্তন করুন
                </button>
              </>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4 mt-6">
          <button
            onClick={() => {
              setIsOtpMode(!isOtpMode);
              setStep(1);
            }}
            className="text-sm font-bold text-[var(--primary)] hover:underline font-hind"
          >
            {isOtpMode
              ? "পাসওয়ার্ড দিয়ে প্রবেশ করুন"
              : "কোড দিয়ে প্রবেশ করুন"}
          </button>
          <div className="relative my-2">
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
            Google দিয়ে প্রবেশ
          </button>
        </div>
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
