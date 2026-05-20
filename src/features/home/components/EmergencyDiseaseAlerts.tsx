import { TriangleAlert } from "lucide-react";

const ALERTS: Array<{
  id: string;
  region: string;
  title: string;
  detail: string;
  level: "high" | "medium";
}> = [
  {
    id: "a1",
    region: "ঢাকা বিভাগ",
    title: "ত্বক ক্ষত রোগ নজরদারি",
    detail: "পানির মান খারাপ হলে সংক্রমণ বাড়ে। pH, অ্যামোনিয়া, DO নিয়মিত মাপুন।",
    level: "medium",
  },
];

export default function EmergencyDiseaseAlerts() {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Emergency Alerts</p>
          <h3 className="text-2xl font-black tracking-tight mt-1">রোগ সতর্কতা</h3>
          <p className="text-sm font-bold opacity-60 mt-2">অঞ্চলভিত্তিক ঝুঁকি সংক্ষিপ্ত আপডেট।</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <TriangleAlert size={20} />
        </div>
      </header>

      <div className="mt-6 space-y-3">
        {ALERTS.map((a) => (
          <article
            key={a.id}
            className={[
              "rounded-2xl border p-4",
              a.level === "high"
                ? "border-red-500/30 bg-red-500/5"
                : "border-orange-500/30 bg-orange-500/5",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{a.region}</p>
                <h4 className="text-lg font-black mt-1">{a.title}</h4>
                <p className="text-sm font-bold opacity-60 mt-2">{a.detail}</p>
              </div>
              <span
                className={[
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                  a.level === "high"
                    ? "text-red-400 border-red-500/30 bg-red-500/10"
                    : "text-orange-400 border-orange-500/30 bg-orange-500/10",
                ].join(" ")}
              >
                {a.level === "high" ? "High" : "Medium"}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

