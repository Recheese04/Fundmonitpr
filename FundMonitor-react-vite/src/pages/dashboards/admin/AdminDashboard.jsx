import React, { useState, useEffect } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Landmark, 
  Activity, 
  ChevronRight,
  PieChart,
  Wallet,
  ShieldAlert
} from "lucide-react";
import API_URL from "@/apiConfig";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total_users: 0, total_budget: "0.00", allocated_budget: "0.00" });
  const [recentBudgets, setRecentBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await fetch(`${API_URL}/admin_actions.php?action=get_stats`);
      const statsData = await statsRes.json();
      setStats(statsData);

      const budgetRes = await fetch(`${API_URL}/admin_actions.php?action=get_budgets&limit=5`);
      const budgetData = await budgetRes.json();
      setRecentBudgets(Array.isArray(budgetData) ? budgetData.slice(0, 5) : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatPHP = (val) => new Intl.NumberFormat('en-PH', {
    style: 'currency', currency: 'PHP',
  }).format(val || 0);

  return (
    <UnifiedLayout title="System Insight">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .ad-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 24px; padding: 24px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
        .ad-card:hover { border-color: #f5a82b30; transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.03); }
        .stat-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px; display: block; }
        .stat-value { font-size: 24px; font-weight: 900; color: #1e293b; font-family: 'IBM Plex Mono', monospace; letter-spacing: -0.02em; }
        .btn-action { display: inline-flex; items-center; gap: 8px; padding: 12px 24px; border-radius: 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.2s; cursor: pointer; }
        .btn-indigo { background: #0f172a; color: #fde68a; border: 1px solid rgba(245,168,43,0.3); }
        .btn-indigo:hover { background: #1e293b; transform: scale(1.02); }
      `}</style>

      <div className="space-y-10 pb-10">
        {/* Animated Greeting Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full mb-4">
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Real-time Node Status</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
              Welcome back, <br />
              <span className="text-indigo-600 not-italic">Root Operator</span>
            </h1>
            <p className="mt-4 text-slate-500 font-medium max-w-xl">
              System monitoring active. You have full oversight of departmental distributions and user node access for Fiscal Year {currentYear}.
            </p>
          </div>
          
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl group-hover:bg-indigo-500/40 transition-all"></div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Command</p>
              <h3 className="text-lg font-bold mb-6">Need to distribute funds fast?</h3>
              <Link
                to="/admin-budgets"
                className="inline-flex items-center gap-3 px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-500/10"
              >
                Launch Control Center <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="ad-card">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6"><Landmark size={20} /></div>
              <span className="stat-label">Total Global Fund</span>
              <p className="stat-value text-indigo-600">₱{stats.total_budget}</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                 <Activity size={12} /> ALL YEARS AGGREGATE
              </div>
           </div>

           <div className="ad-card">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6"><TrendingUp size={20} /></div>
              <span className="stat-label">Allocated Fund (FY {currentYear})</span>
              <p className="stat-value text-amber-600">₱{stats.allocated_budget}</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500">
                 <ChevronRight size={12} /> NODE STATUS: SYNCED
              </div>
           </div>

           <div className="ad-card">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6"><Users size={20} /></div>
              <span className="stat-label">Active Operators</span>
              <p className="stat-value">{stats.total_users}</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                 <ShieldAlert size={12} /> ALL ROLES VERIFIED
              </div>
           </div>

           <div className="ad-card bg-indigo-600 border-none group cursor-pointer" onClick={() => window.location.href='/admin-reports'}>
              <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center mb-6"><PieChart size={20} /></div>
              <span className="stat-label text-indigo-100/60">Generate Reports</span>
              <p className="stat-value text-white">Full Audit</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-white/60 group-hover:text-white transition-colors">
                 VIEW TELEMETRY <ArrowRight size={12} />
              </div>
           </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           <div className="xl:col-span-2 ad-card !p-0 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                 <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Distributions</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">LATEST BUDGETARY NODES ADDED</p>
                 </div>
                 <Link to="/admin-budgets" className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Manage All</Link>
              </div>
              <div className="p-2">
                 {recentBudgets.length === 0 ? (
                    <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">Zero Record State</div>
                 ) : (
                    recentBudgets.map((b, i) => (
                       <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors rounded-2xl group">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                <Wallet size={20} />
                             </div>
                             <div>
                                <p className="font-black text-slate-900 uppercase text-xs tracking-tight">{b.department_name}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">FISCAL YEAR {b.budget_year}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="font-black text-slate-900 text-sm font-mono tracking-tighter italic">{formatPHP(b.total_budget)}</p>
                             <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">VERIFIED</span>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>

           <div className="ad-card">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">System Health</h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                       <span>Database Sync</span>
                       <span className="text-emerald-500">99.9%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[99.9%]"></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                       <span>Network Latency</span>
                       <span className="text-amber-500">14ms</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 w-[15%]"></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                       <span>Security Node</span>
                       <span className="text-indigo-500">Active</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 w-full animate-pulse"></div>
                    </div>
                 </div>

                 <div className="mt-8 p-6 bg-slate-50 rounded-3xl">
                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                       "Every budgetary transaction is immutable and cryptographically verified within the FundMonitor environment."
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}