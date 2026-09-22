import React, { useState } from 'react';
import { 
  Building2, ExternalLink, FileText, CheckCircle2, 
  AlertCircle, ChevronDown, ChevronUp, Sparkles, Info, ArrowRight,
  MapPin, CheckCircle
} from 'lucide-react';

const evaluateEligibility = (scheme, profile) => {
  if (!profile) return { status: 'unknown', label: 'Check Eligibility', color: 'bg-gray-100 text-gray-700 border-gray-200' };

  const elig = scheme.eligibility || scheme.eligibility_criteria || scheme.eligibility_rules || {};
  let matches = true;
  let missing = false;

  const maxIncome = elig.max_income || elig.income_limit || elig.income_max;
  if (maxIncome && profile.income) {
    if (profile.income > maxIncome) matches = false;
  } else if (maxIncome && !profile.income) {
    missing = true;
  }

  if (elig.occupation && elig.occupation.length > 0 && profile.occupation) {
    const occMatch = elig.occupation.some(
      (o) => o.toLowerCase().includes(profile.occupation.toLowerCase()) || profile.occupation.toLowerCase().includes(o.toLowerCase())
    );
    if (!occMatch) matches = false;
  }

  if (elig.min_age && profile.age && profile.age < elig.min_age) matches = false;
  if (elig.max_age && profile.age && profile.age > elig.max_age) matches = false;

  if (elig.gender && elig.gender !== 'All' && profile.gender) {
    if (elig.gender.toLowerCase() !== profile.gender.toLowerCase()) matches = false;
  }

  if (scheme.state && scheme.state !== 'All India' && profile.state) {
    if (!scheme.state.toLowerCase().includes(profile.state.toLowerCase()) && !profile.state.toLowerCase().includes(scheme.state.toLowerCase())) {
      matches = false;
    }
  }

  if (!matches) {
    return { status: 'no', label: 'Not Eligible', color: 'bg-red-50 text-red-700 border-red-200' };
  }
  if (missing) {
    return { status: 'possible', label: 'Potentially Eligible', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
  }
  return { status: 'yes', label: 'You are Eligible', color: 'bg-green-50 text-green-700 border-green-200' };
};

export default function SchemeCard({ scheme, citizenProfile }) {
  const [showDetails, setShowDetails] = useState(false);

  const displayName = scheme.name || scheme.scheme_name || 'Government Scheme';
  const ministry = scheme.ministry || scheme.department || 'Government of India';
  const state = scheme.state || 'All India';
  const category = scheme.category || 'Welfare';
  const description = scheme.description || '';
  const benefits = scheme.benefits || scheme.benefit || 'Financial and welfare assistance';
  const requiredDocs = scheme.required_documents || scheme.documents_required || [];
  const officialSource = scheme.official_source || scheme.apply_url || 'https://www.myscheme.gov.in/';
  const appSteps = scheme.application_procedure || [];

  const eligibility = evaluateEligibility(scheme, citizenProfile);

  const handleApplyOfficial = () => {
    window.open(officialSource, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white dark:bg-myscheme-secondary border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
      
      {/* Top Banner / Color strip */}
      <div className={`h-1.5 w-full ${
          eligibility.status === 'yes' ? 'bg-myscheme-green' : 
          eligibility.status === 'no' ? 'bg-red-500' : 
          eligibility.status === 'possible' ? 'bg-yellow-500' : 'bg-gray-300'
        }`}
      />

      <div className="p-5 flex flex-col flex-1 space-y-4">
        {/* Ministry & State */}
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="flex items-center space-x-1.5">
            <Building2 className="w-4 h-4 text-myscheme-green" />
            <span className="line-clamp-1">{ministry}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
          {displayName}
        </h3>
        
        {/* AI Eligibility Reasoning (Mock for now) */}
        {citizenProfile && (
          <div className={`text-sm px-3 py-2 rounded-md border flex flex-col space-y-1 ${eligibility.color}`}>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center"><Sparkles className="w-4 h-4 mr-1"/> {eligibility.label}</span>
              {eligibility.status === 'yes' && <CheckCircle className="w-4 h-4" />}
            </div>
            {eligibility.status === 'yes' && (
              <p className="text-xs opacity-90">Based on your profile, you meet the age, gender, and state requirements for this scheme.</p>
            )}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 bg-green-50 text-myscheme-green dark:bg-green-900/30 dark:text-green-400 rounded-full font-medium border border-green-200 dark:border-green-800">
            {category}
          </span>
          <span className="px-2.5 py-1 flex items-center bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full font-medium border border-gray-200 dark:border-gray-700">
            <MapPin className="w-3 h-3 mr-1" /> {state}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 flex-1">
          {description}
        </p>

        {/* View Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1.5 text-sm text-myscheme-green hover:text-myscheme-primaryHover font-semibold transition py-2"
        >
          <span>{showDetails ? 'Hide Details' : 'View Details'}</span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Expanded Details */}
        {showDetails && (
          <div className="bg-gray-50 dark:bg-myscheme-dark p-4 rounded-md border border-gray-200 dark:border-gray-700 space-y-4 text-sm">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center">
                <CheckCircle2 className="w-4 h-4 text-myscheme-green mr-1.5" /> Benefits
              </h4>
              <p className="text-gray-700 dark:text-gray-300">{benefits}</p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <FileText className="w-4 h-4 text-myscheme-green mr-1.5" /> Required Documents
              </h4>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-xs">
                {requiredDocs.length > 0 ? (
                  requiredDocs.map((doc, i) => <li key={i}>{doc}</li>)
                ) : (
                  <li>Standard ID & Address proof</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium text-sm flex items-center"
          >
            Check Eligibility
          </button>
          
          <button
            onClick={handleApplyOfficial}
            className="px-4 py-2 bg-myscheme-green hover:bg-myscheme-primaryHover text-white font-bold rounded-md flex items-center justify-center gap-2 transition shadow-sm text-sm"
          >
            <span>Apply Now</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
