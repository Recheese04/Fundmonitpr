import React from "react";
import DeptLayout from "@/components/layout/DeptLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, Clock, TrendingUp, Plus, 
  FileText, CheckCircle2, AlertCircle, MoreHorizontal
} from "lucide-react";

export default function DeptOverview() {
  return (
    <DeptLayout 
      title="Department Overview" 
      actions={
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 font-bold">
          <Plus size={18} className="mr-2" /> New Expense Request
        </Button>
      }
    >
      <div className="space-y-6">
        
        {/* TOP STATS CARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Available Funds", val: "₱325,000.00", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50", sub: "65% of total budget" },
            { label: "Total Spent", val: "₱175,000.00", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50", sub: "12 approved requests" },
            { label: "Pending Approvals", val: "03", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", sub: "Requires your attention" }
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}><s.icon size={24}/></div>
                <Badge variant="outline" className="text-[10px] font-bold border-slate-200">LIVE</Badge>
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">{s.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{s.val}</h3>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" /> {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* MIDDLE SECTION: UTILIZATION & RECENT ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* BUDGET PROGRESS */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900">Budget Utilization Tracking</h3>
              <span className="text-sm font-bold text-indigo-600 tracking-tight">35.0% Used</span>
            </div>
            <Progress value={35} className="h-3 bg-slate-100 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Allocated</p>
                <p className="text-sm font-bold text-slate-900">₱500,000</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Committed</p>
                <p className="text-sm font-bold text-slate-900">₱45,000</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Remaining</p>
                <p className="text-sm font-bold text-emerald-600">₱325,000</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Forecast</p>
                <p className="text-sm font-bold text-slate-900">On Track</p>
              </div>
            </div>
          </div>

          {/* QUICK ALERTS */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-indigo-400" /> System Alerts
              </h3>
              <div className="space-y-4">
                <div className="border-l-2 border-indigo-500 pl-3">
                  <p className="text-xs font-bold text-indigo-300">Pending Action</p>
                  <p className="text-sm text-slate-300">Quarterly report is due in 3 days.</p>
                </div>
                <div className="border-l-2 border-emerald-500 pl-3">
                  <p className="text-xs font-bold text-emerald-300">Budget Status</p>
                  <p className="text-sm text-slate-300">Spending is 12% below projections.</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 text-white/5 rotate-12">
              <FileText size={120} />
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: EXPENDITURE TABLE */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Recent Expenditures</h3>
            <Button variant="ghost" size="sm" className="text-indigo-600 font-bold text-xs">View All</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Description</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Category</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Amount</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { desc: "Dell XPS 15 Laptop", cat: "Equipment", amt: "₱85,000", status: "Approved", sColor: "text-emerald-600 bg-emerald-50" },
                  { desc: "Adobe Creative Cloud", cat: "Software", amt: "₱4,500", status: "Pending", sColor: "text-amber-600 bg-amber-50" },
                  { desc: "Office Furniture", cat: "Facilities", amt: "₱12,300", status: "Approved", sColor: "text-emerald-600 bg-emerald-50" }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{row.desc}</td>
                    <td className="px-6 py-4"><Badge variant="secondary" className="text-[10px] font-bold">{row.cat}</Badge></td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900">{row.amt}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${row.sColor}`}>{row.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><MoreHorizontal size={14}/></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DeptLayout>
  );
}