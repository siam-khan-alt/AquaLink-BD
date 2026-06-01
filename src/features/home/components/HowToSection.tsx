"use client";
import { motion } from "framer-motion";
import { UserPlus, Search, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export const HowToSection = () => {
  const steps = [
    {
      title: "অ্যাকাউন্ট খুলুন",
      icon: <UserPlus size={28} />,
      desc: "আপনার মোবাইল নম্বর দিয়ে মাত্র কয়েক সেকেন্ডে আমাদের প্ল্যাটফর্মে যুক্ত হোন।",
      link: "/register",
    },
    {
      title: "রোগ শনাক্ত করুন",
      icon: <Search size={28} />,
      desc: "স্মার্ট ক্যামেরা ব্যবহার করে মাছের রোগের ছবি তুলুন, এআই করবে নির্ভুল বিশ্লেষণ।",
      link: "/fish-diseases",
    },
    {
      title: "সমাধান পান",
      icon: <CheckCircle size={28} />,
      desc: "রোগের ধরণ অনুযায়ী দ্রুত চিকিৎসা এবং বিশেষজ্ঞ পরামর্শ গ্রহণ করুন।",
      link: "/#expert-panel",
    },
  ];

  return (
    <section className="pb-10 container mx-auto">
      <h2 className="text-4xl font-black text-center mb-16 text-[var(--text)]">
        ৩টি সহজ ধাপে <span className="text-[var(--primary)]">মৎস্য বন্ধু</span>{" "}
        শুরু করুন
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            className="group relative p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-4 left-8 bg-[var(--primary)] text-white font-black px-4 py-1 rounded-full text-sm">
              ০{idx + 1}
            </div>

            <div className="w-16 h-16 mb-6 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
              {step.icon}
            </div>

            <h3 className="text-2xl font-black text-[var(--text)] mb-3">
              {step.title}
            </h3>
            <p className="text-[var(--text)]/60 leading-relaxed mb-6">
              {step.desc}
            </p>

            {step.link.startsWith("#") ? (
              <a
                href={step.link}
                className="flex items-center text-[var(--primary)] font-bold gap-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              >
                জানুন আরও <ArrowRight size={16} />
              </a>
            ) : (
              <Link
                href={step.link}
                className="flex items-center text-[var(--primary)] font-bold gap-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              >
                জানুন আরও <ArrowRight size={16} />
              </Link>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};
