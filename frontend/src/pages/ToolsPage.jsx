import React, { useState, useMemo } from "react";
import { Calculator, TrendingUp, CheckCircle2, Circle, Download, FileText, ChevronRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const COMMON_DOCS = ["Aadhaar Card","Ration Card","Income Certificate","Caste Certificate","Bank Passbook","Passport Size Photo","Mobile Number (Linked to Aadhaar)","Residence Proof"];
const SCHEME_DOCS = {
  "Education": ["School/College ID","Previous Marksheets","Bonafide Certificate","Gap Certificate (if any)"],
  "Agriculture": ["Land Records (Patta)","Farmer ID / Kisan Card","Soil Health Card","Bank Account Details"],
  "Women Empowerment": ["Marriage Certificate (if applicable)","Self-Help Group ID (if any)","Birth Certificate"],
  "Healthcare": ["PMJAY / Ayushman Card","Hospital Referral Letter","Discharge Summary"],
  "Business & Entrepreneurship": ["Business Registration / UDYAM","GST Certificate","Project Report","CA Balance Sheet"],
  "Housing": ["Site Plan / Land Documents","NOC from Panchayat / ULB","Construction Estimate"],
};

export default function ToolsPage() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("emi");
  const [loan, setLoan] = useState(500000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(60);
  const [checkedDocs, setCheckedDocs] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("Education");
  const [income, setIncome] = useState(200000);
  const [savings, setSavings] = useState(50000);
  const [hasLand, setHasLand] = useState(false);
  const [hasBankAcc, setHasBankAcc] = useState(true);

  const emi = useMemo(() => {
    const r = rate / (12 * 100);
    if (r === 0) return loan / tenure;
    return (loan * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
  }, [loan, rate, tenure]);

  const totalPayment = emi * tenure;
  const totalInterest = totalPayment - loan;

  const schemeDocList = [...COMMON_DOCS, ...(SCHEME_DOCS[selectedCategory] || [])];
  const toggleDoc = (doc) => setCheckedDocs(prev => ({ ...prev, [doc]: !prev[doc] }));
  const checkedCount = Object.values(checkedDocs).filter(Boolean).length;

  const readinessScore = useMemo(() => {
    let score = 0;
    if (income < 250000) score += 30;
    else if (income < 600000) score += 20;
    else score += 10;
    if (savings >= 20000) score += 20;
    if (hasBankAcc) score += 25;
    if (hasLand) score += 15;
    score += Math.min(10, checkedCount);
    return Math.min(100, score);
  }, [income, savings, hasBankAcc, hasLand, checkedCount]);

  const tabs = [
    { id: "emi", label: t("emiCalcTitle"), icon: Calculator },
    { id: "readiness", label: t("finReadinessTitle"), icon: TrendingUp },
    { id: "checklist", label: t("docChecklistTitle"), icon: FileText },
  ];

  const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-2xl p-6">
        <div className="badge-saffron mb-2 inline-flex"><Calculator className="w-3.5 h-3.5" /> {t("toolsTitle")}</div>
        <h1 className="text-2xl font-black text-white">{t("toolsTitle")}</h1>
        <div className="flex gap-3 mt-4 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${activeTab === tab.id ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                <Icon className="w-4 h-4" />{tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "emi" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-black text-white">{t("emiCalcTitle")}</h2>
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="text-slate-400">{t("loanAmount")}</span><span className="text-emerald-400 font-bold">{fmt(loan)}</span></div>
              <input type="range" min={10000} max={10000000} step={10000} value={loan} onChange={e => setLoan(+e.target.value)} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="text-slate-400">{t("interestRate")}</span><span className="text-amber-400 font-bold">{rate}%</span></div>
              <input type="range" min={1} max={30} step={0.1} value={rate} onChange={e => setRate(+e.target.value)} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="text-slate-400">{t("loanTenure")}</span><span className="text-blue-400 font-bold">{tenure} mo</span></div>
              <input type="range" min={6} max={360} step={6} value={tenure} onChange={e => setTenure(+e.target.value)} className="w-full" />
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-black text-white">Result</h2>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 text-center">
              <p className="text-slate-400 text-sm">{t("monthlyEMI")}</p>
              <p className="text-4xl font-black gradient-text-emerald mt-1">{fmt(emi)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-slate-400 text-xs">{t("totalInterest")}</p>
                <p className="text-rose-400 font-black text-lg mt-0.5">{fmt(totalInterest)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-slate-400 text-xs">{t("totalPayment")}</p>
                <p className="text-amber-400 font-black text-lg mt-0.5">{fmt(totalPayment)}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">Interest ratio</span>
                <span className="text-blue-400 font-bold">{((totalInterest / totalPayment) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full" style={{ width: `${((loan / totalPayment) * 100).toFixed(1)}%` }} />
              </div>
              <div className="flex justify-between text-[10px] mt-1">
                <span className="text-emerald-400">Principal {((loan / totalPayment) * 100).toFixed(0)}%</span>
                <span className="text-rose-400">Interest {((totalInterest / totalPayment) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "readiness" && (
        <div className="glass-card rounded-2xl p-6 space-y-6 animate-fade-in">
          <h2 className="text-lg font-black text-white">{t("finReadinessTitle")}</h2>
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="url(#g1)" strokeWidth="3" strokeDasharray={`${readinessScore} ${100 - readinessScore}`} strokeDashoffset="0" strokeLinecap="round" />
                <defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black gradient-text-emerald">{readinessScore}</span>
                <span className="text-xs text-slate-400 font-bold">/ 100</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div><label className="text-xs text-slate-400 mb-1 block">Annual Family Income</label><input type="number" value={income} onChange={e=>setIncome(+e.target.value)} className="glass-input w-full px-4 py-2 rounded-xl text-sm" /></div>
            <div><label className="text-xs text-slate-400 mb-1 block">Monthly Savings</label><input type="number" value={savings} onChange={e=>setSavings(+e.target.value)} className="glass-input w-full px-4 py-2 rounded-xl text-sm" /></div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer"><input type="checkbox" checked={hasBankAcc} onChange={e=>setHasBankAcc(e.target.checked)} className="accent-emerald-500 w-4 h-4" /> Bank Account</label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer"><input type="checkbox" checked={hasLand} onChange={e=>setHasLand(e.target.checked)} className="accent-emerald-500 w-4 h-4" /> Land/Property</label>
            </div>
          </div>
          <div className={`p-4 rounded-xl border ${readinessScore >= 70 ? "bg-emerald-500/10 border-emerald-500/30" : readinessScore >= 40 ? "bg-amber-500/10 border-amber-500/30" : "bg-rose-500/10 border-rose-500/30"}`}>
            <p className={`text-sm font-bold ${readinessScore >= 70 ? "text-emerald-400" : readinessScore >= 40 ? "text-amber-400" : "text-rose-400"}`}>
              {readinessScore >= 70 ? "✅ High Readiness — You qualify for most government schemes" : readinessScore >= 40 ? "⚠️ Moderate — Complete your documents to improve eligibility" : "❌ Low — Focus on getting Aadhaar-linked bank account first"}
            </p>
          </div>
        </div>
      )}

      {activeTab === "checklist" && (
        <div className="glass-card rounded-2xl p-6 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">{t("docChecklistTitle")}</h2>
            <span className="badge-emerald">{checkedCount} / {schemeDocList.length} Ready</span>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Select Scheme Category</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(SCHEME_DOCS).map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${selectedCategory === cat ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-white/5 text-slate-400 border border-white/8 hover:border-white/20"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {schemeDocList.map((doc) => (
              <button key={doc} onClick={() => toggleDoc(doc)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${checkedDocs[doc] ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/3 border-white/5 hover:border-white/15"}`}>
                {checkedDocs[doc] ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <Circle className="w-5 h-5 text-slate-600 shrink-0" />}
                <span className={`text-sm ${checkedDocs[doc] ? "text-white font-bold" : "text-slate-400"}`}>{doc}</span>
              </button>
            ))}
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${(checkedCount / schemeDocList.length) * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
