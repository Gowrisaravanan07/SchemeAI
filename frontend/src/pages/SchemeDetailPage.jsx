import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Bookmark, BookmarkCheck, Share2, CheckCircle2,
  FileText, HelpCircle, ExternalLink, Bot, Building2, Send,
  ThumbsUp, ThumbsDown, Copy, Check, Mail, MessageSquare,
  Sparkles, ShieldCheck, ChevronRight, Layers, Info, Award
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useWishlist } from "../context/WishlistContext";
import SchemeEligibilityModal from "../components/SchemeEligibilityModal";

// Helper to robustly extract eligibility criteria
function getEligibilityList(scheme, language) {
  if (!scheme) return [];
  if (language === "ta") {
    if (Array.isArray(scheme.eligibility_conditions_ta) && scheme.eligibility_conditions_ta.length > 0) return scheme.eligibility_conditions_ta;
    if (Array.isArray(scheme.eligibility_criteria_ta) && scheme.eligibility_criteria_ta.length > 0) return scheme.eligibility_criteria_ta;
  }
  if (Array.isArray(scheme.eligibility_conditions_en) && scheme.eligibility_conditions_en.length > 0) return scheme.eligibility_conditions_en;
  if (Array.isArray(scheme.eligibility_criteria) && scheme.eligibility_criteria.length > 0) return scheme.eligibility_criteria;
  if (Array.isArray(scheme.eligibility_criteria_en) && scheme.eligibility_criteria_en.length > 0) return scheme.eligibility_criteria_en;
  if (Array.isArray(scheme.eligibility) && scheme.eligibility.length > 0) return scheme.eligibility;

  // Object format parsing (e.g. from backend RAG database)
  const el = scheme.eligibility || scheme.rules || {};
  const list = [];
  if (typeof el === "object" && el !== null) {
    if (el.state && el.state !== "All India" && el.state !== "All") {
      list.push(`Must be a permanent resident of ${el.state}.`);
    } else {
      list.push(`Must be a citizen of India residing in the eligible territory.`);
    }
    if (el.occupation && el.occupation.length > 0) {
      const occs = Array.isArray(el.occupation) ? el.occupation.join(", ") : el.occupation;
      list.push(`Applicant occupation or target group: ${occs}.`);
    }
    if (el.min_age || el.max_age) {
      const minA = el.min_age || 18;
      const maxA = el.max_age || 70;
      list.push(`Applicant age must be between ${minA} and ${maxA} years.`);
    }
    if (el.max_income) {
      list.push(`Family annual income limit: Up to ₹${Number(el.max_income).toLocaleString("en-IN")}.`);
    }
    if (el.gender && el.gender !== "All") {
      list.push(`Applicable exclusively for ${el.gender} beneficiaries.`);
    }
    if (el.education && el.education.length > 0) {
      const edu = Array.isArray(el.education) ? el.education.join(" / ") : el.education;
      list.push(`Educational eligibility: ${edu}.`);
    }
    if (el.caste && el.caste !== "All") {
      const caste = Array.isArray(el.caste) ? el.caste.join(", ") : el.caste;
      list.push(`Eligible Community / Category: ${caste}.`);
    }
  }

  // Fallback if list still empty
  if (list.length === 0) {
    const target = scheme.target_audience ? (Array.isArray(scheme.target_audience) ? scheme.target_audience.join(", ") : scheme.target_audience) : (scheme.category || "Citizens");
    list.push(`Target Beneficiaries: ${target}`);
    list.push(`Resident requirement: ${scheme.state || "All India / Tamil Nadu"}`);
    list.push(`Must possess valid required identification and land/education/income proofs as mandated by ${scheme.ministry_en || scheme.ministry || "the concerned department"}.`);
    list.push(`Applicant must not have availed duplicate subsidy for the same purpose under central/state parallel schemes.`);
  }

  return list;
}

