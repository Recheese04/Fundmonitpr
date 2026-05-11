import React, { useState, useEffect } from "react";
import Sidebar from "../shared/Sidebar";
import {
  Bell,
  Search,
  ChevronDown,
  User,
  ShieldCheck,
  Layout,
  Activity,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import API_URL from "@/apiConfig";

export default function UnifiedLayout({ children, title, subtitle, stats }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      const userId = parsed.id || parsed.user_id;
      if (userId) {
        fetchNotifications(userId);
        const interval = setInterval(() => fetchNotifications(userId), 10000);
        return () => clearInterval(interval);
      }
    }
  }, []);

  const fetchNotifications = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/notifications.php?action=get_notifications&user_id=${userId}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch(`${API_URL}/notifications.php?action=mark_as_read`, {
        method: "POST",
        body: JSON.stringify({ user_id: user?.id || user?.user_id })
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({...n, is_read: 1})));
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleBranding = () => {
    switch (user?.role) {
      case "admin":
        return {
          label: "Root Console",
          icon: <ShieldCheck size={18} />,
          accent: "indigo",
          status: "System: Optimal"
        };
      case "department_head":
        return {
          label: "Dept Command",
          icon: <Activity size={18} />,
          accent: "emerald",
          status: "Session: Verified"
        };
      case "staff":
        return {
          label: "Staff Portal",
          icon: <Zap size={18} />,
          accent: "amber",
          status: "Access: Active"
        };
      default:
        return {
          label: "Portal",
          icon: <Layout size={18} />,
          accent: "slate",
          status: "Guest"
        };
    }
  };

  const branding = getRoleBranding();

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      {/* Sidebar - Fixed Left */}
      <Sidebar />

      {/* Main Container - Fills Remaining Space */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0 h-full relative">

        {/* Urban Glass Header */}
        <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-2xl border-b border-slate-100/80 px-6 py-3 flex-shrink-0">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">

            {/* dynamic Title & Role Badge */}
            <div className="flex items-center gap-4">
              <div className={`w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 border border-slate-800`}>
                <div className="text-white scale-90">
                  {branding.icon}
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2 mb-0">
                  <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{branding.label}</h2>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest">{branding.status}</span>
                </div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase italic">{title || "Dashboard"}</h1>
              </div>
            </div>

            {/* Global Search & Actions */}
            <div className="flex items-center gap-6">
              <div className="hidden xl:flex items-center bg-slate-100/80 border border-slate-200/50 rounded-xl px-4 py-2 transition-all focus-within:bg-white focus-within:ring-4 ring-indigo-50/50 select-none group">
                <Search size={14} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Intelligent lookup..."
                  className="bg-transparent border-none text-[11px] font-bold text-slate-600 focus:outline-none ml-2 w-48 placeholder:text-slate-400"
                />
                <span className="ml-3 px-1.5 py-0.2 bg-white border border-slate-200 rounded text-[8px] font-black text-slate-400">⌘+K</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Stats if provided */}
                {stats && (
                  <div className="hidden md:flex items-center gap-3 mr-2 border-r border-slate-100 pr-6">
                    {stats}
                  </div>
                )}

                <div className="relative">
                  <button onClick={() => setShowNotifications(!showNotifications)} className="relative w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group">
                    <Bell size={18} className="group-hover:rotate-12 transition-transform" />
                    {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-[2px] border-white shadow-sm"></span>}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[400px]">
                      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAsRead} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="overflow-y-auto flex-1 p-2">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-slate-400 text-xs font-semibold">No notifications yet</div>
                        ) : (
                          notifications.slice(0, 20).map(n => (
                            <div key={n.id} className={`p-3 mb-2 rounded-xl transition-colors ${n.is_read == 0 ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.is_read == 0 ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
                                <div>
                                  <p className={`text-xs ${n.is_read == 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{n.title}</p>
                                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-2">{new Date(n.created_at).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-8 w-[1px] bg-slate-100 rotate-12"></div>

                <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-white transition-all border border-transparent hover:border-slate-100 group">
                  <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-lg overflow-hidden border border-indigo-100/50 group-hover:scale-105 transition-transform">
                    <User size={16} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Workspace */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[radial-gradient(#e5e7eb_1.2px,transparent_1.2px)] [background-size:32px_32px] [background-position:center]">
          <div className="p-4 lg:p-6 max-w-[1400px] mx-auto min-h-full flex flex-col">
            <div className="flex-1 animate-in fade-in zoom-in-95 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
              {children}
            </div>

            {/* Micro Footer Inside Scroll Area */}
            <footer className="mt-12 pt-6 border-t border-slate-200/50 pb-8 opacity-30">
              <div className="flex justify-between items-center italic">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">FundMonitor Platform • v4.2</p>
                <div className="flex gap-8">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Encrypted Session</span>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">System Normal</span>
                </div>
              </div>
            </footer>
          </div>
        </main>

        {/* CSS For Custom Scrollbar */}
        <style dangerouslySetInnerHTML={{
          __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(241, 245, 249, 0.5);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 99px;
            border: 2px solid rgba(241, 245, 249, 1);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}} />
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            .h-screen { height: auto !important; overflow: visible !important; }
            .overflow-hidden { overflow: visible !important; }
            .overflow-y-auto { overflow: visible !important; }
            .lg\\:ml-64 { margin-left: 0 !important; }
            aside, header, nav, .sidebar { display: none !important; }
            main { padding: 0 !important; margin: 0 !important; }
            footer { display: none !important; }
            body { background: white !important; }
          }
        `}} />
      </div>
    </div>
  );
}
