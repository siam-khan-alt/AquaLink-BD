"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, CheckCircle, XCircle, ArrowLeft, Loader2, Award } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { toast } from "sonner";

interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ICourse {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  price: number;
  category: string;
  quiz?: IQuizQuestion[];
}

interface ICourseResponse {
  course: ICourse;
}

interface IEnrollment {
  _id: string;
  userId: string;
  courseId: string;
  paymentStatus: string;
  completed: boolean;
  completedAt?: string;
}

interface IEnrollmentResponse {
  enrollment: IEnrollment;
}

export default function CourseQuizPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const queryClient = useQueryClient();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const { data: courseData, isLoading: isCourseLoading } = useQuery<ICourseResponse>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("কোর্স লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated" && !!courseId,
  });

  const { data: enrollmentData } = useQuery<IEnrollmentResponse>({
    queryKey: ["enrollment", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/enrollments/course/${courseId}`);
      if (!res.ok) throw new Error("এনরোলমেন্ট লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated" && !!courseId,
  });

  const completeEnrollmentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/enrollments/${enrollmentData?.enrollment._id}/complete`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("সম্পূর্ণতা আপডেট করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    onSuccess: () => {
      toast.success("কুইজ সফলভাবে সম্পন্ন হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
      router.push(`/dashboard/farmer/courses/${courseId}/certificate`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (status === "loading" || isCourseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated" || !courseData?.course) {
    router.push("/dashboard/farmer/courses");
    return null;
  }

  const course = courseData.course;
  const quiz = course.quiz || [];

  if (quiz.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <BookOpen size={48} className="text-[var(--primary)]/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--text)] font-hind mb-2">
              কুইজ উপলব্ধ নেই
            </h2>
            <p className="text-sm text-[var(--text)]/60 font-hind mb-6">
              এই কোর্সের জন্য কোনো কুইজ সেট করা হয়নি।
            </p>
            <Button
              onClick={() => router.back()}
              className="font-hind text-sm"
            >
              ফিরে যান
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (enrollmentData?.enrollment.completed) {
    return (
      <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Award size={48} className="text-[var(--primary)] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--text)] font-hind mb-2">
              আপনি ইতিমধ্যে এই কোর্সটি সম্পন্ন করেছেন
            </h2>
            <p className="text-sm text-[var(--text)]/60 font-hind mb-6">
              আপনার সার্টিফিকেট দেখতে নিচের বাটনে ক্লিক করুন।
            </p>
            <Button
              onClick={() => router.push(`/dashboard/farmer/courses/${courseId}/certificate`)}
              className="font-hind text-sm"
            >
              সার্টিফিকেট দেখুন
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: answerIndex });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    let correctCount = 0;
    quiz.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    const percentage = (correctCount / quiz.length) * 100;
    setScore(percentage);
    setShowResults(true);

    if (percentage >= 80) {
      completeEnrollmentMutation.mutate();
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const question = quiz[currentQuestion];

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
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
              কোর্স কুইজ: {course.title}
            </h1>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              প্রশ্ন {currentQuestion + 1} / {quiz.length}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--border)] rounded-full h-2">
          <div
            className="bg-[var(--primary)] h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
          />
        </div>

        {!showResults ? (
          /* Question Card */
          <Card className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--text)] font-hind mb-6">
                {question.question}
              </h2>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestion, index)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all font-hind ${
                      selectedAnswers[currentQuestion] === index
                        ? "border-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-[var(--border)] hover:border-[var(--primary)]/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswers[currentQuestion] === index
                            ? "border-[var(--primary)] bg-[var(--primary)]"
                            : "border-[var(--border)]"
                        }`}
                      >
                        {selectedAnswers[currentQuestion] === index && (
                          <CheckCircle size={14} className="text-white" />
                        )}
                      </div>
                      <span className="text-[var(--text)]">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[var(--border)]">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="font-hind text-sm"
              >
                আগে
              </Button>
              <Button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === undefined}
                className="font-hind text-sm"
              >
                {currentQuestion === quiz.length - 1 ? "জমা দিন" : "পরবর্তী"}
              </Button>
            </div>
          </Card>
        ) : (
          /* Results Card */
          <Card className="p-8 space-y-6 text-center">
            <div className="flex justify-center mb-4">
              {score >= 80 ? (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={40} className="text-green-600" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle size={40} className="text-red-600" />
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-[var(--text)] font-hind">
              {score >= 80 ? "অভিনন্দন! আপনি পাস করেছেন" : "দুঃখিত, আপনি ফেইল করেছেন"}
            </h2>

            <div className="py-8">
              <p className="text-5xl font-black text-[var(--primary)] font-hind">
                {score.toFixed(0)}%
              </p>
              <p className="text-sm text-[var(--text)]/60 font-hind mt-2">
                আপনার স্কোর
              </p>
            </div>

            <div className="space-y-2 text-sm text-[var(--text)]/70 font-hind">
              <p>সঠিক উত্তর: {Math.round((score / 100) * quiz.length)} / {quiz.length}</p>
              <p>পাস করার জন্য প্রয়োজন: ৮০%</p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
              {score >= 80 ? (
                <Button
                  onClick={() => router.push(`/dashboard/farmer/courses/${courseId}/certificate`)}
                  className="flex-1 font-hind text-sm"
                  isLoading={completeEnrollmentMutation.isPending}
                >
                  সার্টিফিকেট দেখুন
                </Button>
              ) : (
                <Button
                  onClick={handleRetry}
                  className="flex-1 font-hind text-sm"
                >
                  আবার চেষ্টা করুন
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 font-hind text-sm"
              >
                ফিরে যান
              </Button>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
