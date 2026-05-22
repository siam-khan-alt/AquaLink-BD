"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Plus,
  X,
  Loader2,
  Video,
  Tag,
  Trash2,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ImageUpload from "@/components/ui/ImageUpload";

interface ICourse {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  price: number;
  category: string;
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

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function AdminCoursesPage() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    price: "",
    category: "",
    imageUrl: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: coursesData, isLoading: isCoursesLoading } = useQuery<ICoursesResponse>({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("কোর্স লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const addCourseMutation = useMutation({
    mutationFn: async (newCourseData: {
      title: string;
      description: string;
      videoUrl: string;
      price: number;
      category: string;
    }) => {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourseData),
      });
      if (!res.ok) {
        const errorData = await res.json() as { error?: string };
        throw new Error(errorData.error || "কোর্স তৈরি করতে ব্যর্থ হয়েছে");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("নতুন কোর্স সফলভাবে তৈরি করা হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setIsModalOpen(false);
      setFormData({
        title: "",
        description: "",
        videoUrl: "",
        price: "",
        category: "",
        imageUrl: "",
      });
      setFormErrors({});
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "কোর্সের শিরোনাম অবশ্যই দিতে হবে";
    }
    if (!formData.description.trim()) {
      errors.description = "কোর্সের বিবরণ অবশ্যই দিতে হবে";
    }
    if (!formData.videoUrl.trim()) {
      errors.videoUrl = "ভিডিও URL অবশ্যই দিতে হবে";
    }
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      errors.price = "সঠিক মূল্য লিখুন";
    }
    if (!formData.category.trim()) {
      errors.category = "ক্যাটাগরি অবশ্যই দিতে হবে";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    addCourseMutation.mutate({
      title: formData.title.trim(),
      description: formData.description.trim(),
      videoUrl: formData.videoUrl.trim(),
      price: priceNum,
      category: formData.category.trim(),
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[var(--text)] tracking-tight font-hind">
              বুটক্যাম্প ব্যবস্থাপনা
            </h1>
            <p className="text-[var(--text)]/60 text-sm font-medium mt-1 font-hind">
              কোর্স তৈরি এবং ম্যানেজ করুন
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="sm:w-auto h-12 flex items-center justify-center gap-2 font-hind text-sm font-bold shadow-lg hover:scale-105 transition-all"
          >
            <Plus size={18} />
            নতুন কোর্স তৈরি করুন
          </Button>
        </div>

        {/* Course Grid */}
        {isCoursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
              </Card>
            ))}
          </div>
        ) : !coursesData?.courses || coursesData.courses.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-[var(--border)]">
            <BookOpen size={48} className="text-[var(--text)]/30 mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">কোনো কোর্স নেই</h3>
            <p className="text-sm text-[var(--text)]/60 mt-1 max-w-md font-hind">
              প্ল্যাটফর্মে কোর্স যোগ করতে নতুন কোর্স তৈরি করুন
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
                    <p className="text-xs text-[var(--text)]/50 font-semibold font-hind mb-1">বিবরণ</p>
                    <p className="text-sm text-[var(--text)]/80 line-clamp-3 font-hind">
                      {course.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-[var(--text)]/50" />
                    <span className="text-xs font-semibold px-2 py-0.5 bg-[var(--background)] text-[var(--primary)] rounded-md border border-[var(--border)] font-hind">
                      {course.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[var(--border)]/50">
                    <div>
                      <p className="text-xs text-[var(--text)]/50 font-semibold font-hind">মূল্য</p>
                      <p className="text-base font-black text-[var(--primary)] font-hind mt-0.5">
                        {formatBDT(course.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text)]/50 font-semibold font-hind">তৈরির তারিখ</p>
                      <p className="text-base font-black text-[var(--text)] font-hind mt-0.5">
                        {formatDate(course.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2 pt-3 border-t border-[var(--border)]/30">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 font-hind text-xs"
                    onClick={() => toast.info("এডিট ফিচার শীঘ্রই আসছে")}
                  >
                    <Edit size={14} className="mr-1" />
                    এডিট
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-hind text-xs text-red-500 hover:bg-red-50"
                    onClick={() => toast.info("ডিলিট ফিচার শীঘ্রই আসছে")}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Course Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <Card className="bg-[var(--surface)] w-full max-w-md border border-[var(--border)] relative shadow-2xl p-6 rounded-2xl flex flex-col justify-between animate-in slide-in-from-bottom-12 duration-400 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-5">
                <h3 className="text-xl font-bold text-[var(--text)] font-hind flex items-center gap-2">
                  <BookOpen className="text-[var(--primary)]" size={20} />
                  নতুন কোর্স তৈরি করুন
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-[var(--border)] text-[var(--text)]/60 hover:text-[var(--text)] rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <Input
                  label="কোর্সের শিরোনাম"
                  id="course-title"
                  placeholder="যেমন: মাছ চাষের আধুনিক কৌশল"
                  className="font-hind"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={formErrors.title}
                />

                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2 font-hind">
                    কোর্সের বিবরণ
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="কোর্স সম্পর্কে বিস্তারিত লিখুন..."
                    rows={4}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] font-hind focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                  />
                  {formErrors.description && (
                    <p className="text-xs text-red-500 mt-1 font-hind">{formErrors.description}</p>
                  )}
                </div>

                <Input
                  label="ভিডিও URL"
                  id="course-video"
                  placeholder="https://youtube.com/watch?v=..."
                  className="font-hind"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  error={formErrors.videoUrl}
                />

                <Input
                  label="মূল্য (টাকা)"
                  id="course-price"
                  type="number"
                  step="0.01"
                  placeholder="যেমন: ৫০০ (ফ্রি করতে ০ দিন)"
                  className="font-hind"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  error={formErrors.price}
                />

                <Input
                  label="ক্যাটাগরি"
                  id="course-category"
                  placeholder="যেমন: মাছ চাষ, রোগ নির্ণয়"
                  className="font-hind"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  error={formErrors.category}
                />

                <ImageUpload
                  label="কোর্সের ছবি"
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                />

                <div className="flex gap-3 pt-4 border-t border-[var(--border)] mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 font-hind text-sm h-11"
                  >
                    বাতিল
                  </Button>
                  <Button
                    type="submit"
                    isLoading={addCourseMutation.isPending}
                    className="flex-1 font-hind text-sm h-11"
                  >
                    তৈরি করুন
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
