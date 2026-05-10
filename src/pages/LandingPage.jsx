import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PieChart, ShieldCheck, Zap, BarChart3, ArrowRight } from "lucide-react";

const FEATURES = [
  { title: "Smart Budgeting", desc: "Allocate funds by department with automatic capping and real-time alerts.", icon: Zap, accent: "#f5a82b", bg: "rgba(245,168,43,0.1)" },
  { title: "Fraud Prevention", desc: "Multi-level approval workflows for every centavo spent across all departments.", icon: ShieldCheck, accent: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  { title: "Visual Analytics", desc: "See where money goes with auto-generated charts and fiscal heatmaps.", icon: BarChart3, accent: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
];

const STATS = [
  { label: "Active Users", val: "12k+" },
  { label: "Funds Tracked", val: "₱4.2M" },
  { label: "Colleges", val: "85" },
  { label: "Requests/Day", val: "450+" },
];



export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0c", color: "#f1f5f9", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: rgba(245,168,43,0.2); }
        .nav-link { color: #64748b; font-size: 14px; font-weight: 600; text-decoration: none; transition: color 0.15s; }
        .nav-link:hover { color: #f5a82b; }
        .btn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 10px 22px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit; text-decoration: none; display: inline-flex; align-items: center; }
        .btn-outline:hover { border-color: rgba(245,168,43,0.3); color: #f5a82b; }
        .btn-primary { background: #0f172a; border: 1px solid rgba(245,168,43,0.25); color: #fde68a; padding: 10px 22px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.15s; font-family: inherit; text-decoration: none; display: inline-flex; align-items: center; gap: 7px; }
        .btn-primary:hover { background: #1e293b; box-shadow: 0 4px 20px rgba(245,168,43,0.15); }
        .btn-hero { background: linear-gradient(135deg, #f5a82b, #d97706); color: #1a0e00; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 800; cursor: pointer; border: none; transition: all 0.2s; font-family: inherit; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 8px 32px rgba(245,168,43,0.3); }
        .btn-hero:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(245,168,43,0.4); }
        .feature-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; padding: 28px; transition: all 0.2s ease; }
        .feature-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(245,168,43,0.15); transform: translateY(-4px); }
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.8); opacity: 0; } }
        @keyframes grid-scroll { from { transform: translateY(0); } to { transform: translateY(40px); } }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,12,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg, #f5a82b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(245,168,43,0.3)", transform: "rotate(3deg)" }}>
              <PieChart size={19} color="#fff" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#fefce8", letterSpacing: "-0.02em" }}>
              Fund<span style={{ color: "#f5a82b" }}>Monitor</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#stats" className="nav-link">Stats</a>
            <Link to="/login" className="btn-outline">Sign in</Link>
            <Link to="/login" className="btn-primary">Get Started <ArrowRight size={14} /></Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "100px 24px 80px" }}>
        {/* Grid bg */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.04 }}>
          <svg width="100%" height="100%"><defs><pattern id="hero-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="#fff" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#hero-grid)" /></svg>
        </div>
        {/* Gold glow */}
        <div style={{ position: "absolute", top: "0%", left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(245,168,43,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,168,43,0.08)", border: "1px solid rgba(245,168,43,0.2)", borderRadius: 99, padding: "6px 16px", marginBottom: 32 }}>
            <span style={{ position: "relative", width: 8, height: 8 }}>
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#f5a82b", animation: "pulse-ring 1.5s infinite" }} />
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#f5a82b" }} />
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#f5a82b", letterSpacing: "0.06em" }}>Trusted by 50+ Colleges</span>
          </motion.div>


          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}
            style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 20, color: "#fefce8" }}>
            Manage Campus Funds<br />
            <span style={{ background: "linear-gradient(90deg, #f5a82b 0%, #fbbf24 50%, #f5a82b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200%" }}>
              with Total Clarity.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ fontSize: 17, color: "#475569", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.75 }}>
            The all-in-one platform to track budgets, request approvals, and generate audit-ready reports instantly.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Link to="/login" className="btn-hero">
              Start Monitoring <ArrowRight size={16} />
            </Link>
            <a href="#features" className="btn-outline" style={{ padding: "14px 28px", fontSize: 15 }}>
              See Features
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "48px 24px", background: "rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ textAlign: "center", padding: "20px 12px" }}>
              <p style={{ fontSize: 30, fontWeight: 900, color: "#f5a82b", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "-0.02em", marginBottom: 4 }}>{s.val}</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              style={{ fontSize: 11, fontWeight: 700, color: "#f5a82b", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 12 }}>
              Why FundMonitor
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontSize: 38, fontWeight: 900, color: "#fefce8", letterSpacing: "-0.02em", marginBottom: 14 }}>
              Everything you need to stay audit-ready
            </motion.h2>
            <p style={{ fontSize: 15, color: "#475569", maxWidth: 440, margin: "0 auto" }}>
              Powerful features built specifically for academic environments.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} className="feature-card"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: f.bg, border: `1px solid ${f.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <f.icon size={22} color={f.accent} strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#fefce8", marginBottom: 10, letterSpacing: "-0.01em" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "0 24px 96px" }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ maxWidth: 900, margin: "0 auto", background: "linear-gradient(135deg, #0f172a 0%, #1a1a2e 100%)", border: "1px solid rgba(245,168,43,0.2)", borderRadius: 28, padding: "64px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          {/* Gold glow corners */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(245,168,43,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(245,168,43,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />


          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#f5a82b", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 14 }}>Get Started Today</p>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: "#fefce8", letterSpacing: "-0.02em", marginBottom: 14 }}>
              Ready to transform your college finances?
            </h2>
            <p style={{ fontSize: 15, color: "#475569", maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.7 }}>
              Join schools already using FundMonitor to eliminate paperwork and increase transparency.
            </p>
            <Link to="/login" className="btn-hero" style={{ fontSize: 16, padding: "16px 40px" }}>
              Sign Up Your College <ArrowRight size={17} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "28px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #f5a82b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(3deg)" }}>
            <PieChart size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#475569" }}>Fund<span style={{ color: "#f5a82b" }}>Monitor</span></span>
        </div>
        <p style={{ fontSize: 12, color: "#1e293b", fontWeight: 500 }}>© 2026 FundMonitor Systems Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}