import { Metadata } from "next";
import DiseaseGuideUI from "@/modules/fish-diseases/components/DiseaseGuideUI";
import { PageHeader } from "@/shared/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "মাছের রোগ ও সমাধান | ডিজিটাল মৎস্য সহকারী - AquaLink-BD",
  description: "মাছের সাধারণ রোগ, কারণ, প্রতিকার এবং সঠিক ওষুধ সম্পর্কে বিস্তারিত জানুন।",
};

export default function DiseasePage() {
  return (
    <main className="min-h-screen py-10 container mx-auto px-4 ">
      {/* Header */}
      
          <PageHeader 
            badge="স্বাস্থ্য ও সুরক্ষা গাইড"
            title="মাছের রোগ ও সমাধান"
            subtitle="মাছকে রোগমুক্ত রাখতে সঠিক চিকিৎসা ও আধুনিক পরামর্শ।"
          />
        
      <DiseaseGuideUI />
    </main>
  );
}

