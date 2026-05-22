"use client";

import React, { useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Award, ArrowLeft, Download, Share2, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface ICourse {
  _id: string;
  title: string;
  description: string;
  category: string;
}

interface ICourseResponse {
  course: ICourse;
}

interface IEnrollment {
  _id: string;
  userId: string;
  courseId: string;
  completed: boolean;
  completedAt?: string;
}

interface IEnrollmentResponse {
  enrollment: IEnrollment;
}

export default function CertificatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const certificateRef = useRef<HTMLDivElement>(null);

  const { data: courseData, isLoading: isCourseLoading } = useQuery<ICourseResponse>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("কোর্স লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated" && !!courseId,
  });

  const { data: enrollmentData, isLoading: isEnrollmentLoading } = useQuery<IEnrollmentResponse>({
    queryKey: ["enrollment", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/enrollments/course/${courseId}`);
      if (!res.ok) throw new Error("এনরোলমেন্ট লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated" && !!courseId,
  });

  if (status === "loading" || isCourseLoading || isEnrollmentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated" || !courseData?.course || !enrollmentData?.enrollment) {
    router.push("/dashboard/farmer/courses");
    return null;
  }

  const course = courseData.course;
  const enrollment = enrollmentData.enrollment;

  if (!enrollment.completed) {
    return (
      <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Award size={48} className="text-[var(--primary)]/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--text)] font-hind mb-2">
              সার্টিফিকেট উপলব্ধ নেই
            </h2>
            <p className="text-sm text-[var(--text)]/60 font-hind mb-6">
              আপনি এখনও কুইজ সম্পন্ন করেননি।
            </p>
            <Button
              onClick={() => router.push(`/dashboard/farmer/courses/${courseId}/quiz`)}
              className="font-hind text-sm"
            >
              কুইজ দিন
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const completionDate = enrollment.completedAt ? new Date(enrollment.completedAt) : new Date();
  const formattedDate = completionDate.toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const serialId = `AQ-${courseId.slice(0, 6).toUpperCase()}-${enrollment._id.slice(-6).toUpperCase()}`;

  const handleDownload = () => {
    if (certificateRef.current) {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="h-10 w-10 flex items-center justify-center p-0"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)] font-hind">
                ডিজিটাল সার্টিফিকেট
              </h1>
              <p className="text-sm text-[var(--text)]/60 font-hind">
                কোর্স সম্পূর্ণতার প্রমাণপত্র
              </p>
            </div>
          </div>
          <Button
            onClick={handleDownload}
            className="flex items-center gap-2 font-hind text-sm"
          >
            <Download size={16} />
            সার্টিফিকেট ডাউনলোড করুন
          </Button>
        </div>

        {/* Certificate */}
        <div ref={certificateRef} className="print:shadow-none">
          <div className="bg-white p-12 border-8 border-yellow-500 shadow-2xl relative overflow-hidden">
            
            {/* Gold Border */}
            <div className="absolute inset-0 border-4 border-yellow-400 pointer-events-none" />
            
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <Award size={400} className="text-yellow-600" />
            </div>

            {/* Certificate Content */}
            <div className="relative z-10 text-center space-y-8">
              
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                    <Award size={32} className="text-white" />
                  </div>
                </div>
                <h1 className="text-4xl font-black text-gray-800 font-hind tracking-wider">
                  সার্টিফিকেট অফ কমপ্লিশন
                </h1>
                <p className="text-lg text-gray-600 font-hind">
                  এটি প্রমাণ করে যে
                </p>
              </div>

              {/* Student Name */}
              <div className="py-8">
                <h2 className="text-5xl font-bold text-gray-800 font-hind mb-2">
                  {session?.user?.name || "চাষি"}
                </h2>
                <p className="text-sm text-gray-500 font-hind uppercase tracking-widest">
                  সফলভাবে সম্পন্ন করেছেন
                </p>
              </div>

              {/* Course Title */}
              <div className="py-6 border-t-2 border-b-2 border-yellow-400">
                <h3 className="text-3xl font-bold text-gray-800 font-hind">
                  {course.title}
                </h3>
                <p className="text-base text-gray-600 font-hind mt-2">
                  {course.category}
                </p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-8 py-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-hind">সম্পূর্ণতার তারিখ</p>
                  <p className="text-xl font-bold text-gray-800 font-hind">
                    {formattedDate}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-hind">সিরিয়াল নম্বর</p>
                  <p className="text-xl font-bold text-gray-800 font-hind">
                    {serialId}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-8 space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-hind">
                  <Award size={16} />
                  <span>মৎস্য বন্ধু - AquaLink BD</span>
                </div>
                <p className="text-xs text-gray-400 font-hind">
                  এই সার্টিফিকেটটি ডিজিটালভাবে যাচাই করা যায়
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Actions */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-[var(--text)] font-hind">
                সার্টিফিকেট শেয়ার করুন
              </p>
              <p className="text-xs text-[var(--text)]/60 font-hind">
                আপনার সাফল্য সবারের সাথে ভাগ করুন
              </p>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 font-hind text-sm"
            >
              <Share2 size={16} />
              শেয়ার করুন
            </Button>
          </div>
        </Card>

      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
