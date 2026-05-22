import React from "react";
import { MessageSquare, Eye, TrendingUp, Clock } from "lucide-react";
import Card from "@/components/ui/Card";

interface Discussion {
  title: string;
  replies: number;
  views: number;
  timeAgo: string;
  category: string;
}

const discussions: Discussion[] = [
  {
    title: "পুকুরের অ্যামোনিয়া নিয়ন্ত্রণের সেরা উপায়",
    replies: 24,
    views: 156,
    timeAgo: "২ ঘণ্টা আগে",
    category: "পানির গুণমান",
  },
  {
    title: "চলতি সপ্তাহে কার্প জাতীয় মাছের পোনার দাম",
    replies: 18,
    views: 203,
    timeAgo: "৫ ঘণ্টা আগে",
    category: "বাজার দর",
  },
  {
    title: "পুকুরে মাছের রোগ প্রতিরোধে প্রাকৃতিক উপায়",
    replies: 31,
    views: 289,
    timeAgo: "১ দিন আগে",
    category: "রোগ নির্ণয়",
  },
];

export default function CommunityDiscussions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
          <MessageSquare size={20} className="text-[var(--primary)]" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[var(--text)] font-hind">
            কমিউনিটি আলোচনা
          </h2>
          <p className="text-sm text-[var(--text)]/60 font-hind">
            চাষিদের সাথে জ্ঞান ও অভিজ্ঞতা শেয়ার করুন
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {discussions.map((discussion, index) => (
          <Card
            key={index}
            className="bg-[var(--surface)] border border-[var(--border)] p-5 hover:shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-1 rounded-lg font-hind">
                  {discussion.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-[var(--text)]/40 font-hind">
                  <Clock size={12} />
                  {discussion.timeAgo}
                </div>
              </div>

              <h3 className="text-base font-bold text-[var(--text)] font-hind leading-snug">
                {discussion.title}
              </h3>

              <div className="flex items-center gap-4 pt-2 border-t border-[var(--border)]">
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-[var(--text)]/40" />
                  <span className="text-xs text-[var(--text)]/60 font-hind">
                    {discussion.replies} উত্তর
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye size={14} className="text-[var(--text)]/40" />
                  <span className="text-xs text-[var(--text)]/60 font-hind">
                    {discussion.views} দেখেছে
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center pt-2">
        <button className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline font-hind">
          সকল আলোচনা দেখুন
          <TrendingUp size={16} />
        </button>
      </div>
    </div>
  );
}
