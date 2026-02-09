import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FolderTree, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import DeptLayout from "../../../components/layout/DeptLayout";

const API_BASE = "http://localhost/fundmonitor-api/categories.php";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [departmentAllocatedBudget, setDepartmentAllocatedBudget] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Store the current category for subcategory operations
  const [currentCategory, setCurrentCategory] = useState(null);
  
  // Expanded categories
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Category form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    total_budget: ''
  });
  
  // Subcategory form
  const [subcategoryForm, setSubcategoryForm] = useState({
    category_id: '',
    department_id: '',
    name: '',
    allocation_amount: '',
    description: ''
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
        const user = JSON.parse(localStorage.getItem('user'));
        const deptId = user?.department_id || 0;
        const currentYear = new Date().getFullYear();

        const response = await fetch(
            `${API_BASE}?action=get_categories_with_budget&year=${currentYear}&department_id=${deptId}`
        );
        const data = await response.json();
        
        if (data.success) {
            // Ensure every category has department_id
            const categoriesWithDept = data.categories.map(cat => ({
                ...cat,
                department_id: cat.department_id || deptId
            }));
            setCategories(categoriesWithDept);
            setDepartmentAllocatedBudget(data.department_allocated_budget || 0); // Add this line
            const expanded = {};
            categoriesWithDept.forEach(cat => {
                if (cat.subcategories?.length > 0) expanded[cat.id] = true;
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

  const calculateCategoryBudget = (category) => {
    let totalBudget = parseFloat(category.total_budget || 0);
    
    let allocatedAmount = 0;
    let source = 'none';
    
    if (category.allocated_budget !== undefined && category.allocated_budget !== null && !isNaN(parseFloat(category.allocated_budget))) {
      allocatedAmount = parseFloat(category.allocated_budget);
      source = 'budgets_table';
    } 
    else if (category.subcategories_allocated !== undefined && !isNaN(parseFloat(category.subcategories_allocated))) {
      allocatedAmount = parseFloat(category.subcategories_allocated);
      source = 'subcategories_sum';
    }

    if (totalBudget === 0 && allocatedAmount > 0) {
      totalBudget = allocatedAmount;
    }

    const remainingBudget = totalBudget - allocatedAmount;
    const percentageUsed = totalBudget > 0 ? (allocatedAmount / totalBudget) * 100 : 0;

    return {
      totalBudget,
      allocatedAmount,
      remainingBudget,
      percentageUsed
    };
  };

  const getBudgetStatusColor = (remaining, total) => {
    if (remaining < 0) return 'text-red-600';
    if (remaining === 0) return 'text-slate-500';
    const percentage = (remaining / total) * 100;
    if (percentage < 20) return 'text-orange-600';
    return 'text-emerald-600';
  };

  const getProgressBarColor = (percentUsed) => {
    if (percentUsed > 100) return 'bg-red-500';
    if (percentUsed === 100) return 'bg-slate-500';
    if (percentUsed >= 80) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  // ============================================
  // CATEGORY OPERATIONS
  // ============================================

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        total_budget: category.total_budget || ''
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', total_budget: '' });
    }
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '', total_budget: '' });
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      setError('Category name is required');
      return;
    }

    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    const deptId = user?.department_id;

    if (!deptId) {
      setError('Session expired. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const url = editingCategory 
        ? `${API_BASE}?action=update_category`
        : `${API_BASE}?action=create_category`;
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const payload = editingCategory
        ? { id: editingCategory.id, ...categoryForm, department_id: deptId }
        : { ...categoryForm, department_id: deptId };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(data.message);
        closeCategoryModal();
        fetchCategories();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to save category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    setDeleteTarget({ type: 'category', data: category });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setLoading(true);
    try {
      const { type, data } = deleteTarget;
      const action = type === 'category' ? 'delete_category' : 'delete_subcategory';
      
      const response = await fetch(`${API_BASE}?action=${action}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.id })
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess(result.message);
        setShowDeleteModal(false);
        setDeleteTarget(null);
        fetchCategories();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to delete: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SUBCATEGORY OPERATIONS
  // ============================================

  const openSubcategoryModal = (category, subcategory = null) => {
    console.log('=== Opening Subcategory Modal ===');
    console.log('Category object:', category);
    
    // Store the current category
    setCurrentCategory(category);
    
    // Get department_id - try multiple sources
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    const deptId = category.department_id || user?.department_id || 0;
    
    console.log('Department ID resolution:', {
      from_category: category.department_id,
      from_user: user?.department_id,
      final_deptId: deptId
    });
    
    if (!category.id) {
      setError('Category ID is missing. Please refresh the page and try again.');
      return;
    }
    
    if (!deptId || deptId === 0) {
      setError('Department ID could not be determined. Please log out and log back in.');
      return;
    }
    
    if (subcategory) {
      // Editing existing subcategory
      console.log('Editing subcategory:', subcategory);
      setEditingSubcategory(subcategory);
      setSubcategoryForm({
        category_id: String(category.id),
        department_id: String(deptId),
        name: subcategory.name,
        allocation_amount: subcategory.allocation_amount || 0,
        description: subcategory.description || ''
      });
    } else {
      // Creating new subcategory
      console.log('Creating new subcategory');
      setEditingSubcategory(null);
      setSubcategoryForm({
        category_id: String(category.id),
        department_id: String(deptId),
        name: '',
        allocation_amount: '',
        description: ''
      });
    }
    
    console.log('Form initialized:', {
      category_id: String(category.id),
      department_id: String(deptId)
    });
    
    setShowSubcategoryModal(true);
  };

  const closeSubcategoryModal = () => {
    setShowSubcategoryModal(false);
    setEditingSubcategory(null);
    setCurrentCategory(null);
    setSubcategoryForm({
      category_id: '',
      department_id: '',
      name: '',
      allocation_amount: '',
      description: ''
    });
  };

  const handleSaveSubcategory = async () => {
    console.log('=== Save Subcategory Called ===');
    console.log('Form state:', subcategoryForm);
    
    if (!subcategoryForm.name.trim()) {
      setError('Sub-category name is required');
      return;
    }

    // Parse the IDs
    const catId = parseInt(subcategoryForm.category_id);
    const deptId = parseInt(subcategoryForm.department_id);

    console.log('Parsed IDs:', {
      original_catId: subcategoryForm.category_id,
      parsed_catId: catId,
      catId_isNaN: isNaN(catId),
      original_deptId: subcategoryForm.department_id,
      parsed_deptId: deptId,
      deptId_isNaN: isNaN(deptId)
    });

    // Validate category ID
    if (!catId || catId === 0 || isNaN(catId)) {
      console.error('Category ID validation failed!', {
        catId,
        type: typeof catId,
        form_value: subcategoryForm.category_id,
        form_type: typeof subcategoryForm.category_id
      });
      setError(`Invalid Category ID: ${catId}. Form value: "${subcategoryForm.category_id}". Please close the modal and try again.`);
      return;
    }
    
    // Validate department ID
    if (!deptId || deptId === 0 || isNaN(deptId)) {
      console.error('Department ID validation failed!', {
        deptId,
        type: typeof deptId,
        form_value: subcategoryForm.department_id,
        form_type: typeof subcategoryForm.department_id
      });
      setError(`Invalid Department ID: ${deptId}. Form value: "${subcategoryForm.department_id}". Please log out and log back in.`);
      return;
    }

    console.log('Validation passed! Proceeding with save...');

    setLoading(true);
    try {
      const url = editingSubcategory 
        ? `${API_BASE}?action=update_subcategory`
        : `${API_BASE}?action=create_subcategory`;
      
      const method = editingSubcategory ? 'PUT' : 'POST';
      
      const payload = {
        name: subcategoryForm.name.trim(),
        allocation_amount: parseFloat(subcategoryForm.allocation_amount) || 0,
        description: subcategoryForm.description.trim(),
        category_id: catId,
        department_id: deptId
      };
      
      if (editingSubcategory) {
        payload.id = editingSubcategory.id;
      }

      console.log('Sending request:', {
        url,
        method,
        payload
      });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Server response:', data);
      
      if (data.success) {
        setSuccess(data.message);
        closeSubcategoryModal();
        fetchCategories();
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Request failed:', err);
      setError('Failed to save sub-category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategory = async (subcategory) => {
    setDeleteTarget({ type: 'subcategory', data: subcategory });
    setShowDeleteModal(true);
  };

  const handleResetSubcategoryBudget = async (subcategory) => {
    const confirmed = window.confirm(
      `Reset budget for "${subcategory.name}"?\n\n` +
      `This will set the remaining budget back to the allocated amount:\n` +
      `Allocated: ${formatCurrency(subcategory.allocation_amount)}\n\n` +
      `Continue?`
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}?action=reset_subcategory_budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subcategory.id })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(data.message || 'Budget reset successfully');
        fetchCategories();
      } else {
        setError(data.message || 'Failed to reset budget');
      }
    } catch (err) {
      setError('Failed to reset budget: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeptLayout title="Category & Sub-category Management">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Budget Categories</h2>
            <p className="text-sm text-slate-600 mt-1">
              Manage budget categories and allocation amounts
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={fetchCategories}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => openCategoryModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              New Category
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="border-green-200 bg-green-50">
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
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderTree className="w-5 h-5 text-indigo-600" />
              Categories & Sub-categories
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
                <p className="text-sm text-slate-600">No categories found</p>
                <p className="text-xs text-slate-500 mt-1">Create your first category to get started</p>
              </div>
            ) : (
              <div className="divide-y">
                {categories.map((category) => {
                  const budget = calculateCategoryBudget(category);
                  
                  return (
                    <div key={category.id}>
                      {/* Category Row */}
                      <div className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => toggleCategory(category.id)}
                              className="mt-1 p-1 hover:bg-slate-200 rounded transition-colors"
                            >
                              {expandedCategories[category.id] ? (
                                <ChevronDown className="w-4 h-4 text-slate-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-slate-900">{category.name}</h3>
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                  {category.subcategory_count} sub-categories
                                </span>
                                {budget.totalBudget > 0 && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                    {budget.percentageUsed.toFixed(1)}% allocated
                                  </span>
                                )}
                              </div>
                              {category.description && (
                                <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                              )}
                              
                              {/* Category Budget Summary */}
                              <div className="mt-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs text-slate-600 mb-1">Category Budget</p>
                                    <p className="font-bold text-indigo-900">{formatCurrency(budget.totalBudget)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-600 mb-1">Allocated to Subs</p>
                                    <p className={`font-bold ${budget.allocatedAmount > budget.totalBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                                      {formatCurrency(budget.allocatedAmount)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-600 mb-1">Available</p>
                                    <p className={`font-bold ${getBudgetStatusColor(budget.remainingBudget, budget.totalBudget)}`}>
                                      {formatCurrency(budget.remainingBudget)}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className={`h-full transition-all ${getProgressBarColor(budget.percentageUsed)}`}
                                      style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openSubcategoryModal(category)}
                              className="gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Sub
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openCategoryModal(category)}
                              className="gap-1"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteCategory(category)}
                              className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Subcategories */}
                      {expandedCategories[category.id] && category.subcategories && category.subcategories.length > 0 && (
                        <div className="bg-slate-50 border-t">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-slate-100">
                                <th className="text-left py-2 px-4 pl-16 text-xs font-semibold text-slate-700">Sub-category Name</th>
                                <th className="text-left py-2 px-4 text-xs font-semibold text-slate-700">Description</th>
                                <th className="text-right py-2 px-4 text-xs font-semibold text-slate-700">Allocated</th>
                                <th className="text-right py-2 px-4 text-xs font-semibold text-slate-700">Remaining</th>
                                <th className="text-right py-2 px-4 text-xs font-semibold text-slate-700">Spent</th>
                                <th className="text-right py-2 px-4 pr-4 text-xs font-semibold text-slate-700">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {category.subcategories.map((sub) => {
                                const allocated = parseFloat(sub.allocation_amount || 0);
                                const remaining = parseFloat(sub.remaining_budget || allocated);
                                const spent = allocated - remaining;
                                
                                return (
                                  <tr key={sub.id} className="border-b last:border-b-0 hover:bg-white transition-colors">
                                    <td className="py-3 px-4 pl-16 text-sm font-medium text-slate-900">{sub.name}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600">{sub.description || '-'}</td>
                                    <td className="py-3 px-4 text-right">
                                      <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                        {formatCurrency(allocated)}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                                        remaining <= 0 ? 'bg-red-100 text-red-700' :
                                        remaining < allocated * 0.2 ? 'bg-orange-100 text-orange-700' :
                                        'bg-emerald-100 text-emerald-700'
                                      }`}>
                                        {formatCurrency(remaining)}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                                        {formatCurrency(spent)}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 pr-4 text-right">
                                      <div className="flex gap-2 justify-end">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleResetSubcategoryBudget(sub)}
                                          className="h-8 px-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                          title="Reset remaining budget to allocated amount"
                                        >
                                          <RefreshCw className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => openSubcategoryModal(category, sub)}
                                          className="h-8 px-2"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDeleteSubcategory(sub)}
                                          className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                              {/* Total Row */}
                              <tr className="bg-slate-100 border-t-2 border-slate-300">
                                <td colSpan="2" className="py-3 px-4 pl-16 text-sm font-bold text-slate-900">
                                  Totals
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
                                    {formatCurrency(category.subcategories.reduce((sum, sub) => sum + parseFloat(sub.allocation_amount || 0), 0))}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span className="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full">
                                    {formatCurrency(category.subcategories.reduce((sum, sub) => sum + parseFloat(sub.remaining_budget || sub.allocation_amount || 0), 0))}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span className="inline-flex items-center px-3 py-1.5 bg-slate-200 text-slate-700 text-sm font-bold rounded-full">
                                    {formatCurrency(category.subcategories.reduce((sum, sub) => {
                                      const allocated = parseFloat(sub.allocation_amount || 0);
                                      const remaining = parseFloat(sub.remaining_budget || allocated);
                                      return sum + (allocated - remaining);
                                    }, 0))}
                                  </span>
                                </td>
                                <td className="py-3 px-4 pr-4"></td>
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
            <div className="border-t-2 border-slate-300 bg-gradient-to-r from-indigo-50 to-slate-50 p-6">
              <div className="flex justify-between items-center max-w-4xl mx-auto">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Total Department Budget:</h3>
                  <p className="text-xs text-slate-600 mt-1">Allocated to categories (FY {new Date().getFullYear()})</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-indigo-700">
                    {(() => {
                      // Sum up the allocation_amount or total_budget from each category
                      const total = categories.reduce((sum, cat) => {
                        const amount = parseFloat(cat.allocation_amount || cat.total_budget || 0);
                        return sum + amount;
                      }, 0);
                      return formatCurrency(total);
                    })()}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    across {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </CardTitle>
                  <button onClick={closeCategoryModal} className="p-1 hover:bg-slate-100 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Category Name *</label>
                  <Input
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g., Facility Development"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Total Budget (PHP) *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={categoryForm.total_budget}
                    onChange={(e) => setCategoryForm({ ...categoryForm, total_budget: e.target.value })}
                    placeholder="e.g., 500000.00"
                  />
                  {editingCategory && (
                    <p className="text-xs text-amber-600">
                      ⚠️ Current allocated: {formatCurrency(calculateCategoryBudget(editingCategory).allocatedAmount)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Brief description of this category"
                    className="w-full min-h-[100px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveCategory}
                    disabled={loading || !categoryForm.name.trim() || !categoryForm.total_budget}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingCategory ? 'Update' : 'Create'} Category
                  </Button>
                  <Button
                    onClick={closeCategoryModal}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subcategory Modal */}
        {showSubcategoryModal && (
          <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {editingSubcategory ? 'Edit Sub-category' : 'Create New Sub-category'}
                  </CardTitle>
                  <button onClick={closeSubcategoryModal} className="p-1 hover:bg-slate-100 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {currentCategory && (() => {
                  const budget = calculateCategoryBudget(currentCategory);
                  const oldAmount = editingSubcategory ? parseFloat(editingSubcategory.allocation_amount || 0) : 0;
                  const availableBudget = budget.remainingBudget + oldAmount;

                  return (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-slate-700 mb-2">Category Budget Status:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-600">Total Budget:</span>
                          <p className="font-bold text-slate-900">{formatCurrency(budget.totalBudget)}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Available:</span>
                          <p className={`font-bold ${getBudgetStatusColor(availableBudget, budget.totalBudget)}`}>
                            {formatCurrency(availableBudget)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Sub-category Name *</label>
                  <Input
                    value={subcategoryForm.name}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                    placeholder="e.g., Building Maintenance"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Allocation Amount (PHP) *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={subcategoryForm.allocation_amount}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, allocation_amount: e.target.value })}
                    placeholder="e.g., 50000.00"
                  />
                  <p className="text-xs text-slate-500">
                    Set the budget amount for this sub-category
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    value={subcategoryForm.description}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                    placeholder="Brief description of this sub-category"
                    className="w-full min-h-[100px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveSubcategory}
                    disabled={loading || !subcategoryForm.name.trim() || (!subcategoryForm.allocation_amount && subcategoryForm.allocation_amount !== 0)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingSubcategory ? 'Update' : 'Create'} Sub-category
                  </Button>
                  <Button
                    onClick={closeSubcategoryModal}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deleteTarget && (
          <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  Confirm Deletion
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-700 mb-4">
                  Are you sure you want to delete <strong>{deleteTarget.data.name}</strong>?
                  {deleteTarget.type === 'category' && deleteTarget.data.subcategory_count > 0 && (
                    <span className="block mt-2 text-sm text-red-600">
                      ⚠️ This category has {deleteTarget.data.subcategory_count} sub-categories. 
                      You must delete all sub-categories first.
                    </span>
                  )}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={confirmDelete}
                    disabled={loading || (deleteTarget.type === 'category' && deleteTarget.data.subcategory_count > 0)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteTarget(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DeptLayout>
  );
};

export default CategoryManager;