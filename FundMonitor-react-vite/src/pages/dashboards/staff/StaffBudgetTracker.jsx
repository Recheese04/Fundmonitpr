import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "react-router-dom";
import { 
  FolderTree, 
  X, 
  Save,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Upload,
  Receipt,
  DollarSign,
  Printer,
  TrendingUp,
  PieChart,
  CheckCircle2,
  Paperclip,
  PlusCircle,
  FileText
} from "lucide-react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import API_URL from "@/apiConfig";

const API_BASE_CATEGORIES = `${API_URL}/categories.php`;
const API_BASE_EXPENSES = `${API_URL}/expenses.php`;

const StaffBudgetTracker = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [departmentAllocatedBudget, setDepartmentAllocatedBudget] = useState(0);
  
  const [expandedCategories, setExpandedCategories] = useState({});
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    file: null,
    fileName: '',
    categoryId: '',
    subcategoryId: ''
  });

  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const deptId = user?.department_id || 0;

  useEffect(() => {
    fetchYears();
    fetchCategories();
  }, [selectedYear]);

  // Check for ?new=true on mount to open modal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true' && categories.length > 0) {
      openExpenseModal();
    }
  }, [location.search, categories.length]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchYears = async () => {
    try {
      const res = await fetch(`${API_URL}/admin_actions.php?action=get_years`);
      const data = await res.json();
      setAvailableYears(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async (year = selectedYear) => {
    if (!deptId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_CATEGORIES}?action=get_categories_with_budget&year=${year}&department_id=${deptId}`);
      const data = await response.json();
      
      if (data.success) {
        const cats = Array.isArray(data.categories) ? data.categories : [];
        setCategories(cats);
        setDepartmentAllocatedBudget(data.department_allocated_budget || 0);
        const expanded = {};
        cats.forEach(cat => {
          if (cat.subcategories && cat.subcategories.length > 0) {
            expanded[cat.id] = true;
          }
        });
        setExpandedCategories(expanded);
      } else {
        setError(data.message);
        setCategories([]);
      }
    } catch (err) {
      setError('Failed to fetch categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateCategoryBudget = (category) => {
    const totalBudget = parseFloat(category.total_budget || 0);
    const subcategories = category.subcategories || [];
    
    // In Staff view, we care about the sub-category allocations primarily
    const allocatedAmount = subcategories.reduce((sum, sub) => sum + parseFloat(sub.allocation_amount || 0), 0);
    const remainingBudget = subcategories.reduce((sum, sub) => sum + parseFloat(sub.remaining_budget || 0), 0);
    
    // Percentage used at category level (allocated vs total_budget)
    const percentageUsed = totalBudget > 0 ? (allocatedAmount / totalBudget) * 100 : 0;
    
    return {
      totalBudget,
      allocatedAmount,
      remainingBudget,
      percentageUsed
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getProgressBarColor = (percentage) => {
    if (percentage > 90) return 'bg-rose-500';
    if (percentage > 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const openExpenseModal = (category = null, subcategory = null) => {
    if (category && subcategory) {
      setSelectedSubcategory({
        ...subcategory,
        categoryName: category.name,
        categoryId: category.id
      });
      setExpenseForm({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        file: null,
        fileName: '',
        categoryId: category.id,
        subcategoryId: subcategory.id
      });
    } else {
      setSelectedSubcategory(null);
      setExpenseForm({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        file: null,
        fileName: '',
        categoryId: '',
        subcategoryId: ''
      });
    }
    setShowExpenseModal(true);
  };

  const closeExpenseModal = () => {
    setShowExpenseModal(false);
    setSelectedSubcategory(null);
    setError(null);
    setSuccess(null);
    setExpenseForm({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      file: null,
      fileName: '',
      categoryId: '',
      subcategoryId: ''
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExpenseForm({
        ...expenseForm,
        file: file,
        fileName: file.name
      });
    }
  };

  const handleSubmitExpense = async () => {
    const finalAmount = parseFloat(expenseForm.amount);
    const finalSubId = selectedSubcategory ? selectedSubcategory.id : expenseForm.subcategoryId;

    if (!finalAmount || finalAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!finalSubId || finalSubId === "" || finalSubId === "0") {
      setError('Please select a specific sub-category');
      return;
    }

    if (!expenseForm.description.trim()) {
      setError('Please enter a description');
      return;
    }

    const allSubcategories = Array.isArray(categories) ? categories.flatMap(c => c.subcategories || []) : [];
    const subToCheck = selectedSubcategory || allSubcategories.find(s => Number(s.id) === Number(finalSubId));
    const remaining = subToCheck ? parseFloat(subToCheck.remaining_budget || subToCheck.effective_balance || 0) : 0;
    
    if (finalAmount > remaining) {
      setError(`Amount exceeds remaining budget (Available: ${formatCurrency(remaining)})`);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('user_id', user.user_id || user.id);
      formData.append('subcategory_id', finalSubId);
      formData.append('amount', expenseForm.amount);
      formData.append('description', expenseForm.description);
      formData.append('date', expenseForm.date);
      formData.append('year', selectedYear);
      if (expenseForm.file) {
        formData.append('receipt', expenseForm.file);
      }

      const response = await fetch(`${API_BASE_EXPENSES}?action=create`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Expense submitted successfully!`);
        closeExpenseModal();
        fetchCategories(); 
      } else {
        setError(data.message || 'Failed to submit expense');
      }
    } catch (err) {
      setError('Failed to submit expense: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalRemaining = categories.reduce((sum, cat) => sum + calculateCategoryBudget(cat).remainingBudget, 0);

  return (
    <UnifiedLayout 
      title="Resource Allocation" 
      subtitle="Operational expenditure nodes & budget synchronicity"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .sbt-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .sbt-welcome { background: #0f172a; border-radius: 18px; padding: 20px 24px; color: #fff; display: flex; justify-content: space-between; align-items: center; position: relative; overflow: hidden; border: 1px solid rgba(245,168,43,0.2); }
        .sbt-welcome h2 { color: #fde68a; margin: 0; }
        .sbt-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 16px; position: relative; transition: all 0.2s; }
        .sbt-card:hover { border-color: #fde68a; }
        .sbt-card-indigo { background: #0f172a; color: #fde68a; border: 1px solid rgba(245,168,43,0.3); }
        .sbt-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
        .sbt-value { font-size: 20px; font-weight: 800; font-family: 'IBM Plex Mono', monospace; }
        .btn-exec {
          padding: 8px 16px; border-radius: 9px; font-size: 11px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.2s;
          cursor: pointer; display: inline-flex; align-items: center; gap: 6px; border: none;
        }
        .btn-primary { background: #0f172a; color: #fde68a; border: 1px solid rgba(245,168,43,0.4); }
        .btn-primary:hover { background: #1e293b; }
        .btn-primary:hover { background: #4b2fd8; transform: translateY(-1px); }
        .btn-secondary { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }
        .btn-secondary:hover { background: #f1f5f9; }
        .cat-row { padding: 14px 20px; border-bottom: 1px solid #f8fafc; display: flex; align-items: center; gap: 16px; }
        .cat-row:last-child { border-bottom: none; }
        .sub-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .sub-table th { padding: 10px 16px; background: #fafafa; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; text-align: left; border-bottom: 1px solid #f1f5f9; }
        .sub-table td { padding: 12px 16px; border-bottom: 1px solid #f8fafc; }
        .compact-input {
          width: 100%; padding: 10px 14px; background: #fafafa; border: 1px solid #e2e8f0; border-radius: 10px;
          font-size: 14px; font-weight: 600; outline: none; transition: all 0.15s;
        }
        .compact-input:focus { border-color: #5D3CFE; background: #fff; box-shadow: 0 0 0 3px rgba(93,60,254,0.1); }
      `}</style>

      <div className="sbt-root" style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 40 }}>
        
        {/* HEADER SECTION */}
        <div className="sbt-welcome">
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Budget Control Center</h2>
            <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginTop: 2 }}>FY {selectedYear} • Operational Telemetry</p>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>FISCAL:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                style={{ background: "transparent", border: "none", color: "#fff", fontSize: 12, fontWeight: 800, outline: "none", cursor: "pointer" }}
              >
                {availableYears.map(y => <option key={y.year} value={y.year} style={{ color: "#000" }}>{y.label}</option>)}
              </select>
            </div>
            <button onClick={() => openExpenseModal()} className="btn-exec btn-primary">
              <PlusCircle size={14} /> New Request
            </button>
            <button onClick={handlePrint} className="btn-exec btn-secondary">
              <Printer size={14} /> Export
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="sbt-card sbt-card-indigo">
            <p className="sbt-label" style={{ color: "rgba(255,255,255,0.6)" }}>Total Dept Allocation</p>
            <p className="sbt-value" style={{ fontSize: 24, marginTop: 4 }}>{formatCurrency(departmentAllocatedBudget)}</p>
            <div style={{ position: "absolute", top: 16, right: 16, opacity: 0.1 }}><TrendingUp size={40} /></div>
          </div>

          <div className="sbt-card">
            <p className="sbt-label">Total Running Balance</p>
            <p className="sbt-value" style={{ color: "#10b981", fontSize: 24, marginTop: 4 }}>{formatCurrency(totalRemaining)}</p>
            <div style={{ height: 4, width: "100%", background: "#f1f5f9", borderRadius: 10, marginTop: 12, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#10b981", width: `${departmentAllocatedBudget > 0 ? (totalRemaining / departmentAllocatedBudget) * 100 : 0}%` }}></div>
            </div>
            <div style={{ position: "absolute", top: 16, right: 16, opacity: 0.05 }}><RefreshCw size={40} /></div>
          </div>
        </div>

        {/* MAIN LIST */}
        <div className="sbt-card" style={{ padding: 0 }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #f8fafc", background: "#fafafa", display: "flex", alignItems: "center", gap: 8 }}>
            <FolderTree size={14} color="#94a3b8" />
            <span style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Financial Structure</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {categories.length === 0 ? (
               <div style={{ padding: 40, textAlign: "center", color: "#cbd5e1", fontSize: 12, fontWeight: 600 }}>Zero Record State</div>
            ) : categories.map((category) => {
              const budget = calculateCategoryBudget(category);
              return (
                <div key={category.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                  <div className="cat-row">
                    <button 
                      onClick={() => toggleCategory(category.id)}
                      style={{ width: 32, height: 32, borderRadius: 8, background: expandedCategories[category.id] ? "#4f46e5" : "#f1f5f9", border: "none", color: expandedCategories[category.id] ? "#fff" : "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      {expandedCategories[category.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{category.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "2px 8px", borderRadius: 6 }}>{category.subcategory_count} Items</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>REMAINING:</span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: "#1e293b", fontFamily: "'IBM Plex Mono', monospace" }}>{formatCurrency(budget.remainingBudget)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedCategories[category.id] && (
                    <div style={{ background: "#fafafa", padding: "8px 20px 20px" }}>
                      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
                        <table className="sub-table">
                          <thead>
                            <tr>
                              <th>Financial Item</th>
                              <th>Current Balance</th>
                              <th style={{ textAlign: "right" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.subcategories?.map((sub) => {
                              const remaining = parseFloat(sub.effective_balance || 0);
                              const isEmpty = remaining <= 0;
                              return (
                                <tr key={sub.id}>
                                  <td>
                                    <div style={{ fontWeight: 700, color: "#1e293b" }}>{sub.name}</div>
                                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Allotment: {formatCurrency(sub.allocation_amount)}</div>
                                  </td>
                                  <td>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: isEmpty ? "#ef4444" : "#10b981", fontFamily: "'IBM Plex Mono', monospace" }}>
                                      {formatCurrency(remaining)}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: "right" }}>
                                    <button 
                                      onClick={() => openExpenseModal(category, sub)}
                                      disabled={isEmpty}
                                      className="btn-exec btn-primary"
                                      style={{ height: 32, padding: "0 12px", opacity: isEmpty ? 0.3 : 1 }}
                                    >
                                      {isEmpty ? "Empty" : "Request"}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>


      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
           <div className="sbt-card" style={{ width: "100%", maxWidth: 540, padding: 0, overflow: "hidden", borderRadius: 24 }}>
              <div style={{ background: "#0f172a", padding: "24px 32px", color: "#fff", display: "flex", justifyContent: "space-between", alignSize: "center" }}>
                 <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Budget Request</h3>
                    <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>
                       {selectedSubcategory ? `${selectedSubcategory.categoryName} → ${selectedSubcategory.name}` : 'Submission Dispatch'}
                    </p>
                 </div>
                 <button onClick={closeExpenseModal} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><X size={20} /></button>
              </div>
              
              <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
                 {error && <div style={{ background: "#fff1f2", color: "#e11d48", padding: 12, borderRadius: 10, fontSize: 12, fontWeight: 700 }}>{error}</div>}
                 {success && <div style={{ background: "#f0fdf4", color: "#166534", padding: 12, borderRadius: 10, fontSize: 12, fontWeight: 700 }}>{success}</div>}

                 {!selectedSubcategory && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                       <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <span className="sbt-label">Category</span>
                          <select className="compact-input" value={expenseForm.categoryId} onChange={(e) => setExpenseForm({...expenseForm, categoryId: e.target.value, subcategoryId: ''})}>
                             <option value="">Select</option>
                             {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                          </select>
                       </div>
                       <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <span className="sbt-label">Sub-Item</span>
                          <select className="compact-input" value={expenseForm.subcategoryId} onChange={(e) => setExpenseForm({...expenseForm, subcategoryId: e.target.value})} disabled={!expenseForm.categoryId}>
                             <option value="">Select</option>
                             {(categories || []).find(c => String(c.id) === String(expenseForm.categoryId))?.subcategories?.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                          </select>
                       </div>
                    </div>
                 )}

                 <div style={{ background: "#eef2ff", padding: 16, borderRadius: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                       <p style={{ fontSize: 9, fontWeight: 700, color: "#6366f1", textTransform: "uppercase" }}>Available Fund</p>
                       <p style={{ fontSize: 24, fontWeight: 800, color: "#4f46e5", fontFamily: "'IBM Plex Mono', monospace" }}>
                          {(() => {
                             const subId = selectedSubcategory?.id || expenseForm.subcategoryId;
                             const sub = (categories || []).flatMap(c => c.subcategories || []).find(s => Number(s.id) === Number(subId));
                             return formatCurrency(parseFloat(sub?.effective_balance || 0));
                          })()}
                       </p>
                    </div>
                    <DollarSign size={24} color="#6366f1" />
                 </div>

                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                       <span className="sbt-label">Amount (₱)</span>
                       <input type="number" className="compact-input" value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} placeholder="0.00" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                       <span className="sbt-label">Date</span>
                       <input type="date" className="compact-input" value={expenseForm.date} onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})} />
                    </div>
                 </div>

                 <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span className="sbt-label">Justification</span>
                    <textarea className="compact-input" style={{ minHeight: 80, resize: "none" }} value={expenseForm.description} onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})} placeholder="Purpose of funds..." />
                 </div>

                 <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span className="sbt-label">Attachment</span>
                    <div onClick={() => document.getElementById('m-file').click()} style={{ padding: 12, border: "2px dashed #e2e8f0", borderRadius: 12, textAlign: "center", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>
                       <input type="file" id="m-file" className="hidden" onChange={handleFileChange} />
                       {expenseForm.fileName || 'Click to attach proof'}
                    </div>
                 </div>

                 <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <button onClick={closeExpenseModal} className="btn-exec btn-secondary" style={{ flex: 1, padding: 14 }}>Cancel</button>
                    <button onClick={handleSubmitExpense} disabled={submitting || !expenseForm.amount} className="btn-exec btn-primary" style={{ flex: 2, padding: 14 }}>
                       {submitting ? <RefreshCw size={18} className="animate-spin" /> : 'Confirm Dispatch'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </UnifiedLayout>
  );
};

export default StaffBudgetTracker;