// Helper to extract documents list
function getDocumentsList(scheme, language) {
  if (!scheme) return [];
  if (language === "ta") {
    if (Array.isArray(scheme.documents_ta) && scheme.documents_ta.length > 0) return scheme.documents_ta;
  }
  if (Array.isArray(scheme.documents_en) && scheme.documents_en.length > 0) return scheme.documents_en;
  if (Array.isArray(scheme.required_documents) && scheme.required_documents.length > 0) return scheme.required_documents;
  if (Array.isArray(scheme.documents) && scheme.documents.length > 0) return scheme.documents;

  const cat = (scheme.category || "").toLowerCase();
  if (cat.includes("agri") || cat.includes("farmer")) {
    return [
      "Aadhaar Card (Identity & Address Proof)",
      "Land Record Documents (Patta / Chitta / Adangal Copy)",
      "Farmer Identity Card / Kisan Credit Card",
      "Quotation for Equipment from Authorized Dealer",
      "Bank Account Passbook / Cancelled Cheque",
      "Passport Size Photograph"
    ];
  }
  if (cat.includes("edu") || cat.includes("student") || cat.includes("learn")) {
    return [
      "Aadhaar Card",
      "10th & 12th Standard Marksheets",
      "College Admission Letter & Fee Structure",
      "Income Certificate issued by Revenue Authority",
      "Bank Account Passbook / Cancelled Cheque",
      "Community / Caste Certificate"
    ];
  }
  return [
    "Aadhaar Card / Voter ID Card (Identity Proof)",
    "Ration Card / Smart Family Card (Address Proof)",
    "Income Certificate (Current Financial Year)",
    "Bank Account Passbook Copy with IFSC Code",
    "Passport Size Photograph"
  ];
}

// Helper to extract application steps
function getStepsList(scheme, language) {
  if (!scheme) return [];
  if (language === "ta") {
    if (Array.isArray(scheme.steps_ta) && scheme.steps_ta.length > 0) return scheme.steps_ta;
  }
  if (Array.isArray(scheme.steps_en) && scheme.steps_en.length > 0) return scheme.steps_en;
  if (Array.isArray(scheme.application_procedure) && scheme.application_procedure.length > 0) return scheme.application_procedure;
  if (Array.isArray(scheme.steps) && scheme.steps.length > 0) return scheme.steps;

  const portal = scheme.official_portal_url || scheme.official_source || "myscheme.gov.in";
  return [
    `Visit the official portal (${portal}) or your nearest Common Service Center (CSC) / e-Sevai Kendra.`,
    `Register an account with your mobile number and Aadhaar authentication.`,
    `Fill the common online scheme application form with personal, residence and income details.`,
    `Upload scanned self-attested copies of the required ID proofs and certificates.`,
    `Submit application and note down the Acknowledgement Reference Number for real-time tracking.`
  ];
}

