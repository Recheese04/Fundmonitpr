import React from "react";
import DeptLayout from "@/components/layout/DeptLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, XCircle } from "lucide-react";

export default function Approvals() {
  const pendingRequests = [
    { id: "REQ-442", staff: "Mark Anthony", item: "Tablet for QA", amt: "₱22,000", remark: "Need mobile testing device for the new logistics module." },
    { id: "REQ-445", staff: "Sarah G.", item: "Postgres Training", amt: "₱8,500", remark: "Upskilling for database optimization tasks." }
  ];

  return (
    <DeptLayout title="Pending Approvals">
      <div className="space-y-4">
        {pendingRequests.map((req) => (
          <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-50 text-[#5D3CFE] border-indigo-100 font-bold uppercase text-[9px]">Staff Request</Badge>
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">ID: {req.id}</span>
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">{req.item}</h4>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Requested by: {req.staff}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 flex gap-3">
                <MessageSquare size={16} className="text-slate-300 mt-0.5" />
                <p className="text-xs text-slate-600 font-medium italic leading-relaxed">"{req.remark}"</p>
              </div>
            </div>
            <div className="md:w-48 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">Amount</p>
                <p className="text-xl font-black text-slate-900 tracking-tighter">{req.amt}</p>
              </div>
              <div className="flex gap-2 w-full mt-4">
                <Button variant="outline" className="flex-1 border-rose-200 text-rose-600 font-bold hover:bg-rose-50 uppercase text-[10px] h-9"><XCircle size={14} className="mr-1"/> Deny</Button>
                <Button className="flex-1 bg-emerald-600 font-bold uppercase text-[10px] h-9"><CheckCircle size={14} className="mr-1"/> Approve</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DeptLayout>
  );
}