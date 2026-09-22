import React from "react";
import { GitCompare, X, ExternalLink, CheckCircle2, XCircle, Minus } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useWishlist } from "../context/WishlistContext";
import { ALL_INDIA_SCHEMES } from "../data/all_india_schemes";

const ROWS = [
  { label: "Scheme Name", key: "name" },
  { label: "Ministry / Dept", key: "ministry" },
  { label: "Level", key: "level" },
  { label: "Category", key: "category" },
  { label: "Benefits", key: "benefits" },
  { label: "Max Benefit", key: "max_benefit" },
  { label: "Target Group", key: "target_group" },
  { label: "Application Mode", key: "application_mode" },
  { label: "Helpline", key: "helpline" },
  { label: "Official Portal", key: "official_portal_url" },
];

export default function CompareSchemesPage({ onOpenDetails }) {
  const { language, t } = useLanguage();
  const { compareList, removeFromCompare, clearCompare } = useWishlist();

  const getName = (s) => language === "ta" ? (s.name_ta || s.name_en || s.name) : (s.name_en || s.name);
  const getMinistry = (s) => language === "ta" ? (s.ministry_ta || s.ministry_en || s.ministry) : (s.ministry_en || s.ministry);
  const getBenefits = (s) => language === "ta" ? (s.benefits_ta || s.benefits_en || s.benefits) : (s.benefits_en || s.benefits);

  const getCell = (scheme, key) => {
    if (key === "name") return getName(scheme);
    if (key === "ministry") return getMinistry(scheme);
    if (key === "benefits") return getBenefits(scheme);
    return scheme[key] || "—";
  };

  const GRAD_COLORS = [
    "from-emerald-500 to-blue-500",
    "from-purple-500 to-pink-500",
    "from-amber-500 to-orange-500",
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="badge-blue mb-2 inline-flex"><GitCompare className="w-3.5 h-3.5" /> {t("compareTitle")}</div>
            <h1 className="text-2xl font-black text-white">{t("compareTitle")}</h1>
            <p className="text-slate-400 text-sm mt-1">{t("compareSubtitle")}</p>
          </div>
          {compareList.length > 0 && (
            <button onClick={clearCompare} className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-xl text-sm">
              <X className="w-4 h-4" />{language === "hi" ? "क्लियर" : language === "ta" ? "நீக்கு" : "Clear All"}
            </button>
          )}
        </div>
      </div>

      {compareList.length === 0 ? (
        <div className="glass-card rounded-2xl p-20 text-center animate-fade-in">
          <GitCompare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-black text-white mb-2">{t("compareTitle")}</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">{t("compareSubtitle")}</p>
        </div>
      ) : (
        <div className="animate-fade-in overflow-x-auto">
          {/* Scheme Header Cards */}
          <div className="flex gap-4 mb-4 min-w-max lg:min-w-0">
            <div className="w-48 shrink-0" />
            {compareList.map((scheme, idx) => (
              <div key={scheme.id || idx} className="flex-1 min-w-56 glass-card rounded-2xl overflow-hidden">
                <div className={`h-1.5 w-full bg-gradient-to-r ${GRAD_COLORS[idx]}`} />
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="badge-emerald text-[10px]">{scheme.level || scheme.state}</span>
                      <h3 className="text-sm font-black text-white mt-1 leading-tight">{getName(scheme)}</h3>
                    </div>
                    <button onClick={() => removeFromCompare(scheme.id)} className="p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs font-bold text-emerald-400">{getBenefits(scheme)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onOpenDetails(scheme)} className="flex-1 py-1.5 rounded-lg bg-white/5 text-slate-300 text-xs font-bold hover:bg-white/10 transition">
                      Details
                    </button>
                    <a href={scheme.official_portal_url || scheme.official_source || "https://myscheme.gov.in"} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full compare-table">
              <thead>
                <tr>
                  <th className="w-48">Feature</th>
                  {compareList.map((s, i) => <th key={i}>{getName(s)}</th>)}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.key}>
                    <td className="font-bold text-slate-300 text-xs">{row.label}</td>
                    {compareList.map((scheme, si) => {
                      const val = getCell(scheme, row.key);
                      if (row.key === "official_portal_url") {
                        return <td key={si}>
                          <a href={val !== "—" ? val : "#"} target="_blank" rel="noopener noreferrer" className="text-emerald-400 text-xs hover:underline flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Apply
                          </a>
                        </td>;
                      }
                      return <td key={si} className="text-slate-300 text-xs">{val}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
