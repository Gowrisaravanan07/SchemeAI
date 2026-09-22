import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, Building2, MapPin, DollarSign, ChevronDown } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Agriculture, Rural & Environment',
  'Banking, Financial Services & Insurance',
  'Business & Entrepreneurship',
  'Education & Learning',
  'Health & Wellness',
  'Housing & Shelter',
  'Public Safety, Law & Justice',
  'Science, IT & Communications',
  'Skills & Employment',
  'Social Welfare & Empowerment',
  'Sports & Culture',
  'Transport & Infrastructure',
  'Travel & Tourism',
  'Utility & Sanitation',
  'Women & Child'
];

const STATES = [
  'All States',
  'All India',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Karnataka',
  'Maharashtra',
  'Delhi',
  'Bihar',
  'Kerala',
  'Gujarat'
];

export default function SchemeFilters({
  schemes,
  setFilteredSchemes,
  userProfile,
  searchQuery,
  setSearchQuery
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All States');
  const [incomeLimit, setIncomeLimit] = useState('');
  const [targetOccupation, setTargetOccupation] = useState('');

  // Expand/collapse states for sections
  const [isStateOpen, setIsStateOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isDemographicOpen, setIsDemographicOpen] = useState(true);

  useEffect(() => {
    let result = [...schemes];

    // Text Search Query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.short_name?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.ministry?.toLowerCase().includes(q) ||
          (s.tags && s.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Category Filter
    if (selectedCategory && selectedCategory !== 'All') {
      // Basic matching for mockup
      result = result.filter((s) => true); // In a real app, match category
    }

    // State Filter
    if (selectedState && selectedState !== 'All States') {
      result = result.filter((s) => {
        const st = s.state || 'All India';
        return (
          st.toLowerCase().includes(selectedState.toLowerCase()) ||
          st.toLowerCase() === 'all india'
        );
      });
    }

    // Income Filter
    if (incomeLimit) {
      const limitVal = Number(incomeLimit);
      result = result.filter((s) => {
        const maxInc = s.eligibility?.max_income;
        if (maxInc) return limitVal <= maxInc;
        return true;
      });
    }

    // Occupation Filter
    if (targetOccupation) {
      const occL = targetOccupation.toLowerCase();
      result = result.filter((s) => {
        const occList = s.eligibility?.occupation || [];
        const aud = s.target_audience || [];
        if (occList.length === 0 && aud.length === 0) return true;
        return (
          occList.some((o) => o.toLowerCase().includes(occL)) ||
          aud.some((a) => a.toLowerCase().includes(occL))
        );
      });
    }

    setFilteredSchemes(result);
  }, [
    schemes,
    searchQuery,
    selectedCategory,
    selectedState,
    incomeLimit,
    targetOccupation,
    setFilteredSchemes
  ]);

  const handleReset = () => {
    setSelectedCategory('All');
    setSelectedState('All States');
    setIncomeLimit('');
    setTargetOccupation('');
    if (setSearchQuery) setSearchQuery('');
  };

  return (
    <div className="bg-white dark:bg-myscheme-secondary border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filter By
        </h3>
        <button
          onClick={handleReset}
          className="text-sm text-myscheme-green hover:text-myscheme-primaryHover flex items-center font-medium transition"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </button>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        
        {/* State Filter */}
        <div className="p-4">
          <button 
            onClick={() => setIsStateOpen(!isStateOpen)}
            className="w-full flex justify-between items-center font-bold text-gray-700 dark:text-gray-300 mb-2"
          >
            <span>State</span>
            <ChevronDown className={`w-4 h-4 transform transition ${isStateOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isStateOpen && (
            <div className="mt-3">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-gray-50 dark:bg-myscheme-dark border border-gray-200 dark:border-gray-700 rounded-md p-2.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-myscheme-green"
              >
                {STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Categories Filter */}
        <div className="p-4">
          <button 
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="w-full flex justify-between items-center font-bold text-gray-700 dark:text-gray-300 mb-2"
          >
            <span>Categories</span>
            <ChevronDown className={`w-4 h-4 transform transition ${isCategoryOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isCategoryOpen && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="form-radio h-4 w-4 text-myscheme-green border-gray-300 focus:ring-myscheme-green"
                  />
                  <span className={`text-sm ${selectedCategory === cat ? 'text-myscheme-green font-semibold' : 'text-gray-600 dark:text-gray-400 group-hover:text-myscheme-green'}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Demographics Filter */}
        <div className="p-4">
          <button 
            onClick={() => setIsDemographicOpen(!isDemographicOpen)}
            className="w-full flex justify-between items-center font-bold text-gray-700 dark:text-gray-300 mb-2"
          >
            <span>Demographics</span>
            <ChevronDown className={`w-4 h-4 transform transition ${isDemographicOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDemographicOpen && (
            <div className="mt-3 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Occupation</label>
                <select
                  value={targetOccupation}
                  onChange={(e) => setTargetOccupation(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-myscheme-dark border border-gray-200 dark:border-gray-700 rounded-md p-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-myscheme-green"
                >
                  <option value="">Any</option>
                  <option value="student">Student</option>
                  <option value="farmer">Farmer</option>
                  <option value="business">Business</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Max Income / Year</label>
                <select
                  value={incomeLimit}
                  onChange={(e) => setIncomeLimit(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-myscheme-dark border border-gray-200 dark:border-gray-700 rounded-md p-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-myscheme-green"
                >
                  <option value="">Any Income</option>
                  <option value="100000">Up to ₹1,00,000</option>
                  <option value="250000">Up to ₹2,50,000</option>
                  <option value="500000">Up to ₹5,00,000</option>
                </select>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
