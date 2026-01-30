import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { PieChart, ArrowLeft, Mail, Key, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // CORRECTED FETCH URL BELOW
      const response = await fetch("http://localhost/fundmonitor-api/login_action.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Handle cases where PHP might return an error status (like 404 or 500)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Store user session in localStorage
        localStorage.setItem("user", JSON.stringify(data));

        // Redirect based on the actual database role
        if (data.role === "admin") {
          navigate("/admin-dashboard");
        } else if (data.role === "department_head") {
          navigate("/dept-dashboard");
        } else {
          navigate("/staff-dashboard");
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Server error. Make sure XAMPP is running and the URL is correct.");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left Side: Branding */}
      <div className="relative hidden lg:flex flex-col bg-slate-900 p-12 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -mr-48 -mt-48" />
        <Link to="/" className="relative z-10 flex items-center gap-2 group w-fit">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <PieChart size={18} />
          </div>
          <span className="text-xl font-bold tracking-tighter">FundMonitor</span>
        </Link>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative z-10 mt-auto">
          <h2 className="text-4xl font-black leading-tight mb-6 uppercase">
            Campus <br /> <span className="text-indigo-400">Finance Control.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-md font-medium">
            Streamlined budget approvals and real-time fund tracking.
          </p>
        </motion.div>
      </div>

      {/* Right Side: Form */}
      <div className="flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px] space-y-8">
          <div className="space-y-2">
            <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-4 font-black uppercase tracking-widest">
              <ArrowLeft size={16} className="mr-2" /> Back
            </Link>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 uppercase leading-none">Sign In</h1>
            {error && (
              <motion.p 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-500 font-bold bg-red-50 p-3 rounded-lg text-sm border border-red-100"
              >
                {error}
              </motion.p>
            )}
          </div>

          <form onSubmit={handleLogin} className="grid gap-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label className="text-slate-950 font-black uppercase text-[10px] tracking-[0.2em]">University Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    required 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="admin@test.com" 
                    className="h-14 pl-12 border-slate-200 bg-slate-50 rounded-2xl border-2 transition-all focus:border-indigo-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-slate-950 font-black uppercase text-[10px] tracking-[0.2em]">Password</Label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 pr-12 border-slate-200 bg-slate-50 rounded-2xl border-2 transition-all focus:border-indigo-600 font-bold"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="h-14 bg-slate-950 hover:bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl uppercase mt-2 transition-all active:scale-95">
                Sign In to Dashboard
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}