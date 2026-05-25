"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Plus,
  X,
  Loader2,
  Edit,
  Trash2,
  Video,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ImageUpload from "@/components/ui/ImageUpload";

interface IStory {
  _id: string;
  farmerName: string;
  location: string;
  title: string;
  description: string;
  thumbnail: string;
  achievement: string;
  contentType: "video" | "text";
  videoUrl?: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
}

interface IStoriesResponse {
  stories: IStory[];
}

interface ISaveStoryInput {
  farmerName: string;
  location: string;
  title: string;
  description: string;
  thumbnail: string;
  achievement: string;
  contentType: "video" | "text";
  videoUrl?: string;
  isFeatured: boolean;
  isPublished: boolean;
}

export default function AdminStoriesManagement() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStoryId, setEditStoryId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    farmerName: "",
    location: "",
    title: "",
    description: "",
    thumbnail: "",
    achievement: "",
    contentType: "video" as "video" | "text",
    videoUrl: "",
    isFeatured: false,
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

  const saveStoryMutation = useMutation<unknown, Error, ISaveStoryInput>({
    mutationFn: async (storyData: ISaveStoryInput) => {
      const url = editStoryId ? `/api/admin/stories/${editStoryId}` : "/api/admin/stories";
      const method = editStoryId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storyData),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData.error || "গল্প সংরক্ষণ করতে ব্যর্থ হয়েছে");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success(editStoryId ? "গল্পটি সফলভাবে আপডেট করা হয়েছে!" : "নতুন গল্প সফলভাবে তৈরি হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteStoryMutation = useMutation<unknown, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/stories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("গল্প ডিলিট করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    onSuccess: () => {
      toast.success("গল্পটি ডিলিট করা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openCreateModal = () => {
    setEditStoryId(null);
    setFormData({
      farmerName: "",
      location: "",
      title: "",
      description: "",
      thumbnail: "",
      achievement: "",
      contentType: "video",
      videoUrl: "",
      isFeatured: false,
      isPublished: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (story: IStory) => {
    setEditStoryId(story._id);
    setFormData({
      farmerName: story.farmerName || "",
      location: story.location || "",
      title: story.title || "",
      description: story.description || "",
      thumbnail: story.thumbnail || "",
      achievement: story.achievement || "",
      contentType: story.contentType || "video",
      videoUrl: story.videoUrl || "",
      isFeatured: !!story.isFeatured,
      isPublished: !!story.isPublished,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditStoryId(null);
    setFormData({
      farmerName: "",
      location: "",
      title: "",
      description: "",
      thumbnail: "",
      achievement: "",
      contentType: "video",
      videoUrl: "",
      isFeatured: false,
      isPublished: true,
    });
    setFormErrors({});
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.farmerName.trim()) errors.farmerName = "চাষির নাম অবশ্যই দিতে হবে";
    if (!formData.location.trim()) errors.location = "অবস্থান অবশ্যই দিতে হবে";
    if (!formData.title.trim()) errors.title = "শিরোনাম অবশ্যই দিতে হবে";
    if (formData.description.trim().length < 20) errors.description = "বিবরণ কমপক্ষে ২০ অক্ষর হতে হবে";
    if (!formData.achievement.trim()) errors.achievement = "অর্জন অবশ্যই দিতে হবে";

    if (formData.contentType === "video" && !formData.videoUrl.trim()) {
      errors.videoUrl = "ইউটিউব ভিডিও লিংক বা আইডিটি প্রদান করুন";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    saveStoryMutation.mutate({
      ...formData,
      videoUrl: formData.contentType === "video" ? formData.videoUrl.trim() : "",
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-8">
          <div>
            <h1 className="text-3xl font-black text-[var(--text)] tracking-tight font-hind">
              চাষি গল্প ব্যবস্থাপনা
            </h1>
            <p className="text-[var(--text)]/60 text-sm font-medium mt-1 font-hind">
              হোম পেজের ৪টি ভিডিও এবং ২টি টেক্সট সাকসেস স্টোরি এখান থেকে নিয়ন্ত্রণ করুন
            </p>
          </div>
          <Button
            onClick={openCreateModal}
            className="sm:w-auto h-12 flex items-center justify-center gap-2 font-hind text-sm font-bold shadow-lg"
          >
            <Plus size={18} /> নতুন গল্প যোগ করুন
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">থাম্বনেইল</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">চাষির নাম</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">টাইপ</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">শিরোনাম</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">হোম পেজ ফিচারড</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">স্ট্যাটাস</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-[var(--text)]/70 font-hind">অ্যাকশন</th>
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
                      <p className="text-sm font-semibold text-[var(--text)]/60 font-hind">কোনো গল্প পাওয়া যায়নি</p>
                    </td>
                  </tr>
                ) : (
                  storiesData.stories.map((story) => (
                    <tr key={story._id} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface)] transition-colors">
                      <td className="py-4 px-6">
                        <div className="w-14 h-10 rounded-md overflow-hidden bg-[var(--background)] border border-[var(--border)] flex items-center justify-center">
                          {story.thumbnail ? (
                            <img src={story.thumbnail} alt={story.farmerName} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={16} className="text-[var(--text)]/30" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-[var(--text)] font-hind">{story.farmerName}</td>
                      <td className="py-4 px-6 text-sm font-hind">
                        {story.contentType === "video" ? (
                          <span className="flex items-center gap-1 text-blue-500 font-bold"><Video size={14}/> ভিডিও</span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-500 font-bold"><FileText size={14}/> টেক্সট</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--text)] font-hind max-w-xs truncate">{story.title}</td>
                      <td className="py-4 px-6">
                        {story.isFeatured ? (
                          <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full font-hind">ফিচারড একটিভ</span>
                        ) : (
                          <span className="text-xs font-medium text-[var(--text)]/40 bg-gray-500/10 px-2.5 py-1 rounded-full font-hind">জেনারেল</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full font-hind ${story.isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {story.isPublished ? "প্রকাশিত" : "অপ্রকাশিত"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEditModal(story)}
                          >
                            <Edit size={14}/>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:bg-red-50 border-[var(--border)]"
                            onClick={() => {
                              if (window.confirm("আপনি কি নিশ্চিতভাবে এই গল্পটি ডিলিট করতে চান?")) {
                                deleteStoryMutation.mutate(story._id);
                              }
                            }}
                          >
                            <Trash2 size={14}/>
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

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
            <Card className="bg-[var(--surface)] w-full max-w-2xl border relative p-6 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between border-b pb-4 mb-5">
                <h3 className="text-xl font-bold text-[var(--text)] font-hind flex items-center gap-2">
                  <BookOpen className="text-[var(--primary)]" size={20} /> 
                  {editStoryId ? "গল্প সম্পাদনা করুন" : "নতুন গল্প যোগ করুন"}
                </h3>
                <button onClick={closeModal} className="p-1.5 hover:bg-[var(--border)] rounded-lg"><X size={20} /></button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2 font-hind">গল্পের ধরণ</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      disabled={!!editStoryId}
                      onClick={() => setFormData({ ...formData, contentType: "video" })}
                      className={`h-11 flex items-center justify-center gap-2 rounded-xl border text-sm font-bold font-hind ${formData.contentType === "video" ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" : "border-[var(--border)]"} ${editStoryId ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <Video size={16}/> ভিডিও স্টোরি
                    </button>
                    <button
                      type="button"
                      disabled={!!editStoryId}
                      onClick={() => setFormData({ ...formData, contentType: "text" })}
                      className={`h-11 flex items-center justify-center gap-2 rounded-xl border text-sm font-bold font-hind ${formData.contentType === "text" ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" : "border-[var(--border)]"} ${editStoryId ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <FileText size={16}/> টেক্সট স্টোরি
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="চাষির নাম" id="farmer-name" placeholder="যেমন: শোভন আহমেদ" value={formData.farmerName} onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })} error={formErrors.farmerName} />
                  <Input label="অবস্থান" id="location" placeholder="যেমন: ফুলপুর, ময়মনসিংহ" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} error={formErrors.location} />
                </div>

                <Input label="শিরোনাম" id="title" placeholder="যেমন: আধুনিক প্রযুক্তিতে শিং ও পাবদা মাছ চাষে বাজিমাত" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} error={formErrors.title} />

                {formData.contentType === "video" && (
                  <Input label="ইউটিউব ভিডিও ইউআরএল বা আইডি" id="videoUrl" placeholder="যেমন: https://youtu.be/hMpuXSEfhCg" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} error={formErrors.videoUrl} />
                )}

                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2 font-hind">বিবরণ</label>
                  <textarea 
                    id="description" 
                    placeholder="সফলতার বিবরণ লিখুন..." 
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm font-hind min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all resize-none" 
                    value={formData.description || ""} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  />
                  {formErrors.description && <p className="text-xs text-red-600 mt-1 font-hind">{formErrors.description}</p>}
                </div>

                <Input label="অর্জন" id="achievement" placeholder="যেমন: বার্ষিক লাভ ২৫ লাখ টাকা" value={formData.achievement} onChange={(e) => setFormData({ ...formData, achievement: e.target.value })} error={formErrors.achievement} />
                
                <ImageUpload
                  label="গল্পের থাম্বনেইল ছবি"
                  value={formData.thumbnail}
                  onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                />

                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="is-featured" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-4 h-4 accent-[var(--primary)]" />
                    <label htmlFor="is-featured" className="text-sm font-bold text-[var(--text)] font-hind text-amber-500">হোম পেজে সাজেস্ট করুন (পিন করুন)</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="is-published" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} className="w-4 h-4 accent-[var(--primary)]" />
                    <label htmlFor="is-published" className="text-sm font-semibold text-[var(--text)] font-hind">এখনই পাবলিশ করুন</label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t mt-6">
                  <Button type="button" variant="outline" onClick={closeModal} className="flex-1 font-hind text-sm h-11">বাতিল</Button>
                  <Button type="submit" isLoading={saveStoryMutation.isPending} className="flex-1 font-hind text-sm h-11">
                    {editStoryId ? "আপডেট করুন" : "সংরক্ষণ করুন"}
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