import React, { useState, useEffect } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import { MessageSquare, CheckCircle, XCircle, User, Shield, AlertCircle } from "lucide-react";
import API_URL from "@/apiConfig";

export default function Approvals() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/dept_expenses.php?action=get_reports&department_id=${user.department_id || 0}`);
      const data = await res.json();
      if (data.success) {
        // Filter only pending requests
        setPendingRequests(data.data.filter(r => r.status === 'pending'));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAction = async (id, status) => {
    if (status === 'rejected' && !rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("status", status);
      formData.append("user_id", user.id);
      if (status === 'rejected') {
        formData.append("rejection_reason", rejectReason);
      }

      const res = await fetch(`${API_URL}/dept_expenses.php?action=update_status`, {
        method: "POST",
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        setPendingRequests(pendingRequests.filter(r => r.id !== id));
        if (status === 'rejected') {
          setRejectingId(null);
          setRejectReason("");
        }
      } else {
        alert("Action failed: " + data.message);
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    }
  };

  return (
    <UnifiedLayout 
      title="Approval Pipeline" 
      subtitle="Pending authorization for fund dispatches"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .ap-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .ap-card { 
          background: #fff; border: 1px solid #f1f5f9; border-radius: 16px; 
          display: flex; flex-direction: column; overflow: hidden;
          transition: border-color 0.2s;
        }
        .ap-card:hover { border-color: #cbd5e1; }
        .ap-header { padding: 12px 20px; border-bottom: 1px solid #f8fafc; background: #fafafa; display: flex; justify-content: space-between; align-items: center; }
        .ap-body { padding: 20px; display: flex; gap: 20px; }
        .ap-content { flex: 1; }
        .ap-sidebar { width: 140px; border-left: 1px solid #f1f5f9; padding-left: 20px; display: flex; flexDirection: column; justifyContent: space-between; }
        .ap-badge { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; background: #f1f5f9; padding: 4px 10px; border-radius: 99px; }
        .ap-amount { font-family: 'IBM Plex Mono', monospace; font-size: 18px; font-weight: 800; color: #1e293b; margin-top: 4px; }
        .ap-btn { 
          width: 100%; padding: 8px; border-radius: 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; 
          cursor: pointer; transition: all 0.2s; display: flex; alignItems: center; justifyContent: center; gap: 6px;
        }
        .btn-deny { background: #fff; border: 1px solid #fee2e2; color: #ef4444; }
        .btn-deny:hover { background: #fef2f2; border-color: #fca5a5; }
        .btn-approve { background: #0f172a; border: 1px solid #1e293b; color: #fff; }
        .btn-approve:hover { background: #1e293b; transform: translateY(-1px); }
        .reject-modal { margin-top: 10px; padding: 12px; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; }
        .reject-input { width: 100%; padding: 8px; border: 1px solid #feb2b2; border-radius: 6px; margin-bottom: 8px; font-size: 12px; font-family: 'Outfit'; }
      `}</style>

      <div className="ap-root" style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 40 }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#94a3b8", padding: 40, fontWeight: 600 }}>Loading requests...</p>
        ) : (
          <>
            {pendingRequests.map((req) => (
              <div key={req.id} className="ap-card">
                <div className="ap-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                     <Shield size={14} color="#94a3b8" />
                     <span style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>ID: {req.id} • {req.subcategory_name}</span>
                  </div>
                  <span className="ap-badge">Awaiting Authorization</span>
                </div>
                
                <div className="ap-body">
                  <div className="ap-content">
                    <div style={{ marginBottom: 16 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{req.description}</h4>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                        <User size={12} strokeWidth={2.5} /> {req.staff_name} ({req.staff_role}) • {req.expense_date}
                      </p>
                    </div>
                    
                    {req.receipt_path && (
                      <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 12, border: "1px dashed #e2e8f0", display: "flex", gap: 10 }}>
                        <MessageSquare size={14} color="#cbd5e1" style={{ marginTop: 2, flexShrink: 0 }} />
                        <a href={`${API_URL}/../${req.receipt_path}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#3b82f6", fontWeight: 600, margin: 0, textDecoration: "none" }}>View Attached Document</a>
                      </div>
                    )}

                    {rejectingId === req.id && (
                      <div className="reject-modal">
                        <label style={{ fontSize: 10, fontWeight: 800, color: "#c53030", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                          <AlertCircle size={10} style={{ display: "inline", marginRight: 4 }}/>
                          Reason for Rejection
                        </label>
                        <input 
                          type="text" 
                          className="reject-input"
                          placeholder="State why this is being rejected..."
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          autoFocus
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="ap-btn" style={{ background: "#c53030", color: "#fff", border: "none" }} onClick={() => handleAction(req.id, 'rejected')}>Confirm Denial</button>
                          <button className="ap-btn" style={{ background: "#fff", color: "#4a5568", border: "1px solid #cbd5e1" }} onClick={() => { setRejectingId(null); setRejectReason(""); }}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ap-sidebar">
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", margin: 0 }}>Dispatch Value</p>
                      <div className="ap-amount">₱{parseFloat(req.amount).toLocaleString()}</div>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                      <button className="ap-btn btn-approve" onClick={() => handleAction(req.id, 'approved')} disabled={rejectingId === req.id}><CheckCircle size={14} /> Approve</button>
                      <button className="ap-btn btn-deny" onClick={() => setRejectingId(req.id)} disabled={rejectingId === req.id}><XCircle size={14} /> Deny</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {pendingRequests.length === 0 && (
              <div style={{ padding: 80, textAlign: "center", border: "2px dashed #f1f5f9", borderRadius: 24, background: "#fff", color: "#cbd5e1" }}>
                 <Shield size={48} strokeWidth={1} style={{ margin: "0 auto 16px" }} />
                 <p style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>Queue Empty: Zero Pending Actions</p>
              </div>
            )}
          </>
        )}
      </div>
    </UnifiedLayout>
  );
}