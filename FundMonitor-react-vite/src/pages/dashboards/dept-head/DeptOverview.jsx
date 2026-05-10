import React, { useState, useEffect } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import {
  Wallet, Clock, TrendingUp, Plus,
  FileText, CheckCircle2, AlertCircle, MoreHorizontal, Activity
} from "lucide-react";
import API_URL from "@/apiConfig";
import { useNavigate } from "react-router-dom";

const fmt = (v) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 0 }).format(v || 0);

export default function DeptOverview() {
  const [budgetData, setBudgetData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const year = new Date().getFullYear();
        const deptId = user.department_id || 0;

        // Fetch Budget Allocation
        const budgetRes = await fetch(`${API_URL}/allocate.php?department_id=${deptId}&year=${year}`);
        const budgetResult = await budgetRes.json();
        if (budgetResult.success) {
          setBudgetData(budgetResult);
        }

        // Fetch Department Expenses
        const expRes = await fetch(`${API_URL}/dept_expenses.php?action=get_reports&department_id=${deptId}`);
        const expResult = await expRes.json();
        if (expResult.success) {
          setExpenses(expResult.data || []);
        }
      } catch (err) {
        console.error("Overview fetch error:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <UnifiedLayout title="Department Overview" subtitle="Synchronizing Operational Data...">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 100, color: '#94a3b8' }}>
          <Activity className="animate-pulse" size={32} />
        </div>
      </UnifiedLayout>
    );
  }

  // Derived metrics
  const totalBudget = budgetData ? parseFloat(budgetData.raw_allocated || budgetData.department_budget?.replace(/[^0-9.-]+/g,"")) : 0;
  const approvedExpensesList = expenses.filter(e => e.status === 'approved');
  const pendingExpensesList = expenses.filter(e => e.status === 'pending');
  const rejectedExpensesList = expenses.filter(e => e.status === 'rejected');

  const approvedAmount = approvedExpensesList.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const pendingAmount = pendingExpensesList.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const remainingBudget = totalBudget - approvedAmount;
  
  const utilizationRate = totalBudget > 0 ? ((approvedAmount / totalBudget) * 100).toFixed(1) : 0;

  const STATS = [
    { label: "Available Funds", value: fmt(remainingBudget), icon: Wallet, sub: `${(100 - utilizationRate).toFixed(1)}% of total budget`, accent: "#22c55e" },
    { label: "Total Spent", value: fmt(approvedAmount), icon: TrendingUp, sub: `${approvedExpensesList.length} approved requests`, accent: "#f5a82b" },
    { label: "Pending Approvals", value: String(pendingExpensesList.length).padStart(2, '0'), icon: Clock, sub: "Requires your attention", accent: "#f87171" },
  ];

  const BUDGET_STATS = [
    { label: "Allocated", value: fmt(totalBudget), color: "#94a3b8" },
    { label: "Committed", value: fmt(approvedAmount), color: "#94a3b8" },
    { label: "Remaining", value: fmt(remainingBudget), color: "#22c55e" },
    { label: "Forecast", value: "On Track", color: "#f5a82b" },
  ];

  return (
    <UnifiedLayout title="Department Overview" subtitle={`Fiscal Year ${new Date().getFullYear()}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .dept-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .stat-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 16px; padding: 22px 24px; transition: box-shadow 0.2s ease, transform 0.2s ease; }
        .stat-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.07); transform: translateY(-2px); }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; background: #0f172a; color: #fde68a;
          border: 1px solid rgba(245,168,43,0.3); border-radius: 10px;
          font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap;
          transition: background 0.15s ease, box-shadow 0.15s ease;
          font-family: 'Outfit', sans-serif;
        }
        .btn-primary:hover { background: #1e293b; box-shadow: 0 4px 16px rgba(245,168,43,0.15); }
        .btn-ghost {
          background: transparent; border: none; color: #f5a82b;
          font-size: 12px; font-weight: 700; cursor: pointer; padding: 6px 12px;
          border-radius: 7px; transition: background 0.15s;
          font-family: 'Outfit', sans-serif;
        }
        .btn-ghost:hover { background: #fefce8; }
        .progress-track { height: 6px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
        .progress-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #f5a82b, #fbbf24);
          box-shadow: 0 0 10px rgba(245,168,43,0.3);
        }
        .status-approved { background: #f0fdf4; color: #16a34a; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
        .status-pending  { background: #fffbeb; color: #d97706; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
        .status-rejected { background: #fef2f2; color: #dc2626; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
        .cat-badge { background: #f8fafc; border: 1px solid #e2e8f0; color: #475569; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
        tr:hover td { background: #fafafa; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .dept-root > * { animation: fadeUp 0.3s ease both; }
      `}</style>

      <div className="dept-root" style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 48 }}>

        {/* PAGE HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
              Operational Overview
            </h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 }}>
              Real-time fiscal snapshot — FY {new Date().getFullYear()}
            </p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/dept-head/approvals')}>
            <Clock size={15} />
            Review Pending Requests
          </button>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {STATS.map((s, i) => (
            <div key={i} className="stat-card" style={{ animationDelay: `${i * 60}ms` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${s.accent}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <s.icon size={18} color={s.accent} strokeWidth={2} />
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "#94a3b8",
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  padding: "2px 8px", borderRadius: 5, textTransform: "uppercase", letterSpacing: "0.06em",
                }}>Live</span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {s.label}
              </p>
              <p style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "-0.02em" }}>
                {s.value}
              </p>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, display: "flex", alignItems: "center", gap: 5 }}>
                <CheckCircle2 size={12} color={s.accent} />
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* MIDDLE ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>

          {/* Budget utilization */}
          <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "22px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Budget Utilization</p>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#f5a82b", fontFamily: "'IBM Plex Mono', monospace" }}>{utilizationRate}% used</span>
            </div>
            <div className="progress-track" style={{ marginBottom: 20 }}>
              <div className="progress-fill" style={{ width: `${utilizationRate}%` }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {BUDGET_STATS.map((b, i) => (
                <div key={i}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>{b.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: b.color, margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>{b.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts panel */}
          <div style={{
            background: "#0f172a", borderRadius: 16, padding: "22px 24px",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", bottom: -20, right: -20, opacity: 0.04 }}>
              <FileText size={120} color="#fff" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={16} color="#f5a82b" />
              Alerts
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ borderLeft: "2px solid #f5a82b", paddingLeft: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#f5a82b", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>Pending Actions</p>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>You have {pendingExpensesList.length} request(s) awaiting approval.</p>
              </div>
              <div style={{ borderLeft: "2px solid #22c55e", paddingLeft: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>Budget Status</p>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>{remainingBudget < totalBudget * 0.2 ? "Approaching budget limits." : "Spending is within normal limits."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* EXPENDITURE TABLE */}
        <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Recent Expenditures</p>
            <button className="btn-ghost" onClick={() => navigate('/dept-head/approvals')}>View all →</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Description", "Category", "Staff", "Amount", "Status", ""].map((h, i) => (
                    <th key={i} style={{
                      padding: "10px 24px", textAlign: i === 5 ? "right" : "left",
                      fontSize: 10, fontWeight: 700, color: "#94a3b8",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                      borderBottom: "1px solid #f1f5f9",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>No recent expenditures</td></tr>
                ) : (
                  expenses.slice(0, 5).map((row, i) => (
                    <tr key={row.id} style={{ borderBottom: i < 4 ? "1px solid #f8fafc" : "none", transition: "background 0.1s" }}>
                      <td style={{ padding: "14px 24px", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{row.description}</td>
                      <td style={{ padding: "14px 24px" }}><span className="cat-badge">{row.subcategory_name || 'General'}</span></td>
                      <td style={{ padding: "14px 24px", fontSize: 12, color: "#64748b" }}>{row.staff_name}</td>
                      <td style={{ padding: "14px 24px", fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(row.amount)}</td>
                      <td style={{ padding: "14px 24px" }}>
                        <span className={`status-${row.status.toLowerCase()}`}>{row.status}</span>
                      </td>
                      <td style={{ padding: "14px 24px", textAlign: "right" }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", padding: 4, borderRadius: 6 }}>
                          <MoreHorizontal size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </UnifiedLayout>
  );
}