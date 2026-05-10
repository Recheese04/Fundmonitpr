import React from "react";
import { Search, Bell, ChevronDown, Menu } from "lucide-react";

export default function Navbar({ role, setRole, userName = "Juan Dela Cruz" }) {
  return (
    <nav className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 lg:px-10 flex items-center justify-between">
      {/* Left Section: Role Switcher & Search */}
      <div className="flex items-center gap-6 flex-1">
        {/* Role Switcher (Visible Tint) */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setRole("Officer")}
            className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${
              role === "Officer" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            OFFICER
          </button>
          <button 
            onClick={() => setRole("Adviser")}
            className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${
              role === "Adviser" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            ADVISER
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-md w-full hidden md:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search transactions or files..." 
            className="w-full h-11 pl-10 pr-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm text-slate-950 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Notifications */}
        <button className="relative p-2.5 bg-slate-50 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-all active:scale-95">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

        {/* User Profile */}
        <button className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-slate-50 rounded-2xl transition-all group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-950 leading-none">{userName}</p>
            <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1 tracking-wider">{role} Mode</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-200 group-hover:rotate-3 transition-transform">
            {userName.split(' ').map(n => n[0]).join('')}
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </button>
      </div>
    </nav>
  );
}