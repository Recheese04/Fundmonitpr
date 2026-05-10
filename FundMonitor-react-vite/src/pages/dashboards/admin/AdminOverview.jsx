import React, { useState, useEffect } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Wallet, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import API_URL from "@/apiConfig";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell
} from 'recharts';

// Mock data for charts
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
    <div className="um-card" style={{ padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>{title}</p>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 10, fontWeight: 700, color: trendUp ? "#10b981" : "#94a3b8" }}>
            {trendUp ? <ArrowUpRight size={12} /> : <Activity size={12} />}
            {trend}
          </div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState({ total_users: 0, total_budget: "0.00", allocated_budget: "0.00" });

  useEffect(() => {
    fetch(`${API_URL}/admin_actions.php?action=get_stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error loading stats:", err));
  }, []);

  return (
    <UnifiedLayout title="Node Telemetry" subtitle="Real-time system health and data persistence">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .ao-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .um-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 18px 20px; transition: transform 0.2s, box-shadow 0.2s; }
        .um-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.06); }
        .chart-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 18px; padding: 20px; }
        .chart-card-dark { background: #0f172a; border-color: #1e293b; color: #fff; }
      `}</style>

      <div className="ao-root" style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 40 }}>
        
        {/* STATS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <StatsCard
            title="Total Budget"
            value={`₱${stats.total_budget}`}
            icon={<TrendingUp size={18} />}
            trend="+12% from last year"
            trendUp={true}
          />
          <StatsCard
            title="Allocated Funds"
            value={`₱${stats.allocated_budget}`}
            icon={<Wallet size={18} />}
            trend="84% of total"
            trendUp={false}
          />
          <StatsCard
            title="System Users"
            value={stats.total_users}
            icon={<Users size={18} />}
            trend="Active sessions now"
            trendUp={true}
          />
        </div>

        {/* CHARTS SECTION */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* BAR CHART */}
          <div className="chart-card">
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Departmental Spending</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", margin: "2px 0" }}>Budget vs Expenses</p>
            </div>
            <div style={{ height: 240, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '10px' }}
                  />
                  <Bar dataKey="spent" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AREA CHART */}
          <div className="chart-card chart-card-dark">
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Resource Utilization</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", margin: "2px 0" }}>System growth & activity</p>
            </div>
            <div style={{ height: 240, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fde68a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#fde68a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '10px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="spent" stroke="#fde68a" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}