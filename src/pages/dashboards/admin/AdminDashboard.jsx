import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminDashboard() {
  return (
    <DashboardLayout>
       <h1 className="text-3xl font-black text-slate-950 uppercase">Admin Overview</h1>
       {/* All your stats cards and forms go here */}
    </DashboardLayout>
  );
}