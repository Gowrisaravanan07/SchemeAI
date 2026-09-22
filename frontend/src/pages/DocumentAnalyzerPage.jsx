import React, { useState, useRef } from "react";
import { FileSearch, Upload, Loader2, Sparkles, CheckCircle2, ExternalLink, AlertCircle, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { ALL_INDIA_SCHEMES } from "../data/all_india_schemes";

export default function DocumentAnalyzerPage({ onOpenDetails }) {
  const { language, t } = useLanguage();
  const fileRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [extractedText, setExtractedText] = useState("");

  const handleFiles = (newFiles) => {
    const arr = Array.from(newFiles);
    setFiles(prev => [...prev, ...arr].slice(0, 5));
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const analyzeDocuments = async () => {
    if (files.length === 0) return;
    setAnalyzing(true);
    setResults(null);
    
    // Simulate analysis — in production, send to AI backend
    await new Promise(r => setTimeout(r, 2500));

    // Extract "features" from file names for demo matching
    const fileInfo = files.map(f => f.name.toLowerCase()).join(" ");
    const detected = {
      hasAadhaar: fileInfo.includes("aadhar") || fileInfo.includes("aadhaar"),
      hasIncome: fileInfo.includes("income"),
      hasCaste: fileInfo.includes("caste") || fileInfo.includes("bc") || fileInfo.includes("obc") || fileInfo.includes("sc") || fileInfo.includes("st"),
      hasLand: fileInfo.includes("patta") || fileInfo.includes("land") || fileInfo.includes("chitta"),
      hasMark: fileInfo.includes("mark") || fileInfo.includes("certificate") || fileInfo.includes("degree"),
      hasBank: fileInfo.includes("bank") || fileInfo.includes("passbook"),
    };

    const detected_attrs = {
      category: detected.hasCaste ? "SC/ST/OBC" : "General",
      hasLand: detected.hasLand,
      educated: detected.hasMark,
    };

    // Match schemes
    const matched = ALL_INDIA_SCHEMES.filter(s => {
      if (detected.hasLand && s.category?.toLowerCase().includes("agriculture")) return true;
      if (detected.hasMark && s.category?.toLowerCase().includes("education")) return true;
      if (detected.hasCaste && s.category?.toLowerCase().includes("social")) return true;
      return Math.random() > 0.6; // demo: random matches
    }).slice(0, 8);

    setExtractedText(`Detected documents: ${files.map(f=>f.name).join(", ")}. Category: ${detected_attrs.category}. Land holding: ${detected.hasLand ? "Yes" : "Not detected"}. Educational docs: ${detected.educated ? "Yes" : "Not detected"}.`);
    setResults({ matched, detected });
    setAnalyzing(false);
  };

  const getName = (s) => language === "ta" ? (s.name_ta || s.name_en || s.name) : (s.name_en || s.name);
  const getBenefits = (s) => language === "ta" ? (s.benefits_ta || s.benefits_en || s.benefits) : (s.benefits_en || s.benefits);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-2xl p-6">
        <div className="badge-purple mb-2 inline-flex"><FileSearch className="w-3.5 h-3.5" /> {t("docAnalyzerTitle")}</div>
        <h1 className="text-2xl font-black text-white">{t("docAnalyzerTitle")}</h1>
        <p className="text-slate-400 text-sm mt-1">{t("docAnalyzerSubtitle")}</p>
      </div>

      {/* Upload zone */}
      <div
        className="glass-card rounded-2xl p-8 border-2 border-dashed border-white/10 hover:border-purple-500/40 transition cursor-pointer text-center"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); }}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <input type="file" ref={fileRef} multiple accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={e => handleFiles(e.target.files)} />
        <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-float" />
        <h3 className="text-lg font-black text-white">{t("uploadDoc")}</h3>
        <p className="text-slate-400 text-sm mt-2">PDF, JPG, PNG supported. Upload Aadhaar, Income Certificate, Caste Certificate, etc.</p>
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          {["Aadhaar", "Income Cert", "Caste Cert", "Patta/Land", "Marksheet", "Bank Passbook"].map(doc => (
            <span key={doc} className="badge-purple text-[10px]">{doc}</span>
          ))}
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="glass-card rounded-2xl p-4 space-y-2 animate-fade-in">
          <h3 className="text-sm font-bold text-white mb-3">Uploaded Files ({files.length}/5)</h3>
          {files.map((f, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <FileSearch className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-sm text-slate-300 flex-1 truncate">{f.name}</span>
              <span className="text-xs text-slate-500">{(f.size / 1024).toFixed(0)} KB</span>
              <button onClick={() => removeFile(idx)} className="p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button onClick={analyzeDocuments} disabled={analyzing}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl mt-3">
            {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" />{language === "hi" ? "विश्लेषण हो रहा है..." : language === "ta" ? "பகுப்பாய்வு நடக்கிறது..." : "Analyzing with AI..."}</> : <><Sparkles className="w-4 h-4" />{t("analyzeDoc")}</>}
          </button>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-5 animate-fade-in">
          {extractedText && (
            <div className="glass-card rounded-2xl p-4 border border-purple-500/30">
              <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Document Analysis</h3>
              <p className="text-sm text-slate-300">{extractedText}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {results.detected.hasAadhaar && <span className="badge-emerald">✓ Aadhaar</span>}
                {results.detected.hasIncome && <span className="badge-emerald">✓ Income Cert</span>}
                {results.detected.hasCaste && <span className="badge-saffron">✓ Caste Cert</span>}
                {results.detected.hasLand && <span className="badge-blue">✓ Land Docs</span>}
                {results.detected.hasMark && <span className="badge-purple">✓ Educational</span>}
                {results.detected.hasBank && <span className="badge-emerald">✓ Bank Docs</span>}
              </div>
            </div>
          )}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-black text-white mb-1">{t("matchedSchemes")}</h2>
            <p className="text-slate-400 text-sm mb-4">{results.matched.length} {language === "hi" ? "योजनाएं मिलीं" : language === "ta" ? "திட்டங்கள் பொருந்துகின்றன" : "schemes matched based on your documents"}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.matched.map((scheme, idx) => (
                <div key={idx} className="glass-card rounded-xl p-4 flex flex-col gap-3 scheme-card-hover">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-white">{getName(scheme)}</h3>
                      <p className="text-xs text-emerald-400 font-bold mt-0.5">{getBenefits(scheme)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onOpenDetails(scheme)} className="flex-1 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition">
                      View Details
                    </button>
                    <a href={scheme.official_portal_url || scheme.official_source || "https://myscheme.gov.in"} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
