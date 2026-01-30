import React from "react";
import DeptLayout from "@/components/layout/DeptLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRightLeft } from "lucide-react";

// Ensure the function name matches and is exported as DEFAULT
export default function BudgetAdjust() {
  const categories = [
    { name: "Equipment", allocated: 250000, spent: 180000, color: "bg-indigo-600" },
    { name: "Software", allocated: 150000, spent: 110000, color: "bg-[#5D3CFE]" },
    { name: "Operations", allocated: 100000, spent: 25000, color: "bg-emerald-500" },
  ];

  return (
    <DeptLayout 
      title="Budget & Adjustments"
      actions={
        <Button className="bg-[#5D3CFE] hover:bg-[#4b2fd8] h-9 font-bold">
          <ArrowRightLeft size={16} className="mr-2" /> Request Reallocation
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4">
        {categories.map((cat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${cat.color}`} />
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">{cat.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current Allocation</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-slate-900 leading-none">₱{cat.allocated.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">Available: ₱{(cat.allocated - cat.spent).toLocaleString()}</p>
              </div>
            </div>
            <Progress value={(cat.spent / cat.allocated) * 100} className="h-1.5 bg-slate-100" />
          </div>
        ))}
      </div>
    </DeptLayout>
  );
}