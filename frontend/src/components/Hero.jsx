import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bot, Sparkles, ShieldCheck, CheckCircle2, 
  ArrowRight, Search, BarChart3, Database, Zap, Cpu
} from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[92vh] pt-36 pb-20 overflow-hidden bg-slate-950 flex items-center">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[160px]"></div>
        <div className="absolute top-[40%] right-[35%] w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
        {/* Left Side: Pitch */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-xs font-semibold tracking-wide shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Multi-Agent Government Scheme Eligibility Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            Discover, Verify & Apply for <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">Government Schemes</span> with AI.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl"
          >
            <strong>SchemeWise AI</strong> uses stateful LangGraph agents, official RAG knowledge bases, zero-hallucination eligibility rules, and n8n workflow automation to give citizens instant, verifiable scheme recommendations.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-2"
          >
            <Link
              to="/agent"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm py-3.5 px-7 rounded-xl flex items-center space-x-2.5 transition shadow-xl shadow-blue-600/30 group"
            >
              <Bot className="w-5 h-5" />
              <span>Launch Multi-Agent Assistant</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/evaluation"
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm py-3.5 px-6 rounded-xl flex items-center space-x-2 transition"
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>AI Evaluation Suite</span>
            </Link>

            <Link
              to="/schemes"
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-sm py-3.5 px-6 rounded-xl flex items-center space-x-2 transition"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Browse 25+ Schemes</span>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero-Hallucination Rule Engine</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Official .gov.in Citations</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Human-in-the-Loop Approval</span>
            </div>
          </div>
        </div>

        {/* Right Side: Architecture & Agent Pipeline Preview */}
        <div className="lg:col-span-5">
          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-sm text-white">LangGraph Multi-Agent Architecture</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-700/50 rounded-full">
                Active Node Graph
              </span>
            </div>

            {/* Step Pipeline Cards */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                  <span className="font-semibold text-slate-200">Intent / Router Agent</span>
                </div>
                <span className="text-[11px] text-blue-400 font-mono">Entity Extraction</span>
              </div>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
                  <span className="font-semibold text-slate-200">Scheme Search & RAG Vector Layer</span>
                </div>
                <span className="text-[11px] text-indigo-400 font-mono">Hybrid Retrieval</span>
              </div>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">3</span>
                  <span className="font-semibold text-slate-200">Strict Eligibility Engine</span>
                </div>
                <span className="text-[11px] text-purple-400 font-mono">Zero Hallucination</span>
              </div>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">4</span>
                  <span className="font-semibold text-slate-200">Document Agent & OCR Checklist</span>
                </div>
                <span className="text-[11px] text-teal-400 font-mono">Missing Doc Audit</span>
              </div>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">5</span>
                  <span className="font-semibold text-slate-200">Verification & Human Confirmation</span>
                </div>
                <span className="text-[11px] text-amber-400 font-mono">Guardrails</span>
              </div>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">6</span>
                  <span className="font-semibold text-slate-200">n8n Automation Dispatch</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">Webhooks & SMS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
