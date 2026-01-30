import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PieChart, ShieldCheck, Zap, BarChart3, ArrowRight } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
              <PieChart size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">FundMonitor</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login">
              <Button variant="ghost" className="font-medium hover:text-indigo-600 transition-colors">Sign In</Button>
            </Link>
            <Link to="/login">
              <Button className="bg-slate-900 hover:bg-slate-800 rounded-full px-6">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <motion.div 
          initial="initial" animate="animate" variants={stagger}
          className="max-w-5xl mx-auto px-6 text-center"
        >
          <motion.div variants={fadeIn} className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 text-sm font-medium text-indigo-600 mb-8">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Trusted by 50+ Colleges
          </motion.div>
          
          <motion.h1 variants={fadeIn} className="text-6xl md:text-7xl font-extrabold tracking-tight mb-8">
            Manage Campus Funds with <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Total Clarity.</span>
          </motion.h1>

          <motion.p variants={fadeIn} className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one platform for student organizations to track budgets, 
            request approvals, and generate audit-ready reports instantly.
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login">
              <Button className="h-14 px-10 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200/50 rounded-2xl group transition-all">
                Start Monitoring <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" className="h-14 px-10 text-lg rounded-2xl border-slate-200 hover:bg-slate-50">
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats / Proof Section */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Users", val: "12k+" },
              { label: "Funds Tracked", val: "₱4.2M" },
              { label: "Colleges", val: "85" },
              { label: "Requests/Day", val: "450+" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl font-bold text-slate-900">{stat.val}</div>
                <div className="text-sm text-slate-500 uppercase tracking-widest mt-1 font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Everything you need to stay audit-ready</h2>
          <p className="text-slate-500 text-lg">Powerful features built specifically for academic environments.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Smart Budgeting",
              desc: "Allocate funds by department or organization with automatic capping and alerts.",
              icon: <Zap className="text-indigo-600" />,
              color: "bg-indigo-50"
            },
            {
              title: "Fraud Prevention",
              desc: "Multi-level approval workflows for every single centavo spent by student orgs.",
              icon: <ShieldCheck className="text-emerald-600" />,
              color: "bg-emerald-50"
            },
            {
              title: "Visual Analytics",
              desc: "See where the money goes with beautiful, auto-generated charts and heatmaps.",
              icon: <BarChart3 className="text-amber-600" />,
              color: "bg-amber-50"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all h-full rounded-3xl p-4">
                <CardContent className="pt-6">
                  <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="px-6 pb-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-5xl mx-auto bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-300"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-20 -mb-20 blur-3xl" />
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">Ready to transform your college finances?</h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto relative z-10">
            Join the schools already using FundMonitor to eliminate paperwork and increase transparency.
          </p>
          <Link to="/login" className="relative z-10">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-50 h-14 px-12 text-lg rounded-2xl font-bold">
              Sign Up Your College
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-sm">© 2026 FundMonitor Systems Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}