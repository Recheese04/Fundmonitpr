import React, { useState, useEffect } from "react";
import API_URL from "@/apiConfig";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import { RefreshCw } from "lucide-react";

// --- HELPERS ---
const fmt = (v) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(v || 0);

const fmtCompact = (v) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", notation: "compact", maximumFractionDigits: 1 }).format(v || 0);

// --- SUBCOMPONENTS ---

function ModeTab({ active, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 18px", fontSize: 12, fontWeight: 700,
      borderRadius: 6, border: "none", cursor: "pointer",
      transition: "all 0.15s ease",
      background: active ? "#0f172a" : "transparent",
      color: active ? "#fde68a" : "#94a3b8",
      fontFamily: "inherit",
    }}>{label}</button>
  );
}

function BarRow({ label, pct }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#d97706", fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
      </div>
      <div style={{ height: 4, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: "linear-gradient(90deg, #f5a82b, #fbbf24)",
          borderRadius: 99,
          transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 0 6px rgba(245,168,43,0.3)",
        }} />
      </div>
    </div>
  );
}

function LedgerRow({ item, index, total }) {
  const [hovered, setHovered] = useState(false);
  const parts = (item.allocated || "0.00").split(".");
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "12px 14px", borderRadius: 10,
        background: hovered ? "#fffbeb" : "transparent",
        border: `1px solid ${hovered ? "rgba(245,168,43,0.25)" : "transparent"}`,
        transition: "all 0.15s ease", cursor: "default",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.08em", margin: "0 0 2px", fontFamily: "monospace" }}>
            #{String(total - index).padStart(3, "0")}
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.department}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
          <span style={{
            display: "inline-block", fontSize: 10, fontWeight: 700,
            color: "#d97706", background: "#fffbeb",
            padding: "2px 8px", borderRadius: 5, marginBottom: 4,
          }}>{item.allocation_percentage.toFixed(0)}% share</span>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a", fontVariantNumeric: "tabular-nums", lineHeight: 1, fontFamily: "'IBM Plex Mono', monospace" }}>
            {parts[0]}<span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>.{parts[1]}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function FeedbackBox({ type, message }) {
  const c = type === "error"
    ? { bg: "#fff1f2", border: "#fecdd3", dot: "#e11d48", text: "#9f1239", label: "Error" }
    : { bg: "#fffbeb", border: "rgba(245,168,43,0.3)", dot: "#f5a82b", text: "#92400e", label: "Success" };
  return (
    <div style={{
      padding: "13px 16px", background: c.bg,
      border: `1px solid ${c.border}`, borderRadius: 10,
      display: "flex", alignItems: "flex-start", gap: 12,
      marginTop: 16, animation: "fadeIn 0.2s ease",
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, flexShrink: 0, marginTop: 4 }} />
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: c.text, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.07em" }}>{c.label}</p>
        <p style={{ fontSize: 13, color: c.text, margin: 0 }}>{message}</p>
      </div>
    </div>
  );
}

