import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { 
  UserPlus, 
  Trash2, 
  Edit, 
  Loader2, 
  Search, 
  Building2, 
  Mail, 
  Shield, 
  Users,
  X,
  RefreshCw,
  Filter,
  AlertTriangle
} from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [roleFilter, setRoleFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  
  const [formData, setFormData] = useState({
    id: "", 
    full_name: "", 
    email: "", 
    password: "", 
    role: "staff", 
    department_id: "" 
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([
        fetch("http://localhost/fundmonitor-api/admin_actions.php?action=get_users"),
        fetch("http://localhost/fundmonitor-api/admin_actions.php?action=get_departments")
      ]);
      setUsers(await uRes.json());
      setDepartments(await dRes.json());
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Open Edit Modal and Fill Data
  const startEdit = (user) => {
    setFormData({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      password: "", // Keep password blank unless changing
      role: user.role,
      department_id: user.department_id || ""
    });
    setEditOpen(true);
  };

  const handleSave = async (e, isUpdate = false) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const action = isUpdate ? 'update_user' : 'create_user';
      const res = await fetch(`http://localhost/fundmonitor-api/admin_actions.php?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setOpen(false);
        setEditOpen(false);
        setFormData({ 
          id: "", 
          full_name: "", 
          email: "", 
          password: "", 
          role: "staff", 
          department_id: "" 
        });
        fetchData();
        alert(data.message);
      } else {
        alert(data.message || "Failed to save user");
      }
    } catch (err) {
      alert("Error saving user: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return;
    
    try {
      await fetch(`http://localhost/fundmonitor-api/admin_actions.php?action=delete_user&id=${id}`, { 
        method: "DELETE" 
      });
      fetchData();
      alert("User deleted successfully");
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  };

  const closeModal = () => {
    setOpen(false);
    setEditOpen(false);
    setFormData({ 
      id: "", 
      full_name: "", 
      email: "", 
      password: "", 
      role: "staff", 
      department_id: "" 
    });
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesDept = deptFilter === "all" || u.department_id?.toString() === deptFilter;
    return matchesSearch && matchesRole && matchesDept;
  });

  // Get role badge styling
  const getRoleBadge = (role) => {
    const styles = {
      admin: "bg-purple-100 text-purple-700 border-purple-300",
      department_head: "bg-blue-100 text-blue-700 border-blue-300",
      staff: "bg-slate-100 text-slate-700 border-slate-300"
    };
    
    const labels = {
      admin: "Admin",
      department_head: "Dept Head",
      staff: "Staff"
    };
    
    return (
      <Badge className={`${styles[role] || styles.staff} border font-medium text-xs`}>
        {labels[role] || role}
      </Badge>
    );
  };

  // Statistics
  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    deptHead: users.filter(u => u.role === 'department_head').length,
    staff: users.filter(u => u.role === 'staff').length
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-600 mt-1">Manage system users, roles, and departments</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={fetchData} 
              variant="outline"
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => {
                setFormData({
                  id:"", 
                  full_name:"", 
                  email:"", 
                  password:"", 
                  role:"staff", 
                  department_id:""
                }); 
                setOpen(true);
              }} 
              className="bg-indigo-600 hover:bg-indigo-700 gap-2"
            >
              <UserPlus className="w-4 h-4" />
              New User
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-indigo-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Admins</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.admin}</p>
                </div>
                <Shield className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Dept Heads</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.deptHead}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-slate-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Staff</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.staff}</p>
                </div>
                <Users className="w-8 h-8 text-slate-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
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

              {/* Role Filter */}
              <div className="w-full md:w-48">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="department_head">Dept Head</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              {/* Department Filter */}
              <div className="w-full md:w-48">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.department_name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(searchQuery || roleFilter !== "all" || deptFilter !== "all") && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <Filter className="w-3 h-3" />
                <span>Active filters:</span>
                {searchQuery && <Badge variant="outline" className="text-xs">Search: "{searchQuery}"</Badge>}
                {roleFilter !== "all" && <Badge variant="outline" className="text-xs">Role: {roleFilter}</Badge>}
                {deptFilter !== "all" && (
                  <Badge variant="outline" className="text-xs">
                    Dept: {departments.find(d => d.id.toString() === deptFilter)?.department_name}
                  </Badge>
                )}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("all");
                    setDeptFilter("all");
                  }}
                  className="text-indigo-600 hover:text-indigo-700 underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Modal (Create/Edit) */}
        <Dialog open={open || editOpen} onOpenChange={(val) => { 
          if (!val) closeModal();
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold">
                  {editOpen ? "Edit User" : "Create New User"}
                </DialogTitle>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DialogHeader>
            
            <form onSubmit={(e) => handleSave(e, editOpen)} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Full Name *</Label>
                <Input 
                  placeholder="John Doe" 
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="email" 
                    placeholder="john.doe@example.com" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="pl-10"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  {editOpen ? "New Password (leave blank to keep current)" : "Password *"}
                </Label>
                <Input 
                  type="password" 
                  placeholder={editOpen ? "Leave blank to keep current password" : "Enter password"} 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required={!editOpen} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Role *</Label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="staff">Staff</option>
                    <option value="department_head">Dept Head</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Department</Label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                    value={formData.department_id} 
                    onChange={e => setFormData({...formData, department_id: e.target.value})}
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.department_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Save {editOpen ? "Changes" : "User"}</>
                  )}
                </Button>
                <Button 
                  type="button"
                  onClick={closeModal}
                  variant="outline"
                  className="flex-1"
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Users Table */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span className="text-lg">
                  User Directory 
                  <span className="text-sm font-normal text-slate-600 ml-2">
                    ({filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'})
                  </span>
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
                <p className="text-sm text-slate-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-600">No users found</p>
                <p className="text-xs text-slate-500 mt-1">
                  {searchQuery || roleFilter !== "all" || deptFilter !== "all" 
                    ? "Try adjusting your filters" 
                    : "Create your first user to get started"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold">User Information</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Department</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-700 font-semibold text-sm">
                                {user.full_name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{user.full_name}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700">{user.dept_name || "Not assigned"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => startEdit(user)}
                              className="hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-red-50 hover:text-red-700" 
                              onClick={() => handleDelete(user.id, user.full_name)}
                            >
                              <Trash2 className="w-4 h-4" />
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
    </DashboardLayout>
  );
}