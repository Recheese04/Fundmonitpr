import React from "react";
import StaffLayout from "@/components/layout/StaffLayout";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function StaffHistory() {
  const history = [
    { id: "REQ-901", item: "Logitech MX Master 3S", date: "Jan 12, 2026", amt: "₱6,500", status: "Approved" },
    { id: "REQ-905", item: "Vercel Pro Subscription", date: "Jan 20, 2026", amt: "₱1,200", status: "Pending" },
    { id: "REQ-882", item: "Office Chair Repair", date: "Dec 15, 2025", amt: "₱2,000", status: "Denied" },
  ];

  return (
    <StaffLayout title="Request History">
      <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Request Details</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="p-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {history.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <p className="font-black text-slate-900 uppercase text-sm">{req.item}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{req.id} • {req.date}</p>
                </td>
                <td className="p-6 font-black text-slate-900">{req.amt}</td>
                <td className="p-6">
                  <Badge className={`
                    font-black uppercase text-[9px] px-3 py-1 rounded-full
                    ${req.status === "Approved" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : 
                      req.status === "Pending" ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : 
                      "bg-rose-100 text-rose-700 hover:bg-rose-100"}
                  `}>
                    {req.status}
                  </Badge>
                </td>
                <td className="p-6 text-right">
                  <button className="text-slate-400 hover:text-indigo-600 transition-colors"><Eye size={20}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StaffLayout>
  );
}