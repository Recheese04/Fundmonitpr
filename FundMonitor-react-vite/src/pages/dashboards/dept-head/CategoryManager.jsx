import React, { useState, useEffect } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import {
  FolderTree, Plus, Edit, Trash2, X, Save,
  AlertTriangle, RefreshCw, ChevronDown, ChevronRight
} from "lucide-react";
import API_URL from "@/apiConfig";

const API_BASE = `${API_URL}/categories.php`;

const fmt = (v) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(v || 0);

const inputStyle = {
  width: "100%", padding: "10px 13px",
  border: "1px solid #e2e8f0", borderRadius: 9,
  fontSize: 13, fontWeight: 500, color: "#0f172a",
  background: "#fff", outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
  transition: "border-color 0.15s",
};
const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: "#64748b", textTransform: "uppercase",
  letterSpacing: "0.08em", marginBottom: 5,
};

function Modal({ onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 500, boxShadow: "0 24px 64px rgba(0,0,0,0.15)", overflow: "hidden", animation: "modalIn 0.2s ease" }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>{title}</p>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, borderRadius: 6, display: "flex" }}><X size={18} /></button>
    </div>
  );
}

function Toast({ type, message }) {
  const c = type === "error"
    ? { bg: "#fff1f2", border: "rgba(239,68,68,0.2)", dot: "#e11d48", text: "#9f1239" }
    : { bg: "#fffbeb", border: "rgba(245,168,43,0.3)", dot: "#f5a82b", text: "#92400e" };
  return (
    <div style={{ padding: "12px 16px", background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, display: "flex", alignItems: "center", gap: 10, animation: "fadeIn 0.2s ease" }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      <p style={{ fontSize: 13, fontWeight: 600, color: c.text, margin: 0 }}>{message}</p>
    </div>
  );
}

function ProgressBar({ pct, over }) {
  const color = over ? "#ef4444" : pct >= 80 ? "#f97316" : "#22c55e";
  return (
    <div style={{ height: 4, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
    </div>
  );
}

function IconBtn({ onClick, danger, title, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s", background: hov ? (danger ? "#fff1f2" : "#f8fafc") : "#fff", borderColor: hov ? (danger ? "rgba(239,68,68,0.3)" : "#e2e8f0") : "#f1f5f9", color: hov ? (danger ? "#e11d48" : "#0f172a") : "#94a3b8" }}>
      {children}
    </button>
  );
}

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [departmentAllocatedBudget, setDepartmentAllocatedBudget] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", total_budget: "", allocation_percentage: "" });
  const [subcategoryForm, setSubcategoryForm] = useState({ category_id: "", department_id: "", name: "", allocation_amount: "", description: "" });

  useEffect(() => { fetchYears(); fetchCategories(); }, [selectedYear]);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(null), 5000); return () => clearTimeout(t); } }, [success]);
  useEffect(() => { if (error) { const t = setTimeout(() => setError(null), 5000); return () => clearTimeout(t); } }, [error]);

  const fetchYears = async () => {
    try {
      const res = await fetch(`${API_URL}/admin_actions.php?action=get_years`);
      const data = await res.json();
      setAvailableYears(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchCategories = async (year = selectedYear) => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const deptId = user?.department_id || 0;
      const res = await fetch(`${API_BASE}?action=get_categories_with_budget&year=${year}&department_id=${deptId}`);
      const data = await res.json();
      if (data.success) {
        const cats = data.categories.map(c => ({ ...c, department_id: c.department_id || deptId }));
        setCategories(cats);
        setDepartmentAllocatedBudget(data.department_allocated_budget || 0);
        const exp = {};
        cats.forEach(c => { if (c.subcategories?.length > 0) exp[c.id] = true; });
        setExpandedCategories(exp);
      } else setError(data.message);
    } catch (e) { setError("Failed to fetch categories: " + e.message); }
    finally { setLoading(false); }
  };

  const toggleCategory = (id) => setExpandedCategories(p => ({ ...p, [id]: !p[id] }));

  const calcBudget = (cat) => {
    let totalBudget = parseFloat(cat.total_budget || 0);
    let allocatedAmount = 0;
    if (cat.subcategories_allocated !== undefined && !isNaN(parseFloat(cat.subcategories_allocated))) {
      allocatedAmount = parseFloat(cat.subcategories_allocated);
    } else if (cat.allocated_budget !== undefined && cat.allocated_budget !== null && !isNaN(parseFloat(cat.allocated_budget))) {
      allocatedAmount = parseFloat(cat.allocated_budget);
    }
    if (totalBudget === 0 && allocatedAmount > 0) totalBudget = allocatedAmount;
    return { totalBudget, allocatedAmount, remainingBudget: totalBudget - allocatedAmount, percentageUsed: totalBudget > 0 ? (allocatedAmount / totalBudget) * 100 : 0 };
  };

  const openCategoryModal = (cat = null) => {
    if (cat) { setEditingCategory(cat); setCategoryForm({ name: cat.name, description: cat.description || "", total_budget: cat.total_budget || "", allocation_percentage: cat.allocation_percentage || "" }); }
    else { setEditingCategory(null); setCategoryForm({ name: "", description: "", total_budget: "", allocation_percentage: "" }); }
    setShowCategoryModal(true);
  };
  const closeCategoryModal = () => { setShowCategoryModal(false); setEditingCategory(null); setCategoryForm({ name: "", description: "", total_budget: "", allocation_percentage: "" }); };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) { setError("Category name is required"); return; }
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const deptId = user?.department_id;
    if (!deptId) { setError("Session expired. Please log in again."); return; }
    setLoading(true);
    try {
      const url = editingCategory ? `${API_BASE}?action=update_category` : `${API_BASE}?action=create_category`;
      const payload = editingCategory ? { id: editingCategory.id, ...categoryForm, department_id: deptId, year: selectedYear } : { ...categoryForm, department_id: deptId, year: selectedYear };
      const res = await fetch(url, { method: editingCategory ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) { setSuccess(data.message); closeCategoryModal(); fetchCategories(); } else setError(data.message);
    } catch (e) { setError("Failed to save category: " + e.message); }
    finally { setLoading(false); }
  };

  const handleDeleteCategory = (cat) => { setDeleteTarget({ type: "category", data: cat }); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const { type, data } = deleteTarget;
      const res = await fetch(`${API_BASE}?action=${type === "category" ? "delete_category" : "delete_subcategory"}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: data.id }) });
      const result = await res.json();
      if (result.success) { setSuccess(result.message); setShowDeleteModal(false); setDeleteTarget(null); fetchCategories(); } else setError(result.message);
    } catch (e) { setError("Failed to delete: " + e.message); }
    finally { setLoading(false); }
  };

  const openSubcategoryModal = (cat, sub = null) => {
    setCurrentCategory(cat);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const deptId = cat.department_id || user?.department_id || 0;
    if (!cat.id) { setError("Category ID is missing. Please refresh."); return; }
    if (!deptId) { setError("Department ID missing. Please log in again."); return; }
    if (sub) { setEditingSubcategory(sub); setSubcategoryForm({ category_id: String(cat.id), department_id: String(deptId), name: sub.name, allocation_amount: sub.allocation_amount || 0, description: sub.description || "" }); }
    else { setEditingSubcategory(null); setSubcategoryForm({ category_id: String(cat.id), department_id: String(deptId), name: "", allocation_amount: "", description: "" }); }
    setShowSubcategoryModal(true);
  };
  const closeSubcategoryModal = () => { setShowSubcategoryModal(false); setEditingSubcategory(null); setCurrentCategory(null); setSubcategoryForm({ category_id: "", department_id: "", name: "", allocation_amount: "", description: "" }); };

  const handleSaveSubcategory = async () => {
    if (!subcategoryForm.name.trim()) { setError("Sub-category name is required"); return; }
    const catId = parseInt(subcategoryForm.category_id);
    const deptId = parseInt(subcategoryForm.department_id);
    if (!catId || isNaN(catId)) { setError("Invalid Category ID. Please close and try again."); return; }
    if (!deptId || isNaN(deptId)) { setError("Invalid Department ID. Please log in again."); return; }
    const parentCategory = categories.find(c => c.id === catId);
    if (parentCategory) {
      const parentTotal = parseFloat(parentCategory.total_budget || 0);
      const otherSubTotal = (parentCategory.subcategories || []).filter(s => editingSubcategory ? s.id !== editingSubcategory.id : true).reduce((sum, s) => sum + parseFloat(s.allocation_amount || 0), 0);
      const newAmount = parseFloat(subcategoryForm.allocation_amount) || 0;
      if (otherSubTotal + newAmount > parentTotal) { setError(`Budget overlap! Only ${fmt(parentTotal - otherSubTotal)} remains in "${parentCategory.name}".`); return; }
    }
    setLoading(true);
    try {
      const url = editingSubcategory ? `${API_BASE}?action=update_subcategory` : `${API_BASE}?action=create_subcategory`;
      const payload = { name: subcategoryForm.name.trim(), allocation_amount: parseFloat(subcategoryForm.allocation_amount) || 0, description: subcategoryForm.description.trim(), category_id: catId, department_id: deptId, year: selectedYear, ...(editingSubcategory ? { id: editingSubcategory.id } : {}) };
      const res = await fetch(url, { method: editingSubcategory ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) { setSuccess(data.message); closeSubcategoryModal(); fetchCategories(); } else setError(data.message);
    } catch (e) { setError("Failed to save sub-category: " + e.message); }
    finally { setLoading(false); }
  };

  const handleDeleteSubcategory = (sub) => { setDeleteTarget({ type: "subcategory", data: sub }); setShowDeleteModal(true); };

  const handleResetSubcategoryBudget = async (sub) => {
    if (!window.confirm(`Reset budget for "${sub.name}"?\n\nAllocated: ${fmt(sub.allocation_amount)}\n\nThis resets remaining budget back to allocated amount.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}?action=reset_subcategory_budget`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: sub.id }) });
      const data = await res.json();
      if (data.success) { setSuccess(data.message || "Budget reset successfully"); fetchCategories(); } else setError(data.message || "Failed to reset budget");
    } catch (e) { setError("Failed to reset budget: " + e.message); }
    finally { setLoading(false); }
  };

  const totalRemaining = categories.reduce((s, c) => s + calcBudget(c).remainingBudget, 0);
  const remainingPct = departmentAllocatedBudget > 0 ? (totalRemaining / departmentAllocatedBudget) * 100 : 0;
  const totalPct = categories.reduce((s, c) => s + parseFloat(c.allocation_percentage || 0), 0);

  return (
    <UnifiedLayout title="Budget Categories" subtitle={`Fiscal Year ${selectedYear}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Outfit:wght@400;500;600;700;800&display=swap');
        .cm-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #cbd5e1; }
        .focus-gold:focus { border-color: #f5a82b !important; outline: none; }
        .row-hover:hover { background: #fafafa; }
        .sub-row:hover { background: #fff; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.97) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="cm-root" style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 48 }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Budget Categories</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "3px 0 0" }}>Manage categories and allocation amounts</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                style={{ ...inputStyle, width: "auto", paddingRight: 28, fontSize: 12, fontWeight: 700, color: "#d97706", background: "#fffbeb", border: "1px solid rgba(245,168,43,0.25)", cursor: "pointer" }}>
                {availableYears.map(y => <option key={y.year} value={y.year}>{y.label}</option>)}
              </select>
              <svg style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <button onClick={() => fetchCategories()} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, fontWeight: 700, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>
              <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
            </button>
            <button onClick={() => openCategoryModal()} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", background: "#0f172a", border: "1px solid rgba(245,168,43,0.2)", borderRadius: 9, fontSize: 12, fontWeight: 700, color: "#fde68a", cursor: "pointer", fontFamily: "inherit" }}>
              <Plus size={14} /> New Category
            </button>
          </div>
        </div>

        {success && <Toast type="success" message={success} />}
        {error && <Toast type="error" message={error} />}

        {/* OVERVIEW CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(245,168,43,0.15)", borderRadius: 14, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#f5a82b", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 8px" }}>Total Allocation {selectedYear}</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: "#fefce8", margin: "0 0 5px", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "-0.02em" }}>{fmt(departmentAllocatedBudget)}</p>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>Department level budget</span>
          </div>
          <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, padding: "20px 22px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 8px" }}>Total Remaining Balance</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: "#22c55e", margin: "0 0 10px", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "-0.02em" }}>{fmt(totalRemaining)}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 5, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(remainingPct, 100)}%`, background: "linear-gradient(90deg, #22c55e, #4ade80)", borderRadius: 99, transition: "width 0.8s ease" }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", whiteSpace: "nowrap" }}>{remainingPct.toFixed(1)}% left</span>
            </div>
          </div>
        </div>

        {/* CATEGORIES LIST */}
        <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: "#fffbeb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FolderTree size={15} color="#f5a82b" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Categories & Sub-categories</p>
          </div>

          {loading && categories.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", gap: 10 }}>
              <div style={{ width: 24, height: 24, border: "3px solid #f1f5f9", borderTopColor: "#f5a82b", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>Loading categories…</p>
            </div>
          ) : categories.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", gap: 8 }}>
              <FolderTree size={36} color="#e2e8f0" />
              <p style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", margin: 0 }}>No categories yet</p>
              <p style={{ fontSize: 12, color: "#cbd5e1", margin: 0 }}>Create your first category to get started</p>
            </div>
          ) : (
            <div>
              {categories.map((cat, catIdx) => {
                const budget = calcBudget(cat);
                const isExpanded = expandedCategories[cat.id];
                const over = budget.allocatedAmount > budget.totalBudget;
                return (
                  <div key={cat.id} style={{ borderBottom: catIdx < categories.length - 1 ? "1px solid #f8fafc" : "none" }}>
                    <div className="row-hover" style={{ padding: "16px 20px", transition: "background 0.1s" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <button onClick={() => toggleCategory(cat.id)} style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid #f1f5f9", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: 2, color: "#94a3b8" }}>
                          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{cat.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "2px 8px", borderRadius: 5 }}>{cat.subcategory_count} subs</span>
                            {budget.totalBudget > 0 && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: over ? "#e11d48" : "#d97706", background: over ? "#fff1f2" : "#fffbeb", padding: "2px 8px", borderRadius: 5 }}>{budget.percentageUsed.toFixed(1)}% allocated</span>
                            )}
                          </div>
                          {cat.description && <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 10px" }}>{cat.description}</p>}
                          <div style={{ background: "#fafafa", border: "1px solid #f1f5f9", borderRadius: 10, padding: "12px 16px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 10 }}>
                              {[
                                { label: "Category Budget", value: fmt(budget.totalBudget), color: "#0f172a" },
                                { label: "Allocated to Subs", value: fmt(budget.allocatedAmount), color: over ? "#e11d48" : "#22c55e" },
                                { label: "Auto-Share %", value: `${cat.allocation_percentage || 0}%`, color: "#d97706" },
                              ].map((s, i) => (
                                <div key={i}>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 3px" }}>{s.label}</p>
                                  <p style={{ fontSize: 14, fontWeight: 700, color: s.color, margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>{s.value}</p>
                                </div>
                              ))}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Budget utilization</span>
                              <span style={{ fontSize: 10, fontWeight: 700, color: over ? "#e11d48" : "#64748b" }}>{budget.percentageUsed.toFixed(1)}%</span>
                            </div>
                            <ProgressBar pct={budget.percentageUsed} over={over} />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button onClick={() => openSubcategoryModal(cat)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>
                            <Plus size={12} /> Add Sub
                          </button>
                          <IconBtn onClick={() => openCategoryModal(cat)} title="Edit"><Edit size={13} /></IconBtn>
                          <IconBtn onClick={() => handleDeleteCategory(cat)} danger title="Delete"><Trash2 size={13} /></IconBtn>
                        </div>
                      </div>
                    </div>

                    {isExpanded && cat.subcategories?.length > 0 && (
                      <div style={{ background: "#fafafa", borderTop: "1px solid #f1f5f9" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                              {["Sub-category", "Description", "Allocated", "Remaining", "Spent", ""].map((h, i) => (
                                <th key={i} style={{ padding: "9px 16px", paddingLeft: i === 0 ? 56 : 16, textAlign: i >= 2 && i <= 4 ? "right" : i === 5 ? "right" : "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {cat.subcategories.map((sub, si) => {
                              const allocated = parseFloat(sub.allocation_amount || 0);
                              const remaining = parseFloat(sub.remaining_budget !== undefined ? sub.remaining_budget : allocated);
                              const spent = allocated - remaining;
                              const low = remaining < allocated * 0.2;
                              return (
                                <tr key={sub.id} className="sub-row" style={{ borderBottom: si < cat.subcategories.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 0.1s" }}>
                                  <td style={{ padding: "12px 16px", paddingLeft: 56, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{sub.name}</td>
                                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8" }}>{sub.description || "—"}</td>
                                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", background: "#eff6ff", padding: "3px 9px", borderRadius: 5, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(allocated)}</span>
                                  </td>
                                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 5, fontFamily: "'IBM Plex Mono', monospace", color: remaining <= 0 ? "#e11d48" : low ? "#ea580c" : "#16a34a", background: remaining <= 0 ? "#fff1f2" : low ? "#fff7ed" : "#f0fdf4" }}>{fmt(remaining)}</span>
                                  </td>
                                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", background: "#f8fafc", padding: "3px 9px", borderRadius: 5, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(spent)}</span>
                                  </td>
                                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                    <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                                      <IconBtn onClick={() => handleResetSubcategoryBudget(sub)} title="Reset budget"><RefreshCw size={12} /></IconBtn>
                                      <IconBtn onClick={() => openSubcategoryModal(cat, sub)} title="Edit"><Edit size={12} /></IconBtn>
                                      <IconBtn onClick={() => handleDeleteSubcategory(sub)} danger title="Delete"><Trash2 size={12} /></IconBtn>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
                              <td colSpan={2} style={{ padding: "10px 16px", paddingLeft: 56, fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Totals</td>
                              {[
                                { v: cat.subcategories.reduce((s, sub) => s + parseFloat(sub.allocation_amount || 0), 0), c: "#1d4ed8", bg: "#eff6ff" },
                                { v: cat.subcategories.reduce((s, sub) => s + parseFloat(sub.remaining_budget !== undefined ? sub.remaining_budget : sub.allocation_amount || 0), 0), c: "#16a34a", bg: "#f0fdf4" },
                                { v: cat.subcategories.reduce((s, sub) => { const a = parseFloat(sub.allocation_amount || 0); const r = parseFloat(sub.remaining_budget !== undefined ? sub.remaining_budget : a); return s + (a - r); }, 0), c: "#64748b", bg: "#f8fafc" },
                              ].map((t, i) => (
                                <td key={i} style={{ padding: "10px 16px", textAlign: "right" }}>
                                  <span style={{ fontSize: 12, fontWeight: 800, color: t.c, background: t.bg, padding: "3px 10px", borderRadius: 6, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(t.v)}</span>
                                </td>
                              ))}
                              <td />
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && categories.length > 0 && (
            <div style={{ padding: "16px 24px", borderTop: "2px solid #f1f5f9", background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 2px" }}>Department Overview</p>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Active Fiscal Year {selectedYear}</p>
              </div>
              <div style={{ display: "flex", gap: 28 }}>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>Total Allocation</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {fmt(categories.reduce((s, c) => s + parseFloat(c.allocation_amount || c.total_budget || 0), 0))}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>Auto-Dist. Rule</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: totalPct === 100 ? "#22c55e" : "#f59e0b", margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>{totalPct.toFixed(1)}%</p>
                  {totalPct !== 100 && <p style={{ fontSize: 9, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", margin: "2px 0 0" }}>Must be 100%</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CATEGORY MODAL */}
        {showCategoryModal && (
          <Modal onClose={closeCategoryModal}>
            <ModalHeader title={editingCategory ? "Edit Category" : "New Category"} onClose={closeCategoryModal} />
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Category Name *</label>
                <input className="focus-gold" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g., Facility Development" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Total Budget (PHP) *</label>
                <input className="focus-gold" type="number" min="0" step="0.01" value={categoryForm.total_budget} onChange={(e) => setCategoryForm({ ...categoryForm, total_budget: e.target.value })} placeholder="500000.00" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Allocation Share (%) *</label>
                <input className="focus-gold" type="number" min="0" max="100" step="0.1" value={categoryForm.allocation_percentage} onChange={(e) => setCategoryForm({ ...categoryForm, allocation_percentage: e.target.value })} placeholder="25" style={inputStyle} />
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "5px 0 0", fontStyle: "italic" }}>% of funds auto-distributed here during "Auto" mode</p>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea className="focus-gold" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Brief description…" style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button onClick={handleSaveCategory} disabled={loading || !categoryForm.name.trim() || !categoryForm.total_budget}
                  style={{ flex: 1, padding: "11px 0", background: (!categoryForm.name.trim() || !categoryForm.total_budget) ? "#f1f5f9" : "#0f172a", color: (!categoryForm.name.trim() || !categoryForm.total_budget) ? "#94a3b8" : "#fde68a", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: (!categoryForm.name.trim() || !categoryForm.total_budget) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "inherit" }}>
                  <Save size={14} /> {editingCategory ? "Update" : "Create"} Category
                </button>
                <button onClick={closeCategoryModal} style={{ flex: 1, padding: "11px 0", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, fontWeight: 700, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              </div>
            </div>
          </Modal>
        )}

        {/* SUBCATEGORY MODAL */}
        {showSubcategoryModal && currentCategory && (() => {
          const budget = calcBudget(currentCategory);
          const oldAmount = editingSubcategory ? parseFloat(editingSubcategory.allocation_amount || 0) : 0;
          const availableBudget = budget.remainingBudget + oldAmount;
          const enteredAmount = parseFloat(subcategoryForm.allocation_amount || 0);
          const isOver = enteredAmount > availableBudget;
          const disabledSave = loading || isOver || !subcategoryForm.name.trim() || subcategoryForm.allocation_amount === "";
          return (
            <Modal onClose={closeSubcategoryModal}>
              <ModalHeader title={editingSubcategory ? "Edit Sub-category" : "New Sub-category"} onClose={closeSubcategoryModal} />
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "#fafafa", border: "1px solid #f1f5f9", borderRadius: 10, padding: "12px 16px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Category budget status</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 3px" }}>Total category</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(budget.totalBudget)}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 3px" }}>Available for subs</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: availableBudget > 0 ? "#d97706" : "#e11d48", margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(availableBudget)}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Sub-category Name *</label>
                  <input className="focus-gold" value={subcategoryForm.name} onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })} placeholder="e.g., Building Maintenance" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Allocation Amount (PHP) *</label>
                  <input className="focus-gold" type="number" min="0" step="0.01" value={subcategoryForm.allocation_amount}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, allocation_amount: e.target.value })}
                    placeholder="50000.00" style={{ ...inputStyle, borderColor: isOver ? "#fca5a5" : "#e2e8f0" }} />
                  {isOver && (
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6, padding: "8px 12px", background: "#fff1f2", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 7 }}>
                      <AlertTriangle size={13} color="#e11d48" />
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#9f1239", margin: 0 }}>Exceeds available — max {fmt(availableBudget)}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea className="focus-gold" value={subcategoryForm.description} onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })} placeholder="Brief description…" style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                  <button onClick={handleSaveSubcategory} disabled={disabledSave}
                    style={{ flex: 1, padding: "11px 0", background: disabledSave ? "#f1f5f9" : "#0f172a", color: disabledSave ? "#94a3b8" : "#fde68a", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: disabledSave ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "inherit" }}>
                    <Save size={14} /> {isOver ? "Exceeds Budget" : editingSubcategory ? "Update" : "Create"} Sub-category
                  </button>
                  <button onClick={closeSubcategoryModal} style={{ flex: 1, padding: "11px 0", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, fontWeight: 700, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                </div>
              </div>
            </Modal>
          );
        })()}

        {/* DELETE MODAL */}
        {showDeleteModal && deleteTarget && (
          <Modal onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>
            <ModalHeader title="Confirm Deletion" onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }} />
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fff1f2", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AlertTriangle size={18} color="#e11d48" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 5px" }}>Delete <strong>{deleteTarget.data.name}</strong>?</p>
                  {deleteTarget.type === "category" && deleteTarget.data.subcategory_count > 0 && (
                    <p style={{ fontSize: 12, color: "#e11d48", margin: 0 }}>This category has {deleteTarget.data.subcategory_count} sub-categories. Delete all sub-categories first.</p>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={confirmDelete} disabled={loading || (deleteTarget.type === "category" && deleteTarget.data.subcategory_count > 0)}
                  style={{ flex: 1, padding: "11px 0", background: (loading || (deleteTarget.type === "category" && deleteTarget.data.subcategory_count > 0)) ? "#f1f5f9" : "#e11d48", color: (loading || (deleteTarget.type === "category" && deleteTarget.data.subcategory_count > 0)) ? "#94a3b8" : "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  {loading ? "Deleting…" : "Delete"}
                </button>
                <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} style={{ flex: 1, padding: "11px 0", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, fontWeight: 700, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </UnifiedLayout>
  );
};

export default CategoryManager;