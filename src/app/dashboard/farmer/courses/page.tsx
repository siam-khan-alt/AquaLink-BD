"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Play,
  Loader2,
  Video,
  DollarSign,
  X,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface ICourse {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  price: number;
  category: string;
  isEnrolled: boolean;
  createdAt: string;
}

interface ICoursesResponse {
  courses: ICourse[];
}

const formatBDT = (val: number): string => {
  if (val === 0) return "ফ্রি";
  return "৳ " + new Intl.NumberFormat("bn-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return "";
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

export default function FarmerCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const success = searchParams.get("success");
  const error = searchParams.get("error");

  React.useEffect(() => {
    if (success === "true") {
      toast.success("পেমেন্ট সফলভাবে সম্পন্ন হয়েছে! কোর্সে ভর্তি হয়েছেন।");
      router.replace("/dashboard/farmer/courses");
      queryClient.invalidateQueries({ queryKey: ["farmer-courses"] });
    } else if (error) {
      const errorMessages: Record<string, string> = {
        payment_failed: "পেমেন্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
        enrollment_not_found: "এনরোলমেন্ট পাওয়া যায়নি।",
        invalid_response: "অবৈধ প্রতিক্রিয়া।",
        server_error: "সার্ভার ত্রুটি। আবার চেষ্টা করুন।",
      };
      toast.error(errorMessages[error] || "একটি ত্রুটি হয়েছে।");
      router.replace("/dashboard/farmer/courses");
    }
  }, [success, error, router, queryClient]);

  const { data: coursesData, isLoading: isCoursesLoading } = useQuery<ICoursesResponse>({
    queryKey: ["farmer-courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("কোর্স লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const initiatePaymentMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (!res.ok) {
        const errorData = await res.json() as { error?: string };
        throw new Error(errorData.error || "পেমেন্ট শুরু করতে ব্যর্থ হয়েছে");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.isFree || data.alreadyEnrolled) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["farmer-courses"] });
      } else if (data.gatewayUrl) {
        window.location.href = data.gatewayUrl;
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  const handleWatchVideo = (course: ICourse) => {
    setSelectedCourse(course);
    setIsVideoModalOpen(true);
  };

  const handlePurchase = (course: ICourse) => {
    initiatePaymentMutation.mutate(course._id);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[var(--text)] tracking-tight font-hind">
              লার্নিং হাব
            </h1>
            <p className="text-[var(--text)]/60 text-sm font-medium mt-1 font-hind">
              মাছ চাষের দক্ষতা বাড়াতে প্রিমিয়াম কোর্স এবং বুটক্যাম্প
            </p>
          </div>
        </div>

        {/* Course Grid */}
        {isCoursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-80 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
              </Card>
            ))}
          </div>
        ) : !coursesData?.courses || coursesData.courses.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-[var(--border)]">
            <BookOpen size={48} className="text-[var(--text)]/30 mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">কোনো কোর্স পাওয়া যায়নি</h3>
            <p className="text-sm text-[var(--text)]/60 mt-1 max-w-md font-hind">
              শীঘ্রই নতুন কোর্স যোগ করা হবে
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesData.courses.map((course) => (
              <Card key={course._id} className="bg-[var(--surface)] hover:shadow-2xl hover:border-[var(--primary)]/30 transition-all duration-300 flex flex-col h-full">
                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
                        <Video size={20} />
                      </div>
                      <h3 className="font-extrabold text-lg text-[var(--text)] line-clamp-2 font-hind">
                        {course.title}
                      </h3>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-[var(--text)]/80 line-clamp-3 font-hind">
                      {course.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-[var(--background)] text-[var(--primary)] rounded-md border border-[var(--border)] font-hind">
                      {course.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]/50">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-[var(--primary)]" />
                      <span className="text-base font-black text-[var(--primary)] font-hind">
                        {formatBDT(course.price)}
                      </span>
                    </div>
                    {course.isEnrolled && (
                      <div className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-hind">
                        <CheckCircle size={12} />
                        ভর্তি হয়েছেন
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-[var(--border)]/30">
                  {course.price === 0 || course.isEnrolled ? (
                    <Button
                      onClick={() => handleWatchVideo(course)}
                      className="w-full font-hind text-sm h-11 flex items-center justify-center gap-2"
                    >
                      <Play size={16} />
                      ভিডিও দেখুন
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePurchase(course)}
                      isLoading={initiatePaymentMutation.isPending}
                      className="w-full font-hind text-sm h-11 flex items-center justify-center gap-2"
                    >
                      <DollarSign size={16} />
                      {formatBDT(course.price)} দিয়ে কিনুন
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Video Modal */}
        {isVideoModalOpen && selectedCourse && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="w-full max-w-5xl relative animate-in slide-in-from-bottom-12 duration-400">
              <button
                onClick={() => {
                  setIsVideoModalOpen(false);
                  setSelectedCourse(null);
                }}
                className="absolute -top-12 right-0 p-2 hover:bg-[var(--border)] text-white hover:text-[var(--text)] rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="bg-[var(--surface)] rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[var(--text)] font-hind">
                    {selectedCourse.title}
                  </h3>
                  <a
                    href={selectedCourse.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline font-hind"
                  >
                    <ExternalLink size={14} />
                    নতুন ট্যাবে খুলুন
                  </a>
                </div>
                
                <div className="aspect-video bg-black">
                  <iframe
                    src={getYouTubeEmbedUrl(selectedCourse.videoUrl)}
                    title={selectedCourse.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
