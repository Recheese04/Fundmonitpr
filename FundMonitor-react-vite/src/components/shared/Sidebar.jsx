import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, Wallet, FileText, LogOut, Menu, X, 
  PieChart, ClipboardCheck, History, FolderTree, Printer,
  ShieldAlert, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || '{"role": "staff"}');

  const confirmLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = {
    admin: [
      { icon: <LayoutDashboard size={20}/>, label: "Overview", path: "/admin-dashboard" },
      { icon: <Wallet size={20}/>, label: "Budgets", path: "/admin-budgets" },
      { icon: <Users size={20}/>, label: "Users", path: "/admin-users" },
      { icon: <FileText size={20}/>, label: "Reports", path: "/admin-reports" },
    ],
    department_head: [
      { icon: <LayoutDashboard size={20}/>, label: "Dept Dashboard", path: "/dept-dashboard" },
      { icon: <Wallet size={20}/>, label: "Budget Allocation", path: "/dept-budget-allocation" },
      { icon: <FolderTree size={20}/>, label: "Categories", path: "/dept-categories" },
      { icon: <ClipboardCheck size={20}/>, label: "Approvals", path: "/dept-approvals" },
      { icon: <FileText size={20}/>, label: "Dept Reports", path: "/dept-reports" },
    ],
    staff: [
      { icon: <LayoutDashboard size={20}/>, label: "My Expenses", path: "/staff-dashboard" },
      { icon: <Printer size={20}/>, label: "Budget Tracker", path: "/staff-budget-tracker" },
      { icon: <History size={20}/>, label: "History", path: "/staff-history" },
    ]
  };

  const currentMenu = menuItems[user.role] || [];

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} className="bg-white shadow-md border-slate-200">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <aside className={`
        fixed top-0 left-0 z-40 h-screen transition-transform bg-slate-900 text-white w-64 p-6 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex items-center gap-3 mb-10 group cursor-pointer">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <PieChart size={22} />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">FundMonitor</span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Navigation</p>
          {currentMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm uppercase tracking-wide
                ${location.pathname === item.path 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"}
              `}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User info strip */}
        <div className="mb-3 px-3 py-2 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Signed in as</p>
          <p className="text-[11px] font-bold text-slate-300 truncate mt-0.5">{user.full_name || user.name || "User"}</p>
          <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wide">{user.role?.replace("_", " ")}</p>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm uppercase">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* ── LOGOUT CONFIRMATION MODAL ── */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.75)", backdropFilter: "blur(8px)" }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              width: "100%",
              maxWidth: 400,
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,0.3)",
              animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)"
            }}
          >
            {/* Header */}
            <div style={{ background: "#0f172a", padding: "28px 32px 24px", textAlign: "center" }}>
              <div style={{
                width: 56, height: 56,
                background: "rgba(239,68,68,0.15)",
                border: "2px solid rgba(239,68,68,0.3)",
                borderRadius: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <ShieldAlert size={28} color="#ef4444" />
              </div>
              <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                Session Termination
              </h3>
              <p style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 6 }}>
                Security Protocol Active
              </p>
            </div>

            {/* Body */}
            <div style={{ padding: "28px 32px" }}>
              <div style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 12,
                padding: "14px 16px",
                display: "flex", alignItems: "flex-start", gap: 12,
                marginBottom: 24
              }}>
                <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#b91c1c", margin: "0 0 3px" }}>
                    Confirm Sign Out
                  </p>
                  <p style={{ fontSize: 12, color: "#991b1b", margin: 0, lineHeight: 1.5 }}>
                    You are about to end your current session. Any unsaved changes will be lost. Are you sure you want to proceed?
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    flex: 1, padding: "13px 0",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    fontSize: 12, fontWeight: 800,
                    color: "#475569",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={e => e.target.style.background = "#f1f5f9"}
                  onMouseLeave={e => e.target.style.background = "#f8fafc"}
                >
                  Stay Logged In
                </button>
                <button
                  onClick={confirmLogout}
                  style={{
                    flex: 1, padding: "13px 0",
                    background: "#ef4444",
                    border: "1px solid #dc2626",
                    borderRadius: 12,
                    fontSize: 12, fontWeight: 800,
                    color: "#fff",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={e => e.target.style.background = "#dc2626"}
                  onMouseLeave={e => e.target.style.background = "#ef4444"}
                >
                  <LogOut size={14} />
                  Yes, Sign Out
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes modalIn {
              from { opacity: 0; transform: scale(0.92) translateY(12px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}