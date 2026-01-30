import React from "react";
import DeptLayout from "@/components/layout/DeptLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DeptReports() {
  const reports = [
    { id: 1, name: "Q1 Expense Summary", date: "Jan 2026", size: "2.4 MB", type: "PDF" },
    { id: 2, name: "Annual Budget Allocation", date: "FY 2026", size: "1.1 MB", type: "XLSX" },
    { id: 3, name: "Staff Spending Audit", date: "Dec 2025", size: "850 KB", type: "PDF" },
  ];

  return (
    <DeptLayout 
      title="Department Reports"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 border-slate-200 text-slate-600 font-bold">
            <Filter size={14} className="mr-2" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="h-9 border-slate-200 text-slate-600 font-bold">
            <Download size={14} className="mr-2" /> Export All
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* REPORT SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search reports by name or date..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5D3CFE]/20 transition-all"
          />
        </div>

        {/* REPORTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="border-slate-200 hover:border-[#5D3CFE]/30 transition-all group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-[#5D3CFE]/10 group-hover:text-[#5D3CFE] transition-colors">
                    <FileText size={20} />
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-slate-200">{report.type}</Badge>
                </div>
                <h4 className="font-black text-slate-900 text-sm leading-tight">{report.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{report.date} • {report.size}</p>
                <Button variant="ghost" className="w-full mt-4 h-9 text-[10px] font-black uppercase tracking-widest text-[#5D3CFE] hover:bg-[#5D3CFE]/5 border border-transparent hover:border-[#5D3CFE]/20">
                  Download <Download size={12} className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DeptLayout>
  );
}