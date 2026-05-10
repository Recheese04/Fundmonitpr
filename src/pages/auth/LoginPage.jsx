import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { PieChart, Mail, Key, Eye, EyeOff } from "lucide-react";
import API_URL from "@/apiConfig";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login_action.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data));
        setIsRedirecting(true);
        setTimeout(() => {
          if (data.role === "admin") navigate("/admin-dashboard");
          else if (data.role === "department_head") navigate("/dept-dashboard");
          else navigate("/staff-dashboard");
        }, 1200);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Server error. Make sure XAMPP is running and the URL is correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; }
        .login-root { font-family: 'Outfit', sans-serif; }
        input::placeholder { color: #94a3b8; font-weight: 500; }
        .input-field { transition: border-color 0.15s ease; }
        .input-field:focus { border-color: #f5a82b !important; outline: none; box-shadow: 0 0 0 3px rgba(245,168,43,0.1); }
        .btn-submit { transition: background 0.15s ease, transform 0.1s ease; }
        .btn-submit:not(:disabled):hover { background: #1e293b !important; }
        .btn-submit:not(:disabled):active { transform: scale(0.98); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes gridFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
      `}</style>

      <div className="login-root" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "#fff" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          background: "#0a0a0c",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          padding: "48px",
          overflow: "hidden",
        }}>
          {/* Grid texture */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Gold glow orbs */}
          <div style={{ position: "absolute", top: "20%", left: "30%", width: 320, height: 320, background: "radial-gradient(circle, rgba(245,168,43,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "-5%", width: 200, height: 200, background: "radial-gradient(circle, rgba(245,168,43,0.07) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

          {/* Logo */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, #f5a82b, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 24px rgba(245,168,43,0.3)",
              transform: "rotate(3deg)",
            }}>
              <PieChart size={22} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#fefce8", letterSpacing: "-0.02em", lineHeight: 1 }}>
                Fund<span style={{ color: "#f5a82b" }}>Monitor</span>
              </p>
              <p style={{ fontSize: 10, fontWeight: 600, color: "#374151", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>Enterprise</p>
            </div>
          </div>

          {/* Hero content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ position: "relative", zIndex: 1, marginTop: "auto", marginBottom: 32 }}
          >
            <h2 style={{
              fontSize: 44, fontWeight: 900, color: "#fefce8",
              lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 20,
            }}>
              Campus<br />
              <span style={{
                background: "linear-gradient(90deg, #f5a82b, #fbbf24)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Finance<br />Control.</span>
            </h2>
            <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, maxWidth: 340 }}>
              Streamlined budget approvals and real-time fund tracking for your campus.
            </p>

            {/* Floating stat cards */}
            <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
              {[
                { label: "Departments", value: "24+" },
                { label: "FY 2026", value: "Active" },
                { label: "Uptime", value: "99.9%" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12, padding: "12px 18px",
                  }}
                >
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{s.label}</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#f5a82b", fontFamily: "'IBM Plex Mono', monospace" }}>{s.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px", background: "#fff" }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: "100%", maxWidth: 380 }}
          >
            {/* Heading */}
            <div style={{ marginBottom: 36 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#f5a82b", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>Welcome back</p>
              <h1 style={{ fontSize: 34, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1 }}>Sign in</h1>
              <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>Enter your credentials to access the dashboard.</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: "11px 15px", background: "#fff1f2",
                  border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10,
                  display: "flex", alignItems: "center", gap: 9, marginBottom: 20,
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#e11d48", flexShrink: 0 }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: "#9f1239", margin: 0 }}>{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>
                  University Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    required type="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@test.com"
                    className="input-field"
                    style={{
                      width: "100%", padding: "13px 14px 13px 42px",
                      border: "1.5px solid #e2e8f0", borderRadius: 11,
                      fontSize: 14, fontWeight: 500, color: "#0f172a",
                      background: "#fafafa", fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Key size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    required type={showPassword ? "text" : "password"}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    style={{
                      width: "100%", padding: "13px 44px 13px 42px",
                      border: "1.5px solid #e2e8f0", borderRadius: 11,
                      fontSize: 14, fontWeight: 500, color: "#0f172a",
                      background: "#fafafa", fontFamily: "inherit",
                    }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, display: "flex" }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || isRedirecting}
                className="btn-submit"
                style={{
                  marginTop: 6, padding: "14px 0",
                  background: loading || isRedirecting ? "#f1f5f9" : "#0f172a",
                  color: loading || isRedirecting ? "#94a3b8" : "#fde68a",
                  border: loading || isRedirecting ? "1px solid #e2e8f0" : "1px solid rgba(245,168,43,0.2)",
                  borderRadius: 11, fontSize: 14, fontWeight: 700,
                  cursor: loading || isRedirecting ? "not-allowed" : "pointer",
                  width: "100%", fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 14, height: 14, border: "2px solid rgba(148,163,184,0.3)", borderTopColor: "#94a3b8", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Authenticating…
                  </>
                ) : "Sign in to Dashboard"}
              </button>
            </form>

            {/* Footer */}
            <p style={{ fontSize: 11, color: "#cbd5e1", textAlign: "center", marginTop: 28, fontWeight: 500 }}>
              BISU — Candijay Campus · FY 2026
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── REDIRECT OVERLAY ── */}
      {isRedirecting && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: "#0f172a", border: "1px solid rgba(245,168,43,0.2)",
              borderRadius: 20, padding: "32px 40px",
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 12, textAlign: "center", minWidth: 240,
            }}
          >
            <div style={{ width: 40, height: 40, border: "3px solid rgba(245,168,43,0.15)", borderTopColor: "#f5a82b", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#f5a82b", letterSpacing: "-0.01em", margin: "0 0 4px" }}>Syncing portal</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>Redirecting to dashboard</p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}