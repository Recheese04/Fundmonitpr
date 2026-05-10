import React, { useState, useEffect } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
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
import API_URL from "@/apiConfig";

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
        fetch(`${API_URL}/admin_actions.php?action=get_users`),
        fetch(`${API_URL}/admin_actions.php?action=get_departments`)
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
      const res = await fetch(`${API_URL}/admin_actions.php?action=${action}`, {
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
      await fetch(`${API_URL}/admin_actions.php?action=delete_user&id=${id}`, {
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
    <UnifiedLayout title="User Management" subtitle="Manage system users, roles, and departments">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .um-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .um-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 18px 20px; transition: transform 0.2s, box-shadow 0.2s; }
        .um-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.06); }
        .btn-primary { 
          display: inline-flex; align-items: center; gap: 8px; 
          padding: 8px 16px; background: #0f172a; color: #fde68a; 
          border: 1px solid rgba(245,168,43,0.3); border-radius: 9px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }
        .btn-primary:hover { background: #1e293b; box-shadow: 0 4px 14px rgba(245,168,43,0.15); }
        .btn-outline {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
          font-size: 12px; font-weight: 700; color: #64748b; cursor: pointer;
          font-family: inherit; transition: all 0.15s;
        }
        .btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; color: #475569; }
        .um-input {
          width: 100%; padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
          font-size: 13px; font-weight: 500; color: #1e293b; background: #fff;
          outline: none; transition: border-color 0.15s;
        }
        .um-input:focus { border-color: #f5a82b; }
        .um-label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 5px; }
        .role-admin { background: #fff1f2; color: #e11d48; border: 1px solid rgba(225,29,72,0.2); }
        .role-dept { background: #eff6ff; color: #1d4ed8; border: 1px solid rgba(29,78,216,0.2); }
        .role-staff { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }
        .badge-compact { padding: 2px 8px; border-radius: 5px; font-size: 10px; font-weight: 700; }
        tr:hover td { background: #fafafa; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .um-root > * { animation: fadeUp 0.35s ease both; }
      `}</style>

      <div className="um-root" style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 48 }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>User Directory</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "3px 0 0" }}>Manage system access and departmental roles</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={fetchData} disabled={loading} className="btn-outline">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button onClick={() => {
              setFormData({ id: "", full_name: "", email: "", password: "", role: "staff", department_id: "" });
              setOpen(true);
            }} className="btn-primary">
              <UserPlus size={15} />
              New User
            </button>
          </div>
        </div>

        {/* STATS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Total Users", val: stats.total, icon: Users, color: "#6366f1" },
            { label: "Admins", val: stats.admin, icon: Shield, color: "#f43f5e" },
            { label: "Dept Heads", val: stats.deptHead, icon: Building2, color: "#3b82f6" },
            { label: "Staff members", val: stats.staff, icon: Users, color: "#64748b" }
          ].map((s, i) => (
            <div key={i} className="um-card" style={{ padding: "16px 18px", animationDelay: `${i * 50}ms` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>{s.label}</p>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                  <s.icon size={15} />
                </div>
              </div>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* FILTERS CARD */}
        <div className="um-card" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative", minWidth: 200 }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input 
                className="um-input focus-gold" 
                style={{ paddingLeft: 36 }}
                placeholder="Search name or email..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <div style={{ width: 150 }}>
              <select className="um-input focus-gold" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: "8px 10px" }}>
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="department_head">Dept Head</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div style={{ width: 180 }}>
              <select className="um-input focus-gold" value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ padding: "8px 10px" }}>
                <option value="all">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Directory Listing <span style={{ color: "#94a3b8", fontWeight: 500, marginLeft: 6 }}>({filteredUsers.length})</span>
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["User Details", "System Role", "Department", ""].map((h, i) => (
                    <th key={i} style={{ padding: "10px 20px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ padding: 60, textAlign: "center" }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 10px", color: "#f5a82b" }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Fetching user data...</p>
                  </td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 60, textAlign: "center" }}>
                    <Users size={32} style={{ margin: "0 auto 10px", color: "#e2e8f0" }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>No matches found</p>
                  </td></tr>
                ) : (
                  filteredUsers.map((u) => {
                    const roleClass = u.role === "admin" ? "role-admin" : u.role === "department_head" ? "role-dept" : "role-staff";
                    const roleLabel = u.role === "admin" ? "Admin" : u.role === "department_head" ? "Dept Head" : "Staff";
                    return (
                      <tr key={u.id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.1s" }}>
                        <td style={{ padding: "12px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#64748b" }}>
                              {u.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>{u.full_name}</p>
                              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <span className={`${roleClass} badge-compact`}>{roleLabel}</span>
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Building2 size={13} color="#94a3b8" />
                            <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{u.dept_name || "—"}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 20px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button onClick={() => startEdit(u)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #f1f5f9", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }} title="Edit"><Edit size={13} /></button>
                            <button onClick={() => handleDelete(u.id, u.full_name)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #fff1f2", background: "#fff1f240", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#e11d48" }} title="Delete"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL (Create/Edit) */}
        {(open || editOpen) && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 440, boxShadow: "0 24px 64px rgba(0,0,0,0.15)", overflow: "hidden", animation: "fadeUp 0.25s ease" }}>
              <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>{editOpen ? "Modify Credentials" : "Provision New User"}</p>
                <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><X size={18} /></button>
              </div>
              <form onSubmit={(e) => handleSave(e, editOpen)} style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="um-label">Full Name *</label>
                  <input className="um-input focus-gold" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required />
                </div>
                <div>
                  <label className="um-label">Email Address *</label>
                  <input type="email" className="um-input focus-gold" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div>
                  <label className="um-label">{editOpen ? "New Secret (Optional)" : "Secret Key *"}</label>
                  <input type="password" className="um-input focus-gold" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!editOpen} placeholder={editOpen ? "Leave blank to keep current" : ""} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="um-label">Privilege Level *</label>
                    <select className="um-input focus-gold" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                      <option value="staff">Staff</option>
                      <option value="department_head">Dept Head</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="um-label">Department Node</label>
                    <select className="um-input focus-gold" value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })}>
                      <option value="">No Node</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
                  <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, height: 42, justifyContent: "center" }}>
                    {saving ? <Loader2 size={16} className="animate-spin" /> : editOpen ? "Commit Changes" : "Initialize User"}
                  </button>
                  <button type="button" onClick={closeModal} disabled={saving} style={{ flex: 1, padding: "10px 0", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, fontWeight: 700, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </UnifiedLayout>
  );
}