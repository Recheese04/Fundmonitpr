import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Save, Trash2, Upload, X, FileSpreadsheet, BookOpen, AlertCircle, CheckCircle2, History, Calendar, DollarSign, FileText } from "lucide-react";
import DeptLayout from "../../../components/layout/DeptLayout";

const API_BASE = "http://localhost/fundmonitor-api/categories.php";
const EXPENSES_API = "http://localhost/fundmonitor-api/expenses.php";

const StaffBudgetTracker = () => {
  const [categories, setCategories] = useState([]);
  const [expenseHistory, setExpenseHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("entry");
  const [showModal, setShowModal] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [rows, setRows] = useState([{
    id: Date.now(),
    subcategory_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    file: null,
    fileName: ''
  }]);

  useEffect(() => { 
    fetchBudgetOptions(); 
    fetchExpenseHistory();
  }, []);

  const fetchBudgetOptions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}?action=get_categories`);
      const data = await response.json();
      if (data.success) setCategories(data.categories);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchExpenseHistory = async () => {
    try {
      const response = await fetch(`${EXPENSES_API}?action=get_expenses`);
      const data = await response.json();
      console.log('Expense history response:', data); // Debug log
      
      if (data.success && data.expenses) {
        setExpenseHistory(data.expenses);
      } else if (Array.isArray(data)) {
        // Handle case where API returns array directly
        setExpenseHistory(data);
      } else {
        setExpenseHistory([]);
      }
    } catch (err) { 
      console.error('Error fetching expense history:', err);
      setExpenseHistory([]);
    }
  };

  const addRow = () => {
    setRows([...rows, {
      id: Date.now(),
      subcategory_id: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      file: null,
      fileName: ''
    }]);
  };

  const deleteRow = (id) => {
    if (rows.length > 1) setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleFileUpload = (id, file) => {
    setRows(rows.map(row => row.id === id ? { ...row, file: file, fileName: file?.name || '' } : row));
  };

  const openSubmitModal = () => {
    const validRows = rows.filter(r => r.subcategory_id && r.amount && r.description);
    
    if (validRows.length === 0) {
      alert("Please fill in at least one complete row");
      return;
    }
    setShowModal(true);
  };

  const getSubcategoryName = (subId) => {
    for (const cat of categories) {
      const sub = cat.subcategories?.find(s => s.id == subId);
      if (sub) return sub.name;
    }
    return 'Unknown';
  };

  const getCategoryName = (subId) => {
    for (const cat of categories) {
      const sub = cat.subcategories?.find(s => s.id == subId);
      if (sub) return cat.name;
    }
    return 'Unknown';
  };

  const handleSubmitAll = async () => {
    const validRows = rows.filter(r => r.subcategory_id && r.amount && r.description);
    
    setLoading(true);
    const submittedExpenses = [];
    
    for (const row of validRows) {
      const formData = new FormData();
      formData.append('subcategory_id', row.subcategory_id);
      formData.append('amount', row.amount);
      formData.append('description', row.description);
      formData.append('date', row.date);
      if (row.file) { formData.append('receipt', row.file); }

      try {
        const response = await fetch(`${EXPENSES_API}?action=create`, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (!data.success) { 
          alert(`Error: ${data.message}`); 
          setLoading(false); 
          setShowModal(false);
          return; 
        }
        submittedExpenses.push({
          ...row,
          id: data.expense_id || Date.now(),
          submitted_at: new Date().toISOString()
        });
      } catch (err) { 
        alert("Network error occurred."); 
        setLoading(false); 
        setShowModal(false);
        return; 
      }
    }

    setLoading(false);
    setSubmissionSuccess(true);
    
    // Refresh history
    await fetchExpenseHistory();
    
    // Reset after 2 seconds
    setTimeout(() => {
      setSubmissionSuccess(false);
      setShowModal(false);
      setRows([{ 
        id: Date.now(), 
        subcategory_id: '', 
        amount: '', 
        description: '', 
        date: new Date().toISOString().split('T')[0], 
        file: null, 
        fileName: '' 
      }]);
    }, 2000);
  };

  const formatCurrency = (num) => new Intl.NumberFormat('en-PH', { 
    style: 'currency', 
    currency: 'PHP' 
  }).format(num);

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Pending';
    const s = String(status).toLowerCase();
    if (s === 'approved' || s === 'approve') return 'Approved';
    if (s === 'rejected' || s === 'declined') return 'Rejected';
    if (s === 'pending') return 'Pending';
    return String(status);
  };

  const getStatusClass = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'approved') return 'bg-green-100 text-green-700';
    if (s === 'rejected') return 'bg-red-100 text-red-700';
    if (s === 'pending') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-700';
  };

  const calculateCategoryTotal = (cat) => {
    return cat.subcategories?.reduce((sum, sub) => sum + parseFloat(sub.allocation_amount || 0), 0) || 0;
  };

  const grandTotal = categories.reduce((sum, cat) => sum + calculateCategoryTotal(cat), 0);

  const validRows = rows.filter(r => r.subcategory_id && r.amount && r.description);
  const totalAmount = validRows.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0);

  // Group expenses by date
  const groupedHistory = expenseHistory.reduce((acc, expense) => {
    const date = new Date(expense.expense_date || expense.date || expense.created_at).toLocaleDateString('en-PH');
    if (!acc[date]) acc[date] = [];
    acc[date].push(expense);
    return acc;
  }, {});

  const totalExpenses = expenseHistory.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  return (
    <DeptLayout title="Staff Budget Tracker">
      {/* SUBMISSION MODAL */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          {!submissionSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                  Confirm Expense Submission
                </DialogTitle>
                <DialogDescription>
                  Please review the following expenses before submitting:
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left border-b">#</th>
                      <th className="px-3 py-2 text-left border-b">Category</th>
                      <th className="px-3 py-2 text-right border-b">Amount</th>
                      <th className="px-3 py-2 text-left border-b">Description</th>
                      <th className="px-3 py-2 text-left border-b">Date</th>
                      <th className="px-3 py-2 text-left border-b">Status</th>
                      <th className="px-3 py-2 text-center border-b">File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validRows.map((row, index) => (
                      <tr key={row.id} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2 font-medium">{getSubcategoryName(row.subcategory_id)}</td>
                        <td className="px-3 py-2 text-right font-mono text-green-700">{formatCurrency(row.amount)}</td>
                        <td className="px-3 py-2 text-gray-600 truncate max-w-xs">{row.description}</td>
                        <td className="px-3 py-2 text-gray-500">{row.date}</td>
                        <td className="px-3 py-2 text-left">
                          <span className={`text-xs px-2 py-1 rounded ${getStatusClass('pending')}`}>{getStatusLabel('pending')}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.fileName ? (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">📎 Attached</span>
                          ) : (
                            <span className="text-xs text-gray-400">No file</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-green-50 font-bold sticky bottom-0">
                    <tr>
                      <td colSpan="2" className="px-3 py-3 text-right">TOTAL:</td>
                      <td className="px-3 py-3 text-right text-green-700 text-lg font-mono">{formatCurrency(totalAmount)}</td>
                      <td colSpan="4" className="px-3 py-3 text-gray-500 text-xs">
                        {validRows.length} expense(s)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitAll}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span> Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Confirm & Submit
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <DialogTitle className="text-2xl text-green-700 mb-2">Success!</DialogTitle>
              <DialogDescription className="text-lg">
                {validRows.length} expense(s) submitted successfully
              </DialogDescription>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Excel-style Tab Navigation */}
        <div className="bg-white border-b-2 border-gray-200 px-2">
          <TabsList className="bg-transparent h-auto p-0 space-x-1">
            <TabsTrigger 
              value="entry" 
              className="data-[state=active]:bg-white data-[state=active]:border-t-2 data-[state=active]:border-x data-[state=active]:border-green-500 data-[state=inactive]:bg-gray-100 rounded-t-lg rounded-b-none px-6 py-2.5 font-semibold"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Expense Entry
            </TabsTrigger>
            <TabsTrigger 
              value="budget" 
              className="data-[state=active]:bg-white data-[state=active]:border-t-2 data-[state=active]:border-x data-[state=active]:border-blue-500 data-[state=inactive]:bg-gray-100 rounded-t-lg rounded-b-none px-6 py-2.5 font-semibold"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Budget Categories
           
         
            </TabsTrigger>
          </TabsList>
        </div>

        {/* EXPENSE ENTRY SHEET */}
        <TabsContent value="entry" className="mt-0">
          <div className="bg-white border border-gray-300 rounded-b-lg shadow-sm">
            {/* Excel-style Toolbar */}
            <div className="bg-gray-50 border-b border-gray-300 px-4 py-2 flex items-center gap-3">
              <Button onClick={addRow} size="sm" variant="outline" className="bg-white hover:bg-gray-100">
                <Plus className="w-4 h-4 mr-1" /> Add Row
              </Button>
              <Button 
                onClick={openSubmitModal} 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-1" /> Submit All
              </Button>
              <div className="ml-auto text-xs text-gray-500 font-mono">
                {rows.length} row(s) | {validRows.length} ready to submit
              </div>
            </div>

            {/* Excel-style Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Column Headers (Excel-style) */}
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-400">
                    <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200 w-12">A</th>
                    <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200 w-12">B</th>
                    <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200">C</th>
                    <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200">D</th>
                    <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200">E</th>
                    <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200">F</th>
                    <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200">G</th>
                    <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200 w-16">H</th>
                  </tr>
                  <tr className="bg-green-600 text-white border-b-2 border-gray-400">
                    <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-center">#</th>
                    <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-center">Row</th>
                    <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-left">Sub-category</th>
                    <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-left">Amount (₱)</th>
                    <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-left">Description</th>
                    <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-left">Date</th>
                    <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-left">Attachment</th>
                    <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-center">Del</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                      <td className="border border-gray-300 px-3 py-2 text-center bg-gray-100 text-xs font-bold text-gray-600">
                        {String.fromCharCode(65)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-gray-100 text-xs font-bold text-gray-600">
                        {index + 1}
                      </td>

                      {/* Subcategory */}
                      <td className="border border-gray-300 p-1">
                        <select 
                          className="w-full px-2 py-1.5 border-0 focus:ring-2 focus:ring-blue-400 text-sm bg-transparent"
                          value={row.subcategory_id}
                          onChange={(e) => updateRow(row.id, 'subcategory_id', e.target.value)}
                        >
                          <option value="">-- Select --</option>
                          {categories.map(cat => (
                            <optgroup key={cat.id} label={cat.name}>
                              {cat.subcategories?.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </td>

                      {/* Amount */}
                      <td className="border border-gray-300 p-1">
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-2 py-1.5 border-0 focus:ring-2 focus:ring-blue-400 text-sm text-right font-mono"
                          value={row.amount}
                          onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
                          placeholder="0.00"
                        />
                      </td>

                      {/* Description */}
                      <td className="border border-gray-300 p-1">
                        <input
                          type="text"
                          className="w-full px-2 py-1.5 border-0 focus:ring-2 focus:ring-blue-400 text-sm"
                          value={row.description}
                          onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                          placeholder="Enter description..."
                        />
                      </td>

                      {/* Date */}
                      <td className="border border-gray-300 p-1">
                        <input
                          type="date"
                          className="w-full px-2 py-1.5 border-0 focus:ring-2 focus:ring-blue-400 text-sm"
                          value={row.date}
                          onChange={(e) => updateRow(row.id, 'date', e.target.value)}
                        />
                      </td>

                      {/* File Upload */}
                      <td className="border border-gray-300 p-1">
                        <div className="flex items-center gap-1">
                          <input type="file" className="hidden" id={`f-${row.id}`} accept="image/*,.pdf" onChange={(e) => handleFileUpload(row.id, e.target.files[0])} />
                          <label 
                            htmlFor={`f-${row.id}`} 
                            className="flex-1 px-2 py-1.5 text-xs cursor-pointer hover:bg-gray-100 border border-dashed border-gray-300 rounded text-center truncate"
                          >
                            {row.fileName ? `📎 ${row.fileName.substring(0, 15)}...` : "📁 Choose"}
                          </label>
                          {row.fileName && (
                            <X 
                              className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-700" 
                              onClick={() => handleFileUpload(row.id, null)} 
                            />
                          )}
                        </div>
                      </td>

                      {/* Delete */}
                      <td className="border border-gray-300 p-1 text-center">
                        <button
                          onClick={() => deleteRow(row.id)}
                          disabled={rows.length === 1}
                          className="text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Excel-style Status Bar */}
            <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-xs text-gray-600 font-mono flex items-center justify-between">
              <span>Ready</span>
              <span>Sheet 1 of 2</span>
            </div>
          </div>

          {/* MERGED: Expense History (moved into Entry tab) */}
          <div className="mt-6 bg-white border border-gray-300 rounded-b-lg shadow-sm">
            <div className="bg-gray-50 border-b border-gray-300 px-4 py-3 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-green-600" />
                <div className="text-sm font-semibold text-gray-700">Expense Submission History</div>
              </div>
              <Button 
                onClick={fetchExpenseHistory} 
                size="sm" 
                variant="outline"
                disabled={loading}
                className="bg-white hover:bg-gray-100"
              >
                {loading ? "Refreshing..." : "🔄 Refresh"}
              </Button>
              <div className="ml-auto flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span className="font-mono">{expenseHistory.length} transaction(s)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-700 font-bold">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-mono">{formatCurrency(totalExpenses)}</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[600px]">
              {expenseHistory.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No expense history yet</p>
                  <p className="text-sm mt-2">Submit your first expense to see it here</p>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-100 border-b-2 border-gray-400">
                      <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200 w-12">A</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200 w-12">B</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200">C</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200">D</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200">E</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200">F</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200">G</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200">H</th>
                      <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200">I</th>
                    </tr>
                    <tr className="bg-green-600 text-white border-b-2 border-gray-400">
                      <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-center">#</th>
                      <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-center">ID</th>
                      <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-left">Date</th>
                      <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-left">Category</th>
                      <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-left">Subcategory</th>
                      <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-left">Description</th>
                      <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-right">Amount</th>
                      <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-center">Status</th>
                      <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedHistory).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([date, expenses]) => (
                      <React.Fragment key={date}>
                        <tr className="bg-green-50">
                          <td colSpan="9" className="border border-gray-300 px-4 py-2 font-semibold text-sm text-green-800">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            {date}
                          </td>
                        </tr>
                        {expenses.map((expense, index) => (
                          <tr key={expense.id} className="hover:bg-green-50 transition-colors">
                            <td className="border border-gray-300 px-3 py-2 text-center bg-gray-100 text-xs font-bold text-gray-600">
                              {String.fromCharCode(65)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-xs font-mono text-gray-500">
                              #{expense.id}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">
                              {new Date(expense.expense_date || expense.date || expense.created_at).toLocaleDateString('en-PH')}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm font-medium">
                              {getCategoryName(expense.subcategory_id)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              {getSubcategoryName(expense.subcategory_id)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">
                              {expense.description}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm text-right font-mono font-semibold text-green-700">
                              {formatCurrency(expense.amount)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-center">
                              <span className={`text-xs px-2 py-1 rounded ${getStatusClass(expense.status)}`}>
                                {getStatusLabel(expense.status)}
                              </span>
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-center">
                              {expense.receipt_path ? (
                                <a 
                                  href={`http://localhost/fundmonitor-api/${expense.receipt_path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 inline-block"
                                >
                                  📎 View
                                </a>
                              ) : (
                                <span className="text-xs text-gray-400">No file</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-green-100 font-semibold border-b-2 border-green-200">
                          <td colSpan="7" className="border border-gray-300 px-4 py-2 text-sm text-right">
                            Subtotal for {date}:
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-right font-mono text-green-700">
                            {formatCurrency(expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0))}
                          </td>
                          <td className="border border-gray-300"></td>
                        </tr>
                      </React.Fragment>
                    ))}
                    <tr className="bg-green-600 text-white font-bold border-t-2 border-gray-400">
                      <td className="border border-gray-300 px-3 py-3"></td>
                      <td className="border border-gray-300 px-3 py-3"></td>
                      <td className="border border-gray-300 px-3 py-3 text-sm" colSpan={5}>
                        TOTAL EXPENSES
                      </td>
                      <td className="border border-gray-300 px-3 py-3 text-sm text-right font-mono">
                        {formatCurrency(totalExpenses)}
                      </td>
                      <td className="border border-gray-300 px-3 py-3"></td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-xs text-gray-600 font-mono flex items-center justify-between">
              <span>Ready</span>
              <span>History</span>
            </div>
          </div>
        </TabsContent>

        {/* BUDGET CATEGORIES SHEET */}
        <TabsContent value="budget" className="mt-0">
          <div className="bg-white border border-gray-300 rounded-b-lg shadow-sm">
            <div className="bg-gray-50 border-b border-gray-300 px-4 py-2 flex items-center gap-3">
              <div className="text-sm font-semibold text-gray-700">Budget Allocation Reference</div>
              <div className="ml-auto text-xs text-gray-500 font-mono">
                Total Budget: {formatCurrency(grandTotal)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-400">
                    <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200 w-12">A</th>
                    <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200 w-12">B</th>
                    <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200">C</th>
                    <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200">D</th>
                    <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-center bg-gray-200">E</th>
                  </tr>
                  <tr className="bg-blue-600 text-white border-b-2 border-gray-400">
                    <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-center">#</th>
                    <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-center">Row</th>
                    <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-left">Category</th>
                    <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-left">Sub-category</th>
                    <th className="border border-gray-300 px-3 py-3 text-xs font-bold text-right">Allocated Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, catIndex) => (
                    <React.Fragment key={cat.id}>
                      {cat.subcategories?.map((sub, subIndex) => (
                        <tr key={sub.id} className="hover:bg-blue-50 transition-colors">
                          <td className="border border-gray-300 px-3 py-2 text-center bg-gray-100 text-xs font-bold text-gray-600">
                            {String.fromCharCode(65)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center bg-gray-100 text-xs font-bold text-gray-600">
                            {catIndex + subIndex + 1}
                          </td>
                          <td className={`border border-gray-300 px-3 py-2 text-sm font-bold ${subIndex === 0 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                            {subIndex === 0 ? cat.name : ''}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-sm">
                            {sub.name}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-right font-mono font-semibold text-green-700">
                            {formatCurrency(sub.allocation_amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-blue-100 font-bold">
                        <td className="border border-gray-300 px-3 py-2 bg-gray-100"></td>
                        <td className="border border-gray-300 px-3 py-2 bg-gray-100"></td>
                        <td className="border border-gray-300 px-3 py-2 text-sm" colSpan={2}>
                          {cat.name} Subtotal
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-right font-mono text-blue-700">
                          {formatCurrency(calculateCategoryTotal(cat))}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                  <tr className="bg-green-600 text-white font-bold border-t-2 border-gray-400">
                    <td className="border border-gray-300 px-3 py-3"></td>
                    <td className="border border-gray-300 px-3 py-3"></td>
                    <td className="border border-gray-300 px-3 py-3 text-sm" colSpan={2}>
                      GRAND TOTAL
                    </td>
                    <td className="border border-gray-300 px-3 py-3 text-sm text-right font-mono">
                      {formatCurrency(grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-xs text-gray-600 font-mono flex items-center justify-between">
              <span>Ready</span>
              <span>Sheet 2 of 3</span>
            </div>
          </div>
        </TabsContent>

        
      </Tabs>
    </DeptLayout>
  );
};

export default StaffBudgetTracker;