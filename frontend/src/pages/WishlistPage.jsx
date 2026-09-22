import React from "react";
import { Heart, GitCompare, Trash2, ExternalLink, BookOpen, X, Share2, Bot } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useWishlist } from "../context/WishlistContext";

export default function WishlistPage({ onOpenDetails, onAskAI, setActiveView }) {
  const { language, t } = useLanguage();
  const { wishlist, removeFromWishlist, compareList, toggleCompare, isInCompare, clearCompare } = useWishlist();

  const getName = (s) => language === "ta" ? (s.name_ta || s.name_en || s.name) : (s.name_en || s.name);
  const getBenefits = (s) => language === "ta" ? (s.benefits_ta || s.benefits_en || s.benefits) : (s.benefits_en || s.benefits);

  const handleShare = (scheme) => {
    const text = `Check out ${getName(scheme)} - ${scheme.official_portal_url || "https://myscheme.gov.in"}`;
    if (navigator.share) navigator.share({ title: getName(scheme), text });
    else navigator.clipboard.writeText(text).then(() => alert("Link copied!"));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="badge-red mb-2 inline-flex"><Heart className="w-3.5 h-3.5 fill-rose-400" /> {t("navWishlist")}</div>
            <h1 className="text-2xl font-black text-white">{t("wishlistTitle")}</h1>
            <p className="text-slate-400 text-sm mt-1">{wishlist.length} {language === "hi" ? "योजनाएं सेव" : language === "ta" ? "திட்டங்கள் சேமிக்கப்பட்டன" : "schemes saved"}</p>
          </div>
          {compareList.length >= 2 && (
            <button onClick={() => setActiveView("compare")} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm rounded-xl">
              <GitCompare className="w-4 h-4" />{t("compareSelected")} ({compareList.length})
            </button>
          )}
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="glass-card rounded-2xl p-20 text-center animate-fade-in">
          <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-black text-white mb-2">{t("wishlistTitle")}</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">{t("wishlistEmpty")}</p>
          <button onClick={() => setActiveView("all_schemes")} className="mt-6 btn-primary px-6 py-3 text-sm flex items-center gap-2 mx-auto rounded-xl">
            <BookOpen className="w-4 h-4" />{t("browseAllBtn")}
          </button>
        </div>
      ) : (
        <div>
          {compareList.length > 0 && (
            <div className="glass-card rounded-xl p-3 border border-blue-500/30 flex items-center justify-between gap-3 mb-5 animate-fade-in">
              <div className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <GitCompare className="w-4 h-4" /> {compareList.length}/3 {language === "hi" ? "तुलना के लिए चुना" : "selected for compare"}
              </div>
              <div className="flex gap-2">
                {compareList.length >= 2 && <button onClick={() => setActiveView("compare")} className="btn-primary text-xs py-1.5 px-4 rounded-xl">{t("compareSelected")}</button>}
                <button onClick={clearCompare} className="btn-ghost text-xs py-1.5 px-3 rounded-xl"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {wishlist.map((scheme, idx) => {
              const inCompare = isInCompare(scheme.id);
              const title = getName(scheme);
              const benefits = getBenefits(scheme);
              const portalUrl = scheme.official_portal_url || scheme.official_source || "https://www.myscheme.gov.in";
              return (
                <div key={scheme.id || idx} className="glass-card rounded-2xl overflow-hidden scheme-card-hover group">
                  <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500" />
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex gap-1.5 mb-1">
                          <span className="badge-emerald text-[10px]">{scheme.level || scheme.state}</span>
                          <span className="badge-blue text-[10px]">{scheme.category}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition line-clamp-2">{title}</h3>
                      </div>
                      <button onClick={() => removeFromWishlist(scheme.id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <p className="text-xs font-bold text-rose-300">{benefits}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleCompare(scheme)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${inCompare ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                        <GitCompare className="w-3.5 h-3.5" />{inCompare ? "Comparing" : t("addCompare")}
                      </button>
                      <button onClick={() => onAskAI(scheme)} className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition">
                        <Bot className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleShare(scheme)} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <a href={portalUrl} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
