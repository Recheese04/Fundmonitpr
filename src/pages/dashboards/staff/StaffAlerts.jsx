import React from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import { Bell, CheckCircle, Info, RefreshCw } from "lucide-react";

export default function StaffAlerts() {
  const alerts = [
    { title: "Request Approved", desc: "Your request REQ-901 (Logitech Mouse) has been approved by the Dept Head.", type: "success", time: "1 hour ago" },
    { title: "Quarterly Deadline", desc: "All Q1 reimbursement requests must be submitted by March 15.", type: "info", time: "2 days ago" },
  ];

  return (
    <UnifiedLayout 
      title="Environmental Alerts" 
      subtitle="Operational notifications & dispatch telemetry"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .sa-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .sa-card { 
          background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 16px; 
          display: flex; gap: 12px; align-items: flex-start; transition: all 0.2s; cursor: pointer;
        }
        .sa-card:hover { border-color: #fde68a; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .sa-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; alignItems: center; justifyContent: center; flex-shrink: 0; }
        .sa-success { background: #0f172a; color: #fde68a; border: 1px solid rgba(245,168,43,0.3); }
        .sa-info { background: #fafafa; color: #94a3b8; border: 1px solid #f1f5f9; }
      `}</style>

      <div className="sa-root" style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 600, paddingBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "0 4px" }}>
           <h3 style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Broadcast Feed</h3>
           <RefreshCw size={14} color="#94a3b8" style={{ cursor: "pointer" }} />
        </div>

        {alerts.map((alert, i) => (
          <div key={i} className="sa-card">
            <div className={`sa-icon ${alert.type === 'success' ? 'sa-success' : 'sa-info'}`} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              {alert.type === 'success' ? <CheckCircle size={18} /> : <Info size={18} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", margin: 0 }}>{alert.title}</h4>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", fontFamily: "'IBM Plex Mono', monospace" }}>{alert.time}</span>
              </div>
              <p style={{ fontSize: 12, color: "#64748b", fontWeight: 500, margin: 0, lineHeight: 1.5 }}>{alert.desc}</p>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div style={{ padding: 60, textAlign: "center", border: "2px dashed #f1f5f9", borderRadius: 20, color: "#cbd5e1", fontSize: 12, fontWeight: 700 }}>
             ZERO ALERT STATE
          </div>
        )}
      </div>
    </UnifiedLayout>
  );
}