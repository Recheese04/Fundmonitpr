import React from "react";
import StaffLayout from "@/components/layout/StaffLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StaffSettings() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <StaffLayout title="Account Settings">
      <div className="max-w-xl bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-50">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black">
            {user.name?.charAt(0) || "S"}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{user.name || "Staff Member"}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</Label>
            <Input defaultValue={user.email} disabled className="bg-slate-50 h-12 rounded-xl font-bold border-2" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">New Password</Label>
            <Input type="password" placeholder="••••••••" className="h-12 rounded-xl border-2 focus:border-indigo-600 font-bold" />
          </div>
          <Button className="w-full h-14 bg-slate-900 hover:bg-indigo-600 rounded-2xl font-black uppercase tracking-widest text-sm transition-all">
            Update Profile
          </Button>
        </div>
      </div>
    </StaffLayout>
  );
}