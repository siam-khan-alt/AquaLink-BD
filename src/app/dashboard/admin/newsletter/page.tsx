"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // এটি ব্যবহার করুন
import { Mail, Send, Trash2, Users, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Subscriber {
  _id: string;
  email: string;
  createdAt: string;
}

export default function NewsletterAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ["subscribers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/newsletter/subscribers");
      if (!response.ok) throw new Error("সাবস্ক্রাইবার লোড করতে ব্যর্থ");
      const data = await response.json();
      return data.subscribers as Subscriber[];
    },
    enabled: status === "authenticated" && session?.user?.role === "admin",
  });

  if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "admin")) {
    router.push("/unauthorized");
  }

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return toast.error("দয়া করে মেসেজ লিখুন");
    setIsSending(true);
    try {
      const res = await fetch("/api/admin/newsletter/broadcast", {
        method: "POST",
        body: JSON.stringify({ message: broadcastMessage }),
      });
      if (!res.ok) throw new Error();
      toast.success("সফলভাবে মেসেজ পাঠানো হয়েছে");
      setBroadcastMessage("");
    } catch {
      toast.error("মেসেজ পাঠানো সম্ভব হয়নি");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/newsletter/subscribers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("সরিয়ে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["subscribers"] }); 
    } catch {
      toast.error("ডিলিট করা যায়নি");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <Loader2 className="animate-spin text-[var(--primary)]" size={40} />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-8">
      <div className="container mx-auto space-y-8">
        {/* হেডার */}
        <div>
          <h1 className="text-3xl font-black text-[var(--text)] mb-2">নিউজলেটার ম্যানেজমেন্ট</h1>
          <p className="text-[var(--text)] opacity-60">সাবস্ক্রাইবারদের তালিকা এবং ব্রডকাস্ট মেসেজ নিয়ন্ত্রণ করুন</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* কার্ড */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[var(--primary)]/10 rounded-2xl">
                <Users className="text-[var(--primary)]" size={28} />
              </div>
              <div>
                <p className="text-3xl font-black text-[var(--text)]">{subscribers.length}</p>
                <p className="text-sm font-bold text-[var(--text)]/60 uppercase tracking-wider">মোট সাবস্ক্রাইবার</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-[var(--text)] mb-4 flex items-center gap-2">
              <Send size={20} className="text-[var(--primary)]" />
              ব্রডকাস্ট মেসেজ পাঠান
            </h2>
            <div className="space-y-4">
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="আপনার বার্তাটি এখানে লিখুন..."
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] outline-none resize-none transition-all"
                rows={3}
              />
              <button
                onClick={handleBroadcast}
                disabled={isSending || !broadcastMessage.trim()}
                className="w-full md:w-auto px-8 py-3 bg-[var(--primary)] text-white font-black rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isSending ? "পাঠানো হচ্ছে..." : "সবাইকে পাঠান"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-lg font-black text-[var(--text)] flex items-center gap-2">
              <Mail size={20} className="text-[var(--primary)]" />
              সাবস্ক্রাইবার তালিকা
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--background)]/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-[var(--text)] uppercase">ইমেইল এড্রেস</th>
                  <th className="px-6 py-4 text-xs font-black text-[var(--text)] uppercase">সাবস্ক্রাইব তারিখ</th>
                  <th className="px-6 py-4 text-xs font-black text-[var(--text)] uppercase text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-[var(--text)]/60 font-medium">কোন সাবস্ক্রাইবার পাওয়া যায়নি</td>
                  </tr>
                ) : (
                  subscribers.map((sub) => (
                    <tr key={sub._id} className="hover:bg-[var(--background)]/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[var(--text)]">{sub.email}</td>
                      <td className="px-6 py-4 text-[var(--text)]/70 flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(sub.createdAt).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(sub._id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}