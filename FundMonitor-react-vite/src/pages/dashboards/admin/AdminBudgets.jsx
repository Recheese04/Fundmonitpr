import React, { useState, useEffect } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, History, Loader2, Landmark, Filter, CheckCircle2, AlertCircle, Building2, TrendingUp, DollarSign } from "lucide-react";
import API_URL from "@/apiConfig";

export default function AdminBudgets() {
  const [totalFund, setTotalFund] = useState("");
  const [departments, setDepartments] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [isAllocating, setIsAllocating] = useState(false);
  const [budgetHistory, setBudgetHistory] = useState([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sourceOfFunds, setSourceOfFunds] = useState([]);
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [fullBudgetHistory, setFullBudgetHistory] = useState([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [newSource, setNewSource] = useState({ name: "", ay: new Date().getFullYear() });
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ deptId: "", sourceId: "", amount: "" });

  const formatPHP = (val) => new Intl.NumberFormat('en-PH', {
    style: 'currency', currency: 'PHP',
  }).format(val || 0);

  const fetchYears = async () => {
    try {
      const res = await fetch(`${API_URL}/admin_actions.php?action=get_years`);
      const data = await res.json();
      setAvailableYears(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Fetch years error:", err); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_URL}/admin_actions.php?action=get_departments`);
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Fetch depts error:", err); }
  };

  const fetchHistory = async (year = yearFilter) => {
    try {
      const yearParam = year ? `&year=${year}` : "";
      const res = await fetch(`${API_URL}/admin_actions.php?action=get_budgets${yearParam}`);
      const data = await res.json();
      setBudgetHistory(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Fetch history error:", err); }
  };

  const fetchFullHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/admin_actions.php?action=get_budgets`);
      const data = await res.json();
      setFullBudgetHistory(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Fetch full history error:", err); }
  };

  const fetchSourceOfFunds = async () => {
    try {
      const res = await fetch(`${API_URL}/admin_actions.php?action=get_source_of_funds`);
      const data = await res.json();
      setSourceOfFunds(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Fetch sources error:", err); }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchYears(), fetchDepartments(), fetchHistory(), fetchSourceOfFunds()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleYearChange = (e) => {
    const val = e.target.value;
    setYearFilter(val);
    fetchHistory(val);
  };

  const handleAllocationUpdate = (deptId, value) => {
    setAllocations(prev => ({
      ...prev,
      [deptId]: value
    }));
  };

  const handleAllocate = async () => {
    const activeAllocations = Object.entries(allocations)
      .filter(([_, amount]) => parseFloat(amount) > 0)
      .map(([deptId, amount]) => ({
        department_id: deptId,
        amount: parseFloat(amount),
        source_of_fund_id: selectedSourceId || null
      }));

    if (activeAllocations.length === 0) {
      setError("Please assign budget to at least one department");
      return;
    }

    setIsAllocating(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_URL}/admin_actions.php?action=allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: yearFilter || new Date().getFullYear(),
          allocations: activeAllocations
        })
      });
      const data = await res.json();
      if (data.success) {
        setAllocations({});
        setTotalFund("");
        fetchHistory(yearFilter);
        setSuccess(data.message);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.message || "Failed to allocate funds");
      }
    } catch (err) {
      setError("Server error communication failed");
    } finally {
      setIsAllocating(true); // Small delay feel
      setTimeout(() => setIsAllocating(false), 500);
    }
  };

  const handleAddSource = async () => {
    if (!newSource.name) return;
    try {
       const res = await fetch(`${API_URL}/admin_actions.php?action=add_source_of_fund`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSource)
       });
       const data = await res.json();
       if (data.success) {
          setSuccess("Funding source added successfully!");
          setNewSource({ name: "", ay: new Date().getFullYear() });
          setIsSourceModalOpen(false);
          fetchSourceOfFunds();
       }
    } catch (e) { setError("Failed to add source"); }
  };

  const handleIndividualTransfer = async () => {
     if (!transferForm.deptId || !transferForm.amount) return;
     setIsAllocating(true);
     try {
        const res = await fetch(`${API_URL}/admin_actions.php?action=allocate`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
              year: yearFilter,
              allocations: [{
                 department_id: transferForm.deptId,
                 amount: parseFloat(transferForm.amount),
                 source_of_fund_id: transferForm.sourceId || null
              }]
           })
        });
        const data = await res.json();
        if (data.success) {
           setSuccess("Budget transferred successfully!");
           setIsTransferModalOpen(false);
           setTransferForm({ deptId: "", sourceId: "", amount: "" });
           fetchHistory(yearFilter);
        }
     } catch (e) { setError("Transfer failed"); }
     setIsAllocating(false);
  };

  // Calculate total assigned for preview
  const totalAssigned = Object.values(allocations).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

  if (loading) {
    return (
      <UnifiedLayout title="Allocation Engine" subtitle="Initializing University Financial Control...">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#f5a82b]" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Synchronizing Ledger...</p>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout title="Budget Orchestrator" subtitle="Institutional fund distribution and fiscal planning">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .ab-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .ab-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 16px; position: relative; overflow: hidden; }
        .ab-card-dark { background: #0f172a; color: #fff; border: 1px solid #1e293b; }
        .ab-card:hover { border-color: #cbd5e1; }
        .ab-label { display: block; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
        .um-input {
          width: 100%; padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 8px;
          font-size: 13px; font-weight: 500; color: #1e293b; background: #fff;
          outline: none; transition: all 0.15s;
        }
        .um-input:focus { border-color: #f5a82b; box-shadow: 0 0 0 3px rgba(245,168,43,0.1); }
        .btn-exec {
          padding: 10px 24px; background: #0f172a; color: #fde68a; 
          border: 1px solid rgba(245,168,43,0.3); border-radius: 10px;
          font-size: 12px; font-weight: 800; cursor: pointer;
          text-transform: uppercase; letter-spacing: 0.05em;
          transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-exec:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); background: #1e293b; }
        .btn-exec:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }
        .hist-row { padding: 10px 14px; border-bottom: 1px solid #f8fafc; display: flex; justify-content: space-between; align-items: center; }
        .hist-row:last-child { border-bottom: none; }
        .hist-row:hover { background: #fafafa; }
        .dept-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
      `}</style>

      <div className="ab-root" style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 40 }}>

        {/* TOP CONTROLS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#0f172a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fde68a" }}>
              <Landmark size={18} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Allocation Engine</h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", padding: "4px 4px 4px 12px", borderRadius: 10, border: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Fiscal Year</span>
              <select 
                value={yearFilter} 
                onChange={handleYearChange}
                style={{ padding: "4px 8px", border: "none", background: "#f8fafc", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#1e293b", cursor: "pointer", outline: "none" }}
              >
                {availableYears.map(y => <option key={y.year} value={y.year}>{y.label}</option>)}
              </select>
            </div>
            
            <button onClick={() => setIsTransferModalOpen(true)} className="btn-exec" style={{ background: "#0ea5e9", color: "#fff", borderColor: "#0ea5e9" }}>
               <TrendingUp size={14} /> Transfer
            </button>
            <button onClick={() => setIsSourceModalOpen(true)} className="btn-exec" style={{ background: "#fff", color: "#64748b", border: "1px solid #e2e8f0" }}>
               <Landmark size={14} /> Sources
            </button>
          </div>
        </div>

        {/* FEEDBACK */}
        {(error || success) && (
          <div style={{
            padding: "10px 16px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600,
            background: error ? "#fff1f2" : "#f0fdf4", color: error ? "#e11d48" : "#166534", border: `1px solid ${error ? "#fda4af80" : "#bbf7d080"}`
          }}>
            {error ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
            {error || success}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
          {/* MAIN COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="ab-card" style={{ padding: 0 }}>
              <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "20px 24px", color: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em" }}>Active Distribution</span>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 0" }}>University Fund Disbursement</h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em" }}>Total to Allocate</span>
                    <p style={{ fontSize: 24, fontWeight: 800, color: "#fde68a", margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>{formatPHP(totalAssigned)}</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: 20 }}>
                <div className="dept-grid">
                  {departments.length === 0 ? (
                    <div style={{ gridColumn: "1/-1", padding: 40, textAlign: "center", background: "#f8fafc", borderRadius: 12, border: "2px dashed #e2e8f0" }}>
                      <Building2 size={24} color="#cbd5e1" style={{ marginBottom: 8 }} />
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>No active departments identified</p>
                    </div>
                  ) : departments.map((dept) => (
                    <div key={dept.id} style={{ padding: 14, background: allocations[dept.id] ? "#f0f9ff" : "#fff", border: `1px solid ${allocations[dept.id] ? "#bae6fd" : "#f1f5f9"}`, borderRadius: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: allocations[dept.id] ? "#0ea5e9" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: allocations[dept.id] ? "#fff" : "#94a3b8" }}>
                          <Building2 size={14} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dept.department_name}</span>
                      </div>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 700, color: "#cbd5e1" }}>₱</span>
                        <input
                          type="number"
                          className="um-input focus-gold"
                          style={{ paddingLeft: 22, height: 38 }}
                          placeholder="0.00"
                          value={allocations[dept.id] || ""}
                          onChange={(e) => handleAllocationUpdate(dept.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="btn-exec"
                    onClick={handleAllocate}
                    disabled={isAllocating || totalAssigned <= 0}
                  >
                    {isAllocating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        Authorize Disbursement
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="ab-card ab-card-dark">
              <span className="ab-label" style={{ color: "#64748b" }}>Control Metrics</span>
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Accumulated Allocation</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "4px 0", fontFamily: "'IBM Plex Mono', monospace" }}>{formatPHP(totalAssigned)}</p>
                <div style={{ height: 4, width: "100%", background: "#1e293b", borderRadius: 10, marginTop: 12, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#f5a82b", width: "65%", boxShadow: "0 0 10px rgba(245,168,43,0.5)" }}></div>
                </div>
              </div>

              <div style={{ marginTop: 20, padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <TrendingUp size={16} color="#10b981" />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>+8.2% vs Previous Quarter</span>
                </div>
              </div>

              <div style={{ marginTop: 16, fontSize: 10, color: "#64748b", fontWeight: 500, lineHeight: 1.5, display: "flex", gap: 8 }}>
                <Wallet size={14} style={{ flexShrink: 0 }} />
                <span>Encrypted ledger synchronization enabled. Every transaction is verifiable on the main node.</span>
              </div>
            </div>

            <div className="ab-card" style={{ padding: 0 }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc", background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <History size={14} color="#94a3b8" />
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Transfer Log</span>
                </div>
                <button
                  onClick={() => { fetchFullHistory(); setIsHistoryModalOpen(true); }}
                  style={{ background: "none", border: "none", fontSize: 10, fontWeight: 800, color: "#3b82f6", cursor: "pointer", textTransform: "uppercase" }}
                >
                  View All
                </button>
              </div>
              <div style={{ height: 260, overflowY: "auto" }}>
                {budgetHistory.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "#cbd5e1", fontSize: 11, fontWeight: 600 }}>Empty Ledger</div>
                ) : budgetHistory.map((row, i) => (
                  <div key={i} className="hist-row">
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", margin: 0, textOverflow: "ellipsis", overflow: "hidden" }}>{row.department_name}</p>
                      <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, margin: 0 }}>FY {row.budget_year}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", margin: 0 }}>{formatPHP(row.total_budget)}</p>
                      <span style={{ fontSize: 8, fontWeight: 800, color: "#10b981" }}>CONFIRMED</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INDIVIDUAL TRANSFER MODAL */}
      {isTransferModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
           <div className="ab-card" style={{ width: "100%", maxWidth: 440, padding: 0, borderRadius: 24, background: "#fff" }}>
              <div style={{ background: "#0f172a", padding: "20px 24px", color: "#fff", display: "flex", justifyContent: "space-between" }}>
                 <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Budget Dispatch</h3>
                    <p style={{ margin: 0, fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Single Node Transfer Protocol</p>
                 </div>
                 <button onClick={() => setIsTransferModalOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><History size={20} /></button>
              </div>
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                 <div>
                    <label className="ab-label">Target College / Department</label>
                    <select className="um-input" value={transferForm.deptId} onChange={e => setTransferForm({...transferForm, deptId: e.target.value})}>
                       <option value="">Select Destination</option>
                       {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="ab-label">Source of Fund</label>
                    <select className="um-input" value={transferForm.sourceId} onChange={e => setTransferForm({...transferForm, sourceId: e.target.value})}>
                       <option value="">General Fund</option>
                       {sourceOfFunds.map(s => <option key={s.id} value={s.id}>{s.name} ({s.ay})</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="ab-label">Disbursement Amount (₱)</label>
                    <input type="number" className="um-input" placeholder="0.00" value={transferForm.amount} onChange={e => setTransferForm({...transferForm, amount: e.target.value})} />
                 </div>
                 <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button onClick={() => setIsTransferModalOpen(false)} style={{ flex: 1, padding: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                    <button onClick={handleIndividualTransfer} disabled={isAllocating || !transferForm.deptId || !transferForm.amount} className="btn-exec" style={{ flex: 2, justifyContent: "center" }}>
                       {isAllocating ? "Processing..." : "Confirm Transfer"}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* SOURCE MANAGEMENT MODAL */}
      {isSourceModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
           <div className="ab-card" style={{ width: "100%", maxWidth: 500, padding: 0, borderRadius: 24, background: "#fff" }}>
              <div style={{ background: "#0f172a", padding: "20px 24px", color: "#fff", display: "flex", justifyContent: "space-between" }}>
                 <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Source of Funds Registry</h3>
                 <button onClick={() => setIsSourceModalOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><History size={20} /></button>
              </div>
              <div style={{ padding: 24 }}>
                 <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    <div style={{ flex: 2 }}>
                       <label className="ab-label">Source Name</label>
                       <input type="text" className="um-input" placeholder="e.g. Tertiary Education Subsidy" value={newSource.name} onChange={e => setNewSource({...newSource, name: e.target.value})} />
                    </div>
                    <div style={{ flex: 1 }}>
                       <label className="ab-label">Academic Year</label>
                       <input type="number" className="um-input" value={newSource.ay} onChange={e => setNewSource({...newSource, ay: e.target.value})} />
                    </div>
                    <button onClick={handleAddSource} style={{ alignSelf: "flex-end", height: 38, background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, padding: "0 16px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>ADD</button>
                 </div>

                 <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #f1f5f9", borderRadius: 12 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                       <thead style={{ background: "#fafafa" }}>
                          <tr>
                             <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #f1f5f9" }}>NAME</th>
                             <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #f1f5f9" }}>YEAR</th>
                             <th style={{ textAlign: "center", padding: 12, borderBottom: "1px solid #f1f5f9" }}>STATUS</th>
                          </tr>
                       </thead>
                       <tbody>
                          {sourceOfFunds.map(s => (
                             <tr key={s.id}>
                                <td style={{ padding: 12, borderBottom: "1px solid #f8fafc", fontWeight: 700 }}>{s.name}</td>
                                <td style={{ padding: 12, borderBottom: "1px solid #f8fafc" }}>{s.ay}</td>
                                <td style={{ padding: 12, borderBottom: "1px solid #f8fafc", textAlign: "center" }}><span style={{ fontSize: 9, fontWeight: 800, color: "#10b981", background: "#f0fdf4", padding: "2px 6px", borderRadius: 4 }}>ACTIVE</span></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* FULL HISTORY MODAL */}
      {isHistoryModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={() => setIsHistoryModalOpen(false)}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 600, borderRadius: 20, display: "flex", flexDirection: "column", maxHeight: "85vh", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Full Transfer Log</h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b", fontWeight: 600 }}>Complete history of all budget disbursements</p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} style={{ background: "none", border: "none", fontSize: 28, fontWeight: 300, color: "#94a3b8", cursor: "pointer", lineHeight: 1 }}>&times;</button>
            </div>
            <div style={{ padding: 0, overflowY: "auto", flex: 1 }}>
              {fullBudgetHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>No records found</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <tr>
                      <th style={{ textAlign: "left", padding: "12px 24px", borderBottom: "1px solid #e2e8f0", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Department</th>
                      <th style={{ textAlign: "left", padding: "12px 24px", borderBottom: "1px solid #e2e8f0", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fiscal Year</th>
                      <th style={{ textAlign: "right", padding: "12px 24px", borderBottom: "1px solid #e2e8f0", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullBudgetHistory.map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "16px 24px", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{row.department_name}</td>
                        <td style={{ padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#64748b" }}>
                          <span style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: 6 }}>FY {row.budget_year}</span>
                        </td>
                        <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 800, color: "#0f172a", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{formatPHP(row.total_budget)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </UnifiedLayout>
  );
}
