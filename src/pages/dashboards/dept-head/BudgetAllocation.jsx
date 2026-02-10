import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calculator, 
  CheckCircle, 
  AlertCircle, 
  History, 
  RefreshCw,
  TrendingUp,
  DollarSign
} from "lucide-react";
import DeptLayout from "../../../components/layout/DeptLayout";

const BudgetAllocation = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Get user info from localStorage
  const [userDeptId, setUserDeptId] = useState(0);
  const [userDeptName, setUserDeptName] = useState("");
  
  // Category & Subcategory states
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [manualAmount, setManualAmount] = useState("");

  // Fetch data on component mount
  useEffect(() => {
    // Get user's department_id from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserDeptId(user.department_id || 0);
      setUserDeptName(user.department_name || "Your Department");
    }
    
    fetchHistory();
    fetchCategories();
  }, []);

  // Filter subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.id.toString() === selectedCategory.toString());
      if (category && category.subcategories) {
        setFilteredSubcategories(category.subcategories);
      } else {
        setFilteredSubcategories([]);
      }
      setSelectedSubcategory(""); // Reset subcategory when category changes
    } else {
      setFilteredSubcategories([]);
      setSelectedSubcategory("");
    }
  }, [selectedCategory, categories]);

  // Format currency helper function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatCompactCurrency = (value) => {
    const num = parseFloat(value || 0);
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);
  };

  // Format percentage helper function
  const formatPercentage = (percentage) => {
    const num = parseFloat(percentage || 0);
    return `${num.toFixed(2)}%`;
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      // Get user's department_id from localStorage
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const deptId = user?.department_id;
      
      if (!deptId) {
        console.error('No department_id found for user');
        setCategories([]);
        setLoadingCategories(false);
        return;
      }
      
      const response = await fetch(`http://localhost/fundmonitor-api/categories.php?action=get_categories&department_id=${deptId}`);
      const data = await response.json();
      
      if (data.success) {
        console.log("Categories loaded for department", deptId, ":", data.categories);
        if (data.categories && data.categories.length > 0) {
          console.log("First category structure:", data.categories[0]);
          console.log("Available fields:", Object.keys(data.categories[0]));
        }
        setCategories(data.categories || []);
      } else {
        console.error("Failed to load categories:", data.message);
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      // Get user's department_id from localStorage
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const deptId = user?.department_id;
      
      if (!deptId) {
        console.error('No department_id found for user');
        setHistory([]);
        setLoadingHistory(false);
        return;
      }
      
      // Fetch allocations for this department's categories
      const response = await fetch(`http://localhost/fundmonitor-api/allocate.php?year=2026&department_id=${deptId}`);
      const data = await response.json();
      
      if (data.success && data.allocations) {
        const allocationHistory = data.allocations.map(alloc => {
          return {
            department: alloc.category, // Changed from department to category
            allocated: alloc.allocated,
            raw_allocated: alloc.raw_allocated,
            allocation_percentage: parseFloat(alloc.allocation_percentage || 0)
          };
        });
        setHistory(allocationHistory);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAutoAllocate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // ⭐ CRITICAL FIX: Now includes department_id in the request
      const response = await fetch("http://localhost/fundmonitor-api/allocate.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          total_fund: parseFloat(amount), 
          year: 2026,
          department_id: userDeptId  // ⭐ Added department_id
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        setAmount(""); // Clear input on success
        fetchHistory(); // Refresh history
        fetchCategories(); // Refresh categories to get updated budgets
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Error connecting to server: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAllocate = () => {
    if (!selectedCategory || !selectedSubcategory || !manualAmount) {
      setError("Please select a category, sub-category, and enter an amount");
      return;
    }

    const category = categories.find(cat => cat.id.toString() === selectedCategory.toString());
    const subcategory = filteredSubcategories.find(sub => sub.id.toString() === selectedSubcategory.toString());
    
    if (!category || !subcategory) {
      setError("Invalid category or sub-category selection");
      return;
    }

    setError(null);
    setResult({
      success: true,
      message: "✅ Manual allocation preview",
      manual: true,
      allocations: [{
        department: category.name,
        subcategory: subcategory.name,
        percentage: formatCurrency(subcategory.allocation_amount),
        amount: formatCurrency(parseFloat(manualAmount)),
        description: subcategory.description || ''
      }]
    });
  };

  const calculateSuggestedAmount = () => {
    if (!selectedSubcategory || !amount) return null;
    
    const subcategory = filteredSubcategories.find(sub => sub.id.toString() === selectedSubcategory.toString());
    if (!subcategory) return null;
    
    const totalBudget = parseFloat(amount);
    if (isNaN(totalBudget) || totalBudget <= 0) return null;
    
    const suggested = parseFloat(subcategory.allocation_amount || 0);
    return suggested.toFixed(2);
  };

  const suggestedAmount = calculateSuggestedAmount();

  return (
    <DeptLayout title="Budget Allocation">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Allocation Tools */}
        <div className="space-y-6">
          {/* Auto-Allocation Card */}
          <Card className="shadow-lg border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <Calculator className="w-5 h-5" /> 
                Automated Budget Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Total Department Budget for {userDeptName}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="number" 
                    placeholder="Enter total amount (e.g. 500000)" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleAutoAllocate}
                disabled={loading || !amount || userDeptId === 0}
              >
                {loading ? "Allocating..." : `Allocate to ${userDeptName}`}
              </Button>
              
              {/* Budget Allocation by Category Display */}
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border text-sm space-y-2">
                <p className="font-bold text-slate-700 mb-2">Budget Allocation by Category:</p>
                {loadingCategories ? (
                  <p className="text-xs text-slate-500 text-center py-2">Loading categories...</p>
                ) : categories.length === 0 ? (
                  <p className="text-xs text-amber-600 text-center py-2">No categories found. Run allocation first.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 text-xs text-slate-600">
                    {categories.map((cat) => {
                      const allocationPercentage = parseFloat(cat.allocation_percentage || 0);
                      
                      return (
                        <div key={cat.id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">• {cat.name}</span>
                            <div className="text-right">
                              <span className="font-bold text-indigo-600">
                                {allocationPercentage.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div 
                              className="h-1.5 rounded-full transition-all bg-indigo-500"
                              style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Manual Allocation Card */}
          <Card className="shadow-lg border-emerald-200">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <TrendingUp className="w-5 h-5" /> 
                Manual Category Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Select Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={loadingCategories}
                >
                  <option value="">-- Choose a Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({parseFloat(cat.allocation_percentage || 0).toFixed(0)}%)
                    </option>
                  ))}
                </select>
                {loadingCategories && (
                  <p className="text-xs text-slate-500">Loading categories...</p>
                )}
                {!loadingCategories && categories.length === 0 && (
                  <p className="text-xs text-amber-600">No categories found. Please create categories first.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Select Sub-category</label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  disabled={!selectedCategory || filteredSubcategories.length === 0}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">-- Choose a Sub-category --</option>
                  {filteredSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({formatCompactCurrency(parseFloat(sub.allocation_amount || 0))})
                    </option>
                  ))}
                </select>
                {selectedCategory && filteredSubcategories.length === 0 && (
                  <p className="text-xs text-amber-600">This category has no sub-categories yet. Please add sub-categories in Category Manager.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Allocation Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="number" 
                    placeholder="Enter allocation amount" 
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {suggestedAmount && parseFloat(suggestedAmount) > 0 && (
                  <div className="flex items-center justify-between text-xs p-2 bg-emerald-50 rounded border border-emerald-200">
                    <span className="text-slate-600">💡 Configured allocation amount:</span>
                    <button
                      onClick={() => setManualAmount(suggestedAmount)}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
                    >
                      {formatCurrency(parseFloat(suggestedAmount))}
                    </button>
                  </div>
                )}
              </div>

              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleManualAllocate}
                disabled={!selectedCategory || !selectedSubcategory || !manualAmount}
              >
                Preview Allocation
              </Button>
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
                    {!result.manual && (
                      <div className="text-sm text-green-700 mt-2 space-y-1">
                        <p>Department: <strong>{result.department}</strong></p>
                        <p>Total Fund: <strong>{result.total_fund}</strong></p>
                        <p>Allocated: <strong>{result.total_allocated}</strong></p>
                      </div>
                    )}
                  </div>
                </div>

                {!result.manual && result.category_breakdown && (
                  <div className="space-y-3 mt-4">
                    <p className="font-semibold text-slate-700 text-sm">Category Breakdown:</p>
                    {result.category_breakdown.map((alloc, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-green-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-slate-900">{alloc.category}</p>
                            <p className="text-xs text-slate-500 mt-1">{alloc.percentage}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-700 text-lg">{alloc.amount}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {result.manual && result.allocations && (
                  <div className="space-y-3 mt-4">
                    <p className="font-semibold text-slate-700 text-sm">Allocation Preview:</p>
                    {result.allocations.map((alloc, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-green-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-slate-900">{alloc.department}</p>
                            {alloc.subcategory && (
                              <p className="text-xs text-indigo-600 font-medium mt-1">→ {alloc.subcategory}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-1">{alloc.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-700 text-lg">{alloc.amount}</p>
                            <p className="text-xs text-slate-600">{alloc.percentage}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - History & Stats */}
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
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900">{item.department}</p>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                              {item.allocation_percentage.toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Category Budget</p>
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
                        {history.length > 0 ? 
                          formatCurrency(
                            history.reduce((sum, item) => 
                              sum + (parseFloat(item.raw_allocated) || 0), 0
                            )
                          ) : formatCurrency(0)
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
                <span className="text-sm text-slate-600">Department:</span>
                <span className="font-bold text-indigo-700">{userDeptName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Categories Funded:</span>
                <span className="font-bold text-indigo-700">{history.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Active Categories:</span>
                <span className="font-bold text-indigo-700">{categories.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Budget Allocated:</span>
                <span className="font-bold text-indigo-700">
                  {formatCurrency(history.reduce((sum, item) => sum + (parseFloat(item.raw_allocated) || 0), 0))}
                </span>
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

          {/* Category Summary */}
          {categories.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900">Category Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{cat.name}</p>
                        <p className="text-xs text-slate-500">{cat.subcategory_count} sub-categories</p>
                      </div>
                      <span className="text-xs font-semibold text-indigo-600">
                        {parseFloat(cat.allocation_percentage || 0).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DeptLayout>
  );
};

export default BudgetAllocation;