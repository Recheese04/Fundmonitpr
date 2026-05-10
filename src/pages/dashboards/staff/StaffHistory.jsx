import React, { useState, useEffect } from 'react';
import UnifiedLayout from '../../../components/layout/UnifiedLayout';
import { 
  History, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Download, 
  FileText, 
  ChevronRight,
  RefreshCw,
  AlertCircle,
  X,
  Clock
 } from 'lucide-react';
import API_URL from "@/apiConfig";

const StaffHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [auditTrail, setAuditTrail] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.user_id || user?.id;
      
      if (!userId) {
        console.warn('No user identity detected');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/expenses.php?action=get_user_expenses&user_id=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.expenses || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditTrail = async (expense) => {
    setSelectedAudit(expense);
    setAuditLoading(true);
    try {
      const response = await fetch(`${API_URL}/expenses.php?action=get_audit_trail&expense_id=${expense.id}`);
      const data = await response.json();
      if (data.success) {
        setAuditTrail(data.audits || []);
      }
    } catch (error) {
      console.error(error);
    }
    setAuditLoading(false);
  };

  return (
    <UnifiedLayout
      title="Request Archive"
      subtitle="Historical telemetry of fund dispatches"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .sh-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .sh-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; overflow: hidden; }
        .sh-card:hover { border-color: #fde68a; }
        .sh-table { width: 100%; border-collapse: collapse; }
        .sh-table th { padding: 12px 16px; background: #0f172a; font-size: 10px; font-weight: 800; color: #fde68a; text-transform: uppercase; text-align: left; border-bottom: 1px solid rgba(245,168,43,0.2); }
        .sh-table td { padding: 12px 16px; border-bottom: 1px solid #f8fafc; font-size: 13px; vertical-align: middle; }
        .sh-table tr:hover { background: #fafafa; }
        .badge-exec {
          padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid transparent; display: inline-block;
        }
        .badge-pending { background: #fffbeb; color: #b45309; border-color: #fef3c7; }
        .badge-approved { background: #f0fdf4; color: #15803d; border-color: #dcfce7; }
        .badge-rejected { background: #fef2f2; color: #b91c1c; border-color: #fee2e2; }
        .btn-icon-sh {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0;
          background: #fff; color: #64748b; cursor: pointer; display: flex;
          align-items: center; justify-content: center; transition: all 0.15s;
          text-decoration: none;
        }
        .btn-icon-sh:hover { background: #f8fafc; color: #4f46e5; border-color: #cbd5e1; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; }
        .modal-content { background: #fff; width: 100%; max-width: 480px; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
        .modal-header { padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
        .modal-body { padding: 24px; overflow-y: auto; }
        
        .timeline { position: relative; border-left: 2px solid #e2e8f0; margin-left: 12px; padding-left: 24px; padding-bottom: 8px; }
        .timeline-node {
          position: absolute; left: -11px; width: 20px; height: 20px; border-radius: 50%;
          background: #fff; border: 4px solid #cbd5e1; top: 0;
        }
        .node-requested { border-color: #94a3b8; }
        .node-approved { border-color: #22c55e; }
        .node-rejected { border-color: #ef4444; }
        .node-status_updated { border-color: #f59e0b; }
        .timeline-item { position: relative; margin-bottom: 24px; }
      `}</style>

      <div className="sh-root" style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 40 }}>
        <div className="sh-card">
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #f8fafc", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
               <History size={14} color="#94a3b8" />
               <span style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Interaction Log</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8" }}>{history.length} RECORDS TOTAL</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="sh-table">
              <thead>
                <tr>
                  <th>Meta / Reference</th>
                  <th>Classification</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Artifacts</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan="5" style={{ padding: 40, textAlign: "center" }}><RefreshCw size={24} className="animate-spin text-indigo-200" /></td></tr>
                ) : history.length === 0 ? (
                   <tr><td colSpan="5" style={{ padding: 40, textAlign: "center", color: "#cbd5e1", fontSize: 11, fontWeight: 600 }}>Zero History Records</td></tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "#1e293b" }}>{item.description}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{new Date(item.created_at).toLocaleDateString()} • REF-{item.id}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#475569" }}>{item.category_name || '-'}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{item.subcategory_name}</div>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 800, color: "#000", fontFamily: "'IBM Plex Mono', monospace" }}>
                        {formatCurrency(item.amount)}
                      </td>
                      <td>
                        <span className={`badge-exec badge-${item.status?.toLowerCase()}`}>
                          {item.status}
                        </span>
                        {item.status === 'rejected' && item.rejection_reason && (
                          <div style={{ fontSize: 9, color: '#ef4444', marginTop: 4, fontWeight: 700 }}>REJECTED: {item.rejection_reason}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                          {item.receipt_path && (
                             <a href={`${API_URL}/${item.receipt_path}`} target="_blank" rel="noreferrer" className="btn-icon-sh" title="View Source">
                                <FileText size={14} />
                             </a>
                          )}
                          <button className="btn-icon-sh" title="View Audit Trail" onClick={() => fetchAuditTrail(item)}>
                             <Clock size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Trail Modal */}
      {selectedAudit && (
        <div className="sh-root modal-overlay" onClick={() => setSelectedAudit(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Audit Trail</h3>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b', fontWeight: 600 }}>REF-{selectedAudit.id} • {formatCurrency(selectedAudit.amount)}</p>
              </div>
              <button onClick={() => setSelectedAudit(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {auditLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><RefreshCw size={24} className="animate-spin text-slate-300 mx-auto" /></div>
              ) : auditTrail.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>No audit records found.</div>
              ) : (
                <div style={{ paddingTop: 8 }}>
                  {auditTrail.map((audit, index) => (
                    <div className="timeline-item" key={audit.id}>
                      <div className="timeline">
                        <div className={`timeline-node node-${audit.action}`}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>
                            {audit.action.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'IBM Plex Mono', monospace" }}>
                            {new Date(audit.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 6px', fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{audit.user_name} <span style={{ color: '#94a3b8', fontWeight: 500 }}>({audit.user_role})</span></p>
                        {audit.comments && (
                          <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 8, fontSize: 12, color: '#475569', border: '1px solid #f1f5f9' }}>
                            "{audit.comments}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </UnifiedLayout>
  );
};

export default StaffHistory;