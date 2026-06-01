import React from "react";
import { Target, Zap, Shield, Users, Globe, Heart, Stethoscope } from "lucide-react";
import Card from "@/components/ui/Card";
import { PageHeader } from "@/shared/components/ui/PageHeader";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      {/* Hero Section */}
      <PageHeader 
        badge="মৎস্য বন্ধু সম্পর্কে"
        title="আধুনিক মৎস্য চাষের ডিজিটাল সঙ্গী"
        subtitle="বাংলাদেশের মাছ চাষিদের জন্য আধুনিক ডিজিটাল সমাধান। আমরা প্রযুক্তির মাধ্যমে মাছ চাষকে লাভজনক এবং সহজ করে তুলছি।"
      />

      {/* Mission Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <Target size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            আমাদের লক্ষ্য
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
            <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl w-fit">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              দক্ষতা বৃদ্ধি
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              আধুনিক প্রযুক্তি ও বিশেষজ্ঞ পরামর্শের মাধ্যমে মাছ চাষের দক্ষতা
              বৃদ্ধি করা এবং উৎপাদন বৃদ্ধি নিশ্চিত করা।
            </p>
          </Card>

          <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
            <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl w-fit">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              ঝুঁকি হ্রাস
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              বাজার দর, রোগ নির্ণয় এবং আবহাওয়া সম্পর্কে সঠিক তথ্য প্রদান করে
              চাষিদের ঝুঁকি হ্রাস করা।
            </p>
          </Card>

          <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
            <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl w-fit">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              সম্প্রদায় গঠন
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              চাষিদের একটি শক্তিশালী সম্প্রদায় গঠন করা যেখানে তারা পরস্পর
              সহযোগিতা করতে পারে এবং জ্ঞান বিনিময় করতে পারে।
            </p>
          </Card>

          <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
            <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl w-fit">
              <Stethoscope size={24} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              বিশেষজ্ঞ পরামর্শ
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              অভিজ্ঞ মৎস্য বিশেষজ্ঞদের সাথে সরাসরি পরামর্শ নিয়ে রোগ নির্ণয়
              এবং চিকিৎসার সঠিক সমাধান পাওয়া।
            </p>
          </Card>
        </div>
      </section>

      {/* Technology Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <Globe size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            আমাদের প্রযুক্তি
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              এআই রোগ নির্ণয়
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              জেমিনি ভিশন মডেল ব্যবহার করে মাছের ছবি বিশ্লেষণ করে রোগ নির্ণয়
              করা হয়। এটি চাষিদের দ্রুত এবং নির্ভুল রোগ শনাক্তকরণে সহায়তা করে।
            </p>
          </Card>

          <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              বাস্তব সময় বাজার দর
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              সারা দেশের মাছের বাজার দর সংগ্রহ করে বাস্তব সময়ে চাষিদের সঠিক
              তথ্য প্রদান করা হয়। এটি তাদের সঠিক সময়ে মাছ বিক্রি করতে সহায়তা করে।
            </p>
          </Card>

          <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              আবহাওয়া ও ফসল পরামর্শ
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              আবহাওয়া পূর্বাভাস এবং ফসল পরামর্শ প্রদান করে চাষিদের সঠিক
              সিদ্ধান্ত নিতে সহায়তা করা হয়। এটি তাদের ফসল ক্ষতি কমাতে সহায়তা করে।
            </p>
          </Card>

          <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              ডিজিটাল পুকুর ব্যবস্থাপনা
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              পুকুরের পানির গুণমান, খরচ ট্র্যাকিং এবং উৎপাদন পরিসংখ্যান
              ডিজিটালভাবে পরিচালনা করা হয়। এটি চাষিদের তাদের পুকুর সহজে
              ব্যবস্থাপনা করতে সহায়তা করে।
            </p>
          </Card>

          <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              বিশেষজ্ঞ পরামর্শ সেবা
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              অভিজ্ঞ মৎস্য বিশেষজ্ঞদের সাথে সরাসরি চ্যাট করে রোগ নির্ণয় এবং
              চিকিৎসার পরামর্শ পাওয়া যায়। বিশেষজ্ঞরা তাদের সময়সূচি অনুযায়ী
              পরামর্শ প্রদান করেন।
            </p>
          </Card>

          <Card className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">
              সময়সূচি ব্যবস্থাপনা
            </h3>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              বিশেষজ্ঞরা তাদের সাপ্তাহিক কাজের সময় এবং উপলব্ধতা সেট করতে পারেন।
              চাষিরা বিশেষজ্ঞের উপলব্ধতা দেখে পরামর্শ বুক করতে পারেন।
            </p>
          </Card>
        </div>
      </section>

      {/* Values Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <Heart size={24} />
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] font-hind">
            আমাদের মূল্যবোধ
          </h2>
        </div>

        <Card className="bg-[var(--surface)] border border-[var(--border)] p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[var(--primary)] font-hind">
                বিশ্বাস
              </h3>
              <p className="text-sm text-[var(--text)]/60 font-hind">
                আমরা চাষিদের সাথে দীর্ঘমেয়াদী সম্পর্ক গড়ে তুলতে প্রতিশ্রুতিবদ্ধ।
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[var(--primary)] font-hind">
                উদ্ভাবন
              </h3>
              <p className="text-sm text-[var(--text)]/60 font-hind">
                আমরা সবসময় নতুন প্রযুক্তি এবং সমাধান নিয়ে কাজ করি।
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[var(--primary)] font-hind">
                সহযোগিতা
              </h3>
              <p className="text-sm text-[var(--text)]/60 font-hind">
                আমরা চাষিদের একে অপরের সাথে সহযোগিতা করতে উৎসাহিত করি।
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[var(--primary)] font-hind">
                স্থায়িত্ব
              </h3>
              <p className="text-sm text-[var(--text)]/60 font-hind">
                আমরা পরিবেশ বান্ধব মাছ চাষ পদ্ধতি প্রচার করি।
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
