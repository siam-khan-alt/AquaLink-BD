import MarketUI from "@/modules/market-data/components/MarketUI";
import { MarketPrice } from "@/models/MarketPrice";
import { connectDB } from "@/shared/lib/db";
import { IMarketPrice } from "@/shared/types/market";
import { PageHeader } from "@/shared/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function MarketPricesPage() {
  await connectDB();
  const rawData = await MarketPrice.find().sort({ lastUpdated: -1 }).lean<IMarketPrice[]>();
  const data = JSON.parse(JSON.stringify(rawData)) as IMarketPrice[];

  return (
    <main className="min-h-screen py-10 px-4 bg-[var(--background)]">
      <div className="container mx-auto">
        <PageHeader 
          badge="লাইভ বাজার আপডেট"
          title="মাছের বাজার দর"
          subtitle="ঢাকার পাইকারি মাছের বাজারের সঠিক ও সর্বশেষ আপডেট এখন আপনার হাতের মুঠোয়।"
        />
        <MarketUI initialData={data} />
      </div>
    </main>
  );
}