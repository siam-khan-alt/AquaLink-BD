"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, CreditCard, Camera, AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "পুকুরে অ্যামোনিয়া গ্যাস হলে করণীয় কি?",
    answer: "পুকুরে অ্যামোনিয়া গ্যাস হলে প্রতি শতাংশে ১-২ কেজি চুন প্রয়োগ করুন। পানির গভীরতা বাড়ান এবং পানি বদলানোর ব্যবস্থা করুন। প্রয়োজনে পটাশিয়াম পারম্যাঙ্গানেট ব্যবহার করতে পারেন।",
    icon: <AlertCircle size={20} />,
  },
  {
    id: "2",
    question: "প্রিমিয়াম বুটক্যাম্পের পেমেন্ট কীভাবে করব?",
    answer: "প্রিমিয়াম বুটক্যাম্পের জন্য আপনি SSLCommerz গেটওয়ের মাধ্যমে পেমেন্ট করতে পারেন। বিকাশ, নগদ, রকেট এবং কার্ড পেমেন্ট সমর্থিত। পেমেন্ট সফল হলে আপনি সাথে সাথে কোর্স অ্যাক্সেস পাবেন।",
    icon: <CreditCard size={20} />,
  },
  {
    id: "3",
    question: "ছবি তুলে রোগ শনাক্তকরণ কতটা নির্ভুল?",
    answer: "আমাদের এআই রোগ শনাক্তকরণ সিস্টেম জেমিনি ভিশন মডেল ব্যবহার করে যা প্রায় ৮৫-৯০% নির্ভুলতা প্রদান করে। তবে এটি শুধুমাত্র প্রাথমিক নির্ণয়ের জন্য। চূড়ান্ত চিকিৎসার জন্য বিশেষজ্ঞ বা অভিজ্ঞ মৎস্য কর্মকর্তার পরামর্শ নিন।",
    icon: <Camera size={20} />,
  },
  {
    id: "4",
    question: "কীভাবে পুকুরের পানির গুণমান পরীক্ষা করব?",
    answer: "আমাদের প্ল্যাটফর্মে আপনি পুকুরের পানির গুণমান পরীক্ষা করতে পারেন। পিএইচ, ডিসলভড অক্সিজেন, তাপমাত্রা এবং অন্যান্য প্যারামিটার পরীক্ষা করে আপনি পুকুরের স্বাস্থ্য সম্পর্কে জানতে পারবেন।",
    icon: <HelpCircle size={20} />,
  },
  {
    id: "5",
    question: "বাজার দর আপডেট কতটা ঘন ঘন হয়?",
    answer: "আমরা প্রতিদিন বাজার দর আপডেট করি। সারা দেশের বিভিন্ন বাজার থেকে তথ্য সংগ্রহ করে আমরা সবচেয়ে সাম্প্রতিক দর প্রদান করি। এটি আপনাকে সঠিক সময়ে মাছ বিক্রি করতে সহায়তা করবে।",
    icon: <MessageCircle size={20} />,
  },
  {
    id: "6",
    question: "বিশেষজ্ঞ পরামর্শ কীভাবে নিব?",
    answer: "আপনি আমাদের প্ল্যাটফর্মে মৎস্য বিশেষজ্ঞদের তালিকা দেখতে পারবেন। বিশেষজ্ঞের উপলব্ধতা দেখে আপনি পরামর্শ বুক করতে পারেন। বুকিং নিশ্চিত হলে আপনি বিশেষজ্ঞের সাথে চ্যাট করে আপনার সমস্যা সম্পর্কে জানাতে পারবেন।",
    icon: <MessageCircle size={20} />,
  },
  {
    id: "7",
    question: "বিশেষজ্ঞ পরামর্শের ফি কত?",
    answer: "প্রতিটি বিশেষজ্ঞের নিজস্ব পরামর্শ ফি রয়েছে। বিশেষজ্ঞের প্রোফাইলে তাদের ফি দেখা যাবে। পরামর্শ নেওয়ার আগে ফি সম্পর্কে নিশ্চিত হয়ে নিন। পেমেন্ট SSLCommerz গেটওয়ের মাধ্যমে নিরাপদভাবে করা যাবে।",
    icon: <CreditCard size={20} />,
  },
  {
    id: "8",
    question: "বিশেষজ্ঞ হওয়ার জন্য কী প্রয়োজন?",
    answer: "বিশেষজ্ঞ হওয়ার জন্য আপনাকে আবেদন করতে হবে। আপনার যোগ্যতা, অভিজ্ঞতা এবং প্রমাণপত্র জমা দিতে হবে। অ্যাডমিন আপনার আবেদন যাচাই করে অনুমোদন দেবেন। অনুমোদন পেলে আপনি বিশেষজ্ঞ ড্যাশবোর্ড অ্যাক্সেস পাবেন।",
    icon: <HelpCircle size={20} />,
  },
  {
    id: "9",
    question: "বিশেষজ্ঞ সময়সূচি কীভাবে সেট করব?",
    answer: "বিশেষজ্ঞ ড্যাশবোর্ডে আপনি 'সময়সূচি' সেকশনে যেতে পারেন। সেখানে আপনি প্রতিদিনের কাজের সময় এবং উপলব্ধতা সেট করতে পারেন। আপনি যেকোনো সময় আপনার উপলব্ধতা টগল করতে পারেন।",
    icon: <MessageCircle size={20} />,
  },
];

export default function HelpPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-[var(--text)] font-hind">
          সাহায্য কেন্দ্র
        </h1>
        <p className="text-lg text-[var(--text)]/60 max-w-2xl mx-auto font-hind">
          আমাদের প্ল্যাটফর্ম সম্পর্কে সাধারণ প্রশ্ন এবং উত্তর। আপনার প্রশ্নের উত্তর না পেলে
          আমাদের সাথে যোগাযোগ করুন।
        </p>
      </div>

      {/* FAQ Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <HelpCircle size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            সাধারণ প্রশ্নাবলী
          </h2>
        </div>

        <div className="space-y-4">
          {faqData.map((faq) => (
            <Card
              key={faq.id}
              className="bg-[var(--surface)] border border-[var(--border)] overflow-hidden"
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-[var(--border)]/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
                    {faq.icon}
                  </div>
                  <h3 className="text-base font-bold text-[var(--text)] font-hind">
                    {faq.question}
                  </h3>
                </div>
                {openItems.has(faq.id) ? (
                  <ChevronUp size={20} className="text-[var(--text)]/60 flex-shrink-0" />
                ) : (
                  <ChevronDown size={20} className="text-[var(--text)]/60 flex-shrink-0" />
                )}
              </button>

              {openItems.has(faq.id) && (
                <div className="px-6 pb-6 pt-0">
                  <div className="pl-14 pr-4">
                    <p className="text-sm text-[var(--text)]/80 font-hind leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <MessageCircle size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            আরও সাহায্য প্রয়োজন?
          </h2>
        </div>

        <Card className="bg-[var(--surface)] border border-[var(--border)] p-8">
          <div className="text-center space-y-4">
            <p className="text-base text-[var(--text)]/80 font-hind">
              আপনার প্রশ্নের উত্তর পাননি? আমাদের সাথে যোগাযোগ করুন।
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a
                href="mailto:support@aqualinkbd.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold font-hind hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={18} />
                ইমেইল করুন
              </a>
              <a
                href="tel:+8801700000000"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-xl font-bold font-hind hover:bg-[var(--border)]/30 transition-colors"
              >
                <HelpCircle size={18} />
                ফোন করুন
              </a>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
