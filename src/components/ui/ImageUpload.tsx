"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Loader2, X } from "lucide-react";
import Image from "next/image";
import { uploadToCloudinary } from "@/shared/lib/cloudinary";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export default function ImageUpload({ value, onChange, label, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("অনুগ্রহ করে একটি ইমেজ ফাইল নির্বাচন করুন");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ফাইলের আকার 5MB এর বেশি হতে পারবে না");
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadToCloudinary(file);
      onChange(result.secure_url);
      setPreview(result.secure_url);
      toast.success("ইমেজ সফলভাবে আপলোড হয়েছে");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ইমেজ আপলোড করতে ব্যর্থ হয়েছে");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    setPreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-[var(--text)] mb-2 font-hind">
          {label}
        </label>
      )}

      {preview ? (
        <div className="relative group">
          <div className="relative w-full h-48 bg-[var(--background)] rounded-2xl overflow-hidden border border-[var(--border)]">
            <Image
              src={preview}
              alt="Preview"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-3 right-3 w-10 h-10 bg-[var(--surface)]/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-[var(--border)] hover:bg-red-500 hover:border-red-500 hover:text-white transition-all duration-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`flex flex-col items-center justify-center w-full h-48 bg-[var(--surface)] border-2 border-dashed border-[var(--border)]/60 rounded-2xl p-6 transition-all hover:border-[var(--border)] cursor-pointer ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="text-[var(--primary)] animate-spin" />
                <p className="text-sm text-[var(--text)]/60 font-hind">আপলোড হচ্ছে...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                  <UploadCloud size={32} className="text-[var(--primary)]" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-[var(--text)] font-hind">
                    ইমেজ আপলোড করুন
                  </p>
                  <p className="text-xs text-[var(--text)]/60 font-hind">
                    ক্লিক করুন বা ড্র্যাগ করুন
                  </p>
                </div>
                <p className="text-xs text-[var(--text)]/40 font-hind">
                  PNG, JPG, WEBP (সর্বোচ্চ 5MB)
                </p>
              </div>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
