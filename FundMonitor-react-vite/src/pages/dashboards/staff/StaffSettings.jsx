import React from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";

export default function StaffSettings() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <UnifiedLayout 
      title="Identity Configuration" 
      subtitle="Security parameters & profile synchronicity"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .ss-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .ss-card { 
          background: #fff; border: 1px solid #f1f5f9; border-radius: 20px; padding: 32px; 
          max-width: 500px; transition: border-color 0.2s;
        }
        .ss-card:hover { border-color: #fde68a; }
        .ss-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; display: block; }
        .ss-input {
          width: 100%; padding: 12px 16px; background: #fafafa; border: 1px solid #e2e8f0; border-radius: 12px;
          font-size: 14px; font-weight: 600; outline: none; transition: all 0.15s;
        }
        .ss-input:focus { border-color: #f5a82b; background: #fff; box-shadow: 0 0 0 3px rgba(245,168,43,0.1); }
        .ss-input:disabled { opacity: 0.6; cursor: not-allowed; background: #f8fafc; }
        .btn-update {
          width: 100%; padding: 14px; background: #0f172a; color: #fde68a; border: 1px solid rgba(245,168,43,0.4); border-radius: 14px;
          font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
          transition: all 0.2s; cursor: pointer; margin-top: 12px;
        }
        .btn-update:hover { background: #1e293b; transform: translateY(-1px); box-shadow: 0 4px 15px rgba(245,168,43,0.1); }
      `}</style>
      <div className="ss-root" style={{ paddingBottom: 40 }}>
        <div className="ss-card">
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid #f8fafc" }}>
            <div style={{ width: 64, height: 64, background: "#0f172a", border: "1px solid rgba(245,168,43,0.3)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "#fde68a", fontSize: 24, fontWeight: 900 }}>
              {user.name?.charAt(0) || "S"}
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>{user.name || "Staff Member"}</h3>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>{user.role} • {user.department_name}</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label className="ss-label">Email Node</label>
              <input type="text" className="ss-input" defaultValue={user.email} disabled />
            </div>
            <div>
              <label className="ss-label">Access Key (Password)</label>
              <input type="password" className="ss-input" placeholder="••••••••" />
            </div>
            <button className="btn-update">Update configuration</button>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}