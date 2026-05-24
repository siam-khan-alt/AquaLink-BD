import { TriangleAlert } from "lucide-react";
import { Card, Chip } from "@heroui/react";

interface Alert {
  _id?: string;
  region: string;
  title: string;
  detail: string;
  level: "info" | "warning" | "danger";
  isActive: boolean;
  createdAt: string;
}

async function getAlerts(): Promise<Alert[]> {
  try {
    const res = await fetch("/api/home/alerts", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.alerts || [];
  } catch {
    return [];
  }
}

function mapLevelToDisplay(level: "info" | "warning" | "danger"): "high" | "medium" {
  if (level === "danger") return "high";
  return "medium";
}

function getLevelColor(level: "high" | "medium"): string {
  if (level === "high") {
    return "border-l-4 border-red-500 bg-red-500/5 animate-pulse";
  }
  return "border-l-4 border-orange-500 bg-orange-500/5";
}

function getChipColor(level: "high" | "medium"): string {
  if (level === "high") {
    return "text-red-400 bg-red-500/10";
  }
  return "text-orange-400 bg-orange-500/10";
}

export default async function EmergencyDiseaseAlerts() {
  const alerts = await getAlerts();

  return (
    <Card className="rounded-3xl bg-[var(--surface)]/40 p-6">
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
        {alerts.map((a) => {
          const displayLevel = mapLevelToDisplay(a.level);
          
          return (
            <Card
              key={a._id || a.title}
              className={`p-4 ${getLevelColor(displayLevel)}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{a.region}</p>
                  <h4 className="text-lg font-black mt-1">{a.title}</h4>
                  <p className="text-sm font-bold opacity-60 mt-2">{a.detail}</p>
                </div>
                <Chip
                  size="sm"
                  variant="soft"
                  className={`${getChipColor(displayLevel)} text-[10px] font-black uppercase tracking-widest`}
                >
                  {displayLevel === "high" ? "High" : "Medium"}
                </Chip>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

