import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calculator, CheckCircle } from "lucide-react";

const AdminAllocation = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAutoAllocate = async () => {
    setLoading(true);
    const response = await fetch("http://localhost/fundmonitor/api/allocate.php", {
      method: "POST",
      body: JSON.stringify({ total_fund: amount, year: 2024 }),
    });
    const result = await response.json();
    alert(result.message);
    setLoading(false);
  };

  return (
    <div className="p-6">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" /> 
            Automated Budget Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Total Annual Fund</label>
            <Input 
              type="number" 
              placeholder="Enter total amount (e.g. 100000)" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleAutoAllocate}
            disabled={loading || !amount}
          >
            {loading ? "Allocating..." : "Run Auto-Allocation"}
          </Button>
          
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border text-xs text-slate-500">
            <strong>Rules:</strong> IT (40%), Finance (30%), HR (30%)
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAllocation;