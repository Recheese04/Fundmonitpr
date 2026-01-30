import React from "react";
import Sidebar from "../shared/Sidebar"; 

export default function DeptLayout({ children, title, actions }) {
  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      {/* Sidebar remains fixed/responsive as per your Sidebar component logic */}
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 min-h-screen transition-all">
        {/* Sub-Header Area */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">
                Department Head Portal • Fiscal Year 2026
              </p>
            </div>
            <div className="flex items-center gap-3">
              {actions}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}