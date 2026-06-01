"use client";
import { useState } from "react";
import { Plus, Minus, HelpCircle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@heroui/react";

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: "আমি কি নতুন হিসেবে শুরু করতে পারব?", a: "হ্যাঁ, আমাদের প্ল্যাটফর্মে নতুন চাষিদের জন্য ধাপে ধাপে গাইডলাইন ও ভিডিও কোর্স রয়েছে যা আপনার যাত্রা সহজ করবে।" },
    { q: "এআই রোগ নির্ণয় কতটুকু নির্ভুল?", a: "আমাদের এআই মডেলটি হাজারো তথ্যের ভিত্তিতে তৈরি। তবে চূড়ান্ত নিশ্চিতকরণের জন্য বিশেষজ্ঞের পরামর্শ নেওয়ার সুযোগও রয়েছে।" },
    { q: "পেমেন্ট পদ্ধতি কী কী?", a: "আপনি বিকাশ, নগদ বা রকেট এর মাধ্যমে সরাসরি প্ল্যাটফর্মে কোর্স ও পরামর্শ ফি প্রদান করতে পারবেন।" },
    { q: "সরাসরি বিশেষজ্ঞের সাথে কথা বলা যাবে?", a: "অবশ্যই! আমাদের 'এক্সপার্ট প্যানেল' থেকে আপনি পছন্দমতো মৎস্য বিশেষজ্ঞের সাথে সরাসরি ভিডিও কলে কথা বলতে পারবেন।" },
    { q: "পুকুরের পানি পরীক্ষা করার নিয়ম কী?", a: "আমাদের অ্যাপের 'পিএইচ মিটার' ফিচারের মাধ্যমে আপনি পানির মান যাচাই করার গাইডলাইন পেয়ে যাবেন।" },
    { q: "সাপোর্ট টিম কি ২৪/৭ খোলা থাকে?", a: "আমাদের সাপোর্ট টিম সকাল ৯টা থেকে রাত ১০টা পর্যন্ত সক্রিয় থাকে, যেকোনো জরুরি প্রয়োজনে যোগাযোগ করুন।" }
  ];

  return (
    <section className="w-full container mx-auto  py-10">
      <Card className="backdrop-blur-xl bg-[var(--surface)]/40 border border-[var(--border)]/60 shadow-2xl rounded-2xl overflow-hidden p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
          
          {/* Left Side */}
          <div className="lg:col-span-4 relative flex flex-col justify-end p-8 min-h-[400px] bg-black/20">
            <img 
              src="/images/faq-farmer-consult.jpg" 
              alt="কৃষক পরামর্শ" 
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            {/* Dark Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--hero-bg-start)] to-transparent z-10" />
            
            <div className="relative z-20 text-white space-y-4">
              <div className="w-12 h-12 bg-[var(--primary)] rounded-2xl flex items-center justify-center shadow-lg">
                <HelpCircle className="text-white" size={24} />
              </div>
              <h2 className="text-4xl font-black leading-tight">সাধারণ <br/> <span className="text-[var(--secondary)]">জিজ্ঞাসা</span></h2>
              <p className="text-sm font-bold opacity-80 leading-relaxed">
                আপনার খামার ও চাষাবাদ সংক্রান্ত যেকোনো প্রশ্নের উত্তর খুঁজে নিন এখানে। আমরা সবসময় আপনার পাশে আছি।
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="lg:col-span-8 p-8 bg-[var(--surface)] flex flex-col justify-center">
            <div className="space-y-4">
              {faqs.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--primary)] transition-colors"
                >
                  <button 
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left bg-[var(--background)]/30"
                  >
                    <span className="font-black text-[var(--text)] flex items-center gap-3">
                      <ChevronRight className={`text-[var(--primary)] transition-transform ${openIndex === index ? 'rotate-90' : ''}`} size={16} />
                      {item.q}
                    </span>
                    <span className="text-[var(--primary)] shrink-0 ml-4">
                      {openIndex === index ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>
                  
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[var(--surface)]"
                      >
                        <p className="px-6 py-4 text-[var(--text)]/70 text-sm leading-relaxed border-t border-[var(--border)]/50">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};