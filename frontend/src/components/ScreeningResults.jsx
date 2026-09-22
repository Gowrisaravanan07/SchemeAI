import React from 'react';
import { 
  CheckCircle2, Sparkles, AlertCircle, Building2, 
  ExternalLink, RotateCcw, Bot, BookOpen, Gift, FileText, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ScreeningResults({
  screeningData,
  userProfile,
  onReset,
  onOpenDetails,
  onAskAI
}) {
  const { language, t } = useLanguage();

  if (!screeningData) return null;

  const eligibleSchemes = screeningData.eligible_schemes || [];
  const totalBenefit = screeningData.total_benefits || 0;
  const formattedBenefit = screeningData.formatted_benefit || `₹${totalBenefit.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('resultsTitle')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'ta'
                ? `நீங்கள் ${eligibleSchemes.length} அரசு நலத்திட்டங்களுக்கு தகுதியுடையவர்`
                : `You qualify for ${eligibleSchemes.length} Government Welfare Schemes`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {userProfile?.occupation} ({userProfile?.state}) | {t('stepIncome')}: ₹{userProfile?.income?.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-center min-w-[240px] shadow-xl">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              {t('totalBenefitsMatched')}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 drop-shadow-md">
              {formattedBenefit}
            </div>
          </div>
        </div>

        {/* Banner Quick Actions */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
          <button
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetWizardBtn')}</span>
          </button>

          {onAskAI && (
            <button
              onClick={() => onAskAI(null)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition shadow-md"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{t('askAIBtn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Schemes Results Grid */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
          {language === 'ta' ? 'பரிந்துரைக்கப்பட்ட திட்டங்கள்' : 'Recommended Government Schemes'} ({eligibleSchemes.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {eligibleSchemes.map((scheme, idx) => {
            const title = language === 'ta' ? (scheme.name_ta || scheme.name) : (scheme.name_en || scheme.name);
            const ministry = language === 'ta' ? (scheme.ministry_ta || scheme.ministry) : (scheme.ministry_en || scheme.ministry);
            const benefits = language === 'ta' ? (scheme.benefits_ta || scheme.benefits) : (scheme.benefits_en || scheme.benefits);
            const portalUrl = scheme.official_portal_url || scheme.official_source || 'https://www.myscheme.gov.in';

            return (
              <div
                key={scheme.id || idx}
                className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-500/50 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden group text-left"
              >
                {/* Top Status Bar */}
                <div className="h-1.5 w-full bg-emerald-500" />

                <div className="p-6 flex flex-col flex-1 space-y-4">
                  {/* Category & State Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      {scheme.level || scheme.state}
                    </span>
                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {t('eligibleBadge')}
                    </span>
                  </div>

                  {/* Title & Ministry */}
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                      {title}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{ministry}</span>
                    </p>
                  </div>

                  {/* Financial Benefit Card */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-0.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      {t('schemeBenefits')}
                    </span>
                    <p className="text-sm font-black text-emerald-950">
                      {benefits}
                    </p>
                  </div>

                  {/* Overview snippet */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {language === 'ta' ? (scheme.overview_ta || scheme.description) : (scheme.overview_en || scheme.description)}
                  </p>

                  {/* Card Bottom Actions */}
                  <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      onClick={() => onOpenDetails(scheme)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('viewDetailsBtn')}</span>
                    </button>

                    <a
                      href={portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <span>{t('applyPortalBtn')}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
