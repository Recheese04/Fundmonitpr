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
  FileText,
  Download,
  Edit3,
  Trash2,
  Clock
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
  const [expandedPending, setExpandedPending] = useState({});
  
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

  const [isEditingPending, setIsEditingPending] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);

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
    
    // Sub-category totals
    const allocatedToSubcategories = subcategories.reduce((sum, sub) => sum + parseFloat(sub.allocation_amount || 0), 0);
    const subcategoriesRemaining = subcategories.reduce((sum, sub) => {
      const balance = sub.remaining_budget !== undefined ? sub.remaining_budget : 0;
      return sum + parseFloat(balance || 0);
    }, 0);
    
    // Category unallocated amount
    const unallocated = totalBudget - allocatedToSubcategories;
    
    // Total remaining for this category is unallocated + subcategories remaining
    const remainingBudget = unallocated + subcategoriesRemaining;
    
    // Percentage used at category level
    const percentageUsed = totalBudget > 0 ? ((totalBudget - remainingBudget) / totalBudget) * 100 : 0;
    
    return {
      totalBudget,
      allocatedAmount: allocatedToSubcategories,
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
    setIsEditingPending(false);
    setEditingExpenseId(null);
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

  const openEditModal = (category, subcategory, expense) => {
    setSelectedSubcategory({
      ...subcategory,
      categoryName: category.name,
      categoryId: category.id
    });
    setExpenseForm({
      amount: expense.amount.toString(),
      description: expense.description,
      date: expense.expense_date,
      file: null, // Note: Existing file edit not supported here for simplicity
      fileName: '',
      categoryId: category.id,
      subcategoryId: subcategory.id
    });
    setIsEditingPending(true);
    setEditingExpenseId(expense.id);
    setShowExpenseModal(true);
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
    const remaining = subToCheck
      ? parseFloat(subToCheck.remaining_budget ?? 0)
      : 0;
    
    if (finalAmount > remaining) {
      setError(`Amount exceeds remaining budget (Available: ${formatCurrency(remaining)})`);
      return;
    }

    setSubmitting(true);
    try {
      if (isEditingPending) {
        // Update existing pending expense
        const response = await fetch(`${API_BASE_EXPENSES}?action=update_pending`, {
          method: "POST", // Using POST for update_pending as per API design
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expense_id: editingExpenseId,
            user_id: user.user_id || user.id,
            amount: finalAmount,
            description: expenseForm.description,
            date: expenseForm.date
          }),
        });
        const data = await response.json();
        if (data.success) {
          setSuccess('Requisition updated successfully');
          closeExpenseModal();
          fetchCategories();
        } else {
          setError(data.message || 'Failed to update requisition');
        }
      } else {
        // Create new expense
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
      }
    } catch (err) {
      setError('Operation failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPending = async (expenseId) => {
    if (!window.confirm("Are you sure you want to cancel this requisition? This action cannot be undone.")) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_EXPENSES}?action=cancel_pending`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expense_id: expenseId,
          user_id: user.user_id || user.id
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess("Requisition cancelled successfully");
        fetchCategories();
      } else {
        setError(data.message || "Failed to cancel requisition");
      }
    } catch (err) {
      setError("Cancel failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // 1. Prepare Metadata Header
    const deptName = user?.department_name || "Department";
    const exportDate = new Date().toLocaleString();
    
    // 2. Prepare Data Rows
    const headers = ['Category', 'Sub-Category', 'Total Allotment', 'Pending (In Pipeline)', 'Official Remaining', 'Net Available'];
    const rows = [];
    
    let grandAllotment = 0;
    let grandPending = 0;
    let grandRemaining = 0;

    categories.forEach(cat => {
      (cat.subcategories || []).forEach(sub => {
        const allotment = parseFloat(sub.allocation_amount || 0);
        const pending = parseFloat(sub.pending_amount || 0);
        const remaining = parseFloat(sub.remaining_budget || 0);
        const netAvailable = remaining - pending;

        grandAllotment += allotment;
        grandPending += pending;
        grandRemaining += remaining;

        rows.push([
          cat.name,
          sub.name,
          allotment.toFixed(2),
          pending.toFixed(2),
          remaining.toFixed(2),
          netAvailable.toFixed(2)
        ]);
      });
    });

    // 3. Add Grand Total Row
    rows.push([]); // Empty row for spacing
    rows.push([
      'GRAND TOTALS',
      '',
      grandAllotment.toFixed(2),
      grandPending.toFixed(2),
      grandRemaining.toFixed(2),
      (grandRemaining - grandPending).toFixed(2)
    ]);

    // 4. Construct CSV Content with proper escaping
    const escapeCSV = (val) => {
      const stringVal = String(val);
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    };

    const csvContent = [
      escapeCSV(`FUND MONITOR - BUDGET STATUS REPORT`),
      escapeCSV(`Department: ${deptName}`),
      escapeCSV(`Fiscal Year: ${selectedYear}`),
      escapeCSV(`Exported At: ${exportDate}`),
      '', // Spacer
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    // 5. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeDeptName = deptName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    link.href = url;
    link.setAttribute('download', `budget_report_${safeDeptName}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const categoriesSum = categories.reduce((sum, cat) => sum + parseFloat(cat.total_budget || 0), 0);
  const deptUnallocated = departmentAllocatedBudget - categoriesSum;
  const totalRemaining = deptUnallocated + categories.reduce((sum, cat) => sum + calculateCategoryBudget(cat).remainingBudget, 0);
  const totalPending = categories.reduce((sum, cat) => {
    return sum + (cat.subcategories || []).reduce((subSum, sub) => subSum + parseFloat(sub.pending_amount || 0), 0);
  }, 0);

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
        
        @media print {
          @page { margin: 20mm; size: A4; }
          body { background: #fff !important; color: #000 !important; font-size: 11pt !important; }
          .no-print, .btn-exec, .sbt-welcome, .fixed, .backdrop-blur-md { display: none !important; }
          
          .sbt-root { padding: 0 !important; max-width: 100% !important; }
          .print-only { display: block !important; }
          
          /* Force all categories and sub-items to show during print */
          .sub-table-container { display: block !important; height: auto !important; opacity: 1 !important; visibility: visible !important; }
          .cat-row { 
            background: #f8fafc !important; 
            border: 1px solid #cbd5e1 !important; 
            margin-top: 20px; 
            break-inside: avoid; 
            padding: 10px 15px !important;
          }
          .cat-row button { display: none !important; }
          
          .sbt-main-list { border: none !important; box-shadow: none !important; }
          
          .sub-table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            margin-top: 0 !important;
            border: 1px solid #e2e8f0 !important;
          }
          .sub-table th { 
            background: #f1f5f9 !important; 
            color: #0f172a !important; 
            font-size: 9pt !important; 
            border: 1px solid #e2e8f0 !important;
            padding: 8px 12px !important;
          }
          .sub-table td { 
            border: 1px solid #e2e8f0 !important; 
            padding: 8px 12px !important;
            color: #000 !important;
          }
          
          .sbt-card { border: 1px solid #e2e8f0 !important; break-inside: avoid; margin-bottom: 15px !important; }
          .sbt-card-indigo { background: #fff !important; color: #000 !important; border: 2px solid #000 !important; }
          .sbt-card-indigo .sbt-label, .sbt-card-indigo .sbt-value { color: #000 !important; }
          
          .print-summary-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 20px !important; margin-bottom: 30px !important; }
        }
      `}</style>

      <div className="sbt-root" style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 40 }}>
        
        {/* PRINT ONLY HEADER */}
        <div className="print-only" style={{ display: "none", marginBottom: 40 }}>
          <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", paddingBottom: 20, marginBottom: 20 }}>
             <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "0.1em" }}>DEPARTMENTAL BUDGET STATUS REPORT</h1>
             <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", margin: "5px 0 0", textTransform: "uppercase" }}>Financial Monitoring System • Official Record</p>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 }}>
            <div>
               <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, margin: 0, textTransform: "uppercase" }}>Issuing Department</p>
               <p style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>{user?.department_name || "Department of Funds"}</p>
            </div>
            <div style={{ textAlign: "right" }}>
               <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, margin: 0, textTransform: "uppercase" }}>Fiscal Period</p>
               <p style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>FY {selectedYear}</p>
               <p style={{ fontSize: 9, color: "#64748b", fontWeight: 600, margin: "4px 0 0" }}>Report Date: {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="print-summary-grid">
             <div style={{ border: "1px solid #000", padding: 15, borderRadius: 8 }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", margin: 0 }}>Total Approved Allocation</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", margin: "5px 0 0" }}>{formatCurrency(departmentAllocatedBudget)}</p>
             </div>
             <div style={{ border: "1px solid #000", padding: 15, borderRadius: 8 }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", margin: 0 }}>Current Running Balance</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: "#10b981", margin: "5px 0 0" }}>{formatCurrency(totalRemaining)}</p>
             </div>
          </div>
        </div>

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
            <button onClick={handleExport} className="btn-exec btn-secondary">
              <Download size={14} /> Export CSV
            </button>
            <button onClick={() => window.print()} className="btn-exec btn-secondary">
              <Printer size={14} /> Print
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
        <div className="sbt-card sbt-main-list" style={{ padding: 0 }}>
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

                  {/* Sub-item table container - always visible in print */}
                  {(expandedCategories[category.id] || true) && (
                    <div className="sub-table-container" style={{ background: "#fafafa", padding: "8px 20px 20px", display: expandedCategories[category.id] ? "block" : "none" }}>
                      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
                        <table className="sub-table">
                          <thead>
                            <tr>
                              <th>Financial Item</th>
                              <th>Current Balance</th>
                              <th className="no-print" style={{ textAlign: "right" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.subcategories?.map((sub) => {
                              const remaining = parseFloat(sub.remaining_budget || 0);
                              const pendingAmt = parseFloat(sub.pending_amount || 0);
                              const pendingList = sub.pending_expenses || [];
                              const isEmpty = remaining <= 0;
                              const isPendingOpen = expandedPending[sub.id];
                              return (
                                <React.Fragment key={sub.id}>
                                  <tr>
                                    <td>
                                      <div style={{ fontWeight: 700, color: "#1e293b" }}>{sub.name}</div>
                                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Allotment: {formatCurrency(sub.allocation_amount)}</div>
                                    </td>
                                    <td>
                                      <span style={{ fontSize: 12, fontWeight: 800, color: isEmpty ? "#ef4444" : "#10b981", fontFamily: "'IBM Plex Mono', monospace" }}>
                                        {formatCurrency(remaining)}
                                      </span>
                                    </td>
                                    <td className="no-print" style={{ textAlign: "right" }}>
                                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                                        {pendingAmt > 0 && (
                                          <button
                                            onClick={() => setExpandedPending(prev => ({ ...prev, [sub.id]: !prev[sub.id] }))}
                                            style={{
                                              height: 32, padding: "0 12px", borderRadius: 8,
                                              background: isPendingOpen ? "#0f172a" : "#f8fafc",
                                              border: "1px solid #e2e8f0",
                                              color: isPendingOpen ? "#fde68a" : "#64748b", 
                                              fontSize: 10, fontWeight: 800,
                                              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                                              textTransform: "uppercase", letterSpacing: "0.05em",
                                              transition: "all 0.2s"
                                            }}
                                            onMouseEnter={e => { if(!isPendingOpen) { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a"; } }}
                                            onMouseLeave={e => { if(!isPendingOpen) { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#64748b"; } }}
                                          >
                                            <Clock size={12} /> {isPendingOpen ? "Hide" : "Pipeline"}
                                          </button>
                                        )}
                                        <button
                                          onClick={() => openExpenseModal(category, sub)}
                                          disabled={isEmpty}
                                          className="btn-exec btn-primary"
                                          style={{ height: 32, padding: "0 12px", opacity: isEmpty ? 0.3 : 1 }}
                                        >
                                          {isEmpty ? "Empty" : "Request"}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                  {/* Inline Pending Panel */}
                                  {isPendingOpen && (
                                    <tr>
                                      <td colSpan={3} style={{ padding: 0, background: "#f8fafc" }}>
                                        <div style={{ padding: "20px", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 10, background: "#fff7ed", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                   <RefreshCw size={14} color="#b45309" className="animate-spin" style={{ animationDuration: '3s' }} />
                                                </div>
                                                <div>
                                                   <h4 style={{ fontSize: 11, fontWeight: 800, color: "#1e293b", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pending Pipeline</h4>
                                                   <p style={{ fontSize: 10, color: "#64748b", margin: 0 }}>Requests awaiting departmental authorization</p>
                                                </div>
                                             </div>
                                             <div style={{ background: "#fff", padding: "4px 12px", borderRadius: 99, border: "1px solid #e2e8f0", fontSize: 11, fontWeight: 800, color: "#0f172a" }}>
                                                Total: {formatCurrency(pendingAmt)}
                                             </div>
                                          </div>

                                          {pendingList.length === 0 ? (
                                            <div style={{ padding: "20px", textAlign: "center", background: "#fff", borderRadius: 12, border: "1px dashed #e2e8f0" }}>
                                               <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, fontWeight: 600 }}>No detailed record found in the buffer</p>
                                            </div>
                                          ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                              {pendingList.map((exp, i) => (
                                                <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                                                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                     <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f5a82b" }}></div>
                                                     <div>
                                                        <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>{exp.description}</p>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                                           <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4 }}>{exp.expense_date}</span>
                                                           <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8" }}>by {exp.user_name || "Authorized Staff"}</span>
                                                        </div>
                                                     </div>
                                                  </div>
                                                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                                                     <div style={{ textAlign: "right" }}>
                                                        <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>{formatCurrency(exp.amount)}</p>
                                                     </div>
                                                     <div style={{ display: "flex", gap: 6, borderLeft: "1px solid #f1f5f9", paddingLeft: 16 }}>
                                                        <button 
                                                           onClick={() => openEditModal(category, sub, exp)}
                                                           title="Edit Request"
                                                           style={{ width: 32, height: 32, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                                                           onMouseEnter={e => { e.currentTarget.style.color = "#4f46e5"; e.currentTarget.style.borderColor = "#4f46e5"; }}
                                                           onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                                                        >
                                                           <Edit3 size={14} />
                                                        </button>
                                                        <button 
                                                           onClick={() => handleCancelPending(exp.id)}
                                                           title="Cancel Request"
                                                           style={{ width: 32, height: 32, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                                                           onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#ef4444"; }}
                                                           onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                                                        >
                                                           <Trash2 size={14} />
                                                        </button>
                                                     </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
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

            {/* GRAND TOTAL SECTION */}
            {categories.length > 0 && (
               <div style={{ background: "#0f172a", padding: "24px 30px", borderTop: "4px solid #f5a82b" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <div>
                        <h3 style={{ fontSize: 11, fontWeight: 800, color: "#fde68a", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Departmental Grand Totals</h3>
                        <p style={{ fontSize: 10, color: "#94a3b8", margin: "4px 0 0" }}>Final fiscal summation for FY {selectedYear}</p>
                     </div>
                     <div style={{ display: "flex", gap: 40 }}>
                        <div style={{ textAlign: "right" }}>
                           <p style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", margin: 0 }}>Gross Allotment</p>
                           <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>{formatCurrency(departmentAllocatedBudget)}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                           <p style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", margin: 0 }}>Total Pending</p>
                           <p style={{ fontSize: 18, fontWeight: 800, color: "#f5a82b", fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>{formatCurrency(totalPending)}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                           <p style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", margin: 0 }}>Net Balance</p>
                           <p style={{ fontSize: 24, fontWeight: 900, color: "#10b981", fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>{formatCurrency(totalRemaining)}</p>
                        </div>
                     </div>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
           <div className="sbt-card" style={{ width: "100%", maxWidth: 600, padding: 0, overflow: "hidden", borderRadius: 24, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
              {/* Modal Header */}
              <div style={{ background: "#0f172a", padding: "28px 32px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                 <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                       <div style={{ background: "#f5a82b", width: 8, height: 8, borderRadius: "50%" }}></div>
                       <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                          {isEditingPending ? 'Modify Requisition' : 'Financial Requisition'}
                       </h3>
                    </div>
                    {/* Breadcrumb — shows where this request goes */}
                    {selectedSubcategory ? (
                       <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10, color: "#475569", background: "rgba(255,255,255,0.07)", padding: "3px 10px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{selectedSubcategory.categoryName}</span>
                          <span style={{ color: "#475569", fontSize: 12 }}>›</span>
                          <span style={{ fontSize: 10, color: "#fde68a", background: "rgba(245,168,43,0.15)", padding: "3px 10px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{selectedSubcategory.name}</span>
                       </div>
                    ) : (
                       <p style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Select a category to begin</p>
                    )}
                 </div>
                 <button onClick={closeExpenseModal} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer", padding: 8, borderRadius: 12 }}><X size={20} /></button>
              </div>
              
              <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
                 {error && <div style={{ background: "#fff1f2", color: "#e11d48", padding: 12, borderRadius: 10, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}><AlertTriangle size={16} />{error}</div>}
                 {success && <div style={{ background: "#f0fdf4", color: "#166534", padding: 12, borderRadius: 10, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}><CheckCircle2 size={16} />{success}</div>}

                 {/* Category/Sub selectors — only if no subcategory pre-selected */}
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
                          <span className="sbt-label">Financial Item</span>
                          <select className="compact-input" value={expenseForm.subcategoryId} onChange={(e) => setExpenseForm({...expenseForm, subcategoryId: e.target.value})} disabled={!expenseForm.categoryId}>
                             <option value="">Select</option>
                             {(categories || []).find(c => String(c.id) === String(expenseForm.categoryId))?.subcategories?.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                          </select>
                       </div>
                    </div>
                 )}

                 {/* Budget Summary Card */}
                 {(() => {
                    const subId = selectedSubcategory?.id || expenseForm.subcategoryId;
                    const sub = (categories || []).flatMap(c => c.subcategories || []).find(s => Number(s.id) === Number(subId));
                    if (!sub) return null;
                    const rem = parseFloat(sub.remaining_budget || 0);
                    const pen = parseFloat(sub.pending_amount || 0);
                    const alloc = parseFloat(sub.allocation_amount || 0);
                    const usedPct = alloc > 0 ? Math.min(100, ((alloc - rem) / alloc) * 100) : 0;
                    return (
                       <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: "18px 20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                             <div>
                                <p className="sbt-label" style={{ color: "#64748b", marginBottom: 4 }}>Current Balance</p>
                                <p style={{ fontSize: 28, fontWeight: 800, color: rem <= 0 ? "#ef4444" : "#0f172a", fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>{formatCurrency(rem)}</p>
                                <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>Allocated: {formatCurrency(alloc)}</p>
                             </div>
                             <div style={{ background: "#fff", padding: 10, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                                <DollarSign size={22} color="#f5a82b" />
                             </div>
                          </div>
                          <div style={{ height: 5, background: "#e2e8f0", borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
                             <div style={{ height: "100%", width: `${100 - usedPct}%`, background: rem <= 0 ? "#ef4444" : "#10b981", borderRadius: 99, transition: "width 0.4s" }} />
                          </div>
                          {pen > 0 && (
                             <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 14 }}>⏳</span>
                                <div>
                                   <p style={{ fontSize: 11, fontWeight: 800, color: "#92400e", margin: 0 }}>You have {formatCurrency(pen)} pending approval</p>
                                   <p style={{ fontSize: 10, color: "#b45309", margin: 0 }}>This will be deducted from your balance once approved by your department head.</p>
                                </div>
                             </div>
                          )}
                       </div>
                    );
                 })()}

                 {/* Amount & Date */}
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                       <span className="sbt-label">Request Amount (₱)</span>
                       <input type="number" className="compact-input" value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} placeholder="0.00" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                       <span className="sbt-label">Expenditure Date</span>
                       <input type="date" className="compact-input" value={expenseForm.date} onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})} />
                    </div>
                 </div>

                 {/* Justification with smart contextual placeholder */}
                 <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span className="sbt-label">Business Justification</span>
                    <textarea
                       className="compact-input"
                       style={{ minHeight: 90, resize: "none" }}
                       value={expenseForm.description}
                       onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                       placeholder={(() => {
                          const subId = selectedSubcategory?.id || expenseForm.subcategoryId;
                          const sub = (categories || []).flatMap(c => c.subcategories || []).find(s => Number(s.id) === Number(subId));
                          const name = (sub?.name || "").toLowerCase();
                          if (name.includes("learning") || name.includes("material")) return "e.g. chalk, markers, whiteboard erasers, bond paper, notebooks...";
                          if (name.includes("equipment")) return "e.g. projector bulb, printer cartridge, extension cords...";
                          if (name.includes("training") || name.includes("workshop")) return "e.g. seminar registration fee, training materials, facilitator fee...";
                          if (name.includes("digital") || name.includes("software") || name.includes("resource")) return "e.g. software license, online subscription, digital tool access...";
                          if (name.includes("maintenance") || name.includes("renovation")) return "e.g. repair labor, replacement parts, paint, electrical works...";
                          if (name.includes("wellness")) return "e.g. first aid kit, alcohol, sanitation supplies, face masks...";
                          if (name.includes("scholarship")) return "e.g. financial assistance for qualifying student (include student name)...";
                          if (name.includes("conference")) return "e.g. registration fee, accommodation, travel allowance...";
                          if (name.includes("certification")) return "e.g. board exam review fee, certification exam registration...";
                          if (name.includes("assessment")) return "e.g. evaluation materials, assessment tools, scoring sheets...";
                          return "Describe the purpose and specific items for this expense request...";
                       })()}
                    />
                 </div>

                 {/* Attachment */}
                 <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span className="sbt-label">Supporting Document <span style={{ color: "#cbd5e1", textTransform: "none", fontWeight: 500 }}>(optional)</span></span>
                    <div
                       onClick={() => document.getElementById('m-file').click()}
                       style={{
                          padding: "16px",
                          border: `2px dashed ${expenseForm.file ? "#7dd3fc" : "#e2e8f0"}`,
                          borderRadius: 14,
                          textAlign: "center",
                          cursor: "pointer",
                          background: expenseForm.file ? "#f0f9ff" : "#fafafa",
                          transition: "all 0.2s"
                       }}
                    >
                       <input type="file" id="m-file" className="hidden" onChange={handleFileChange} />
                       {expenseForm.file ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                             <Paperclip size={15} color="#0369a1" />
                             <span style={{ fontSize: 13, fontWeight: 700, color: "#0369a1" }}>{expenseForm.fileName}</span>
                             <span style={{ fontSize: 10, color: "#7dd3fc" }}>— click to replace</span>
                          </div>
                       ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#94a3b8" }}>
                             <Upload size={15} />
                             <span style={{ fontSize: 12, fontWeight: 700 }}>Upload receipt or quotation</span>
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Actions */}
                 <div style={{ display: "flex", gap: 12, paddingTop: 20, borderTop: "1px solid #f1f5f9" }}>
                    <button onClick={closeExpenseModal} className="btn-exec btn-secondary" style={{ flex: 1, padding: 14, borderRadius: 14, fontSize: 13 }}>Cancel</button>
                    <button
                       onClick={handleSubmitExpense}
                       disabled={submitting || !expenseForm.amount || !expenseForm.description.trim()}
                       className="btn-exec btn-primary"
                       style={{ flex: 2, padding: 14, borderRadius: 14, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: (submitting || !expenseForm.amount || !expenseForm.description.trim()) ? 0.5 : 1 }}
                    >
                       {submitting ? <><RefreshCw size={16} className="animate-spin" /> Processing...</> : <><Save size={16} /> {isEditingPending ? 'Update Requisition' : 'Submit Requisition'}</>}
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