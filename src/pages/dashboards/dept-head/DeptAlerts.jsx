import React from "react";
import DeptLayout from "@/components/layout/DeptLayout";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, BellRing, Clock, Info } from "lucide-react";

export default function DeptAlerts() {
  const alerts = [
    { id: 1, type: "CRITICAL", msg: "Budget threshold exceeded in 'Software Licenses' (92%)", time: "2 hours ago", icon: AlertTriangle, color: "text-rose-600 bg-rose-50 border-rose-100" },
    { id: 2, type: "WARNING", msg: "Pending reallocation request for 'Equipment' requires review.", time: "5 hours ago", icon: BellRing, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { id: 3, type: "INFO", msg: "Monthly report for January is now available for download.", time: "1 day ago", icon: Info, color: "text-blue-600 bg-blue-50 border-blue-100" },
  ];

  return (
    <DeptLayout title="System Alerts">
      <div className="max-w-3xl space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className={`p-4 rounded-2xl border ${alert.color} flex items-start gap-4 shadow-sm`}>
            <div className="mt-1">
              <alert.icon size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{alert.type}</span>
                <div className="flex items-center gap-1 text-[10px] font-bold opacity-60 uppercase">
                  <Clock size={10} /> {alert.time}
                </div>
              </div>
              <p className="text-sm font-bold tracking-tight leading-snug">{alert.msg}</p>
            </div>
          </div>
        ))}
      </div>
    </DeptLayout>
  );
}