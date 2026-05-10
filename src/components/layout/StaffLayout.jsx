import React from "react";
import Sidebar from "@/components/shared/Sidebar";
import { User, Bell, Search } from "lucide-react";

export default function StaffLayout({ children, title }) {
  return (
    <div className="min-h-screen bg-slate-50/40">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen flex flex-col transition-all duration-500">
        
        {/* Staff Header - Clean & Focused */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">
                  {title}
                </h1>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Authorized Staff Portal • FundMonitor Core</p>
            </div>

            <div className="flex items-center gap-5">
               <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-transparent hover:border-slate-300">
                 <Search size={16} className="text-slate-400" />
                 <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Internal Search</span>
               </button>
               <button className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
               </button>
               <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer shadow-lg hover:shadow-indigo-200/20">
                  <User size={20} />
               </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 lg:p-12">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>

        {/* Branding Footer */}
        <footer className="p-10 border-t border-slate-100 opacity-20 text-center grayscale">
            <h3 className="text-xl font-black italic tracking-tighter text-slate-900 uppercase">FundMonitor</h3>
        </footer>
      </main>
    </div>
  );
}