import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Search, CheckCircle2, ShieldCheck, 
  ArrowRight, RotateCw, ExternalLink, Building2, 
  User, DollarSign, MapPin, Briefcase, Award, Zap
} from 'lucide-react';
import { evaluateCitizenEligibility, fetchAllSchemes } from '../services/api';
import SchemeCard from '../components/SchemeCard';

const PRESET_PROFILES = [
  {
    name: 'Tamil Nadu Student (₹2.5L)',
    profile: {
      occupation: 'Student',
      state: 'Tamil Nadu',
      income: 250000,
      age: 19,
      gender: 'Female',
      education: 'Undergraduate',
      caste: 'General'
    }
  },
  {
    name: 'UP Farmer (2 Acres)',
    profile: {
      occupation: 'Farmer',
      state: 'Uttar Pradesh',
      income: 120000,
      age: 42,
      gender: 'Male',
      education: '10th Pass',
      caste: 'OBC'
    }
  },
  {
    name: 'Karnataka Woman Entrepreneur',
    profile: {
      occupation: 'Business Owner',
      state: 'Karnataka',
      income: 400000,
      age: 29,
      gender: 'Female',
      education: 'Undergraduate',
      caste: 'General'
    }
  },
  {
    name: 'Senior Citizen (70+) Healthcare',
    profile: {
      occupation: 'Retired',
      state: 'All India',
      income: 180000,
      age: 72,
      gender: 'Male',
      education: 'Graduate',
      caste: 'All'
    }
  }
];

export default function MatchingPage() {
  const [profile, setProfile] = useState({
    occupation: 'Student',
    state: 'Tamil Nadu',
    income: 250000,
    age: 19,
    gender: 'Female',
    education: 'Undergraduate',
    caste: 'General'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [matchingResults, setMatchingResults] = useState(null);
  const [allSchemes, setAllSchemes] = useState([]);

  useEffect(() => {
    // Run initial match on page mount
    handleAnalyzeEligibility();
  }, []);

  const handleAnalyzeEligibility = async (customProfile = null) => {
    const profToUse = customProfile || profile;
    setIsLoading(true);
    try {
      const res = await evaluateCitizenEligibility(profToUse);
      if (res && res.success) {
        setMatchingResults(res);
      }
    } catch (err) {
      console.error('Eligibility evaluation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (preset) => {
    setProfile(preset.profile);
    handleAnalyzeEligibility(preset.profile);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI Multi-Criteria Eligibility Matcher</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Check Your Government Scheme Eligibility
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Enter your details or select a quick profile below. Our zero-hallucination engine analyzes 25+ official central & state schemes to pinpoint your exact benefits.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Profiles:
          </span>
          {PRESET_PROFILES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(preset)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-blue-900/40 hover:text-blue-200 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 transition"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Input Profile Form Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-400" />
              <span>Citizen Demographic Profile</span>
            </h2>
            <span className="text-xs text-slate-400">Real-time Rule Analysis</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Occupation */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Occupation / Profession</label>
              <select
                value={profile.occupation}
                onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Student">Student / Youth</option>
                <option value="Farmer">Farmer / Agriculturist</option>
                <option value="Business Owner">Business Owner / Entrepreneur</option>
                <option value="Artisan">Artisan / Traditional Craftsman</option>
                <option value="Street Vendor">Street Vendor / Hawker</option>
                <option value="Unemployed">Unemployed / Job Seeker</option>
                <option value="Retired">Retired / Senior Citizen</option>
                <option value="Salaried">Salaried Employee</option>
              </select>
            </div>

            {/* Annual Income */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Annual Family Income (₹)</label>
              <input
                type="number"
                value={profile.income}
                onChange={(e) => setProfile({ ...profile, income: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. 250000"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">State of Residence</label>
              <select
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Kerala">Kerala</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
                <option value="Bihar">Bihar</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="All India">All India (National)</option>
              </select>
            </div>

            {/* Age */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Applicant Age (Years)</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. 19"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Category / Caste */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Social Category</label>
              <select
                value={profile.caste}
                onChange={(e) => setProfile({ ...profile, caste: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="SCC">SCC (Converted Christian)</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            {/* Education */}
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1.5 font-medium">Education Level</label>
              <select
                value={profile.education}
                onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="10th Pass">10th Pass</option>
                <option value="12th Pass">12th Pass</option>
                <option value="Diploma">Diploma / ITI</option>
                <option value="Undergraduate">Undergraduate (BTech, BSc, BA, BCom)</option>
                <option value="Postgraduate">Postgraduate (MTech, MSc, MBA, MA)</option>
                <option value="Doctorate">PhD / Doctorate</option>
                <option value="No Formal Education">No Formal Education</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => handleAnalyzeEligibility()}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base rounded-2xl flex items-center justify-center space-x-2 transition shadow-xl shadow-blue-600/25 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                <span>Evaluating 25+ Schemes against Profile...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Find My Eligible Schemes</span>
              </>
            )}
          </button>
        </div>

        {/* Results Analytics Summary Banner */}
        {matchingResults && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-950/80 rounded-full border border-emerald-800/50">
                  Analysis Complete
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  You qualify for {matchingResults.eligible_schemes?.length || 0} Government Schemes
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Profile: <strong className="text-slate-200">{profile.occupation}</strong> ({profile.state}) | Income: <strong className="text-slate-200">₹{profile.income?.toLocaleString('en-IN')}</strong>
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl text-center min-w-[240px] shadow-xl">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Total Eligible Benefits
                </span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1">
                  {matchingResults.formatted_benefit}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schemes Grid */}
        {matchingResults && matchingResults.eligible_schemes && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-400" />
              <span>Matching Government Schemes ({matchingResults.eligible_schemes.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {matchingResults.eligible_schemes.map((scheme, idx) => (
                <div key={scheme.id || idx} className="h-full">
                  <SchemeCard scheme={scheme} citizenProfile={profile} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