function ResultGrid({ breakdowns }) {
  return (
    <div style={{ marginTop: 18, padding: 18, background: "#fffbeb", border: "1px solid rgba(245,168,43,0.2)", borderRadius: 12 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>Allocation breakdown</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {breakdowns.map((item, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid rgba(245,168,43,0.15)", borderRadius: 10, padding: "13px 15px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.category}</p>
            <p style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: "0 0 7px", fontFamily: "'IBM Plex Mono', monospace" }}>{item.amount}</p>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#d97706", background: "#fffbeb", padding: "2px 7px", borderRadius: 5 }}>
              {item.percentage} of total
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function BudgetAllocation() {
  const [mode, setMode] = useState("auto");
  const [amount, setAmount] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredSubs, setFilteredSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [userDeptId, setUserDeptId] = useState(0);
  const [userDeptName, setUserDeptName] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserDeptId(user.department_id || 0);
      setUserDeptName(user.department_name || "Unnamed Department");
    }
    fetchHistory(); fetchCategories(); fetchYears();
  }, []);

  useEffect(() => { fetchHistory(yearFilter); fetchCategories(yearFilter); }, [yearFilter]);

  useEffect(() => {
    if (selectedCategory) {
      const cat = categories.find((c) => c.id.toString() === selectedCategory.toString());
      setFilteredSubs(cat?.subcategories || []);
      setSelectedSubcategory("");
    } else {
      setFilteredSubs([]); setSelectedSubcategory("");
    }
  }, [selectedCategory, categories]);

  const fetchCategories = async (year = yearFilter) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.department_id) return;
      const res = await fetch(`${API_URL}/categories.php?action=get_categories&department_id=${user.department_id}&year=${year}`);
      const data = await res.json();
      if (data.success) setCategories(data.categories || []);
    } catch (e) { console.error(e); }
  };

  const fetchYears = async () => {
    try {
      const res = await fetch(`${API_URL}/admin_actions.php?action=get_years`);
      const data = await res.json();
      setAvailableYears(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async (year = yearFilter) => {
    setLoadingHistory(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.department_id) { setHistory([]); return; }
      const res = await fetch(`${API_URL}/allocate.php?year=${year}&department_id=${user.department_id}`);
      const data = await res.json();
      if (data.success && data.allocations) {
        setHistory(data.allocations.map((a) => ({
          department: a.category,
          allocated: a.allocated,
          raw_allocated: a.raw_allocated,
          allocation_percentage: parseFloat(a.allocation_percentage || 0),
        })));
      } else setHistory([]);
    } catch (e) { setHistory([]); }
    finally { setLoadingHistory(false); }
  };

  const handleAutoAllocate = async () => {
    const total = parseFloat(amount);
    if (!total || total <= 0) { setError("Enter a valid fund amount."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API_URL}/allocate.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_fund: total, year: yearFilter, department_id: userDeptId }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ type: "auto", message: data.message, breakdowns: data.category_breakdown });
        setAmount(""); fetchHistory(); fetchCategories();
      } else setError(data.message);
    } catch (e) { setError("Error connecting to server."); }
    finally { setLoading(false); }
  };

  const handleManualAllocate = () => {
    if (!selectedCategory || !selectedSubcategory || !manualAmount) {
      setError("Fill in all fields before verifying."); return;
    }
    const cat = categories.find((c) => c.id.toString() === selectedCategory.toString());
    const sub = filteredSubs.find((s) => s.id.toString() === selectedSubcategory.toString());
    setError(null);
    setResult({
      type: "manual",
      message: `Manual allocation verified — ${cat?.name} › ${sub?.name}.`,
      item: { category: cat?.name, subcategory: sub?.name, amount: fmt(parseFloat(manualAmount)), desc: sub?.description },
    });
  };

  const totalAllocated = history.reduce((s, i) => s + (parseFloat(i.raw_allocated) || 0), 0);

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    border: "1px solid #e2e8f0", borderRadius: 10,
    fontSize: 14, fontWeight: 500, color: "#0f172a",
    background: "#fff", outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease",
    appearance: "none", WebkitAppearance: "none",
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#64748b", textTransform: "uppercase",
    letterSpacing: "0.08em", marginBottom: 6,
  };

  const disabledBtn = loading || !amount || userDeptId === 0;
  const disabledManual = !selectedCategory || !selectedSubcategory || !manualAmount;

  return (
    <UnifiedLayout title="Budget Allocation" subtitle={`Fiscal Year ${yearFilter} — ${userDeptName}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Outfit:wght@400;500;600;700;800&display=swap');
        .ba-root * { box-sizing: border-box; font-family: 'Outfit', sans-serif; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input::placeholder { color: #cbd5e1; }
        .focus-gold:focus { border-color: #f5a82b !important; outline: none; }
        .btn-deploy { transition: background 0.15s ease, box-shadow 0.15s ease; }
        .btn-deploy:not(:disabled):hover { background: #1e293b !important; box-shadow: 0 4px 16px rgba(245,168,43,0.15); }
        .btn-verify:not(:disabled):hover { background: #1e293b !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="ba-root" style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 48 }}>

        {/* HEADER ROW */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "Total Allocated", value: fmtCompact(totalAllocated) },
              { label: "Categories Funded", value: history.length },
            ].map((s, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 12, padding: "12px 18px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 3px" }}>{s.label}</p>
                <p style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>{s.value}</p>
              </div>
            ))}
          </div>
          <div style={{ position: "relative" }}>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{ ...inputStyle, width: "auto", paddingRight: 32, fontSize: 12, fontWeight: 700, color: "#d97706", background: "#fffbeb", border: "1px solid rgba(245,168,43,0.25)", cursor: "pointer" }}
            >
              {availableYears.map((y) => <option key={y.year} value={y.year}>FY {y.year}</option>)}
            </select>
            <svg style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden" }}>

              {/* Card header */}
              <div style={{ padding: "14px 22px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, background: "#fffbeb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="7" width="4" height="8" rx="1" fill="#f5a82b" />
                      <rect x="6" y="4" width="4" height="11" rx="1" fill="#fbbf24" />
                      <rect x="11" y="1" width="4" height="14" rx="1" fill="#fde68a" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Allocation suite</span>
                </div>
                <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 7, padding: 3, gap: 2 }}>
                  <ModeTab active={mode === "auto"} label="Auto" onClick={() => { setMode("auto"); setResult(null); setError(null); }} />
                  <ModeTab active={mode === "manual"} label="Manual" onClick={() => { setMode("manual"); setResult(null); setError(null); }} />
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: 22 }}>
                {mode === "auto" ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
                    <div>
                      <div style={{ background: "#f8fafc", padding: "20px 24px", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>Automatic Allocation Active</h4>
                        <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                          Funds are now automatically allocated into categories by the University Administration upon transfer. You no longer need to manually inject or deploy budget.
                        </p>
                      </div>
                    </div>

                    <div style={{ background: "#fafafa", border: "1px solid #f1f5f9", borderRadius: 12, padding: "16px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Distribution rules</p>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#d97706", background: "#fffbeb", padding: "2px 8px", borderRadius: 5 }}>Standard</span>
                      </div>
                      {categories.slice(0, 4).map((cat) => (
                        <BarRow key={cat.id} label={cat.name} pct={parseFloat(cat.allocation_percentage || 0).toFixed(0)} />
                      ))}
                      {categories.length > 4 && (
                        <p style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", margin: "8px 0 0", fontWeight: 700 }}>
                          + {categories.length - 4} more categories
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <label style={labelStyle}>Category</label>
                        <select className="focus-gold" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                          style={{ ...inputStyle, cursor: "pointer" }}>
                          <option value="">Select category</option>
                          {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Sub-category</label>
                        <select className="focus-gold" value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)}
                          disabled={!selectedCategory}
                          style={{ ...inputStyle, cursor: selectedCategory ? "pointer" : "not-allowed", opacity: selectedCategory ? 1 : 0.5 }}>
                          <option value="">Select item</option>
                          {filteredSubs.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <label style={labelStyle}>Amount (PHP)</label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>₱</span>
                          <input type="number" className="focus-gold" placeholder="0.00" value={manualAmount}
                            onChange={(e) => setManualAmount(e.target.value)}
                            style={{ ...inputStyle, paddingLeft: 28, fontFamily: "'IBM Plex Mono', monospace" }} />
                        </div>
                        {selectedSubcategory && (() => {
                          const sub = filteredSubs.find((s) => s.id.toString() === selectedSubcategory.toString());
                          return sub ? (
                            <p style={{ fontSize: 11, color: "#94a3b8", margin: "6px 0 0", fontStyle: "italic" }}>
                              Suggested: {fmt(sub.allocation_amount)} — {sub.description}
                            </p>
                          ) : null;
                        })()}
                      </div>
                      <button className="btn-verify" onClick={handleManualAllocate} disabled={disabledManual} style={{
                        width: "100%", padding: "12px 0",
                        background: disabledManual ? "#f1f5f9" : "#0f172a",
                        color: disabledManual ? "#94a3b8" : "#fde68a",
                        border: disabledManual ? "1px solid #e2e8f0" : "1px solid rgba(245,168,43,0.2)",
                        borderRadius: 10, fontSize: 13, fontWeight: 700,
                        cursor: disabledManual ? "not-allowed" : "pointer",
                        letterSpacing: "0.04em", transition: "background 0.15s ease",
                        fontFamily: "inherit", marginTop: "auto",
                      }}>Verify allocation</button>
                    </div>
                  </div>
                )}

                {error && <FeedbackBox type="error" message={error} />}
                {result && (
                  <div style={{ animation: "fadeIn 0.25s ease" }}>
                    <FeedbackBox type="success" message={result.message} />
                    {result.type === "auto" && result.breakdowns && <ResultGrid breakdowns={result.breakdowns} />}
                    {result.type === "manual" && result.item && (
                      <div style={{
                        marginTop: 14, padding: "15px 18px",
                        background: "#fffbeb", border: "1px solid rgba(245,168,43,0.2)",
                        borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                      }}>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>{result.item.category}</p>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 3px" }}>{result.item.subcategory}</p>
                          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, fontStyle: "italic" }}>{result.item.desc}</p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>Confirmed</p>
                          <p style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>{result.item.amount}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER INFO */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { label: "Department", value: userDeptName },
                { label: "Mode", value: mode === "auto" ? "Auto distribution" : "Manual override" },
                { label: "Fiscal year", value: `FY ${yearFilter}` },
              ].map((item, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 12, padding: "13px 16px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>{item.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: LEDGER */}
          <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden", position: "sticky", top: 24 }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 1px" }}>Allocation log</p>
                <p style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>FY {yearFilter}</p>
              </div>
              <button onClick={() => fetchHistory(yearFilter)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, borderRadius: 6, display: "flex" }}>
                <RefreshCw size={14} style={{ animation: loadingHistory ? "spin 1s linear infinite" : "none" }} />
              </button>
            </div>

            <div style={{ padding: "10px", maxHeight: 460, overflowY: "auto" }}>
              {loadingHistory ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "50px 0", gap: 10 }}>
                  <div style={{ width: 22, height: 22, border: "2px solid #f1f5f9", borderTopColor: "#f5a82b", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Loading…</p>
                </div>
              ) : history.length === 0 ? (
                <div style={{ padding: "50px 0", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>No records yet</p>
                </div>
              ) : (
                history.map((item, idx) => (
                  <LedgerRow key={idx} item={item} index={idx} total={history.length} />
                ))
              )}
            </div>

            <div style={{ margin: "0 10px 10px", padding: "14px 16px", background: "#0f172a", borderRadius: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#f5a82b", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 5px" }}>Total deployed</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#fefce8", margin: 0, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "-0.02em" }}>
                {fmt(totalAllocated)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}