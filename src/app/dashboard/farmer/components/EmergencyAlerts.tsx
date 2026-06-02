/**
 * EmergencyAlerts Component
 * Displays emergency disease alerts with severity levels
 */

import React from "react";
import { AlertTriangle } from "lucide-react";
import Card from "@/components/ui/Card";
import { EmergencyAlert } from "../hooks/useAlerts";

interface EmergencyAlertsProps {
  alerts: EmergencyAlert[];
  isLoading: boolean;
}

export const EmergencyAlerts: React.FC<EmergencyAlertsProps> = ({
  alerts,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-32 bg-[var(--border)] rounded"></div>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return null;
  }

  const getSeverityColor = (level: EmergencyAlert["level"]): string => {
    switch (level) {
      case "critical":
        return "bg-red-500/10 border-red-500 text-red-500";
      case "error":
        return "bg-red-500/10 border-red-500/50 text-red-500";
      case "warning":
        return "bg-orange-500/10 border-orange-500 text-orange-500";
      case "info":
        return "bg-blue-500/10 border-blue-500 text-blue-500";
      default:
        return "bg-gray-500/10 border-gray-500 text-gray-500";
    }
  };

  const getSeverityIcon = (level: EmergencyAlert["level"]): string => {
    switch (level) {
      case "critical":
        return "🔴";
      case "error":
        return "🟠";
      case "warning":
        return "🟡";
      case "info":
        return "🔵";
      default:
        return "⚪";
    }
  };

  return (
    <Card className="p-6 border-l-4 border-l-[var(--primary)]">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="text-[var(--primary)]" size={24} />
        <h2 className="text-xl font-bold text-[var(--text)] font-hind">
          জরুরি সতর্কতা
        </h2>
        <span className="ml-auto px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-sm font-bold font-hind">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert._id.toString()}
            className={`p-4 rounded-lg border ${getSeverityColor(alert.level)}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">{getSeverityIcon(alert.level)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold font-hind">{alert.title}</h3>
                  <span className="text-xs px-2 py-0.5 bg-white/10 rounded">
                    {alert.region}
                  </span>
                </div>
                <p className="text-sm font-hind">{alert.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
