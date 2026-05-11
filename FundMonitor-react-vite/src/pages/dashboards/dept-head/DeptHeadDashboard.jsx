import React, { useState, useEffect } from 'react';
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import { Wallet, PieChart, Activity, Building2, TrendingUp, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import API_URL from "@/apiConfig";

const DeptHeadDashboard = () => {
  const [budgetData, setBudgetData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const formatPHP = (val) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

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
        console.error("Dashboard fetch error:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <UnifiedLayout title="Strategic Command" subtitle="Synchronizing Department Data...">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 100, color: '#94a3b8' }}>
          <Activity className="animate-pulse" size={32} />
        </div>
      </UnifiedLayout>
    );
  }

  // Calculate Metrics
  const totalBudget = budgetData ? parseFloat(budgetData.raw_allocated || budgetData.department_budget?.replace(/[^0-9.-]+/g,"")) : 0;
  const approvedExpenses = expenses.filter(e => e.status === 'approved').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const remainingBudget = totalBudget - approvedExpenses;
  const utilizationRate = totalBudget > 0 ? ((approvedExpenses / totalBudget) * 100).toFixed(1) : 0;

  return (
    <UnifiedLayout title="Strategic Command">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600;700&display=swap');
        .dh-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .dh-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 20px; overflow: hidden; }
        .dh-stat { padding: 24px; }
        .dh-stat-val { font-family: 'IBM Plex Mono', monospace; font-size: 28px; font-weight: 700; color: #0f172a; margin: 8px 0 4px; letter-spacing: -0.02em; }
        .dh-stat-label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
        .dh-chart-bar { height: 8px; border-radius: 4px; background: #e2e8f0; overflow: hidden; margin-top: 12px; }
        .dh-chart-fill { height: 100%; border-radius: 4px; background: #0f172a; }
      `}</style>

      <div className="dh-root" style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>
        
        {/* WELCOME BANNER */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: 20, padding: 32, color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -40, opacity: 0.05, transform: 'rotate(-15deg)' }}>
            <Building2 size={200} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>DEPARTMENT FISCAL STATUS</span>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '4px 0 16px' }}>FY {new Date().getFullYear()} Allocation Overview</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#cbd5e1', fontWeight: 600 }}>Total Department Fund</p>
              <h1 style={{ margin: 0, fontSize: 42, fontWeight: 700, color: '#fde68a', fontFamily: "'IBM Plex Mono', monospace" }}>{formatPHP(totalBudget)}</h1>
            </div>
            <div style={{ paddingBottom: 8 }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                {utilizationRate}% Utilized
              </span>
            </div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <div className="dh-card dh-stat">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="dh-stat-label">Available Balance</span>
              <div style={{ width: 32, height: 32, background: '#f0fdf4', color: '#16a34a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={16} />
              </div>
            </div>
            <div className="dh-stat-val">{formatPHP(remainingBudget)}</div>
            <div className="dh-chart-bar"><div className="dh-chart-fill" style={{ width: `${100 - utilizationRate}%`, background: '#16a34a' }}></div></div>
          </div>
          
          <div className="dh-card dh-stat">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="dh-stat-label">Disbursed Funds</span>
              <div style={{ width: 32, height: 32, background: '#f8fafc', color: '#64748b', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="dh-stat-val">{formatPHP(approvedExpenses)}</div>
            <div className="dh-chart-bar"><div className="dh-chart-fill" style={{ width: `${utilizationRate}%`, background: '#64748b' }}></div></div>
          </div>
          
          <div className="dh-card dh-stat">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="dh-stat-label">Pending Authorizations</span>
              <div style={{ width: 32, height: 32, background: '#fffbeb', color: '#d97706', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} />
              </div>
            </div>
            <div className="dh-stat-val">{formatPHP(pendingExpenses)}</div>
            <div style={{ marginTop: 12, fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>Awaiting your approval</div>
          </div>
        </div>

        {/* BUDGET BREAKDOWN & RECENT REQUESTS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* CATEGORY BREAKDOWN */}
          <div className="dh-card">
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
              <PieChart size={16} color="#94a3b8" />
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fund Distribution</h3>
            </div>
            <div style={{ padding: 24 }}>
              {(!budgetData || !budgetData.allocations || budgetData.allocations.length === 0) ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>No specific categories configured for this fiscal year.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {budgetData.allocations.map((cat, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{cat.category}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: "'IBM Plex Mono', monospace" }}>{cat.allocated}</span>
                      </div>
                      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#3b82f6', width: `${cat.allocation_percentage}%` }}></div>
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', marginTop: 4, textAlign: 'right' }}>{cat.allocation_percentage}% OF TOTAL</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RECENT REQUESTS */}
          <div className="dh-card">
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} color="#94a3b8" />
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Activity</h3>
            </div>
            <div style={{ padding: 0 }}>
              {expenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>No requests submitted yet.</div>
              ) : (
                expenses.slice(0, 5).map(e => (
                  <div key={e.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{e.description}</h4>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{e.staff_name} • {new Date(e.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: "'IBM Plex Mono', monospace" }}>{formatPHP(e.amount)}</div>
                      <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4, background: e.status === 'approved' ? '#f0fdf4' : e.status === 'rejected' ? '#fef2f2' : '#fffbeb', color: e.status === 'approved' ? '#16a34a' : e.status === 'rejected' ? '#dc2626' : '#d97706' }}>
                        {e.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default DeptHeadDashboard;
