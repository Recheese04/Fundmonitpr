import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, Wallet, FileText, 
  Settings, LogOut, Menu, X, PieChart,
  ClipboardCheck, BellRing, PlusCircle, 
  History, UserCog, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || '{"role": "staff"}');

  const handleLogout = () => {
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
      { icon: <Wallet size={20}/>, label: "Budget & Adjust", path: "/dept-budget" },
      { icon: <ClipboardCheck size={20}/>, label: "Approvals", path: "/dept-approvals" },
      { icon: <FileText size={20}/>, label: "Dept Reports", path: "/dept-reports" },
    ],
    staff: [
      { icon: <LayoutDashboard size={20}/>, label: "My Expenses", path: "/staff-dashboard" },
      { icon: <PlusCircle size={20}/>, label: "New Request", path: "/staff-request" },
      { icon: <History size={20}/>, label: "Request History", path: "/staff-history" },
      { icon: <BellRing size={20}/>, label: "My Alerts", path: "/staff-alerts" },
      { icon: <UserCog size={20}/>, label: "Account Settings", path: "/staff-settings" },
    ]
  };

  const currentMenu = menuItems[user.role] || [];

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} className="bg-white shadow-md">
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

        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
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
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-800 space-y-2">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm uppercase">Sign Out</span>
          </button>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
}