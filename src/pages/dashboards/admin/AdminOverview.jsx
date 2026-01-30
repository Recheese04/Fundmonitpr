import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Wallet, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell 
} from 'recharts';

// Mock data for charts - in a real app, you'd fetch this from PHP
const chartData = [
  { name: 'Jan', budget: 4000, spent: 2400 },
  { name: 'Feb', budget: 3000, spent: 1398 },
  { name: 'Mar', budget: 2000, spent: 9800 },
  { name: 'Apr', budget: 2780, spent: 3908 },
  { name: 'May', budget: 1890, spent: 4800 },
  { name: 'Jun', budget: 2390, spent: 3800 },
];

function StatsCard({ title, value, icon, trend, trendUp }) {
  return (
    <Card className="border-2 border-slate-200 rounded-3xl p-6 shadow-none hover:border-indigo-200 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-900">{value}</h3>
          <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trendUp ? 'text-emerald-500' : 'text-slate-400'}`}>
            {trendUp ? <ArrowUpRight size={14}/> : <Activity size={14}/>}
            {trend}
          </div>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-100">{icon}</div>
      </div>
    </Card>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState({ total_users: 0, total_budget: "0.00", allocated_budget: "0.00" });

  useEffect(() => {
    fetch("http://localhost/fundmonitor-api/admin_actions.php?action=get_stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error loading stats:", err));
  }, []);

  return (
    <DashboardLayout>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">Executive Dashboard</h1>
          <p className="text-slate-500 font-bold">University Fund Monitoring & Resource Planning</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 border border-slate-200">
            FY 2025/26
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Total Budget" 
          value={`₱${stats.total_budget}`} 
          icon={<TrendingUp className="text-emerald-500"/>} 
          trend="+12% from last year"
          trendUp={true}
        />
        <StatsCard 
          title="Allocated Funds" 
          value={`₱${stats.allocated_budget}`} 
          icon={<Wallet className="text-indigo-500"/>} 
          trend="84% of total"
          trendUp={false}
        />
        <StatsCard 
          title="System Users" 
          value={stats.total_users} 
          icon={<Users className="text-blue-500"/>} 
          trend="Active sessions now"
          trendUp={true}
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BAR CHART */}
        <Card className="border-2 border-slate-200 rounded-[2rem] p-6 shadow-none overflow-hidden">
          <div className="mb-6">
            <h4 className="font-black uppercase text-xs tracking-widest text-slate-400">Departmental Spending</h4>
            <p className="text-sm font-bold text-slate-600">Monthly Budget vs. Actual Expenses</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#64748b'}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                />
                <Bar dataKey="spent" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={30} />
                <Bar dataKey="budget" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* AREA CHART */}
        <Card className="border-2 border-slate-200 rounded-[2rem] p-6 shadow-none overflow-hidden bg-slate-900 text-white">
          <div className="mb-6">
            <h4 className="font-black uppercase text-xs tracking-widest text-slate-500">Resource Utilization</h4>
            <p className="text-sm font-bold text-slate-300">System growth & user activity</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip />
                <Area type="monotone" dataKey="spent" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorSpent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}