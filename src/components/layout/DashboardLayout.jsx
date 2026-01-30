import React from "react";
// Path updated to match your specific folder structure
import Sidebar from "../shared/Sidebar"; 

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar is now safely inside the Router context provided by App.jsx */}
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}