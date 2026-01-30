import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, History, Loader2, Landmark, ArrowRight } from "lucide-react";

export default function AdminBudgets() {
  const [amount, setAmount] = useState("");
  const [isAllocating, setIsAllocating] = useState(false);
  const [budgetHistory, setBudgetHistory] = useState([]);

  const itAmount = (parseFloat(amount) * 0.4) || 0;
  const financeAmount = (parseFloat(amount) * 0.3) || 0;
  const hrAmount = (parseFloat(amount) * 0.3) || 0;

  const formatPHP = (val) => new Intl.NumberFormat('en-PH', {
    style: 'currency', currency: 'PHP',
  }).format(val);

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost/fundmonitor-api/admin_actions.php?action=get_budgets");
      const data = await res.json();
      setBudgetHistory(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleAllocate = async () => {
    if (!amount || amount <= 0) return alert("Enter amount");
    setIsAllocating(true);
    try {
      const res = await fetch("http://localhost/fundmonitor-api/admin_actions.php?action=allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, year: new Date().getFullYear() })
      });
      const data = await res.json();
      if(data.success) { setAmount(""); fetchHistory(); }
      alert(data.message);
    } catch (err) { alert("Server error"); } finally { setIsAllocating(false); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Budget Allocation</h1>
          <Badge variant="secondary" className="font-bold">FY {new Date().getFullYear()}</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COMPACT INPUT SECTION */}
          <Card className="lg:col-span-2 border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="border-b bg-slate-50/50 py-4">
              <CardTitle className="text-sm font-bold uppercase text-slate-600 flex items-center gap-2">
                <Landmark size={16} /> Fund Distribution Tool
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 w-full space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Total University Fund</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₱</span>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="pl-7 h-11 font-bold text-lg border-slate-300 focus:border-indigo-500 rounded-lg"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleAllocate} 
                    disabled={isAllocating || !amount}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 font-bold"
                  >
                    {isAllocating ? <Loader2 className="animate-spin" /> : "Distribute Funds"}
                  </Button>
                </div>

                <div className="w-full md:w-72 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Live Preview (40/30/30)</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-600">IT Dept</span>
                      <span className="font-bold text-indigo-600">{formatPHP(itAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-600">Finance</span>
                      <span className="font-bold text-indigo-600">{formatPHP(financeAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-600">HR Dept</span>
                      <span className="font-bold text-indigo-600">{formatPHP(hrAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QUICK STATS */}
          <Card className="border-slate-200 shadow-sm rounded-xl bg-indigo-600 text-white">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <Wallet className="mb-4 opacity-50" size={32} />
              <h3 className="text-lg font-bold mb-1">Audit Ready</h3>
              <p className="text-xs text-indigo-100 leading-relaxed">
                All distributions are final and logged. Ensure the total amount is correct before confirming.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* COMPACT HISTORY TABLE */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
             <h3 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
               <History size={14} /> Recent Allocations
             </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/30">
                <TableHead className="text-[10px] font-bold uppercase">Year</TableHead>
                <TableHead className="text-[10px] font-bold uppercase">Department</TableHead>
                <TableHead className="text-[10px] font-bold uppercase">Amount</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgetHistory.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400 text-xs font-medium">No history found</TableCell></TableRow>
              ) : budgetHistory.map((row, i) => (
                <TableRow key={i} className="hover:bg-slate-50/50">
                  <TableCell className="py-3 font-bold text-slate-700 text-xs">FY {row.budget_year}</TableCell>
                  <TableCell className="py-3 text-xs text-slate-600">{row.department_name}</TableCell>
                  <TableCell className="py-3 font-bold text-indigo-600 text-xs">{formatPHP(row.total_budget)}</TableCell>
                  <TableCell className="py-3 text-right">
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0 text-[9px] font-bold">SUCCESS</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
}