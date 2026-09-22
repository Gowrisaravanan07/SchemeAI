import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Loader2, Sparkles, AlertCircle, MessageSquare } from 'lucide-react';
import SchemeCard from '../components/SchemeCard';
import SchemeFilters from '../components/SchemeFilters';
import { fetchAllSchemes } from '../services/api';
import { useCitizen } from '../context/CitizenContext';

export default function SchemesPage() {
  const { search: urlSearch } = useLocation();
  const searchParams = new URLSearchParams(urlSearch);
  const initialSearch = searchParams.get('search') || '';

  const { citizenData } = useCitizen();
  const citizenProfile = citizenData?.profile || null;

  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [aiQuery, setAiQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAiSearching, setIsAiSearching] = useState(false);

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchAllSchemes();
      if (res && res.data) {
        setSchemes(res.data);
        setFilteredSchemes(res.data);
      }
    } catch (err) {
      console.error('Failed to load schemes:', err);
      setError(err.message || 'Failed to fetch scheme catalog');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiSearch = (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiSearching(true);
    // Mocking RAG search delay
    setTimeout(() => {
      setSearchQuery(aiQuery); // Fallback to standard text search for now
      setIsAiSearching(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-myscheme-dark pt-8 pb-16">
      
      {/* AI Search Header */}
      <div className="bg-myscheme-green text-white py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl font-bold">Find Government Schemes For You</h1>
          <p className="text-green-100 text-lg">Use our AI assistant to discover schemes you are eligible for using natural language.</p>
          
          <form onSubmit={handleAiSearch} className="relative max-w-2xl mx-auto flex items-center bg-white rounded-full p-1 shadow-lg">
            <Sparkles className="w-6 h-6 text-myscheme-green ml-4" />
            <input
              type="text"
              placeholder="E.g., I am a 25 year old female student from Tamil Nadu..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="flex-1 px-4 py-3 text-gray-800 bg-transparent focus:outline-none"
            />
            <button 
              type="submit"
              disabled={isAiSearching}
              className="bg-myscheme-green hover:bg-myscheme-primaryHover text-white px-6 py-3 rounded-full font-medium transition flex items-center space-x-2"
            >
              {isAiSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Ask AI</span>}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-1/4 flex-shrink-0">
          <SchemeFilters
            schemes={schemes}
            setFilteredSchemes={setFilteredSchemes}
            userProfile={citizenProfile}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {/* Main Content Area */}
        <div className="w-full md:w-3/4 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Total <span className="text-myscheme-green">{filteredSchemes.length}</span> Schemes Found
            </h2>
            {isAiSearching && (
              <span className="text-sm text-myscheme-green flex items-center"><Sparkles className="w-4 h-4 mr-1"/> AI is analyzing schemes...</span>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-24 text-center space-y-4">
              <Loader2 className="w-10 h-10 mx-auto text-myscheme-green animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Loading schemes...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center space-y-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-8 h-8 mx-auto" />
              <p className="font-semibold text-sm">Failed to retrieve schemes: {error}</p>
              <button
                onClick={loadSchemes}
                className="px-4 py-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 rounded-md transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredSchemes.length === 0 && (
            <div className="py-20 text-center bg-white dark:bg-myscheme-secondary border border-gray-200 dark:border-gray-800 rounded-xl space-y-3 p-6">
              <Search className="w-10 h-10 mx-auto text-gray-400" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">No Schemes Found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                We couldn't find any schemes matching your criteria. Try adjusting the filters or asking the AI differently.
              </p>
            </div>
          )}

          {/* Schemes Grid */}
          {!isLoading && !error && filteredSchemes.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSchemes.map((scheme, idx) => (
                <div key={scheme.id || idx}>
                  <SchemeCard scheme={scheme} citizenProfile={citizenProfile} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Chatbot Mock */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-myscheme-secondary hover:bg-myscheme-dark text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 border-2 border-myscheme-green">
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
}
