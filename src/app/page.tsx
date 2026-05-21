import HeroSection from "@/features/home/components/HeroSection";
import RealtimePriceSnapshot from "@/features/home/components/RealtimePriceSnapshot";
import WeatherCropAdvisory from "@/features/home/components/WeatherCropAdvisory";
import EmergencyDiseaseAlerts from "@/features/home/components/EmergencyDiseaseAlerts";
import ProfitCalculatorWidget from "@/features/home/components/ProfitCalculatorWidget";
import VoiceSearchGate from "@/features/home/components/VoiceSearchGate";
import SuccessfulFarmerStories from "@/features/home/components/SuccessfulFarmerStories";
import PWAInstallBanner from "@/features/home/components/PWAInstallBanner";
import AIChatbotCTA from "@/features/home/components/AIChatbotCTA";
import { getTickerMarketPrices } from "@/features/home/services/marketQueries";
export const dynamic = "force-dynamic";
export default async function Home() {
  const tickerData = await getTickerMarketPrices(12);

  return (
    <div>
      <HeroSection tickerData={tickerData} />

      <div className="container mx-auto px-4 space-y-24 py-16">
        <RealtimePriceSnapshot />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <WeatherCropAdvisory />
            <EmergencyDiseaseAlerts />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <VoiceSearchGate />
            <ProfitCalculatorWidget />
          </div>
        </div>

        <SuccessfulFarmerStories />
      </div>

      <PWAInstallBanner />
      <AIChatbotCTA />
    </div>
  );
}
