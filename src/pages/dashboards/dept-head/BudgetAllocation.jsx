import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, CheckCircle, AlertCircle, History, RefreshCw } from "lucide-react";
import DeptLayout from "../../../components/layout/DeptLayout";

const BudgetAllocation = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch allocation history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch("http://localhost/fundmonitor-api/allocate.php?year=2026");
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.allocations || []);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAutoAllocate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch("http://localhost/fundmonitor-api/allocate.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          total_fund: parseFloat(amount), 
          year: 2026 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        setAmount(""); // Clear input on success
        fetchHistory(); // Refresh history
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Error connecting to server: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeptLayout title="Budget Allocation">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Allocation Tool */}
        <div className="space-y-6">
          {/* Input Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" /> 
                Automated Budget Tool
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Annual Fund</label>
                <Input 
                  type="number" 
                  placeholder="Enter total amount (e.g. 500000)" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleAutoAllocate}
                disabled={loading || !amount}
              >
                {loading ? "Allocating..." : "Run Auto-Allocation"}
              </Button>
              
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border text-sm space-y-2">
                <p className="font-bold text-slate-700 mb-2">Allocation Rules:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>• Facility Development: <strong>33%</strong></div>
                  <div>• Faculty & Staff Dev: <strong>27%</strong></div>
                  <div>• Curriculum Development: <strong>36%</strong></div>
                  <div>• Student Development: <strong>4%</strong></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Result */}
          {result && result.success && (
            <Card className="border-green-200 bg-green-50 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-green-900 text-lg">{result.message}</p>
                    <p className="text-sm text-green-700 mt-1">
                      Total Fund: <strong>{result.total_fund}</strong> | 
                      Allocated: <strong>{result.total_allocated}</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <p className="font-semibold text-slate-700 text-sm">Allocation Breakdown:</p>
                  {result.allocations.map((alloc, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-green-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-slate-900">{alloc.department}</p>
                          <p className="text-xs text-slate-500">{alloc.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-700 text-lg">{alloc.amount}</p>
                          <p className="text-xs text-slate-600">{alloc.percentage}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - History */}
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" /> 
                  Allocation History (FY 2026)
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchHistory}
                  disabled={loadingHistory}
                >
                  <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-8 text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No allocation history found</p>
                  <p className="text-xs mt-1">Run an allocation to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{item.department}</p>
                          <p className="text-xs text-slate-500 mt-1">Allocated Budget</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-indigo-700 text-lg">{item.allocated}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total Summary */}
                  <div className="mt-4 pt-4 border-t border-slate-300">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-slate-700">Total Allocated:</p>
                      <p className="font-bold text-indigo-700 text-xl">
                        {history.length > 0 && history[0].raw_allocated ? 
                          '₱' + new Intl.NumberFormat().format(
                            history.reduce((sum, item) => 
                              sum + (parseFloat(item.raw_allocated) || 0), 0
                            )
                          ) : '₱0.00'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-indigo-900">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Departments Funded:</span>
                <span className="font-bold text-indigo-700">{history.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Fiscal Year:</span>
                <span className="font-bold text-indigo-700">2026</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Allocation Method:</span>
                <span className="font-bold text-indigo-700">Automated</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DeptLayout>
  );
};

export default BudgetAllocation;