// Helper to sanitize official URL so citizen never hits dead/unreachable link
function getReachablePortalUrl(scheme) {
  const raw = scheme.official_portal_url || scheme.official_source;
  if (!raw) return `https://www.myscheme.gov.in/schemes/${scheme.id || "pcardbpt"}`;
  
  // Clean URL
  let url = raw.trim();
  if (url.startsWith("http://") && !url.includes("localhost")) {
    url = url.replace("http://", "https://");
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
}

export default function SchemeDetailPage({ scheme, onBack, onAskAI, onNavigate }) {
  const { language, t } = useLanguage();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeSection, setActiveSection] = useState("details");
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  if (!scheme) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No scheme selected.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-myscheme-green text-white rounded-lg font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const isSaved = isInWishlist(scheme.id);
  const title = language === "ta" ? (scheme.name_ta || scheme.short_title_ta || scheme.name) : (scheme.name_en || scheme.short_title_en || scheme.name);
  const ministry = language === "ta" ? (scheme.ministry_ta || scheme.ministry) : (scheme.ministry_en || scheme.ministry || scheme.department);
  const overview = language === "ta" ? (scheme.overview_ta || scheme.description) : (scheme.overview_en || scheme.description);
  const benefits = language === "ta" ? (scheme.benefits_ta || scheme.benefits) : (scheme.benefits_en || scheme.benefits);
  const eligibilityList = getEligibilityList(scheme, language);
  const docsList = getDocumentsList(scheme, language);
  const stepsList = getStepsList(scheme, language);
  const portalUrl = getReachablePortalUrl(scheme);
  const stateTag = scheme.state || scheme.level || "Tamil Nadu";

  const defaultTags = scheme.tags || [
    "Agriculture And Rural Development Bank",
    "Farmer",
    "Farming Equipment",
    "Loan",
    "Power Tiller"
  ];

  const navItems = [
    { id: "details", label: language === "ta" ? "விவரங்கள்" : "Details" },
    { id: "benefits", label: language === "ta" ? "நன்மைகள்" : "Benefits" },
    { id: "eligibility", label: language === "ta" ? "தகுதி வரம்புகள்" : "Eligibility" },
    { id: "application", label: language === "ta" ? "விண்ணப்பிக்கும் முறை" : "Application Process" },
    { id: "documents", label: language === "ta" ? "தேவையான ஆவணங்கள்" : "Documents Required" },
    { id: "faqs", label: language === "ta" ? "அடிக்கடி கேட்கப்படும் கேள்விகள்" : "Frequently Asked Questions" },
    { id: "sources", label: language === "ta" ? "ஆதாரங்கள் & இணைப்புகள்" : "Sources And References" },
    { id: "feedback", label: language === "ta" ? "கருத்து" : "Feedback" },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this government welfare scheme: ${title}`);
    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      case "x":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${text}%0A%0A${url}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in text-gray-900 dark:text-gray-100">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-myscheme-green transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === "ta" ? "பின்செல்ல" : "Back"}</span>
        </button>
      </div>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-sm relative">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              {stateTag}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
              {title}
            </h1>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span>{ministry}</span>
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {defaultTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-gray-700 dark:text-emerald-400 dark:border-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                onClick={() => setIsEligibilityModalOpen(true)}
                className="px-6 py-2.5 rounded-lg border-2 border-emerald-600 bg-white hover:bg-emerald-50 text-emerald-700 dark:bg-gray-800 dark:hover:bg-gray-700 font-bold text-sm shadow-sm transition flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{language === "ta" ? "தகுதியை சரிபார்க்கவும்" : "Check Eligibility"}</span>
              </button>

              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition flex items-center gap-2"
              >
                <span>{language === "ta" ? "அதிகாரப்பூர்வ தளத்தில் விண்ணப்பிக்க" : "Apply on Official Portal"}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {onAskAI && (
                <button
                  onClick={() => onAskAI(scheme)}
                  className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-sm transition flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  <span>{language === "ta" ? "AI உடன் கேட்க" : "Ask AI"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Bookmark Button Top Right */}
          <div className="flex items-center gap-2 self-start">
            <button
              onClick={() => toggleWishlist(scheme)}
              className={`p-2.5 rounded-xl border transition ${
                isSaved
                  ? "bg-red-50 border-red-200 text-red-500 dark:bg-gray-700 dark:border-gray-600"
                  : "bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 dark:bg-gray-800 dark:border-gray-700"
              }`}
              title={isSaved ? "Saved" : "Save Scheme"}
            >
              {isSaved ? <BookmarkCheck className="w-5 h-5 text-red-500" /> : <Bookmark className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3-Column Layout: Left Sticky Navigation | Middle Content | Right Sticky Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Navigation Menu */}
        <div className="lg:col-span-3 sticky top-24 space-y-1 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hidden md:block">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition flex items-center justify-between ${
                  isActive
                    ? "bg-emerald-50 dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 font-bold"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <span>{item.label}</span>
                {isActive && <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />}
              </button>
            );
          })}
        </div>

        {/* Main Center Content */}
        <div className="lg:col-span-6 space-y-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Section: Details */}
          <section id="details" className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
              {language === "ta" ? "விவரங்கள் (Details)" : "Details"}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base font-medium">
              {overview}
            </p>
          </section>

          {/* Section: Benefits */}
          <section id="benefits" className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-black text-gray-900 dark:text-white pb-2">
              {language === "ta" ? "நன்மைகள் (Benefits)" : "Benefits"}
            </h2>
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 dark:bg-gray-700/50 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-line font-medium">
              {benefits}
            </div>
          </section>

          {/* Section: Eligibility */}
          <section id="eligibility" className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-black text-gray-900 dark:text-white pb-2">
              {language === "ta" ? "தகுதி வரம்புகள் (Eligibility)" : "Eligibility"}
            </h2>
            {eligibilityList.length > 0 ? (
              <ul className="space-y-3">
                {eligibilityList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Standard criteria applies as per department notifications.</p>
            )}
          </section>

          {/* Section: Application Process */}
          <section id="application" className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-black text-gray-900 dark:text-white pb-2">
              {language === "ta" ? "விண்ணப்பிக்கும் முறை (Application Process)" : "Application Process"}
            </h2>
            {stepsList.length > 0 ? (
              <div className="space-y-3">
                {stepsList.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-start gap-3.5"
                  >
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Apply directly at the authorized cooperative bank or online portal.</p>
            )}
          </section>

          {/* Section: Documents Required */}
          <section id="documents" className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {language === "ta" ? "தேவையான ஆவணங்கள் (Documents Required)" : "Documents Required"}
              </h2>
              <button
                onClick={() => setIsEligibilityModalOpen(true)}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Upload & Verify with AI</span>
              </button>
            </div>
            {docsList.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5">
                {docsList.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3 text-sm font-medium text-gray-800 dark:text-gray-200"
                  >
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Standard proof of identity and address required.</p>
            )}
          </section>

          {/* Section: Frequently Asked Questions */}
          <section id="faqs" className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-black text-gray-900 dark:text-white pb-2">
              {language === "ta" ? "அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQs)" : "Frequently Asked Questions"}
            </h2>
            <div className="space-y-3">
              {(scheme.faqs || [
                {
                  question: "Who is eligible for this loan scheme?",
                  answer: "Any farmer residing in Tamil Nadu engaged in active agricultural cultivation with land records is eligible."
                },
                {
                  question: "What percentage of the power tiller cost is financed?",
                  answer: "Up to 90% of the total cost of the power tiller as quoted by the approved dealer."
                },
                {
                  question: "What is the applicable interest rate?",
                  answer: "The annual interest rate ranges between 11.00% and 12.25% per annum."
                }
              ]).map((faq, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-2">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-start gap-2">
                    <span className="text-emerald-600 font-extrabold">Q:</span>
                    <span>{faq.question}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 pl-5 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Sources & References */}
          <section id="sources" className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-black text-gray-900 dark:text-white pb-2">
              {language === "ta" ? "ஆதாரங்கள் & குறிப்புகள் (Sources And References)" : "Sources And References"}
            </h2>
            <div className="space-y-2">
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-emerald-50 dark:hover:bg-gray-700 transition flex items-center justify-between text-sm font-bold text-emerald-700 dark:text-emerald-400"
              >
                <span>{ministry || "Official Department Portal"}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </section>

          {/* Section: Feedback */}
          <section id="feedback" className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-black text-gray-900 dark:text-white pb-2">
              {language === "ta" ? "உங்கள் கருத்து (Feedback)" : "Feedback"}
            </h2>
            {feedbackSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{language === "ta" ? "நன்றி! உங்கள் கருத்து பதிவு செய்யப்பட்டது." : "Thank you for your feedback!"}</span>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === "ta" ? "இந்த தகவல் உங்களுக்கு பயனுள்ளதாக இருந்ததா?" : "Was this scheme information helpful?"}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFeedbackSubmitted(true)}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-emerald-50 dark:hover:bg-gray-700 text-sm font-bold flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <ThumbsUp className="w-4 h-4 text-emerald-600" /> Yes
                  </button>
                  <button
                    onClick={() => setFeedbackSubmitted(true)}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-gray-700 text-sm font-bold flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <ThumbsDown className="w-4 h-4 text-red-500" /> No
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Sticky Cards: News & Updates and Share */}
        <div className="lg:col-span-3 sticky top-24 space-y-6">
          {/* News and Updates Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {language === "ta" ? "செய்திகள் மற்றும் அறிவிப்புகள்" : "News and Updates"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {language === "ta" ? "புதிய அறிவிப்புகள் எதுவும் இல்லை" : "No new news and updates available"}
            </p>
          </div>

          {/* Share Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {language === "ta" ? "பகிர்க" : "Share"}
            </h3>
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => handleShare("email")}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 transition"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare("facebook")}
                className="w-9 h-9 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] flex items-center justify-center font-bold text-xs transition"
                title="Facebook"
              >
                f
              </button>
              <button
                onClick={() => handleShare("telegram")}
                className="w-9 h-9 rounded-full bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center transition"
                title="Telegram"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare("x")}
                className="w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 text-gray-900 dark:text-white flex items-center justify-center font-bold text-xs transition"
                title="X"
              >
                𝕏
              </button>
              <button
                onClick={() => handleShare("whatsapp")}
                className="w-9 h-9 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] flex items-center justify-center transition"
                title="WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="w-9 h-9 rounded-full bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] flex items-center justify-center font-bold text-xs transition"
                title="LinkedIn"
              >
                in
              </button>
              <button
                onClick={handleCopyLink}
                className="w-9 h-9 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 flex items-center justify-center transition border border-amber-200"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copiedLink && (
              <span className="text-[11px] font-bold text-emerald-600 block animate-fade-in">
                Link copied to clipboard!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI Eligibility & Multi-Proof Document Modal */}
      {isEligibilityModalOpen && (
        <SchemeEligibilityModal
          scheme={scheme}
          onClose={() => setIsEligibilityModalOpen(false)}
          onAskAI={onAskAI}
        />
      )}
    </div>
  );
}
