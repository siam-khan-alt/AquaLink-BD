import HeroSection from "@/features/home/components/HeroSection";
import RealtimePriceSnapshot from "@/features/home/components/RealtimePriceSnapshot";
import WeatherCropAdvisory from "@/features/home/components/WeatherCropAdvisory";
import EmergencyDiseaseAlerts from "@/features/home/components/EmergencyDiseaseAlerts";
import ProfitCalculatorWidget from "@/features/home/components/ProfitCalculatorWidget";
import VoiceSearchGate from "@/features/home/components/VoiceSearchGate";
import SuccessfulFarmerStories from "@/features/home/components/SuccessfulFarmerStories";
import PWAInstallBanner from "@/features/home/components/PWAInstallBanner";
import AIChatbotCTA from "@/features/home/components/AIChatbotCTA";
import MarketTrendsInsight from "@/features/home/components/MarketTrendsInsight";
import PremiumBootcampCTA from "@/features/home/components/PremiumBootcampCTA";
import FarmingVideoShowcase from "@/features/home/components/FarmingVideoShowcase";
import PlatformStatsBanner from "@/features/home/components/PlatformStatsBanner";
import FishDiseaseVisionPreview from "@/features/home/components/FishDiseaseVisionPreview";
import ExpertConsultantPanel from "@/features/home/components/ExpertConsultantPanel";
import CommunityDiscussions from "@/features/home/components/CommunityDiscussions";
import { getTickerMarketPrices } from "@/features/home/services/marketQueries";
import { Metadata } from "next";

export const revalidate = 300; // Revalidate every 5 minutes

export const metadata: Metadata = {
  title: "মৎস্য বন্ধু - বাংলাদেশের স্মার্ট মৎস্য চাষ প্ল্যাটফর্ম",
  description: "মৎস্য বন্ধু - বাংলাদেশের সর্বাধিক আধুনিক মৎস্য চাষ ব্যবস্থাপনা প্ল্যাটফর্ম। বাজার দর, রোগ নির্ণয়, লাভ-ক্ষতি ক্যালকুলেটর, এআই সহায়তা এবং আরও অনেক কিছু।",
  keywords: "মৎস্য চাষ, মাছ চাষ, বাংলাদেশ মৎস্য চাষ, মৎস্য বন্ধু, ফিশ ফার্মিং, মাছের বাজার দর, মৎস্য রোগ নির্ণয়, স্মার্ট মৎস্য চাষ",
  openGraph: {
    title: "মৎস্য বন্ধু - বাংলাদেশের স্মার্ট মৎস্য চাষ প্ল্যাটফর্ম",
    description: "বাংলাদেশের সর্বাধিক আধুনিক মৎস্য চাষ ব্যবস্থাপনা প্ল্যাটফর্ম। বাজার দর, রোগ নির্ণয়, লাভ-ক্ষতি ক্যালকুলেটর, এআই সহায়তা এবং আরও অনেক কিছু।",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://aqualink-bd.com",
    siteName: "মৎস্য বন্ধু",
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "মৎস্য বন্ধু - বাংলাদেশের স্মার্ট মৎস্য চাষ প্ল্যাটফর্ম",
    description: "বাংলাদেশের সর্বাধিক আধুনিক মৎস্য চাষ ব্যবস্থাপনা প্ল্যাটফর্ম। বাজার দর, রোগ নির্ণয়, লাভ-ক্ষতি ক্যালকুলেটর, এআই সহায়তা এবং আরও অনেক কিছু।",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default async function Home() {
  const tickerData = await getTickerMarketPrices(12);

  return (
    <div>
      <HeroSection tickerData={tickerData} />

      <div className="container mx-auto px-4 space-y-12 py-12">
        <RealtimePriceSnapshot />
        <CommunityDiscussions />
        <MarketTrendsInsight />
         
           <WeatherCropAdvisory /> 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
            <VoiceSearchGate />
            <EmergencyDiseaseAlerts />
            
          
        </div>
        <ProfitCalculatorWidget />

        <FishDiseaseVisionPreview />
        <PremiumBootcampCTA />
        <FarmingVideoShowcase />
        <SuccessfulFarmerStories />
        <ExpertConsultantPanel />
        <PlatformStatsBanner />
      </div>

      <PWAInstallBanner />
      <AIChatbotCTA />
    </div>
  );
}
