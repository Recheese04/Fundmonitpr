import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminReports() {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-950 uppercase">Financial Reports</h1>
        <Button variant="outline" className="rounded-xl border-2 font-bold uppercase text-xs">
          <Download size={16} className="mr-2"/> Export CSV
        </Button>
      </div>

      <Card className="border-2 border-slate-200 rounded-3xl shadow-none overflow-hidden">
        <div className="p-12 flex flex-col items-center justify-center text-slate-400">
          <FileText size={64} className="mb-4 opacity-10"/>
          <p className="font-black uppercase tracking-widest text-sm">No Recent Reports Generated</p>
          <p className="text-xs font-bold mt-2">Allocated funds will appear here after the first disbursement.</p>
        </div>
      </Card>
    </DashboardLayout>
  );
}