import React, { useState, useEffect } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import { 
  Wallet, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingUp, 
  RefreshCw,
  Activity
} from "lucide-react";
import API_URL from "@/apiConfig";

export default function StaffDashboard() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({ used: 0, pending: 0, approved: 0 });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch(`${API_URL}/expenses.php?action=get_user_stats&user_id=${user?.user_id || user?.id}&year=${currentYear}`);
      const statsJson = await statsRes.json();

      // Fetch recent expenses
      const expensesRes = await fetch(`${API_URL}/expenses.php?action=get_user_expenses&user_id=${user?.user_id || user?.id}&limit=5`);
      const expensesJson = await expensesRes.json();

      if (statsJson.success) setStatsData(statsJson.stats);
      if (expensesJson.success) setRecentExpenses(expensesJson.expenses);

    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { label: "Used This Year", value: formatCurrency(statsData.used), icon: Wallet, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Pending Requests", value: statsData.pending.toString(), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Approved (YTD)", value: statsData.approved.toString(), icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  function formatCurrency(val) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(val || 0);
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <UnifiedLayout 
      title="Asset Registry" 
      subtitle="Personal expenditure telemetry & resource nodes"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .sd-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .sd-welcome { background: #0f172a; border-radius: 20px; padding: 24px 32px; color: #fff; display: flex; justify-content: space-between; align-items: center; position: relative; overflow: hidden; border: 1px solid rgba(245,168,43,0.2); }
        .sd-welcome h2 { font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -0.02em; color: #fde68a; }
        .sd-welcome p { font-size: 11px; color: #94a3b8; margin: 4px 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
        .btn-quick { background: #0f172a; color: #fde68a; border: 1px solid rgba(245,168,43,0.4); padding: 10px 20px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; cursor: pointer; transition: all 0.2s; z-index: 10; }
        .btn-quick:hover { background: #1e293b; transform: translateY(-1px); box-shadow: 0 4px 15px rgba(245,168,43,0.1); }
        .sd-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 16px; padding: 20px; transition: all 0.2s; }
        .sd-card:hover { border-color: #fde68a; transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        .sd-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
        .sd-value { font-size: 22px; font-weight: 800; color: #1e293b; font-family: 'IBM Plex Mono', monospace; }
        .sd-icon-box { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
      `}</style>

      <div className="sd-root" style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 40 }}>
        {/* Welcome Block */}
        <div className="sd-welcome">
          <div style={{ zIndex: 10 }}>
            <h2>Systems Operational, {user?.full_name?.split(' ')[0] || 'Staff'}</h2>
            <p>Telemetry sync complete • Fiscal Year {currentYear}</p>
          </div>
          <button className="btn-quick" onClick={() => window.location.href='/staff-budget-tracker?new=true'}>
            Initialize Dispatch
          </button>
          <div style={{ position: "absolute", right: -20, top: -20, opacity: 0.1 }}>
             <Activity size={120} color="#fff" />
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {dashboardStats.map((stat, idx) => (
            <div key={idx} className="sd-card">
              <div className={`sd-icon-box ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <p className="sd-label">{stat.label}</p>
              <p className="sd-value">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="sd-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f8fafc", background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={14} color="#94a3b8" />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Activity Feed</span>
            </div>
            <ArrowUpRight size={14} color="#cbd5e1" />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recentExpenses.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#cbd5e1", fontSize: 12, fontWeight: 700 }}>ZERO ACTIVITY DATA</div>
            ) : (
              recentExpenses.map((expense, i) => (
                <div key={i} style={{ padding: "14px 24px", borderBottom: i < recentExpenses.length -1 ? "1px solid #f8fafc" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>{expense.description}</p>
                    <p style={{ fontSize: 10, color: "#94a3b8", margin: "2px 0 0", fontWeight: 600 }}>{expense.category_name} • {new Date(expense.created_at).toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#000", margin: "0 0 4px", fontFamily: "'IBM Plex Mono', monospace" }}>{formatCurrency(expense.amount)}</p>
                    <p style={{ fontSize: 9, fontWeight: 800, color: getStatusColor(expense.status).includes('text-amber-600') ? '#f59e0b' : getStatusColor(expense.status).includes('text-emerald-600') ? '#10b981' : '#ef4444', textTransform: "uppercase", margin: 0 }}>{expense.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}