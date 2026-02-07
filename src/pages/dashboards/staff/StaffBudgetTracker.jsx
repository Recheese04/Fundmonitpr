import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FolderTree, 
  Plus, 
  X, 
  Save,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Upload,
  Trash2,
  Receipt,
  DollarSign,
  Printer // Added for printing
} from "lucide-react";
import DeptLayout from "../../../components/layout/DeptLayout";

const API_BASE_CATEGORIES = "http://localhost/fundmonitor-api/categories.php";
const API_BASE_EXPENSES = "http://localhost/fundmonitor-api/expenses.php";

const StaffBudgetTracker = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Expanded categories for view
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Expense submission
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    file: null,
    fileName: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const response = await fetch(`${API_BASE_CATEGORIES}?action=get_categories_with_budget&year=${currentYear}`);
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
        // Auto-expand all categories
        const expanded = {};
        data.categories.forEach(cat => {
          if (cat.subcategories && cat.subcategories.length > 0) {
            expanded[cat.id] = true;
          }
        });
        setExpandedCategories(expanded);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to trigger browser print
  const handlePrint = () => {
    window.print();
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const openExpenseModal = (category, subcategory) => {
    setSelectedSubcategory({
      ...subcategory,
      categoryName: category.name,
      categoryId: category.id
    });
    setExpenseForm({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      file: null,
      fileName: ''
    });
    setShowExpenseModal(true);
  };

  const closeExpenseModal = () => {
    setShowExpenseModal(false);
    setSelectedSubcategory(null);
    setExpenseForm({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      file: null,
      fileName: ''
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExpenseForm({
        ...expenseForm,
        file: file,
        fileName: file.name
      });
    }
  };

  const handleSubmitExpense = async () => {
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!expenseForm.description.trim()) {
      setError('Please enter a description');
      return;
    }

    const userString = localStorage.getItem("user");
    if (!userString) {
      setError("Session expired. Please log in again.");
      return;
    }
    
    const user = JSON.parse(userString);
    const userId = user.user_id;

    if (!userId) {
      setError("User ID missing. Please re-login.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('subcategory_id', selectedSubcategory.id);
      formData.append('amount', expenseForm.amount);
      formData.append('description', expenseForm.description);
      formData.append('date', expenseForm.date);
      if (expenseForm.file) {
        formData.append('receipt', expenseForm.file);
      }

      const response = await fetch(`${API_BASE_EXPENSES}?action=create`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Expense submitted successfully! Amount: ${formatCurrency(expenseForm.amount)}`);
        closeExpenseModal();
        fetchCategories(); 
      } else {
        setError(data.message || 'Failed to submit expense');
      }
    } catch (err) {
      setError('Failed to submit expense: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeptLayout title="Budget Categories & Expense Submission">
      <div className="space-y-6">
        
        {/* Header - Added Print Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Available Budget Categories</h2>
            <p className="text-sm text-slate-600 mt-1">
              View budget allocations and submit expenses
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Official Plan
            </Button>
            <Button
              variant="outline"
              onClick={fetchCategories}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="border-green-200 bg-green-50 print:hidden">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50 print:hidden">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <Card className="shadow-lg print:shadow-none print:border-none overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-blue-50 print:from-white print:to-white">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderTree className="w-5 h-5 text-indigo-600 print:hidden" />
              Budget Categories & Sub-categories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading && categories.length === 0 ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
                <p className="text-sm text-slate-600">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <FolderTree className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-600">No categories available</p>
              </div>
            ) : (
              <div className="divide-y print:divide-y print:border-t">
                {categories.map((category) => {
                  const totalAllocated = category.subcategories?.reduce((sum, sub) => 
                    sum + parseFloat(sub.allocation_amount || 0), 0) || 0;
                  
                  return (
                    <div key={category.id} className="print:break-inside-avoid">
                      <div className="p-4 hover:bg-slate-50 transition-colors bg-slate-50/30">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => toggleCategory(category.id)}
                              className="mt-1 p-1 hover:bg-slate-200 rounded transition-colors print:hidden"
                            >
                              {expandedCategories[category.id] ? (
                                <ChevronDown className="w-4 h-4 text-slate-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-slate-900 uppercase tracking-tight">{category.name}</h3>
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full print:hidden">
                                  {category.subcategory_count} sub-categories
                                </span>
                              </div>
                              {category.description && (
                                <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {expandedCategories[category.id] && category.subcategories && category.subcategories.length > 0 && (
                        <div className="bg-white border-t">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b bg-slate-100/50 print:bg-white">
                                <th className="text-left py-2 px-4 pl-16 print:pl-4 text-xs font-semibold text-slate-700 uppercase italic">Sub-category</th>
                                <th className="text-left py-2 px-4 text-xs font-semibold text-slate-700 uppercase italic">Description</th>
                                <th className="text-right py-2 px-4 text-xs font-semibold text-slate-700 uppercase italic">Budget Allocation</th>
                                <th className="text-center py-2 px-4 pr-4 text-xs font-semibold text-slate-700 uppercase italic print:hidden">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {category.subcategories.map((sub) => (
                                <tr key={sub.id} className="border-b last:border-b-0 hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3 px-4 pl-16 print:pl-4 text-sm font-medium text-slate-900">
                                    {sub.name}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-slate-600 italic">
                                    {sub.description || '-'}
                                  </td>
                                  <td className="py-3 px-4 text-right tabular-nums">
                                    <span className="font-bold">{formatCurrency(parseFloat(sub.allocation_amount || 0))}</span>
                                  </td>
                                  <td className="py-3 px-4 pr-4 text-center print:hidden">
                                    <Button
                                      size="sm"
                                      onClick={() => openExpenseModal(category, sub)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                    >
                                      <Receipt className="w-3 h-3" />
                                      Submit Expense
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-slate-100/50 print:bg-white border-t border-slate-300">
                                <td colSpan="2" className="py-3 px-4 pl-16 print:pl-4 text-sm font-bold text-slate-900 italic">
                                  Total Category Budget
                                </td>
                                <td className="py-3 px-4 text-right font-black underline">
                                  {formatCurrency(totalAllocated)}
                                </td>
                                <td className="py-3 px-4 pr-4 print:hidden"></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          {!loading && categories.length > 0 && (
            <div className="border-t-2 border-slate-300 bg-gradient-to-r from-indigo-50 to-slate-50 p-6 print:from-white print:to-white">
              <div className="flex justify-between items-center max-w-4xl mx-auto">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">Grand Total Allocation:</h3>
                  <p className="text-xs text-slate-600 mt-1">Calendar Year {new Date().getFullYear()}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-indigo-700 print:text-black">
                    {formatCurrency(
                      categories.reduce((total, cat) => {
                        const categoryTotal = cat.subcategories?.reduce((sum, sub) => 
                          sum + parseFloat(sub.allocation_amount || 0), 0) || 0;
                        return total + categoryTotal;
                      }, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* PRINT ONLY: Signatures Section (Matches scanned document) */}
        <div className="hidden print:grid grid-cols-2 gap-x-20 mt-24 text-center">
          <div className="space-y-0">
            <p className="text-left italic mb-16">Prepared by:</p>
            <p className="font-bold underline uppercase">MARLINA S. UY</p>
            <p className="text-[10pt] uppercase text-slate-700 font-bold">Budget Designate</p>
          </div>
          <div className="space-y-0">
            <p className="text-left italic mb-16">Approved by:</p>
            <p className="font-bold underline uppercase">LUZMINDA H.D.</p>
            <p className="text-[10pt] uppercase text-slate-700 font-bold">Dean, College of Sciences</p>
          </div>
        </div>

        {/* Expense Modal (Keep your original modal logic) */}
        {showExpenseModal && selectedSubcategory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
            <Card className="w-full max-w-lg shadow-2xl">
              <CardHeader className="border-b bg-emerald-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-emerald-600" />
                      Submit Expense
                    </CardTitle>
                    <p className="text-xs text-slate-600 mt-1">
                      {selectedSubcategory.categoryName} → {selectedSubcategory.name}
                    </p>
                  </div>
                  <button onClick={closeExpenseModal} className="p-1 hover:bg-slate-200 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 flex justify-between">
                  <span className="text-xs font-medium">Budget Allocation:</span>
                  <span className="text-sm font-bold text-indigo-700">
                    {formatCurrency(parseFloat(selectedSubcategory.allocation_amount || 0))}
                  </span>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expense Amount (PHP) *</label>
                  <Input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <textarea
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSubmitExpense} disabled={loading} className="flex-1 bg-emerald-600">
                    {loading ? 'Submitting...' : 'Submit Expense'}
                  </Button>
                  <Button onClick={closeExpenseModal} variant="outline" className="flex-1">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DeptLayout>
  );
};

export default StaffBudgetTracker;