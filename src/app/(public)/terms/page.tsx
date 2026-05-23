import React from "react";
import { FileText, Shield, AlertTriangle, Users, Gavel, CheckCircle } from "lucide-react";
import Card from "@/components/ui/Card";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-[var(--text)] font-hind">
          শর্তাবলী
        </h1>
        <p className="text-lg text-[var(--text)]/60 max-w-2xl mx-auto font-hind">
          মৎস্য বন্ধু প্ল্যাটফর্ম ব্যবহারের জন্য সাধারণ শর্তাবলী এবং নির্দেশিকা।
          প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি এই শর্তাবলীতে সম্মত হচ্ছেন।
        </p>
      </div>

      {/* Acceptance Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <CheckCircle size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            গ্রহণযোগ্যতা
          </h2>
        </div>

        <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
          <p className="text-sm text-[var(--text)]/80 font-hind leading-relaxed">
            মৎস্য বন্ধু প্ল্যাটফর্মে নিবন্ধন এবং ব্যবহার করার মাধ্যমে আপনি এই
            শর্তাবলীতে সম্মত হচ্ছেন। আপনি যদি এই শর্তাবলীতে সম্মত না হন, তবে
            প্ল্যাটফর্ম ব্যবহার করবেন না।
          </p>
        </Card>
      </section>

      {/* User Responsibilities Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <Users size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            ব্যবহারকারীর দায়িত্ব
          </h2>
        </div>

        <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
          <p className="text-sm text-[var(--text)]/80 font-hind leading-relaxed">
            প্ল্যাটফর্ম ব্যবহার করার সময় আপনার নিম্নলিখিত দায়িত্ব রয়েছে:
          </p>
          <ul className="space-y-2 text-sm text-[var(--text)]/70 font-hind">
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              সঠিক এবং আপডেট তথ্য প্রদান করা
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              অন্য ব্যবহারকারীদের সাথে সম্মানজনক আচরণ করা
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              প্ল্যাটফর্মের নিরাপত্তা লঙ্ঘন না করা
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              অন্যের অ্যাকাউন্ট ব্যবহার না করা
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              মিথ্যা তথ্য প্রদান না করা
            </li>
          </ul>
        </Card>
      </section>

      {/* Content Guidelines Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <FileText size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            কন্টেন্ট নির্দেশিকা
          </h2>
        </div>

        <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
          <p className="text-sm text-[var(--text)]/80 font-hind leading-relaxed">
            প্ল্যাটফর্মে নিম্নলিখিত কন্টেন্ট নিষিদ্ধ:
          </p>
          <ul className="space-y-2 text-sm text-[var(--text)]/70 font-hind">
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              অপমানজনক বা আক্রমণাত্মক ভাষা
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              মিথ্যা বা ভুল তথ্য
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              অবৈধ কার্যকলাপ প্রচার
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              অন্যের ব্যক্তিগত তথ্য প্রকাশ
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              স্প্যাম বা অযাচ্ছিক বিজ্ঞাপন
            </li>
          </ul>
        </Card>
      </section>

      {/* Prohibited Activities Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            নিষিদ্ধ কার্যকলাপ
          </h2>
        </div>

        <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
          <p className="text-sm text-[var(--text)]/80 font-hind leading-relaxed">
            নিম্নলিখিত কার্যকলাপ কঠোরভাবে নিষিদ্ধ:
          </p>
          <ul className="space-y-2 text-sm text-[var(--text)]/70 font-hind">
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              প্ল্যাটফর্মের নিরাপত্তা ব্যবস্থা হ্যাক করা
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              অন্যের অ্যাকাউন্ট অনুমতি ছাড়া ব্যবহার করা
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              স্বয়ংক্রিয় বট বা স্ক্রিপ্ট ব্যবহার করা
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              প্ল্যাটফর্মের সেবা অপব্যবহার করা
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              বাণিজ্যিক উদ্দেশ্যে অননুমোদিত ব্যবহার
            </li>
          </ul>
        </Card>
      </section>

      {/* Account Termination Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            অ্যাকাউন্ট বাতিল
          </h2>
        </div>

        <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
          <p className="text-sm text-[var(--text)]/80 font-hind leading-relaxed">
            আমরা নিম্নলিখিত ক্ষেত্রে আপনার অ্যাকাউন্ট বাতিল করতে পারি:
          </p>
          <ul className="space-y-2 text-sm text-[var(--text)]/70 font-hind">
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              শর্তাবলী লঙ্ঘন করলে
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              অন্য ব্যবহারকারীর ক্ষতি করলে
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              প্ল্যাটফর্মের নিরাপত্তা হুমকি দিলে
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              আইনি কারণে
            </li>
          </ul>
          <p className="text-sm text-[var(--text)]/60 font-hind leading-relaxed mt-4">
            আপনি যেকোনো সময় আপনার অ্যাকাউন্ট মুছে ফেলতে পারেন।
          </p>
        </Card>
      </section>

      {/* Liability Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <Gavel size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            দায়বদ্ধতা
          </h2>
        </div>

        <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
          <p className="text-sm text-[var(--text)]/80 font-hind leading-relaxed">
            মৎস্য বন্ধু প্ল্যাটফর্মের ব্যবহারের ফলে সৃষ্ট কোনো ক্ষতির জন্য আমরা
            দায়বদ্ধ নই। প্ল্যাটফর্ম প্রদান করা তথ্য এবং পরামর্শ শুধুমাত্র সাধারণ
            নির্দেশিকা। চূড়ান্ত সিদ্ধান্ত নেওয়ার আগে বিশেষজ্ঞের পরামর্শ নিন।
          </p>
        </Card>
      </section>

      {/* Updates Section */}
      <section className="space-y-6">
        <Card className="bg-[var(--surface)] border border-[var(--border)] p-8">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              শর্তাবলী আপডেট
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              আমরা যেকোনো সময় এই শর্তাবলী আপডেট করতে পারি। আপডেট হলে আমরা
              আপনাকে জানাব। আপডেটের পর প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি নতুন
              শর্তাবলীতে সম্মত হচ্ছেন।
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
