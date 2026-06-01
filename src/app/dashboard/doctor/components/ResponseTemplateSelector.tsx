/**
 * ResponseTemplateSelector Component
 * Quick Response System for doctors to use predefined response templates
 */

import React, { useMemo, useCallback } from "react";
import { MessageSquare, Copy, Check } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export interface ResponseTemplate {
  id: string;
  category: string;
  title: string;
  content: string;
  variables?: string[];
}

const RESPONSE_TEMPLATES: ResponseTemplate[] = [
  {
    id: "water-quality",
    category: "পানির গুণমান",
    title: "পানির pH সমস্যা",
    content: "আপনার পুকুরের পানির pH মাত্রা স্বাভাবিকের চেয়ে কম/বেশি হয়েছে। দয়া করে নিচের পদক্ষেপগুলো গ্রহণ করুন:\n1. লাইম বা চুন ব্যবহার করুন\n2. নিয়মিত পানির গুণমান পরীক্ষা করুন\n3. অতিরিক্ত খাবার দেবেন না",
    variables: ["pH মাত্রা"],
  },
  {
    id: "disease",
    category: "রোগ",
    title: "মাছের ক্ষত",
    content: "আপনার মাছের গায়ে ক্ষত দেখা যাচ্ছে। এটি সম্ভবত ব্যাকটেরিয়াল বা ফাঙ্গাল সংক্রমণ। দয়া করে:\n1. আক্রান্ত মাছ আলাদা করুন\n2. লবণ স্নান দিন\n3. উপযুক্ত অ্যান্টিবায়োটিক ব্যবহার করুন",
    variables: ["ক্ষতের ধরন"],
  },
  {
    id: "oxygen",
    category: "অক্সিজেন",
    title: "অক্সিজেন সমস্যা",
    content: "পুকুরে অক্সিজেনের মাত্রা কমে গেছে। তাৎক্ষণিক পদক্ষেপ:\n1. এয়ারেটর চালু করুন\n2. পানির স্তর কমানো\n3. খাবার দেওয়া বন্ধ করুন\n4. নতুন পানি যোগ করুন",
    variables: [],
  },
  {
    id: "nutrition",
    category: "পুষ্টি",
    title: "পোষণ ঘাটতি",
    content: "মাছের পোষণ ঘাটতি দেখা যাচ্ছে। সমাধান:\n1. গুণমানসম্পন্ন খাবার ব্যবহার করুন\n2 প্রোটিন সমৃদ্ধ খাবার বাড়ান\n3. ভিটামিন সাপ্লিমেন্ট দিন",
    variables: ["মাছের বয়স"],
  },
  {
    id: "general",
    category: "সাধারণ",
    title: "সাধারণ পরামর্শ",
    content: "আপনার সমস্যার বিষয়ে আমি অবগত হয়েছি। আরও তথ্যের জন্য দয়া করে:\n1. পুকুরের ছবি পাঠান\n2. পানির পরীক্ষার রিপোর্ট দিন\n3. খাবারের ধরন জানান",
    variables: [],
  },
];

interface ResponseTemplateSelectorProps {
  onSelectTemplate: (template: ResponseTemplate) => void;
  selectedCategory?: string;
}

export default function ResponseTemplateSelector({
  onSelectTemplate,
  selectedCategory,
}: ResponseTemplateSelectorProps) {
  const [copiedTemplateId, setCopiedTemplateId] = React.useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(RESPONSE_TEMPLATES.map((t) => t.category));
    return Array.from(cats);
  }, []);

  const filteredTemplates = useMemo(() => {
    if (!selectedCategory) return RESPONSE_TEMPLATES;
    return RESPONSE_TEMPLATES.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  const handleCopyToClipboard = useCallback(async (template: ResponseTemplate) => {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopiedTemplateId(template.id);
      setTimeout(() => setCopiedTemplateId(null), 2000);
    } catch (error) {
      console.error("Failed to copy template:", error);
    }
  }, []);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-lg font-bold text-[var(--text)] font-hind">
          দ্রুত উত্তর টেমপ্লেট
        </h3>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => onSelectTemplate({ id: "all", category: "all", title: "", content: "" })}
          className={`px-3 py-1 rounded-full text-xs font-bold font-hind transition-colors ${
            !selectedCategory
              ? "bg-[var(--primary)] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          সব
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectTemplate({ id: "all", category, title: "", content: "" })}
            className={`px-3 py-1 rounded-full text-xs font-bold font-hind transition-colors ${
              selectedCategory === category
                ? "bg-[var(--primary)] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Template List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-bold text-[var(--text)] font-hind mb-1">
                  {template.title}
                </p>
                <p className="text-xs text-[var(--text)]/60 font-hind line-clamp-2">
                  {template.content}
                </p>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyToClipboard(template);
                }}
                className="ml-2 p-2 hover:bg-gray-200 rounded-lg"
                variant="ghost"
              >
                {copiedTemplateId === template.id ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
