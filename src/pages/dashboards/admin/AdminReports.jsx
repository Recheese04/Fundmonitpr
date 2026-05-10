import React, { useState } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import { FileSpreadsheet, FileText, Calendar, ChevronRight, Loader2, Download, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import API_URL from "@/apiConfig";

export default function AdminReports() {
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState({ total_users: 0, total_budget: "0.00", allocated_budget: "0.00" });

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin_actions.php?action=get_stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  // Helper to trigger the browser download
  const triggerDownload = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 1. Export Global Expense Ledger
  const handleExportGlobalLedger = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`${API_URL}/admin_actions.php?action=get_all_expenses`);
      const result = await res.json();
      
      if (result.success && result.data.length > 0) {
        const headers = ["ID", "Date", "Department", "Staff Name", "Category", "Description", "Amount (PHP)", "Status"];
        const rows = result.data.map(e => [
          e.id, 
          e.expense_date, 
          `"${e.department_name}"`, 
          `"${e.staff_name}"`, 
          `"${e.category_name || 'General'}"`, 
          `"${e.description}"`, 
          e.amount, 
          e.status.toUpperCase()
        ]);
        
        const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        triggerDownload(csvContent, `Global_Expense_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success("Global Expense Ledger exported successfully!");
      } else {
        toast.error("No expense data found to export.");
      }
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export data.");
    }
    setIsExporting(false);
  };

  // 2. Export Budget Allocations
  const handleExportBudgets = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`${API_URL}/admin_actions.php?action=get_budgets`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const headers = ["Budget ID", "Fiscal Year", "Department", "Allocated Budget (PHP)"];
        const rows = data.map(b => [
          b.id,
          b.budget_year,
          `"${b.department_name}"`,
          b.total_budget
        ]);
        
        const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        triggerDownload(csvContent, `Annual_Budget_Distribution_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success("Annual Budget Distribution exported successfully!");
      } else {
        toast.error("No budget allocations found to export.");
      }
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export data.");
    }
    setIsExporting(false);
  };

  return (
    <UnifiedLayout title="Fiscal Dossiers" subtitle="Archived financial statements and audit trails">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        .ar-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .ar-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 20px; transition: all 0.2s; }
        .btn-export {
          padding: 10px 20px; background: #0f172a; color: #fde68a; 
          border: 1px solid rgba(245,168,43,0.3); border-radius: 10px;
          font-size: 12px; font-weight: 800; cursor: pointer;
          text-transform: uppercase; letter-spacing: 0.05em;
          transition: all 0.15s; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-export:hover:not(:disabled) { background: #1e293b; box-shadow: 0 4px 12px rgba(245,168,43,0.2); transform: translateY(-1px); }
        .btn-export:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .report-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-radius: 12px; border: 1px solid #f8fafc;
          background: #fff; margin-bottom: 12px; transition: all 0.15s;
        }
        .report-item:hover { border-color: #e2e8f0; background: #fafafa; transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .btn-download-icon {
          background: #f1f5f9; border: none; color: #3b82f6; width: 36px; height: 36px;
          border-radius: 10px; display: flex; alignItems: center; justify-content: center; cursor: pointer;
          transition: 0.2s;
        }
        .report-item:hover .btn-download-icon { background: #3b82f6; color: #fff; }
      `}</style>

      <div className="ar-root" style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 40 }}>
        
        {/* STATS OVERVIEW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          <div className="ar-card">
            <p style={{ fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>University Total Budget</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>₱{stats.total_budget}</p>
          </div>
          <div className="ar-card">
            <p style={{ fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Current Year Allocation</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>₱{stats.allocated_budget}</p>
          </div>
          <div className="ar-card">
            <p style={{ fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Active Personnel</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>{stats.total_users}</p>
          </div>
        </div>
        
        {/* GLOBAL ACTIONS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", background: "linear-gradient(to right, #0f172a, #1e293b)", padding: 30, borderRadius: 20, color: "#fff" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#f8fafc" }}>Master Export Engine</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8", fontWeight: 500, maxWidth: 400 }}>
              Generate complete, unfiltered .CSV ledger files of the university's entire financial history for external auditing.
            </p>
          </div>
          <button className="btn-export" onClick={handleExportGlobalLedger} disabled={isExporting}>
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            {isExporting ? "Compiling..." : "Global Expense Ledger (.CSV)"}
          </button>
        </div>

        {/* AVAILABLE REPORTS LIST */}
        <div className="ar-card" style={{ padding: 0, overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <div style={{ padding: "16px 24px", background: "#fafafa", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
            <Calendar size={16} color="#94a3b8" />
            <span style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Standard Reports</span>
          </div>
          
          <div style={{ padding: 24 }}>
            
            {/* Report 1: Budgets */}
            <div className="report-item" onClick={handleExportBudgets} style={{ cursor: 'pointer' }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
                  <FileText size={20} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>Annual Budget Distribution</p>
                  <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, margin: "2px 0 0" }}>Ledger • Master allocation of all departments</p>
                </div>
              </div>
              <button className="btn-download-icon"><Download size={18} /></button>
            </div>

            {/* Report 2: Expenses */}
            <div className="report-item" onClick={handleExportGlobalLedger} style={{ cursor: 'pointer' }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>Global Expense Audit</p>
                  <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, margin: "2px 0 0" }}>Audit • Every expense requested, approved, or rejected</p>
                </div>
              </div>
              <button className="btn-download-icon"><Download size={18} /></button>
            </div>

            <div style={{ marginTop: 24, padding: "40px 20px", textAlign: "center", background: "#f8fafc", borderRadius: 16, border: "2px dashed #e2e8f0" }}>
              <AlertCircle size={32} color="#cbd5e1" style={{ marginBottom: 12, opacity: 0.5, margin: "0 auto 12px" }} />
              <p style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>End of Records</p>
              <p style={{ fontSize: 12, color: "#cbd5e1", marginTop: 6, fontWeight: 500 }}>More reports will be unlocked as data scales.</p>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}