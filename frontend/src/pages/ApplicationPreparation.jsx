import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Upload, FileText, CheckCircle2, AlertTriangle, 
  XCircle, Clock, ChevronRight, Loader2, Info, MapPin, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ApplicationPreparation({ 
  scheme, 
  userProfile, 
  onBack, 
  onApplicationReady 
}) {
  const { language, t } = useLanguage();
  
  // State for documents
  const [checklist, setChecklist] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [verificationResults, setVerificationResults] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [readinessScore, setReadinessScore] = useState(0);

  // Initialize checklist based on scheme
  useEffect(() => {
    if (scheme) {
      const docs = scheme.documents_en || scheme.required_documents || [];
      const formattedChecklist = docs.map(doc => ({
        id: doc.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: doc,
        status: 'pending' // pending, uploaded, verified, mismatch, needs_review
      }));
      setChecklist(formattedChecklist);
    }
  }, [scheme]);

  const handleFileUpload = async (docId, file) => {
    if (!file) return;

    setIsUploading(true);
    
    // Optimistic update
    setUploadedDocs(prev => ({
      ...prev,
      [docId]: { file, name: file.name, status: 'uploading' }
    }));

    try {
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', docId);
      formData.append('user_profile', JSON.stringify(userProfile || {}));

      // In a real app, we would use the actual FastAPI endpoint
      // const response = await fetch('http://localhost:8000/api/documents/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const result = await response.json();
      
      // Mocking the backend response for the demo based on Phase 1 logic
      const result = mockVerificationLogic(docId, userProfile);

      setVerificationResults(prev => ({
        ...prev,
        [docId]: result
      }));

      setUploadedDocs(prev => ({
        ...prev,
        [docId]: { 
          file, 
          name: file.name, 
          status: result.status 
        }
      }));

      // Update checklist status
      setChecklist(prev => prev.map(item => 
        item.id === docId ? { ...item, status: result.status } : item
      ));

      calculateReadinessScore(docId, result.status);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadedDocs(prev => ({
        ...prev,
        [docId]: { file, name: file.name, status: 'error' }
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const calculateReadinessScore = (updatedDocId, newStatus) => {
    setTimeout(() => {
      setChecklist(currentChecklist => {
        let score = 0;
        let verifiedCount = 0;
        let mismatchCount = 0;

        currentChecklist.forEach(item => {
          const status = item.id === updatedDocId ? newStatus : item.status;
          if (status === 'VERIFIED') verifiedCount++;
          if (status === 'MISMATCH') mismatchCount++;
        });

        if (currentChecklist.length > 0) {
          const baseScore = (verifiedCount / currentChecklist.length) * 100;
          const penalty = mismatchCount * 20; // 20% penalty per mismatch
          score = Math.max(0, Math.min(100, Math.round(baseScore - penalty)));
        }

        setReadinessScore(score);
        return currentChecklist;
      });
    }, 100);
  };

  const mockVerificationLogic = (docId, profile) => {
    // Simple mock logic reflecting Phase 1 Document Intelligence
    const rand = Math.random();
    
    if (docId.includes('aadhaar') || docId.includes('identity')) {
      if (profile?.name && rand > 0.8) {
        return {
          status: 'MISMATCH',
          confidence: 0.4,
          extracted_data: { name: 'Slightly Different Name', id_number: 'XXXX-XXXX-1234' },
          reason: `Name mismatch detected between profile (${profile.name}) and document.`
        };
      }
      return {
        status: 'VERIFIED',
        confidence: 0.95,
        extracted_data: { name: profile?.name || 'Citizen', id_number: 'XXXX-XXXX-1234' },
        reason: 'Identity verified successfully against profile.'
      };
    }

    if (docId.includes('income')) {
      if (profile?.income && profile.income > 250000 && rand > 0.7) {
        return {
          status: 'NEEDS_REVIEW',
          confidence: 0.75,
          extracted_data: { income: profile.income + 50000 },
          reason: 'Income value is close to scheme limit. Manual review required.'
        };
      }
      return {
        status: 'VERIFIED',
        confidence: 0.92,
        extracted_data: { income: profile?.income || 150000 },
        reason: 'Income details extracted and verified.'
      };
    }

    return {
      status: 'VERIFIED',
      confidence: 0.88,
      extracted_data: { document_type: docId },
      reason: 'Document structure and required fields found.'
    };
  };

  const handleFindCenter = () => {
    // If user has a pincode in their profile use it, else fallback
    const locationQuery = userProfile?.pincode || userProfile?.state || 'Tamil Nadu';
    const finalQuery = `e-Sevai Maiyam CSC near ${locationQuery}`;
    
    // Add Google Maps data parameters for Satellite view: /data=!3m1!1e3
    const url = `https://www.google.com/maps/search/${encodeURIComponent(finalQuery)}/data=!3m1!1e3`;
    
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VERIFIED': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'MISMATCH': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'NEEDS_REVIEW': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">Verified</span>;
      case 'MISMATCH': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800">Mismatch</span>;
      case 'NEEDS_REVIEW': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">Needs Review</span>;
      default: return null;
    }
  };

  if (!scheme) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-sm mb-2">
            <ShieldCheck className="w-5 h-5" />
            <span>Application Preparation & Readiness</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">{scheme.name_en || scheme.name}</h2>
          <p className="text-slate-500 text-sm mt-1">Upload your documents for AI verification before applying.</p>
        </div>
        
        {/* Readiness Score Ring */}
        <div className="shrink-0 flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${readinessScore >= 100 ? 'text-emerald-500' : readinessScore >= 50 ? 'text-amber-500' : 'text-slate-400'} transition-all duration-1000 ease-out`}
                strokeWidth="3"
                strokeDasharray={`${readinessScore}, 100`}
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-black text-slate-700">{readinessScore}%</span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Readiness Score</div>
            <div className={`font-extrabold ${readinessScore >= 100 ? 'text-emerald-600' : 'text-slate-700'}`}>
              {readinessScore >= 100 ? 'Ready to Apply' : 'Action Required'}
            </div>
          </div>
        </div>
      </div>

      {/* Document Checklist */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Required Document Checklist</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {checklist.map((item, index) => {
            const upload = uploadedDocs[item.id];
            const result = verificationResults[item.id];
            
            return (
              <div key={item.id} className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 transition-colors ${upload && result?.status === 'MISMATCH' ? 'bg-red-50/30' : ''}`}>
                <div className="shrink-0 pt-1">
                  {getStatusIcon(upload?.status)}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800">{index + 1}. {item.name}</h4>
                      {getStatusBadge(upload?.status)}
                    </div>
                  </div>
                  
                  {/* Result Details */}
                  {result && (
                    <div className={`p-3 rounded-xl text-sm ${
                      result.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                      result.status === 'MISMATCH' ? 'bg-red-50 text-red-800 border border-red-200' :
                      'bg-amber-50 text-amber-800 border border-amber-100'
                    }`}>
                      <div className="flex gap-2">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{result.reason}</p>
                          {result.extracted_data && (
                            <div className="mt-2 text-xs opacity-80 grid grid-cols-2 gap-2">
                              {Object.entries(result.extracted_data).map(([k, v]) => (
                                <div key={k}>
                                  <span className="capitalize">{k.replace('_', ' ')}:</span> <strong>{String(v)}</strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Controls */}
                  {!upload || result?.status === 'MISMATCH' ? (
                    <div className="mt-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 hover:border-emerald-500 text-slate-600 hover:text-emerald-700 font-bold rounded-xl cursor-pointer transition">
                        {isUploading && upload?.status === 'uploading' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span className="text-sm">{upload ? 'Re-upload Document' : 'Upload File'}</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(item.id, e.target.files[0])}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <FileText className="w-3 h-3" />
                      {upload.name}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <button 
          onClick={onBack}
          className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition w-full sm:w-auto"
        >
          Back to Scheme
        </button>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={handleFindCenter}
            className="px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition flex items-center justify-center gap-2 border border-blue-200"
          >
            <MapPin className="w-5 h-5" />
            <span>Find e-Sevai Center</span>
            <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
          </button>

          <button
            onClick={onApplicationReady}
            disabled={readinessScore < 100}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Proceed to Apply</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
