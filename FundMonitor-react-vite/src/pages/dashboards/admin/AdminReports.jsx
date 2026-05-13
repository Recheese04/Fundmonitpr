import React, { useState } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import { FileSpreadsheet, FileText, Calendar, ChevronRight, Loader2, Download, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import API_URL from "@/apiConfig";

export default function AdminReports() {
  const [isExporting, setIsExporting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total_users: 0, total_budget: "0.00", allocated_budget: "0.00" });

  React.useEffect(() => {
    fetchStats();
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`${API_URL}/dept_expenses.php?action=get_submissions`);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch submissions", err);
    }
  };

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
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const escapeCSV = (val) => {
    const stringVal = String(val ?? '');
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
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
          e.department_name, 
          e.staff_name, 
          e.category_name || 'General', 
          e.description, 
          parseFloat(e.amount).toFixed(2), 
          e.status.toUpperCase()
        ]);
        
        const csvContent = [
          escapeCSV(`FUND MONITOR - GLOBAL EXPENSE AUDIT LEDGER`),
          escapeCSV(`Institution: University Financial Management`),
          escapeCSV(`Exported At: ${new Date().toLocaleString()}`),
          '', // Spacer
          headers.map(escapeCSV).join(','),
          ...rows.map(row => row.map(escapeCSV).join(','))
        ].join('\n');

        triggerDownload(csvContent, `Global_Expense_Audit_${new Date().toISOString().split('T')[0]}.csv`);
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
          b.department_name,
          parseFloat(b.total_budget).toFixed(2)
        ]);
        
        const csvContent = [
          escapeCSV(`FUND MONITOR - ANNUAL BUDGET DISTRIBUTION`),
          escapeCSV(`Institution: University Financial Management`),
          escapeCSV(`Exported At: ${new Date().toLocaleString()}`),
          '', // Spacer
          headers.map(escapeCSV).join(','),
          ...rows.map(row => row.map(escapeCSV).join(','))
        ].join('\n');

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

        {/* OFFICIAL DEPARTMENTAL FILINGS - NOW PRIMARY VIEW */}
        <div className="ar-card" style={{ padding: 0, overflow: "hidden", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "20px 24px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: "#4f46e5", padding: 8, borderRadius: 8, color: "#fff" }}>
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Official Departmental Filings</span>
                <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 500 }}>Verified fiscal snapshots submitted by Department Heads</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={fetchSubmissions} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 5 }} title="Refresh List">
                 <Loader2 size={16} className={isExporting ? "animate-spin" : ""} />
              </button>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "4px 12px", borderRadius: 20, border: "1px solid #c7d2fe" }}>
                {submissions.length} Filings
              </span>
            </div>
          </div>
          
          <div style={{ padding: "24px" }}>
             {submissions.length === 0 ? (
               <div style={{ textAlign: "center", padding: "60px 0", background: "#fafafa", borderRadius: 16, border: "2px dashed #e2e8f0" }}>
                 <AlertCircle size={40} color="#cbd5e1" style={{ marginBottom: 16, opacity: 0.5, margin: "0 auto 16px" }} />
                 <p style={{ fontSize: 15, fontWeight: 700, color: "#64748b", margin: 0 }}>No Official Filings Detected</p>
                 <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Department heads have not submitted any fiscal reports for this period.</p>
               </div>
             ) : (
               <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                 {submissions.map((sub) => (
                   <div key={sub.id} className="report-item" style={{ margin: 0, cursor: "default", transform: "none", boxShadow: "none", border: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                         <div style={{ width: 48, height: 48, borderRadius: 14, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
                            <FileText size={24} />
                         </div>
                         <div>
                            <p style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>{sub.department_name || `Department #${sub.department_id}`}</p>
                            <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, margin: "3px 0 0", display: "flex", alignItems: "center", gap: 5 }}>
                               <User size={12} className="text-slate-400" /> Filed by {sub.submitter_name || "Authorized Personnel"} • <Calendar size={12} className="text-slate-400" /> FY {sub.fiscal_year}
                            </p>
                         </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                         <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Timestamp</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#475569", margin: "2px 0 0" }}>{new Date(sub.created_at).toLocaleString()}</p>
                         </div>
                         <a 
                           href={`${API_URL}/fundmonitor-api/${sub.file_path}`} 
                           target="_blank" 
                           rel="noreferrer"
                           className="btn-export" 
                           style={{ padding: "10px 20px", fontSize: 11, background: "#0f172a", color: "#fde68a", textDecoration: "none" }}
                         >
                            <Download size={16} /> Download CSV
                         </a>
                      </div>
                   </div>
                 ))}
                 
                 <div style={{ marginTop: 20, padding: "20px", textAlign: "center", background: "#f8fafc", borderRadius: 16, border: "1px solid #f1f5f9" }}>
                   <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Security Verified</p>
                   <p style={{ fontSize: 11, color: "#cbd5e1", marginTop: 4, fontWeight: 500 }}>All files are cryptographically signed and stored in the secure audit vault.</p>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}