import React, { useState } from "react";
import { MapPin, Navigation, Building2, Landmark, HeartPulse, Users, Search, Loader2, ExternalLink, Globe, Map as MapIcon, Info } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const PLACE_TYPES = [
  { id: "csc", label: "e-Sevai / Common Service Centre", icon: Users, color: "#10b981", query: "e-Sevai Maiyam CSC" },
  { id: "bank", label: "Bank Branch (National)", icon: Landmark, color: "#3b82f6", query: "Nationalised Bank" },
  { id: "hospital", label: "Government Hospital", icon: HeartPulse, color: "#f43f5e", query: "Government Hospital" },
  { id: "collectorate", label: "District Collectorate", icon: Building2, color: "#f59e0b", query: "Collectorate" },
];

export default function NearbyMapPage() {
  const { language, t } = useLanguage();
  const [activeType, setActiveType] = useState("csc");
  const [searchInput, setSearchInput] = useState("");
  const [viewMode, setViewMode] = useState("satellite"); // 'satellite' or 'standard'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigateToGoogleMaps = (locationQuery) => {
    const typeInfo = PLACE_TYPES.find(p => p.id === activeType);
    const finalQuery = `${typeInfo.query} near ${locationQuery}`;
    
    let url = `https://www.google.com/maps/search/${encodeURIComponent(finalQuery)}`;
    
    // Add Google Maps data parameters for Satellite view
    // !3m1!1e3 forces the base layer to be Satellite/Hybrid
    if (viewMode === "satellite") {
      url += "/data=!3m1!1e3";
    }
    
    window.open(url, "_blank", "noopener,noreferrer");
    setLoading(false);
  };

  const handleSearch = () => {
    if (!searchInput.trim()) {
      setError("Please enter a city, area, or pincode.");
      return;
    }
    setError("");
    navigateToGoogleMaps(searchInput);
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError("");
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
        navigateToGoogleMaps(coords);
      },
      (err) => {
        setLoading(false);
        setError("Could not get your GPS location. Please type your area manually.");
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="glass-card rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="badge-blue mb-6 inline-flex mx-auto"><MapPin className="w-3.5 h-3.5" /> Official Maps Integration</div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Find Civic Centers</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
          Search for nearby e-Sevai centers, hospitals, and banks. We will securely redirect you to the official Google Maps app for maximum accuracy, 3D Street View, and real-time navigation.
        </p>

        {/* Category Selection */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 relative z-10">
          {PLACE_TYPES.map((pt) => {
            const Icon = pt.icon;
            return (
              <button key={pt.id} onClick={() => setActiveType(pt.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border transition-all ${activeType === pt.id ? "text-white shadow-lg scale-105" : "border-white/8 text-slate-400 bg-white/3 hover:bg-white/10 hover:text-white"}`}
                style={activeType === pt.id ? { background: pt.color + "33", borderColor: pt.color + "55", color: pt.color } : {}}>
                <Icon className="w-5 h-5" />{pt.label}
              </button>
            );
          })}
        </div>

        {/* Search Input Area */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 max-w-2xl mx-auto relative z-10 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                value={searchInput} 
                onChange={e => setSearchInput(e.target.value)} 
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Enter your Pincode, Area, or City..." 
                className="glass-input w-full pl-12 pr-4 py-3.5 rounded-xl text-base font-medium text-white placeholder-slate-500 focus:border-emerald-500/50" 
              />
            </div>
            <button onClick={locateMe} disabled={loading} className="btn-ghost flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 whitespace-nowrap">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />} Find Near Me
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-white/5">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-950 rounded-lg p-1 border border-white/5">
              <button onClick={() => setViewMode("standard")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${viewMode === "standard" ? "bg-slate-800 text-white shadow" : "text-slate-500 hover:text-slate-300"}`}>
                <MapIcon className="w-4 h-4" /> Standard Map
              </button>
              <button onClick={() => setViewMode("satellite")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${viewMode === "satellite" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-slate-300"}`}>
                <Globe className="w-4 h-4" /> Satellite View
              </button>
            </div>

            {/* Launch Button */}
            <button onClick={handleSearch} className="btn-primary w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform">
              Open in Google Maps <ExternalLink className="w-4 h-4" />
            </button>
          </div>
          
          {error && <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center justify-center gap-2"><Info className="w-4 h-4" />{error}</div>}
        </div>
        
        {/* Helper Note */}
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Info className="w-4 h-4" /> Opening in the native Google Maps app ensures you have full access to Street View, 3D mapping, and live traffic navigation.
        </div>
      </div>
    </div>
  );
}
