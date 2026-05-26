"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_CONFIG } from "@/shared/lib/constants";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Plus,
  X,
  Video,
  Tag,
  Trash2,
  Edit,
  Image as ImageIcon,
} from "lucide-react";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ImageUpload from "@/components/ui/ImageUpload";
import type { AdminCourse, AdminCoursesResponse } from "@/shared/types/api-interfaces";
import { courseSchema, type CourseInput } from "@/shared/lib/validation-schemas";
import { AdminGridSkeleton } from "@/shared/components/AdminSkeleton";
import { AdminErrorBoundary } from "@/shared/components/AdminErrorBoundary";

const formatBDT = (val: number): string => {
  if (val === 0) return "ফ্রি";
  return "৳ " + new Intl.NumberFormat("bn-BD").format(val);
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    price: "",
    category: "",
    imageUrl: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch Courses Query
  const { data: coursesData, isLoading: isCoursesLoading } = useQuery<AdminCoursesResponse>({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("কোর্স লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated",
    staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
  });

  // Create or Update Course Mutation
  const saveCourseMutation = useMutation<unknown, Error, CourseInput>({
    mutationFn: async (courseData: CourseInput) => {
      const url = editCourseId ? `/api/courses/${editCourseId}` : "/api/courses";
      const method = editCourseId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData.error || "কোর্স সংরক্ষণ করতে ব্যর্থ হয়েছে");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success(editCourseId ? "কোর্স আপডেট করা হয়েছে!" : "নতুন কোর্স তৈরি হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete Course Mutation
  const deleteCourseMutation = useMutation<unknown, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("কোর্স ডিলিট করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    onSuccess: () => {
      toast.success("কোর্সটি ডিলিট করা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openEditModal = (course: AdminCourse) => {
    setEditCourseId(course._id);
    setFormData({
      title: course.title,
      description: course.description,
      videoUrl: course.videoUrl,
      price: course.price.toString(),
      category: course.category,
      imageUrl: course.image || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditCourseId(null);
    setFormData({ title: "", description: "", videoUrl: "", price: "", category: "", imageUrl: "" });
    setFormErrors({});
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = "কোর্সের শিরোনাম দিতে হবে";
    if (!formData.description.trim()) errors.description = "কোর্সের বিবরণ দিতে হবে";
    if (!formData.videoUrl.trim()) errors.videoUrl = "ভিডিও URL দিতে হবে";
    
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) errors.price = "সঠিক মূল্য লিখুন";
    if (!formData.category.trim()) errors.category = "ক্যাটাগরি দিতে হবে";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    saveCourseMutation.mutate({
      title: formData.title.trim(),
      description: formData.description.trim(),
      videoUrl: formData.videoUrl.trim(),
      price: priceNum,
      category: formData.category.trim(),
      image: formData.imageUrl || undefined,
    });
  };

  if (status === "loading") {
    return <AdminGridSkeleton count={6} />;
  }

  return (
    <AdminErrorBoundary>
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
        
        {/* Top Header Section */}
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

        {/* Main Content Grid */}
        {isCoursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard count={3} className="h-80" />
          </div>
        ) : !coursesData?.courses || coursesData.courses.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-[var(--border)]">
            <BookOpen size={48} className="text-[var(--text)]/30 mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-[var(--text)] font-hind">কোনো কোর্স নেই</h3>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesData.courses.map((course: AdminCourse) => (
              <Card 
                key={course._id} 
                className="bg-[var(--surface)] border border-[var(--border)]/60 overflow-hidden hover:shadow-2xl hover:border-[var(--primary)]/30 transition-all duration-300 flex flex-col h-full rounded-2xl"
              >
                {/* Course Card Thumbnail Image */}
                <div className="relative w-full h-44 bg-gradient-to-br from-[var(--border)] to-[var(--background)] flex items-center justify-center overflow-hidden border-b border-[var(--border)]/40">
                  {course.image ? (
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[var(--text)]/30">
                      <ImageIcon size={36} />
                      <span className="text-xs font-semibold font-hind">থাম্বনেইল ইমেজ নেই</span>
                    </div>
                  )}
                </div>

                {/* Course Card Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg shrink-0 mt-0.5">
                        <Video size={18} />
                      </div>
                      <h3 className="font-extrabold text-lg text-[var(--text)] line-clamp-2 font-hind leading-snug">
                        {course.title}
                      </h3>
                    </div>

                    <p className="text-sm text-[var(--text)]/70 line-clamp-3 font-hind leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-[var(--text)]/40" />
                      <span className="text-xs font-bold px-2.5 py-1 bg-[var(--background)] text-[var(--primary)] rounded-md border border-[var(--border)] font-hind">
                        {course.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[var(--border)]/40">
                      <div>
                        <p className="text-xs text-[var(--text)]/40 font-bold font-hind">মূল্য</p>
                        <p className="text-base font-black text-[var(--primary)] font-hind mt-0.5">
                          {formatBDT(course.price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text)]/40 font-bold font-hind">তৈরির তারিখ</p>
                        <p className="text-sm font-extrabold text-[var(--text)]/90 font-hind mt-0.5">
                          {formatDate(course.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-5 pb-5 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 font-hind text-xs font-bold gap-1 h-9 rounded-xl border-[var(--border)] hover:bg-[var(--border)]/40 text-[var(--text)]"
                    onClick={() => openEditModal(course)}
                  >
                    <Edit size={13} />
                    এডিট
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-hind text-xs text-red-500 hover:bg-red-50/60 p-2 h-9 w-9 rounded-xl border border-transparent hover:border-red-100"
                    onClick={() => {
                      if (window.confirm("আপনি কি নিশ্চিতভাবে এই কোর্সটি ডিলিট করতে চান?")) {
                        deleteCourseMutation.mutate(course._id);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Upsert Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="bg-[var(--surface)] w-full max-w-md border border-[var(--border)] relative shadow-2xl p-6 rounded-2xl flex flex-col justify-between max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-[var(--border)]/60 pb-4 mb-5">
                <h3 className="text-xl font-bold text-[var(--text)] font-hind flex items-center gap-2">
                  <BookOpen className="text-[var(--primary)]" size={20} />
                  {editCourseId ? "কোর্স এডিট করুন" : "নতুন কোর্স তৈরি করুন"}
                </h3>
                <button 
                  onClick={closeModal} 
                  className="p-1.5 hover:bg-[var(--border)]/60 text-[var(--text)]/60 hover:text-[var(--text)] rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <Input
                  label="কোর্সের শিরোনাম"
                  id="course-title"
                  placeholder="যেমন: মাছ চাষের আধুনিক কৌশল"
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
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] font-hind focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 resize-none transition-all"
                  />
                  {formErrors.description && (
                    <p className="text-xs text-red-500 mt-1 font-hind">{formErrors.description}</p>
                  )}
                </div>

                <Input
                  label="ভিডিও URL"
                  id="course-video"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  error={formErrors.videoUrl}
                />

                <Input
                  label="মূল্য (টাকা)"
                  id="course-price"
                  type="number"
                  placeholder="যেমন: ৫০০"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  error={formErrors.price}
                />

                <Input
                  label="ক্যাটাগরি"
                  id="course-category"
                  placeholder="যেমন: মাছ চাষ, রোগ নির্ণয়"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  error={formErrors.category}
                />

                <ImageUpload
                  label="কোর্সের ছবি"
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                />

                <div className="flex gap-3 pt-4 border-t border-[var(--border)]/60 mt-6">
                  <Button type="button" variant="outline" onClick={closeModal} className="flex-1 h-11 rounded-xl">
                    বাতিল
                  </Button>
                  <Button type="submit" isLoading={saveCourseMutation.isPending} className="flex-1 h-11 rounded-xl">
                    {editCourseId ? "আপডেট করুন" : "তৈরি করুন"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

      </div>
    </div>
    </AdminErrorBoundary>
  );
}