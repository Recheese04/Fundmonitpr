import React from "react";
import Sidebar from "@/components/shared/Sidebar";

export default function StaffLayout({ children, title }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="lg:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
              {title}
            </h1>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}