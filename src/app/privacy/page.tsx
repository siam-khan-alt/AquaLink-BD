import React from "react";
import { Shield, Lock, Eye, Database, UserCheck, FileText } from "lucide-react";
import Card from "@/components/ui/Card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-[var(--text)] font-hind">
          গোপনীয়তা নীতি
        </h1>
        <p className="text-lg text-[var(--text)]/60 max-w-2xl mx-auto font-hind">
          মৎস্য বন্ধু প্ল্যাটফর্মে আপনার তথ্য সুরক্ষা আমাদের জন্য অত্যন্ত গুরুত্বপূর্ণ।
          আমরা আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে প্রতিশ্রুতিবদ্ধ।
        </p>
      </div>

      {/* Data Collection Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <Database size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            তথ্য সংগ্রহ
          </h2>
        </div>

        <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
          <p className="text-sm text-[var(--text)]/80 font-hind leading-relaxed">
            আমরা নিম্নলিখিত তথ্য সংগ্রহ করি:
          </p>
          <ul className="space-y-2 text-sm text-[var(--text)]/70 font-hind">
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              নিবন্ধনের সময় আপনার নাম, ইমেইল, ফোন নম্বর এবং ভূমিকা
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              পুকুরের তথ্য, উৎপাদন পরিসংখ্যান এবং খরচের তথ্য
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              ব্যবহারকারীর কার্যকলাপ এবং লগ ডেটা
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              পেমেন্ট তথ্য এবং লেনদেন ইতিহাস
            </li>
          </ul>
        </Card>
      </section>

      {/* Data Protection Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            তথ্য সুরক্ষা
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
            <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl w-fit">
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              এনক্রিপশন
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              আপনার সকল তথ্য শক্তিশালী এনক্রিপশন দ্বারা সুরক্ষিত। আমরা
              শিল্প-মানের নিরাপত্তা ব্যবস্থা ব্যবহার করি।
            </p>
          </Card>

          <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
            <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl w-fit">
              <UserCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              প্রমাণীকরণ
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              NextAuth সেশন ব্যবহার করে নিরাপদ প্রমাণীকরণ ব্যবস্থা। আপনার
              অ্যাকাউন্ট সুরক্ষিত রাখতে আমরা দ্বি-ফ্যাক্টর প্রমাণীকরণ সমর্থন করি।
            </p>
          </Card>
        </div>
      </section>

      {/* Data Retention Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <Eye size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            তথ্য ধারণ সময়
          </h2>
        </div>

        <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
          <p className="text-sm text-[var(--text)]/80 font-hind leading-relaxed">
            আমরা আপনার তথ্য নিম্নলিখিত সময়ের জন্য ধারণ করি:
          </p>
          <ul className="space-y-2 text-sm text-[var(--text)]/70 font-hind">
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              অ্যাকাউন্ট তথ্য: অ্যাকাউন্ট মুছে ফেলা পর্যন্ত
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              পুকুর তথ্য: অ্যাকাউন্ট মুছে ফেলা পর্যন্ত
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              লেনদেন তথ্য: ৫ বছর
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              লগ ডেটা: ১ বছর
            </li>
          </ul>
        </Card>
      </section>

      {/* Data Sharing Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <FileText size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            তথ্য শেয়ারিং
          </h2>
        </div>

        <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
          <p className="text-sm text-[var(--text)]/80 font-hind leading-relaxed">
            আমরা আপনার তথ্য নিম্নলিখিত ক্ষেত্রে শেয়ার করতে পারি:
          </p>
          <ul className="space-y-2 text-sm text-[var(--text)]/70 font-hind">
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              আইনি প্রয়োজনে সরকারি কর্তৃপক্ষের সাথে
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              পেমেন্ট প্রসেসিংয়ের জন্য পেমেন্ট গেটওয়ের সাথে
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              আপনার স্পষ্ট সম্মতি সাপেক্ষে
            </li>
          </ul>
          <p className="text-sm text-[var(--text)]/60 font-hind leading-relaxed mt-4">
            আমরা কখনও আপনার তথ্য বিজ্ঞাপন বা মার্কেটিংয়ের জন্য তৃতীয় পক্ষের সাথে
            শেয়ার করি না।
          </p>
        </Card>
      </section>

      {/* User Rights Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <UserCheck size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            ব্যবহারকারীর অধিকার
          </h2>
        </div>

        <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
          <p className="text-sm text-[var(--text)]/80 font-hind leading-relaxed">
            আপনার নিম্নলিখিত অধিকার রয়েছে:
          </p>
          <ul className="space-y-2 text-sm text-[var(--text)]/70 font-hind">
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              আপনার তথ্য দেখার অধিকার
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              আপনার তথ্য সংশোধন করার অধিকার
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              আপনার তথ্য মুছে ফেলার অধিকার
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              তথ্য প্রক্রিয়াকরণ বন্ধ করার অধিকার
            </li>
          </ul>
        </Card>
      </section>

      {/* Contact Section */}
      <section className="space-y-6">
        <Card className="bg-[var(--surface)] border border-[var(--border)] p-8">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              গোপনীয়তা সম্পর্কে প্রশ্ন আছে?
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              আমাদের সাথে যোগাযোগ করুন: support@aqualinkbd.com
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
