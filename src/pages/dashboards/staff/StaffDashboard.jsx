import React from "react";
import StaffLayout from "@/components/layout/StaffLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function StaffDashboard() {
  const stats = [
    { label: "Used This Month", value: "₱12,450", icon: Wallet, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Pending Requests", value: "3", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Approved (YTD)", value: "12", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <StaffLayout title="My Dashboard">
      <div className="space-y-8">
        {/* TOP SECTION: WELCOME & QUICK ACTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-8 rounded-[2rem] text-white">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Welcome back!</h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Ready to manage your budget requests?</p>
          </div>
          <Link to="/staff-request">
            <Button className="bg-[#5D3CFE] hover:bg-[#4b2fd8] h-12 px-6 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
              <Plus size={18} className="mr-2" /> New Request
            </Button>
          </Link>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <ArrowUpRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div className="mt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* RECENT ACTIVITY PREVIEW */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Recent Activity</h3>
            <Link to="/staff-history" className="text-[10px] font-black uppercase text-indigo-600 hover:underline">View All</Link>
          </div>
          
          <div className="bg-white border-2 border-slate-50 rounded-3xl p-2">
            {[1, 2].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase">Office Supplies Requisition</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Submitted 2 days ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 tracking-tight">₱2,400.00</p>
                  <p className="text-[10px] font-black text-amber-500 uppercase">Pending</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}