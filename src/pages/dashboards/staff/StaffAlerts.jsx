import React from "react";
import StaffLayout from "@/components/layout/StaffLayout";
import { Bell, CheckCircle, Info } from "lucide-react";

export default function StaffAlerts() {
  const alerts = [
    { title: "Request Approved", desc: "Your request REQ-901 (Logitech Mouse) has been approved by the Dept Head.", type: "success", time: "1 hour ago" },
    { title: "Quarterly Deadline", desc: "All Q1 reimbursement requests must be submitted by March 15.", type: "info", time: "2 days ago" },
  ];

  return (
    <StaffLayout title="Notifications">
      <div className="max-w-2xl space-y-4">
        {alerts.map((alert, i) => (
          <div key={i} className="bg-white border-2 border-slate-100 p-5 rounded-2xl flex gap-4 items-start hover:border-indigo-200 transition-colors cursor-pointer">
            <div className={`p-2 rounded-xl ${alert.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              {alert.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-black text-slate-900 text-sm uppercase">{alert.title}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{alert.time}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{alert.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </StaffLayout>
  );
}