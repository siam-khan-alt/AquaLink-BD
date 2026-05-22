"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Plus,
  X,
  Loader2,
  MapPin,
  Trophy,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface IStory {
  _id: string;
  farmerName: string;
  location: string;
  title: string;
  description: string;
  thumbnail: string;
  achievement: string;
  isPublished: boolean;
  createdAt: string;
}

interface IStoriesResponse {
  stories: IStory[];
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function AdminStoriesManagement() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    farmerName: "",
    location: "",
    title: "",
    description: "",
    thumbnail: "",
    achievement: "",
    isPublished: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: storiesData, isLoading: isStoriesLoading } = useQuery<IStoriesResponse>({
    queryKey: ["admin-stories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stories");
      if (!res.ok) throw new Error("গল্প লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const createStoryMutation = useMutation({
    mutationFn: async (newStoryData: {
      farmerName: string;
      location: string;
      title: string;
      description: string;
      thumbnail: string;
      achievement: string;
      isPublished: boolean;
    }) => {
      const res = await fetch("/api/admin/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStoryData),
      });
      if (!res.ok) {
        const errorData = await res.json() as { error?: string };
        throw new Error(errorData.error || "গল্প তৈরি করতে ব্যর্থ হয়েছে");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("নতুন গল্প সফলভাবে তৈরি হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
      setIsModalOpen(false);
      setFormData({
        farmerName: "",
        location: "",
        title: "",
        description: "",
        thumbnail: "",
        achievement: "",
        isPublished: true,
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

    if (!formData.farmerName.trim()) {
      errors.farmerName = "চাষির নাম অবশ্যই দিতে হবে";
    }
    if (!formData.location.trim()) {
      errors.location = "অবস্থান অবশ্যই দিতে হবে";
    }
    if (!formData.title.trim()) {
      errors.title = "শিরোনাম অবশ্যই দিতে হবে";
    }
    if (formData.description.trim().length < 20) {
      errors.description = "বিবরণ কমপক্ষে ২০ অক্ষর হতে হবে";
    }
    if (!formData.achievement.trim()) {
      errors.achievement = "অর্জন অবশ্যই দিতে হবে";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    createStoryMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-8">
          <div>
            <h1 className="text-3xl font-black text-[var(--text)] tracking-tight font-hind">
              চাষি গল্প ব্যবস্থাপনা
            </h1>
            <p className="text-[var(--text)]/60 text-sm font-medium mt-1 font-hind">
              সফল চাষিদের গল্প পরিচালনা এবং প্রকাশ
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="sm:w-auto h-12 flex items-center justify-center gap-2 font-hind text-sm font-bold shadow-lg hover:scale-105 transition-all"
          >
            <Plus size={18} />
            নতুন গল্প যোগ করুন
          </Button>
        </div>

        {/* Stories Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    চাষির নাম
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    অবস্থান
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    শিরোনাম
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    অর্জন
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    স্ট্যাটাস
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    তারিখ
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody>
                {isStoriesLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : !storiesData?.stories || storiesData.stories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <BookOpen size={48} className="text-[var(--text)]/30 mx-auto mb-4" />
                      <p className="text-sm font-semibold text-[var(--text)]/60 font-hind">
                        কোনো গল্প পাওয়া যায়নি
                      </p>
                    </td>
                  </tr>
                ) : (
                  storiesData.stories.map((story) => (
                    <tr
                      key={story._id}
                      className="border-b border-[var(--border)]/50 hover:bg-[var(--surface)] transition-colors"
                    >
                      <td className="py-4 px-6 text-sm font-semibold text-[var(--text)] font-hind">
                        {story.farmerName}
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--text)]/80 font-hind flex items-center gap-1">
                        <MapPin size={14} />
                        {story.location}
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--text)] font-hind max-w-xs truncate">
                        {story.title}
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--text)]/80 font-hind flex items-center gap-1">
                        <Trophy size={14} />
                        {story.achievement}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full font-hind ${
                            story.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {story.isPublished ? "প্রকাশিত" : "অপ্রকাশিত"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--text)]/60 font-hind flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(story.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-hind text-xs"
                            onClick={() => toast.info("সম্পাদনা ফিচার শীঘ্রই আসছে")}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-hind text-xs text-red-600 hover:text-red-700"
                            onClick={() => toast.info("মুছে ফেলা ফিচার শীঘ্রই আসছে")}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create Story Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <Card className="bg-[var(--surface)] w-full max-w-2xl border border-[var(--border)] relative shadow-2xl p-6 rounded-2xl flex flex-col justify-between animate-in slide-in-from-bottom-12 duration-400 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-5">
                <h3 className="text-xl font-bold text-[var(--text)] font-hind flex items-center gap-2">
                  <BookOpen className="text-[var(--primary)]" size={20} />
                  নতুন গল্প যোগ করুন
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
                  label="চাষির নাম"
                  id="farmer-name"
                  placeholder="যেমন: আব্দুল করিম"
                  className="font-hind"
                  value={formData.farmerName}
                  onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                  error={formErrors.farmerName}
                />

                <Input
                  label="অবস্থান"
                  id="location"
                  placeholder="যেমন: যশোর"
                  className="font-hind"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  error={formErrors.location}
                />

                <Input
                  label="শিরোনাম"
                  id="title"
                  placeholder="যেমন: রুই মাছ চাষে সাফল্যের গল্প"
                  className="font-hind"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={formErrors.title}
                />

                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2 font-hind">
                    বিবরণ
                  </label>
                  <textarea
                    id="description"
                    placeholder="গল্পের বিস্তারিত বিবরণ লিখুন..."
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] font-hind focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[120px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  {formErrors.description && (
                    <p className="text-xs text-red-600 mt-1 font-hind">{formErrors.description}</p>
                  )}
                </div>

                <Input
                  label="অর্জন"
                  id="achievement"
                  placeholder="যেমন: ১৫ লাখ টাকা লাভ"
                  className="font-hind"
                  value={formData.achievement}
                  onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                  error={formErrors.achievement}
                />

                <Input
                  label="থাম্বনেইল URL"
                  id="thumbnail"
                  placeholder="https://example.com/image.jpg"
                  className="font-hind"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                />

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is-published"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 accent-[var(--primary)]"
                  />
                  <label htmlFor="is-published" className="text-sm font-semibold text-[var(--text)] font-hind">
                    এখনই প্রকাশ করুন
                  </label>
                </div>

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
                    isLoading={createStoryMutation.isPending}
                    className="flex-1 font-hind text-sm h-11"
                  >
                    গল্প তৈরি করুন
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
