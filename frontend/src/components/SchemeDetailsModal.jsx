import React, { useState } from 'react';
import { 
  X, AlertTriangle, BookOpen, Gift, CheckCircle, 
  FileText, ListOrdered, Phone, ExternalLink, Bot, Check, Building2, Send, Loader2, MessageSquare
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { confirmApplication } from '../services/api';

export default function SchemeDetailsModal({ scheme, onClose, onAskAI }) {
  const { language, t } = useLanguage();
  const [checkedDocs, setCheckedDocs] = useState({});
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!scheme) return null;

  const title = language === 'ta' ? (scheme.name_ta || scheme.short_title_ta || scheme.name) : (scheme.name_en || scheme.short_title_en || scheme.name);
  const ministry = language === 'ta' ? (scheme.ministry_ta || scheme.ministry) : (scheme.ministry_en || scheme.ministry);
  const overview = language === 'ta' ? (scheme.overview_ta || scheme.description) : (scheme.overview_en || scheme.description);
  const benefits = language === 'ta' ? (scheme.benefits_ta || scheme.benefits) : (scheme.benefits_en || scheme.benefits);
  const eligibilityList = language === 'ta' ? (scheme.eligibility_conditions_ta || scheme.eligibility_conditions_en || []) : (scheme.eligibility_conditions_en || []);
  const docsList = language === 'ta' ? (scheme.documents_ta || scheme.documents_en || scheme.required_documents || []) : (scheme.documents_en || scheme.required_documents || []);
  const stepsList = language === 'ta' ? (scheme.steps_ta || scheme.steps_en || scheme.application_procedure || []) : (scheme.steps_en || scheme.application_procedure || []);
  const portalUrl = scheme.official_portal_url || scheme.official_source || 'https://www.myscheme.gov.in';

  const toggleDoc = (idx) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const checkedCount = Object.values(checkedDocs).filter(Boolean).length;

  const handleSendAlert = async (e) => {
    e?.preventDefault();
    if (!phoneNumber.trim()) return;
    setIsSendingAlert(true);
    try {
      await confirmApplication({
        user_id: 'demo-user-123',
        scheme_id: scheme.id,
        user_profile: { name: 'Citizen Applicant', phone: phoneNumber },
        user_phone: phoneNumber,
        document_checklist: {
          total_required: docsList.length,
          provided_count: checkedCount,
          missing_count: docsList.length - checkedCount,
          missing_documents: docsList.map(d => ({ document_name: d }))
        }
      });
      
      const cleanDigits = phoneNumber.replace(/[^0-9]/g, '');
      const docFormatted = docsList.map((d, i) => `${i+1}. ${d}`).join('\n');
      const waText = encodeURIComponent(
`🏛️ *SchemeWise AI — Government Scheme Checklist*

📋 *Scheme:* ${title}
💰 *Benefit:* ${benefits}
🏢 *Ministry:* ${ministry}

📄 *Required Documents (${checkedCount}/${docsList.length} Ready):*
${docFormatted}

🔗 *Apply on Official Portal:*
${portalUrl}

📌 _Dispatched via SchemeWise AI Citizen Portal_`
      );

      const targetWaUrl = cleanDigits 
        ? `https://wa.me/${cleanDigits.length === 10 ? '91' + cleanDigits : cleanDigits}?text=${waText}`
        : `https://wa.me/?text=${waText}`;

      window.open(targetWaUrl, '_blank');

      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setShowPhoneInput(false);
      }, 5000);
    } catch (err) {
      alert('Could not dispatch SMS/WhatsApp: ' + err.message);
    } finally {
      setIsSendingAlert(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0 bg-slate-50/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {scheme.level || scheme.state || 'Government Scheme'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200/80 text-slate-700">
                {language === 'ta' ? (scheme.category_ta || scheme.category) : scheme.category}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              {title}
            </h2>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{ministry}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-left">
          {/* WhatsApp / SMS Quick Dispatch Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-950">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ta' ? 'ஆவணப் பட்டியலை வாட்ஸ்அப் / எஸ்எம்எஸ்-ல் பெறுக' : 'Get Required Documents Checklist via WhatsApp / SMS'}</span>
              </div>
              {!showPhoneInput && !sentSuccess && (
                <button
                  onClick={() => setShowPhoneInput(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                >
                  {t('sendToPhoneBtn')}
                </button>
              )}
            </div>

            {showPhoneInput && !sentSuccess && (
              <form onSubmit={handleSendAlert} className="flex items-center gap-2 pt-1 flex-wrap sm:flex-nowrap">
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 min-w-[200px] px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="submit"
                  disabled={isSendingAlert || !phoneNumber.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSendingAlert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{language === 'ta' ? 'அனுப்பு' : 'Send'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPhoneInput(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  {language === 'ta' ? 'ரத்து' : 'Cancel'}
                </button>
              </form>
            )}

            {sentSuccess && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-2 rounded-xl">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{language === 'ta' ? `ஆவணப் பட்டியல் (${phoneNumber})-க்கு அனுப்பப்பட்டது!` : `Checklist dispatched to ${phoneNumber} via WhatsApp / SMS!`}</span>
              </div>
            )}
          </div>
          {/* Disclaimer Card */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
              <span className="font-bold block mb-0.5">{t('disclaimerTitle')}:</span>
              {t('disclaimerText')}
            </div>
          </div>

          {/* Scheme Overview */}
          <section className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>{t('schemeOverview')}</span>
            </h3>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/60 font-medium">
              {overview}
            </p>
          </section>

          {/* Scheme Benefits */}
          <section className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-emerald-600" />
              <span>{t('schemeBenefits')}</span>
            </h3>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-base sm:text-lg">
              {benefits}
            </div>
          </section>

          {/* Scheme Eligibility */}
          <section className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{t('schemeEligibility')}</span>
            </h3>
            {eligibilityList.length > 0 ? (
              <ul className="space-y-2">
                {eligibilityList.map((cond, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span>{cond}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500">
                {language === 'ta' ? 'அனைத்து குடிமக்களும் பயன்பெறலாம்.' : 'Open to all eligible citizens as per official criteria.'}
              </div>
            )}
          </section>

          {/* Required Documents Interactive Checklist */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>{t('schemeDocuments')}</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {checkedCount} / {docsList.length} {language === 'ta' ? 'தயார்' : 'Ready'}
              </span>
            </div>

            {docsList.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5">
                {docsList.map((doc, idx) => {
                  const isChecked = !!checkedDocs[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleDoc(idx)}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition select-none ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm">{doc}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500">
                {language === 'ta' ? 'தேவையான ஆவணங்கள் எதுவும் குறிப்பிடப்படவில்லை.' : 'Standard ID and address proof required.'}
              </div>
            )}
          </section>

          {/* Application Procedure Steps */}
          <section className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-emerald-600" />
              <span>{t('schemeSteps')}</span>
            </h3>
            {stepsList.length > 0 ? (
              <div className="space-y-3">
                {stepsList.map((step, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="text-sm text-slate-800 font-medium leading-relaxed">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500">
                {language === 'ta' ? 'விண்ணப்பிக்கும் படிகள் அதிகாரப்பூர்வ போர்ட்டலில் உள்ளன.' : 'Apply online via the official government portal link below.'}
              </div>
            )}
          </section>

          {/* Helpline & Mode */}
          <section className="p-4 rounded-2xl bg-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <span className="font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                {t('schemeMode')}
              </span>
              <span className="font-bold text-slate-800">
                {scheme.application_mode || 'Online Portal / Common Service Center'}
              </span>
            </div>
            <div>
              <span className="font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                {t('schemeHelpline')}
              </span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {scheme.helpline || '1800-11-0031'}
              </span>
            </div>
          </section>
        </div>

        {/* Modal Bottom Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm text-center transition"
          >
            {t('closeModal')}
          </button>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {onAskAI && (
              <button
                onClick={() => {
                  onAskAI(scheme);
                  onClose();
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-md transition text-center"
              >
                <Bot className="w-4 h-4 text-slate-950" />
                <span>{t('chatAboutScheme')}</span>
              </button>
            )}

            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition text-center"
            >
              <span>{t('openPortal')}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
