import React, { useState } from "react";
import StaffLayout from "@/components/layout/StaffLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Paperclip, Info } from "lucide-react";

export default function StaffRequest() {
  return (
    <StaffLayout title="Submit New Request">
      <div className="max-w-2xl mx-auto">
        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <div className="bg-slate-900 p-6 text-white">
            <h3 className="text-lg font-black uppercase tracking-tight">Request Details</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ensure all fields are accurate for faster approval</p>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Request Item/Title</Label>
                <Input placeholder="e.g. Software Subscription" className="h-12 border-2 rounded-xl focus:border-indigo-600 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estimated Amount (₱)</Label>
                <Input type="number" placeholder="0.00" className="h-12 border-2 rounded-xl focus:border-indigo-600 font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Justification / Remarks</Label>
              <Textarea 
                placeholder="Explain why this fund is necessary..." 
                className="min-h-[120px] border-2 rounded-xl focus:border-indigo-600 font-medium p-4"
              />
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-3">
              <Info className="text-indigo-600 shrink-0" size={20} />
              <p className="text-[11px] text-indigo-700 font-bold leading-relaxed uppercase">
                Note: Requests above ₱50,000 require additional documentation and may take 3-5 business days for Dept. Head review.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest border-2">
                <Paperclip size={18} className="mr-2" /> Attach File
              </Button>
              <Button className="flex-[2] h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black uppercase tracking-widest text-lg shadow-lg shadow-indigo-200">
                <Send size={18} className="mr-2" /> Submit Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}