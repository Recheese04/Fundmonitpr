import React from "react";
import Sidebar from "../shared/Sidebar"; 
import { Bell, Search, ChevronDown, User, ShieldCheck } from "lucide-react";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#FDFDFF]">
      <Sidebar />
      
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col transition-all duration-500">
        {/* Admin Global Header */}
        <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-2xl border-b border-indigo-50 px-8 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-10">
            
            {/* Context Badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-indigo-100">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <h2 className="text-sm font-black text-slate-900 tracking-widest uppercase">Root Admin Console</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full"></span>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">System Status: Optimal</span>
                </div>
              </div>
            </div>

            {/* Global Actions */}
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-5 py-2.5 transition-all focus-within:bg-white focus-within:ring-4 ring-indigo-50 select-none">
                <Search size={16} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Quick lookup..." 
                  className="bg-transparent border-none text-[12px] font-bold text-slate-600 focus:outline-none ml-3 w-56 placeholder:text-slate-300"
                />
                <span className="ml-4 px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-black text-slate-400">Ctrl+K</span>
              </div>

              <div className="flex items-center gap-3">
                <button className="relative w-11 h-11 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg transition-all">
                  <Bell size={20} />
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-amber-500 rounded-full border-[3px] border-white"></span>
                </button>
                
                <div className="h-8 w-px bg-slate-100 mx-1"></div>

                <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                  <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-indigo-100 group-hover:scale-110 transition-transform">
                     <User size={18} />
                  </div>
                  <ChevronDown size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <section className="flex-1 p-8 lg:p-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] [background-position:top_left]">
          <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-700">
            {children}
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="p-8 border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto flex justify-between items-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">FundMonitor v4.0.21 Enterprise</p>
            <div className="flex gap-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Support</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Terms</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}