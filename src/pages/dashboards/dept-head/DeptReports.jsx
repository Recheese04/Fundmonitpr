import React, { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Printer, 
  RefreshCw, 
  Calendar, 
  Check, 
  X, 
  FileText, 
  ExternalLink,
  Search,
  Filter,
  DollarSign,
  User,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import DeptLayout from "../../../components/layout/DeptLayout";
import API_URL_CONFIG from "@/apiConfig";

const API_URL = `${API_URL_CONFIG}/dept_expenses.php`;
const BASE_URL = `${API_URL_CONFIG}/`; 

const DeptReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const activeDeptId = user?.department_id || 1; 

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=get_reports&department_id=${activeDeptId}`);
      const data = await response.json();
      if (data.success) {
        setReports(data.data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

 const handleStatusUpdate = async (id, newStatus, staffName) => {
  if (!window.confirm(`Are you sure you want to ${newStatus} this expense from ${staffName}?`)) {
    return;
  }

  const formData = new FormData();
  formData.append('id', id);
  formData.append('status', newStatus);

  // Route to different files based on the status
  // Approvals trigger budget deduction logic
  const endpoint = newStatus === 'approved' 
    ? `${API_URL_CONFIG}/approve_expense.php` 
    : `${API_URL}?action=update_status`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });
    
    // Safety check to ensure the server responded with JSON
    const result = await response.json();
    
    if (result.success) {
      fetchReports();
      alert(result.message || `Expense ${newStatus} successfully!`);
    } else {
      // This will display "Insufficient budget!" if that error is triggered
      alert(result.message || "Failed to update status");
    }
  } catch (err) {
    console.error("Connection error:", err);
    alert("Failed to connect to the server. Check if approve_expense.php exists.");
  }
};

useEffect(() => {
  fetchReports();
}, [activeDeptId]);
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.staff_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.subcategory_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const expenseDate = new Date(report.expense_date);
      const today = new Date();
      
      if (dateFilter === "today") {
        matchesDate = expenseDate.toDateString() === today.toDateString();
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = expenseDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = expenseDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate statistics
  const stats = {
    total: filteredReports.length,
    pending: filteredReports.filter(r => r.status === 'pending').length,
    approved: filteredReports.filter(r => r.status === 'approved').length,
    rejected: filteredReports.filter(r => r.status === 'rejected').length,
    totalAmount: filteredReports.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0),
    approvedAmount: filteredReports
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0),
    pendingAmount: filteredReports
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-green-100 text-green-700 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
      pending: "bg-amber-100 text-amber-700 border-amber-300"
    };
    
    const icons = {
      approved: <CheckCircle2 className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />
    };
    
    return (
      <Badge className={`${styles[status] || styles.pending} border font-medium text-xs flex items-center gap-1`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <DeptLayout title="Department Reports">
      <style>{`
        @media print {
          .print\\:hidden, header, aside, .no-print { display: none !important; }
          main { margin-left: 0 !important; padding: 0 !important; width: 100% !important; }
          body { background: white !important; color: black !important; }
          .DeptLayout_header { display: none !important; }
          .space-y-6 { space-y: 0 !important; }
          .p-6 { padding: 0 !important; }
          table { width: 100% !important; border-collapse: collapse !important; margin-top: 20px !important; }
          th, td { border: 1px solid #000 !important; padding: 10px !important; font-size: 10pt !important; text-align: left !important; }
          th { background-color: #f2f2f2 !important; font-weight: bold !important; }
        }
      `}</style>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Expense Reports</h2>
            <p className="text-sm text-slate-600 mt-1">Review and approve department expenses</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={fetchReports}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                if (filteredReports.length === 0) {
                  toast.error("No records to export.");
                  return;
                }
                const headers = ["ID", "Date", "Staff Name", "Role", "Category", "Description", "Amount (PHP)", "Status"];
                const rows = filteredReports.map(e => [
                  e.id, 
                  e.expense_date, 
                  `"${e.staff_name}"`, 
                  `"${e.staff_role || 'Staff'}"`, 
                  `"${e.subcategory_name || 'General'}"`, 
                  `"${e.description || ''}"`, 
                  e.amount, 
                  e.status.toUpperCase()
                ]);
                const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `Department_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("Department Expenses exported successfully!");
              }}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.print()}
              className="gap-2 bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-indigo-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending Review</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Approved</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Rejected</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Amount Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-slate-500 uppercase tracking-wider">Total Filed</p>
                  <p className="text-3xl font-black text-indigo-700 tabular-nums">{formatCurrency(stats.totalAmount)}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">All filtered records</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-emerald-600 uppercase tracking-wider">Approved</p>
                  <p className="text-3xl font-black text-emerald-700 tabular-nums">{formatCurrency(stats.approvedAmount)}</p>
                  <p className="text-[10px] text-emerald-600/60 font-bold uppercase mt-1">Deducted from budget</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-amber-600 uppercase tracking-wider">Pending</p>
                  <p className="text-3xl font-black text-amber-700 tabular-nums">{formatCurrency(stats.pendingAmount)}</p>
                  <p className="text-[10px] text-amber-600/60 font-bold uppercase mt-1">Reserved funds</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="print:hidden">
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by staff name, category, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="w-full md:w-48">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(searchQuery || statusFilter !== "all" || dateFilter !== "all") && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <Filter className="w-3 h-3" />
                <span>Active filters:</span>
                {searchQuery && <Badge variant="outline" className="text-xs">Search: "{searchQuery}"</Badge>}
                {statusFilter !== "all" && <Badge variant="outline" className="text-xs">Status: {statusFilter}</Badge>}
                {dateFilter !== "all" && <Badge variant="outline" className="text-xs">Date: {dateFilter}</Badge>}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setDateFilter("all");
                  }}
                  className="text-indigo-600 hover:text-indigo-700 underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span className="text-lg">
                  Expense Transactions
                  <span className="text-sm font-normal text-slate-600 ml-2">
                    ({filteredReports.length} {filteredReports.length === 1 ? 'record' : 'records'})
                  </span>
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
                <p className="text-sm text-slate-600">Loading expense reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-600">No expenses found</p>
                <p className="text-xs text-slate-500 mt-1">
                  {searchQuery || statusFilter !== "all" || dateFilter !== "all" 
                    ? "Try adjusting your filters" 
                    : "No expense reports available for this department"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold">User & Date</TableHead>
                      <TableHead className="font-semibold">Category & Description</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Receipt</TableHead>
                      <TableHead className="text-center font-semibold">Status</TableHead>
                      <TableHead className="text-right font-semibold print:hidden">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{report.staff_name}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {report.staff_role && (
                                  <Badge className={`text-[10px] px-1.5 py-0 ${
                                    report.staff_role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                    report.staff_role === 'department_head' ? 'bg-blue-100 text-blue-700' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>
                                    {report.staff_role === 'department_head' ? 'Dept Head' : 
                                     report.staff_role === 'admin' ? 'Admin' : 'Staff'}
                                  </Badge>
                                )}
                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(report.expense_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900">{report.subcategory_name}</div>
                            {report.description && (
                              <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                                {report.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-indigo-700">
                            {formatCurrency(parseFloat(report.amount))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.receipt_path ? (
                            <a 
                              href={`${BASE_URL}${report.receipt_path}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors text-xs font-medium"
                            >
                              <Eye className="w-3 h-3" />
                              View File
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-xs">No receipt</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(report.status)}
                        </TableCell>
                        <TableCell className="text-right print:hidden">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 px-3 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
                              onClick={() => handleStatusUpdate(report.id, 'approved', report.staff_name)}
                              disabled={report.status === 'approved'}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                              onClick={() => handleStatusUpdate(report.id, 'rejected', report.staff_name)}
                              disabled={report.status === 'rejected'}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DeptLayout>
  );
};

export default DeptReports;