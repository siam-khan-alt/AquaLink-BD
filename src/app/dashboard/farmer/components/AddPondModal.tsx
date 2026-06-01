/**
 * AddPondModal Component
 * Modal form for adding new ponds with validation
 */

import React, { useState } from "react";
import { X } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { PondFormData, ValidationError } from "../lib/pond-calculations";
import { validatePondData } from "../lib/pond-calculations";
import { IPond } from "@/models/Pond";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AddPondModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPonds: IPond[];
}

export const AddPondModal: React.FC<AddPondModalProps> = ({
  isOpen,
  onClose,
  existingPonds,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<PondFormData>({
    name: "",
    area: "",
    fishType: [],
    initialPh: "",
    depth: "",
  });
  const [errors, setErrors] = useState<ValidationError>({});

  const addPondMutation = useMutation({
    mutationFn: async (data: PondFormData) => {
      const res = await fetch("/api/ponds/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Failed to add pond");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ponds-list"] });
      queryClient.invalidateQueries({ queryKey: ["ponds-stats"] });
      queryClient.invalidateQueries({ queryKey: ["chart-data"] });
      onClose();
      setFormData({
        name: "",
        area: "",
        fishType: [],
        initialPh: "",
        depth: "",
      });
      setErrors({});
    },
    onError: (error) => {
      console.error("Error adding pond:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validatePondData(formData, existingPonds);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    addPondMutation.mutate(formData);
  };

  const handleFishTypeChange = (fish: string) => {
    setFormData((prev) => ({
      ...prev,
      fishType: prev.fishType.includes(fish)
        ? prev.fishType.filter((f) => f !== fish)
        : [...prev.fishType, fish],
    }));
  };

  const fishOptions = [
    "Ruhi",
    "Katla",
    "Mrigel",
    "Pangas",
    "Tilapia",
    "Koi",
    "Magur",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text)] font-hind">
            নতুন পুকুর যোগ করুন
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--border)] rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-[var(--text)] font-hind mb-2">
              পুকুরের নাম *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="পুকুরের নাম লিখুন"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 font-hind">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--text)] font-hind mb-2">
              আয়তন (শতাংশ) *
            </label>
            <input
              type="number"
              value={formData.area}
              onChange={(e) =>
                setFormData({ ...formData, area: e.target.value })
              }
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="আয়তন শতাংশে লিখুন"
              step="0.01"
            />
            {errors.area && (
              <p className="text-red-500 text-xs mt-1 font-hind">{errors.area}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--text)] font-hind mb-2">
              মাছের প্রজাতি *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fishOptions.map((fish) => (
                <label
                  key={fish}
                  className="flex items-center gap-2 p-2 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--surface)]"
                >
                  <input
                    type="checkbox"
                    checked={formData.fishType.includes(fish)}
                    onChange={() => handleFishTypeChange(fish)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-hind">{fish}</span>
                </label>
              ))}
            </div>
            {errors.fishTypes && (
              <p className="text-red-500 text-xs mt-1 font-hind">
                {errors.fishTypes}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--text)] font-hind mb-2">
              প্রাথমিক pH মান *
            </label>
            <input
              type="number"
              value={formData.initialPh}
              onChange={(e) =>
                setFormData({ ...formData, initialPh: e.target.value })
              }
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="pH মান লিখুন (৬.৫ - ৮.৫)"
              step="0.1"
              min="0"
              max="14"
            />
            {errors.initialPh && (
              <p className="text-red-500 text-xs mt-1 font-hind">
                {errors.initialPh}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--text)] font-hind mb-2">
              গভীরতা (মিটার) *
            </label>
            <input
              type="number"
              value={formData.depth}
              onChange={(e) =>
                setFormData({ ...formData, depth: e.target.value })
              }
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="গভীরতা মিটারে লিখুন"
              step="0.1"
              min="0"
            />
            {errors.depth && (
              <p className="text-red-500 text-xs mt-1 font-hind">{errors.depth}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              disabled={addPondMutation.isPending}
              className="flex-1"
            >
              {addPondMutation.isPending ? "যোগ হচ্ছে..." : "যোগ করুন"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
