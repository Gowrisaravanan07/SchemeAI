import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Bot, BookOpen, MapPin, Heart, Wrench, FileSearch, GitCompare, Globe, ExternalLink, ChevronRight, Shield, Zap, Users } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const CATEGORY_CONFIG = [
  { key: "Education", icon: "🎓", color: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/20", cat: "Education" },
  { key: "Agriculture", icon: "🌾", color: "from-emerald-500 to-green-400", shadow: "shadow-emerald-500/20", cat: "Agriculture" },
  { key: "Women", icon: "👩", color: "from-pink-500 to-rose-500", shadow: "shadow-pink-500/20", cat: "Women Empowerment" },
  { key: "Healthcare", icon: "🏥", color: "from-red-500 to-orange-500", shadow: "shadow-red-500/20", cat: "Healthcare" },
  { key: "Business", icon: "💼", color: "from-amber-500 to-yellow-400", shadow: "shadow-amber-500/20", cat: "Business & Entrepreneurship" },
  { key: "Housing", icon: "🏠", color: "from-purple-500 to-indigo-500", shadow: "shadow-purple-500/20", cat: "Housing" },
  { key: "Artisans", icon: "🎨", color: "from-teal-500 to-cyan-500", shadow: "shadow-teal-500/20", cat: "Artisans & Craftsmen" },
  { key: "Pension", icon: "👴", color: "from-slate-400 to-zinc-400", shadow: "shadow-slate-400/20", cat: "Pension & Social Security" },
  { key: "Youth", icon: "⚡", color: "from-violet-500 to-purple-500", shadow: "shadow-violet-500/20", cat: "Youth & Employment" },
];

const FEATURES = [
  { icon: BookOpen, color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)", key: "feat1", view: "all_schemes" },
  { icon: Sparkles, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", key: "feat2", view: "wizard" },
  { icon: FileSearch, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)", key: "feat3", view: "doc_analyzer" },
  { icon: MapPin, color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)", key: "feat4", view: "map" },
  { icon: Heart, color: "#f43f5e", bg: "rgba(244,63,94,0.1)", border: "rgba(244,63,94,0.2)", key: "feat5", view: "wishlist" },
  { icon: Wrench, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", key: "feat6", view: "tools" },
  { icon: Globe, color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.2)", key: "feat7", view: null },
  { icon: ExternalLink, color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.2)", key: "feat8", view: "all_schemes" },
];

const STATS = [
  { label: "statsSchemes", value: "25+", color: "#10b981" },
  { label: "statsAssistance", value: "₹10K Cr+", color: "#f97316" },
  { label: "statsCentralState", value: "2 Levels", color: "#3b82f6" },
  { label: "statsZeroHallucination", value: "100%", color: "#a855f7" },
];

const QUICK_PROMPTS = [
  "PM Kisan — Farmer support ₹6,000/year",
  "Pudhumai Penn — TN Girls scholarship ₹1,000/month",
  "PMJAY — Free healthcare ₹5L/year",
  "Startup India — ₹25L zero interest loan",
];

export default function HomeView({ setActiveView }) {
  const { language, t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div className="space-y-0 bg-white dark:bg-myscheme-dark min-h-screen">
      {/* ─── HERO SECTION ─── */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden px-4 text-center border-b border-gray-100 dark:border-gray-800">
        
        <div className={`max-w-5xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          
          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-6">
            <span className="text-myscheme-green">{language === "en" ? "Find Government" : language === "ta" ? "அரசு திட்டங்களை" : "सरकारी योजनाएं"}</span>
            <br />
            <span>{language === "en" ? "Schemes You Qualify For" : language === "ta" ? "எளிதாக கண்டறியுங்கள்" : "आसानी से खोजें"}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
            {t("heroSubtitle") || "Discover, evaluate, and apply for government schemes seamlessly using AI-powered assistance."}
          </p>

          {/* AI Search Bar */}
          <div className="max-w-3xl mx-auto mb-10 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center">
             <div className="pl-4 pr-2 text-gray-400">
               <Sparkles className="w-6 h-6 text-myscheme-green" />
             </div>
             <input 
               type="text" 
               placeholder="Describe yourself (e.g., I am a 25 year old student from Tamil Nadu)"
               className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-gray-700 dark:text-gray-200"
               onKeyDown={(e) => {
                 if(e.key === 'Enter') setActiveView("chat");
               }}
             />
             <button 
               onClick={() => setActiveView("chat")}
               className="bg-myscheme-green hover:bg-myscheme-primaryHover text-white px-8 py-3 rounded-full font-bold transition-colors"
             >
               Find Schemes
             </button>
          </div>

          {/* Quick Scheme Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <span className="text-sm font-medium text-gray-500 mt-1">Trending:</span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button key={idx} onClick={() => setActiveView("chat")}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 dark:bg-gray-800 text-myscheme-green dark:text-green-400 hover:bg-green-100 text-sm transition font-medium border border-green-200 dark:border-gray-700">
                {prompt}
              </button>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-gray-100 dark:border-gray-800 pt-10">
            {STATS.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-black mb-1 text-gray-800 dark:text-gray-100">{stat.value}</div>
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">{t(stat.label)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section className="bg-gray-50 dark:bg-myscheme-dark py-24 px-4 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
              Everything You Need in One Place
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-xl mx-auto">myScheme AI brings all government scheme discovery tools together in a single, multilingual platform.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => feat.view && setActiveView(feat.view)}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${feat.view ? "cursor-pointer hover:shadow-md hover:border-myscheme-green" : ""} transition-all`}
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-green-50 dark:bg-gray-700">
                    <Icon className="w-6 h-6 text-myscheme-green" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{t(`${feat.key}Title`)}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t(`${feat.key}Desc`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CATEGORY SECTION ─── */}
      <section className="py-24 px-4 bg-white dark:bg-myscheme-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">{t("categoriesTitle")}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-xl mx-auto">Find schemes tailored for your specific needs and life situation.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
            {CATEGORY_CONFIG.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveView("all_schemes")}
                className="group bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700 hover:border-myscheme-green hover:shadow-md transition-all"
              >
                <div className={`w-16 h-16 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm border border-gray-100 dark:border-gray-600`}>
                  {cat.icon}
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-myscheme-green transition">
                  {t(`cat${cat.key}`)}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI CHAT TEASER ─── */}
      <section className="py-20 px-4 bg-myscheme-green text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6 font-semibold">
              <Bot className="w-5 h-5" /> AI Assistant
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">{t("chatTitle")}</h2>
            <p className="text-green-50 max-w-2xl mx-auto text-lg">{t("chatSubtitle")}</p>
          </div>
          <div className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row shadow-2xl max-w-2xl mx-auto">
             <div className="flex-1 flex items-center gap-3 px-4 py-3 text-gray-500">
               <Bot className="w-5 h-5 text-myscheme-green shrink-0" />
               <span className="truncate">{t("chatPlaceholder")}</span>
             </div>
             <button onClick={() => setActiveView("chat")}
               className="bg-gray-900 hover:bg-black text-white flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-colors">
               <Sparkles className="w-4 h-4" />{t("chatSend")}
             </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER/TRUST SECTION ─── */}
      <section className="py-12 px-4 bg-gray-900 text-gray-400 text-sm">
        <div className="max-w-6xl mx-auto text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
               <span className="text-white font-bold text-lg">myScheme AI</span>
            </div>
            <p className="mb-6 max-w-2xl mx-auto">
              © 2024 myScheme AI — AI-powered scheme discovery for Indian citizens. Information is sourced from official government portals and databases. Always verify on official .gov.in portals before applying.
            </p>
            <div className="flex justify-center gap-6">
               <span className="flex items-center gap-2"><Shield className="w-4 h-4"/> Secure</span>
               <span className="flex items-center gap-2"><Globe className="w-4 h-4"/> Multilingual</span>
            </div>
        </div>
      </section>
    </div>
  );
}
