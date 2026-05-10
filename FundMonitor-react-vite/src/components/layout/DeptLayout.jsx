import React, { useState, useEffect } from "react";
import Sidebar from "../shared/Sidebar"; 
import { Bell, Search, Settings, Check } from "lucide-react";
import API_URL from "@/apiConfig";

export default function DeptLayout({ children, title, actions }) {
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
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col transition-all duration-500">
        {/* Modern Sticky Header Area */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 px-8 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-indigo-600 text-[8px] font-black text-white rounded-md uppercase tracking-widest">Portal</span>
                  <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{title}</h1>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                  FundMonitor • Departmental Command • FY-2026
                </p>
              </div>
            </div>

            {/* Global Actions (Mocked for premium feel) */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center bg-slate-100/50 border border-slate-200 rounded-2xl px-4 py-2 group focus-within:ring-2 ring-indigo-100 transition-all">
                <Search size={16} className="text-slate-400 group-focus-within:text-indigo-600" />
                <input 
                  type="text" 
                  placeholder="Universal Search..." 
                  className="bg-transparent border-none text-[12px] font-bold text-slate-600 focus:outline-none ml-3 w-48 placeholder:text-slate-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>}
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
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-4 ml-2">
                  {actions}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace Area */}
        <div className="flex-1 p-8 lg:p-12">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>

        {/* Subtle Footer */}
        <footer className="p-8 border-t border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
              Authorized Personnel Only • Secure Session Active
            </p>
        </footer>
      </main>
    </div>
  );
}