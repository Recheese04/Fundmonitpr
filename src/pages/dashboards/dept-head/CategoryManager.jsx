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
  
  // Expanded categories
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Category form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });
  
  // Subcategory form
  const [subcategoryForm, setSubcategoryForm] = useState({
    category_id: '',
    name: '',
    allocation_percentage: '',
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
      const response = await fetch(`${API_BASE}?action=get_categories`);
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
        // Auto-expand categories with subcategories
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

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // ============================================
  // CATEGORY OPERATIONS
  // ============================================

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '' });
    }
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    try {
      const url = editingCategory 
        ? `${API_BASE}?action=update_category`
        : `${API_BASE}?action=create_category`;
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const payload = editingCategory
        ? { id: editingCategory.id, ...categoryForm }
        : categoryForm;

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



  const openSubcategoryModal = (category, subcategory = null) => {
    if (subcategory) {
      setEditingSubcategory(subcategory);
      setSubcategoryForm({
        category_id: category.id,
        name: subcategory.name,
        allocation_percentage: subcategory.allocation_percentage,
        description: subcategory.description || ''
      });
    } else {
      setEditingSubcategory(null);
      setSubcategoryForm({
        category_id: category.id,
        name: '',
        allocation_percentage: '',
        description: ''
      });
    }
    setShowSubcategoryModal(true);
  };

  const closeSubcategoryModal = () => {
    setShowSubcategoryModal(false);
    setEditingSubcategory(null);
    setSubcategoryForm({
      category_id: '',
      name: '',
      allocation_percentage: '',
      description: ''
    });
  };

  const handleSaveSubcategory = async () => {
    if (!subcategoryForm.name.trim()) {
      setError('Sub-category name is required');
      return;
    }

    if (!subcategoryForm.allocation_percentage || subcategoryForm.allocation_percentage < 0 || subcategoryForm.allocation_percentage > 100) {
      setError('Allocation percentage must be between 0 and 100');
      return;
    }

    setLoading(true);
    try {
      const url = editingSubcategory 
        ? `${API_BASE}?action=update_subcategory`
        : `${API_BASE}?action=create_subcategory`;
      
      const method = editingSubcategory ? 'PUT' : 'POST';
      
      const payload = editingSubcategory
        ? { id: editingSubcategory.id, ...subcategoryForm }
        : subcategoryForm;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(data.message);
        closeSubcategoryModal();
        fetchCategories();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to save sub-category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategory = async (subcategory) => {
    setDeleteTarget({ type: 'subcategory', data: subcategory });
    setShowDeleteModal(true);
  };

  return (
    <DeptLayout title="Category & Sub-category Management">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Budget Categories</h2>
            <p className="text-sm text-slate-600 mt-1">
              Manage budget categories and allocation percentages
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
                {categories.map((category) => (
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
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900">{category.name}</h3>
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                {category.subcategory_count} sub-categories
                              </span>
                            </div>
                            {category.description && (
                              <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span>Total Allocation: <strong className="text-indigo-600">{category.total_allocation?.toFixed(2)}%</strong></span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
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
                              <th className="text-right py-2 px-4 text-xs font-semibold text-slate-700">Allocation %</th>
                              <th className="text-right py-2 px-4 pr-4 text-xs font-semibold text-slate-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.subcategories.map((sub) => (
                              <tr key={sub.id} className="border-b last:border-b-0 hover:bg-white transition-colors">
                                <td className="py-3 px-4 pl-16 text-sm font-medium text-slate-900">{sub.name}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{sub.description || '-'}</td>
                                <td className="py-3 px-4 text-right">
                                  <span className="inline-flex items-center px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                                    {parseFloat(sub.allocation_percentage).toFixed(2)}%
                                  </span>
                                </td>
                                <td className="py-3 px-4 pr-4 text-right">
                                  <div className="flex gap-2 justify-end">
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
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                    disabled={loading || !categoryForm.name.trim()}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Sub-category Name *</label>
                  <Input
                    value={subcategoryForm.name}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                    placeholder="e.g., Building Maintenance"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Allocation Percentage * (0-100)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={subcategoryForm.allocation_percentage}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, allocation_percentage: e.target.value })}
                    placeholder="e.g., 15.00"
                  />
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
                    disabled={loading || !subcategoryForm.name.trim() || !subcategoryForm.allocation_percentage}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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