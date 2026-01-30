import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, Trash2, ShieldCheck, Loader2, Search, X, Hash } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "staff"
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost/fundmonitor-api/admin_actions.php?action=get_users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(user => 
    user.id.toString().includes(searchQuery) ||
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await fetch("http://localhost/fundmonitor-api/admin_actions.php?action=create_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setFormData({ full_name: "", email: "", password: "", role: "staff" });
        setOpen(false);
        fetchUsers();
      }
      alert(data.message);
    } catch (err) {
      alert("Network Error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await fetch(`http://localhost/fundmonitor-api/admin_actions.php?action=delete_user&id=${id}`, { method: "DELETE" });
      fetchUsers();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Access</h1>
            <p className="text-sm text-slate-500 font-medium">Manage user accounts and permission levels.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder="Search ID, name, or email..." 
                className="pl-9 h-10 text-sm border-slate-200 rounded-lg focus-visible:ring-indigo-500 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm font-bold h-10 px-5 rounded-lg shrink-0">
                  <UserPlus size={16} className="mr-2" /> New User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] border-none shadow-2xl rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Create Account</DialogTitle>
                  <DialogDescription className="text-xs">Setup a new authorized user.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase text-slate-500">Full Name</Label>
                    <Input required placeholder="Juan Dela Cruz" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="h-10 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase text-slate-500">Email Address</Label>
                    <Input required type="email" placeholder="juan@university.edu" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-10 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase text-slate-500">Initial Password</Label>
                    <Input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="h-10 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase text-slate-500">Role Selection</Label>
                    <select 
                      className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="admin">Admin / Finance</option>
                      <option value="department_head">Dept Head</option>
                      <option value="staff">Staff Member</option>
                    </select>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" disabled={isAdding} className="w-full bg-indigo-600 font-bold h-11">
                      {isAdding ? <Loader2 className="animate-spin" /> : "Confirm Registration"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[80px] text-[11px] font-bold uppercase tracking-wider pl-6">ID</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Identity</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Access Role</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-right pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" /></TableCell></TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center text-slate-400 text-sm font-medium">No results for "{searchQuery}"</TableCell></TableRow>
              ) : filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="pl-6 py-4 font-mono text-xs font-bold text-slate-400">
                    #{user.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-[10px] shrink-0">
                        {user.full_name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.full_name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-white text-[9px] font-bold uppercase border-slate-200 px-2 py-0">
                      <ShieldCheck size={10} className="mr-1 text-indigo-500" />
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md">
                      <Trash2 size={16} />
                    </Button>
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