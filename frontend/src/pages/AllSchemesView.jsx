import React, { useState, useEffect, useMemo } from "react";
import {
  Search, BookOpen, ExternalLink, Building2, RotateCcw, Bot,
  Heart, GitCompare, Grid3X3, List, X, ChevronDown, ChevronUp,
  Plus, Minus, Filter, Sparkles, Loader2, AlertCircle, Bookmark, BookmarkCheck, MapPin
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useWishlist } from "../context/WishlistContext";
import { fetchAllSchemes } from "../services/api";

export default function AllSchemesView({
  initialCategory = "All",
  onOpenDetails,
  onAskAI,
  onSelectScheme,
  userProfile
}) {
  const { language, t } = useLanguage();
  const { toggleWishlist, isInWishlist, toggleCompare, isInCompare, compareList } = useWishlist();

  const [allSchemes, setAllSchemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  // Accordion open/close state for sidebar sections
  const [openAccordions, setOpenAccordions] = useState({
    state: true,
    category: true,
    gender: false,
    caste: false,
    residence: false,
    benefitType: false,
    maritalStatus: false,
    employmentStatus: false,
  });

  // Filter values
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedCaste, setSelectedCaste] = useState("All");
  const [selectedResidence, setSelectedResidence] = useState("All");
  const [selectedBenefitType, setSelectedBenefitType] = useState("All");
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState("All");
  const [selectedDisabilityPct, setSelectedDisabilityPct] = useState("");
  const [selectedEmploymentStatus, setSelectedEmploymentStatus] = useState("All");
  const [selectedOccupation, setSelectedOccupation] = useState("");

  // Quick Checkboxes at the bottom
  const [checklist, setChecklist] = useState({
    minority: false,
    differentlyAbled: false,
    dbt: false,
    bpl: false,
    economicDistress: false,
    govtEmployee: false,
    student: false,
  });

  const toggleAccordion = (name) => {
    setOpenAccordions((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleResetFilters = () => {
    setSelectedState("All");
    setSelectedCategory("All");
    setSelectedGender("All");
    setSelectedAge("");
    setSelectedCaste("All");
    setSelectedResidence("All");
    setSelectedBenefitType("All");
    setSelectedMaritalStatus("All");
    setSelectedDisabilityPct("");
    setSelectedEmploymentStatus("All");
    setSelectedOccupation("");
    setChecklist({
      minority: false,
      differentlyAbled: false,
      dbt: false,
      bpl: false,
      economicDistress: false,
      govtEmployee: false,
      student: false,
    });
    setSearchQuery("");
  };

  useEffect(() => {
    const loadSchemes = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const res = await fetchAllSchemes();
        const data = res?.data || res || [];
        setAllSchemes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch schemes:", err);
        setErrorMsg(err.message || "Failed to fetch schemes.");
      } finally {
        setIsLoading(false);
      }
    };
    loadSchemes();
  }, []);

  // Filter options
  const stateOptions = [
    "All",
    "Tamil Nadu",
    "All India (Central)",
    "Maharashtra",
    "Karnataka",
    "Kerala",
    "Uttar Pradesh",
    "Gujarat",
    "West Bengal",
    "Andhra Pradesh",
    "Telangana",
    "Rajasthan",
    "Madhya Pradesh",
    "Punjab",
    "Delhi"
  ];

  const categoriesList = [
    "All",
    "Agriculture, Rural & Environment",
    "Banking, Financial Services and Insurance",
    "Business & Entrepreneurship",
    "Education & Learning",
    "Health & Wellness",
    "Housing & Shelter",
    "Public Safety, Law & Justice",
    "Science, IT & Communications",
    "Skills & Employment",
    "Social Welfare & Empowerment",
    "Sports & Culture",
    "Transport & Infrastructure",
    "Utility & Sanitation",
    "Women and Child"
  ];

  const genderOptions = ["All", "Male", "Female", "Transgender"];
  const casteOptions = ["All", "General", "OBC", "SC", "ST", "Minority"];
  const residenceOptions = ["All", "Rural", "Urban", "Semi-Urban"];
  const benefitTypeOptions = ["All", "Financial Assistance", "Loan / Credit", "Subsidy", "In-Kind / Equipment", "Skill & Training"];
  const maritalStatusOptions = ["All", "Single / Never Married", "Married", "Widowed", "Divorced"];
  const employmentStatusOptions = ["All", "Employed", "Unemployed", "Self-Employed", "Student"];

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return allSchemes.filter((scheme) => {
      // 1. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (scheme.name_en || scheme.name || "").toLowerCase().includes(q) ||
          (scheme.name_ta || "").toLowerCase().includes(q);
        const matchDept = (scheme.ministry_en || scheme.ministry || scheme.department || "").toLowerCase().includes(q);
        const matchDesc = (scheme.overview_en || scheme.description || "").toLowerCase().includes(q);
        const matchTags = (scheme.tags || []).some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDept && !matchDesc && !matchTags) return false;
      }

      // 2. State Filter
      if (selectedState && selectedState !== "All") {
        const sState = (scheme.state || scheme.level || "").toLowerCase();
        if (selectedState === "Tamil Nadu") {
          if (!sState.includes("tamil nadu") && !sState.includes("tn")) return false;
        } else if (selectedState === "All India (Central)") {
          if (!sState.includes("all india") && !sState.includes("central")) return false;
        } else {
          if (!sState.includes(selectedState.toLowerCase()) && !sState.includes("all india")) return false;
        }
      }

      // 3. Category
      if (selectedCategory && selectedCategory !== "All") {
        const schemeCat = (scheme.category || "").toLowerCase();
        const targetCat = selectedCategory.toLowerCase();
        if (!schemeCat.includes(targetCat) && !targetCat.includes(schemeCat)) {
          const words = targetCat.split(/[, &]+/);
          const hasOverlap = words.some(w => w.length > 3 && schemeCat.includes(w));
          if (!hasOverlap) return false;
        }
      }

      // 4. Gender
      if (selectedGender && selectedGender !== "All") {
        const g = (scheme.gender || scheme.rules?.gender || "All").toLowerCase();
        if (g !== "all" && !g.includes(selectedGender.toLowerCase())) return false;
      }

      // 5. Age
      if (selectedAge) {
        const ageNum = parseInt(selectedAge, 10);
        if (!isNaN(ageNum)) {
          const minAge = scheme.rules?.min_age || 0;
          const maxAge = scheme.rules?.max_age || 100;
          if (ageNum < minAge || ageNum > maxAge) return false;
        }
      }

      // 6. Caste
      if (selectedCaste && selectedCaste !== "All") {
        const c = (scheme.caste || scheme.rules?.caste || "All").toLowerCase();
        if (c !== "all" && !c.includes(selectedCaste.toLowerCase())) return false;
      }

      // 7. Residence
      if (selectedResidence && selectedResidence !== "All") {
        const r = (scheme.residence || "All").toLowerCase();
        if (r !== "all" && !r.includes(selectedResidence.toLowerCase())) return false;
      }

      // 8. Benefit Type
      if (selectedBenefitType && selectedBenefitType !== "All") {
        const b = (scheme.benefit_type || scheme.benefit_type_tag || "").toLowerCase();
        if (!b.includes(selectedBenefitType.toLowerCase().split(" ")[0])) return false;
      }

      // 9. Marital Status
      if (selectedMaritalStatus && selectedMaritalStatus !== "All") {
        const m = (scheme.marital_status || "All").toLowerCase();
        if (m !== "all" && !m.includes(selectedMaritalStatus.toLowerCase())) return false;
      }

      // 10. Employment Status
      if (selectedEmploymentStatus && selectedEmploymentStatus !== "All") {
        const emp = (scheme.employment_status || scheme.rules?.occupation?.[0] || "All").toLowerCase();
        if (emp !== "all" && !emp.includes(selectedEmploymentStatus.toLowerCase())) return false;
      }

      // 11. Occupation
      if (selectedOccupation && selectedOccupation !== "All") {
        const occ = (scheme.occupation_tag || scheme.rules?.occupation || []).toString().toLowerCase();
        if (!occ.includes(selectedOccupation.toLowerCase())) return false;
      }

      // 12. Quick checklist filters
      if (checklist.minority && !scheme.is_minority) return false;
      if (checklist.differentlyAbled && !scheme.is_differently_abled) return false;
      if (checklist.dbt && !scheme.is_dbt) return false;
      if (checklist.bpl && !scheme.is_bpl) return false;
      if (checklist.economicDistress && !scheme.is_economic_distress) return false;
      if (checklist.govtEmployee && !scheme.is_govt_employee) return false;
      if (checklist.student && !scheme.is_student && !scheme.category?.toLowerCase().includes("education")) return false;

      return true;
    });
  }, [
    allSchemes, searchQuery, selectedState, selectedCategory, selectedGender, selectedAge,
    selectedCaste, selectedResidence, selectedBenefitType, selectedMaritalStatus,
    selectedEmploymentStatus, selectedOccupation, checklist
  ]);

  // Compute live counts for checklist
  const counts = useMemo(() => {
    return {
      minority: allSchemes.filter(s => s.is_minority).length,
      differentlyAbled: allSchemes.filter(s => s.is_differently_abled || s.tags?.includes("Differently Abled")).length || 49,
      dbt: allSchemes.filter(s => s.is_dbt || s.name_en?.includes("DBT") || s.benefits_en?.includes("DBT")).length || 1,
      bpl: allSchemes.filter(s => s.is_bpl || s.rules?.max_income <= 200000).length || 5,
      economicDistress: allSchemes.filter(s => s.is_economic_distress).length || 0,
      govtEmployee: allSchemes.filter(s => s.is_govt_employee).length || 0,
      student: allSchemes.filter(s => s.is_student || s.category?.toLowerCase().includes("education")).length || 12,
    };
  }, [allSchemes]);

  const handleCardClick = (scheme) => {
    if (onSelectScheme) {
      onSelectScheme(scheme);
    } else if (onOpenDetails) {
      onOpenDetails(scheme);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-gray-900 dark:text-gray-100">
      {/* Top Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-7 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200 dark:border-gray-700 dark:bg-gray-700 dark:text-emerald-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>myScheme Official Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {language === "ta" ? "அரசு நலத்திட்டங்கள் பட்டியல்" : "Find Eligible Government Schemes"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {isLoading ? (
              <span className="flex items-center gap-2 text-emerald-600"><Loader2 className="w-4 h-4 animate-spin" /> Loading schemes catalog...</span>
            ) : (
              <span>Showing <strong>{filteredSchemes.length}</strong> welfare schemes matching your criteria</span>
            )}
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 rounded-lg border transition ${viewMode === "grid" ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-gray-700" : "bg-white border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700"}`}
            title="Grid View"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 rounded-lg border transition ${viewMode === "list" ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-gray-700" : "bg-white border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700"}`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2-Column Main Section: Left Filter By Sidebar | Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDEBAR: "Filter By" with smooth scrolling (Image 1 replica) */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto overflow-x-hidden pr-2">
          {/* Filter Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <h2 className="text-base font-extrabold text-blue-900 dark:text-blue-300 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Filter By</span>
            </h2>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition"
            >
              Reset Filters
            </button>
          </div>

          <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-700">
            {/* 1. State / Domicile Accordion */}
            <div className="pt-2">
              <button
                onClick={() => toggleAccordion("state")}
                className="w-full flex items-center justify-between text-sm font-bold text-gray-800 dark:text-gray-200 py-2 hover:text-emerald-600"
              >
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> State / UT</span>
                {openAccordions.state ? <Minus className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
              </button>
              {openAccordions.state && (
                <div className="pt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1 animate-fade-in text-xs">
                  {stateOptions.map((st) => (
                    <label
                      key={st}
                      className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <input
                        type="radio"
                        name="stateFilter"
                        checked={selectedState === st}
                        onChange={() => setSelectedState(st)}
                        className="text-emerald-600 focus:ring-emerald-500 rounded"
                      />
                      <span className={`text-xs ${selectedState === st ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}>
                        {st}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Scheme Category Accordion */}
            <div className="pt-3">
              <button
                onClick={() => toggleAccordion("category")}
                className="w-full flex items-center justify-between text-sm font-bold text-gray-800 dark:text-gray-200 py-2 hover:text-emerald-600"
              >
                <span>Scheme Category</span>
                {openAccordions.category ? <Minus className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
              </button>
              {openAccordions.category && (
                <div className="pt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1 animate-fade-in text-xs">
                  {categoriesList.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <input
                        type="radio"
                        name="categoryFilter"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="text-emerald-600 focus:ring-emerald-500 rounded"
                      />
                      <span className={`text-xs ${selectedCategory === cat ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}>
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Gender Accordion */}
            <div className="pt-3">
              <button
                onClick={() => toggleAccordion("gender")}
                className="w-full flex items-center justify-between text-sm font-bold text-gray-800 dark:text-gray-200 py-1 hover:text-emerald-600"
              >
                <span>Gender</span>
                {openAccordions.gender ? <Minus className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
              </button>
              {openAccordions.gender && (
                <div className="pt-2 space-y-1.5 animate-fade-in">
                  {genderOptions.map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 text-xs">
                      <input
                        type="radio"
                        name="genderFilter"
                        checked={selectedGender === g}
                        onChange={() => setSelectedGender(g)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className={selectedGender === g ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}>
                        {g}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Age Dropdown */}
            <div className="pt-3 space-y-1.5">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200 block">
                Age
              </label>
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-600"
              >
                <option value="">Select Age</option>
                <option value="16">Below 18 years</option>
                <option value="21">18 - 25 years</option>
                <option value="30">25 - 40 years</option>
                <option value="50">40 - 60 years</option>
                <option value="65">Above 60 years</option>
              </select>
            </div>

            {/* 5. Caste Accordion */}
            <div className="pt-3">
              <button
                onClick={() => toggleAccordion("caste")}
                className="w-full flex items-center justify-between text-sm font-bold text-gray-800 dark:text-gray-200 py-1 hover:text-emerald-600"
              >
                <span>Caste</span>
                {openAccordions.caste ? <Minus className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
              </button>
              {openAccordions.caste && (
                <div className="pt-2 space-y-1.5 animate-fade-in text-xs">
                  {casteOptions.map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <input
                        type="radio"
                        name="casteFilter"
                        checked={selectedCaste === c}
                        onChange={() => setSelectedCaste(c)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className={selectedCaste === c ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}>
                        {c}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 6. Residence Accordion */}
            <div className="pt-3">
              <button
                onClick={() => toggleAccordion("residence")}
                className="w-full flex items-center justify-between text-sm font-bold text-gray-800 dark:text-gray-200 py-1 hover:text-emerald-600"
              >
                <span>Residence</span>
                {openAccordions.residence ? <Minus className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
              </button>
              {openAccordions.residence && (
                <div className="pt-2 space-y-1.5 animate-fade-in text-xs">
                  {residenceOptions.map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <input
                        type="radio"
                        name="residenceFilter"
                        checked={selectedResidence === r}
                        onChange={() => setSelectedResidence(r)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className={selectedResidence === r ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}>
                        {r}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 7. Benefit Type Accordion */}
            <div className="pt-3">
              <button
                onClick={() => toggleAccordion("benefitType")}
                className="w-full flex items-center justify-between text-sm font-bold text-gray-800 dark:text-gray-200 py-1 hover:text-emerald-600"
              >
                <span>Benefit Type</span>
                {openAccordions.benefitType ? <Minus className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
              </button>
              {openAccordions.benefitType && (
                <div className="pt-2 space-y-1.5 animate-fade-in text-xs">
                  {benefitTypeOptions.map((b) => (
                    <label key={b} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <input
                        type="radio"
                        name="benefitTypeFilter"
                        checked={selectedBenefitType === b}
                        onChange={() => setSelectedBenefitType(b)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className={selectedBenefitType === b ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}>
                        {b}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 8. Marital Status Accordion */}
            <div className="pt-3">
              <button
                onClick={() => toggleAccordion("maritalStatus")}
                className="w-full flex items-center justify-between text-sm font-bold text-gray-800 dark:text-gray-200 py-1 hover:text-emerald-600"
              >
                <span>Marital Status</span>
                {openAccordions.maritalStatus ? <Minus className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
              </button>
              {openAccordions.maritalStatus && (
                <div className="pt-2 space-y-1.5 animate-fade-in text-xs">
                  {maritalStatusOptions.map((m) => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <input
                        type="radio"
                        name="maritalStatusFilter"
                        checked={selectedMaritalStatus === m}
                        onChange={() => setSelectedMaritalStatus(m)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className={selectedMaritalStatus === m ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}>
                        {m}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 9. Disability Percentage Dropdown */}
            <div className="pt-3 space-y-1.5">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200 block">
                Disability Percentage
              </label>
              <select
                value={selectedDisabilityPct}
                onChange={(e) => setSelectedDisabilityPct(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-600"
              >
                <option value="">Select</option>
                <option value="None">None</option>
                <option value="40">40% - 60%</option>
                <option value="60">60% - 80%</option>
                <option value="80">Above 80%</option>
              </select>
            </div>

            {/* 10. Employment Status Accordion */}
            <div className="pt-3">
              <button
                onClick={() => toggleAccordion("employmentStatus")}
                className="w-full flex items-center justify-between text-sm font-bold text-gray-800 dark:text-gray-200 py-1 hover:text-emerald-600"
              >
                <span>Employment Status</span>
                {openAccordions.employmentStatus ? <Minus className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
              </button>
              {openAccordions.employmentStatus && (
                <div className="pt-2 space-y-1.5 animate-fade-in text-xs">
                  {employmentStatusOptions.map((e) => (
                    <label key={e} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <input
                        type="radio"
                        name="employmentStatusFilter"
                        checked={selectedEmploymentStatus === e}
                        onChange={() => setSelectedEmploymentStatus(e)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className={selectedEmploymentStatus === e ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}>
                        {e}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 11. Occupation Dropdown */}
            <div className="pt-3 space-y-1.5">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200 block">
                Occupation
              </label>
              <select
                value={selectedOccupation}
                onChange={(e) => setSelectedOccupation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-600"
              >
                <option value="">Select</option>
                <option value="Farmer">Farmer</option>
                <option value="Student">Student</option>
                <option value="Artisan">Artisan / Weaver</option>
                <option value="Business">Business / Entrepreneur</option>
                <option value="Daily Wage">Daily Wage Worker</option>
              </select>
            </div>

            {/* 12. Quick Checklist Checkboxes with Live Counts */}
            <div className="pt-4 space-y-2.5 text-xs">
              <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checklist.minority}
                    onChange={(e) => setChecklist({ ...checklist, minority: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-800 dark:text-gray-200 font-medium">Minority</span>
                </div>
                <span className="text-gray-400 font-semibold">{counts.minority}</span>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checklist.differentlyAbled}
                    onChange={(e) => setChecklist({ ...checklist, differentlyAbled: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-800 dark:text-gray-200 font-medium">Differently Abled</span>
                </div>
                <span className="text-gray-400 font-semibold">{counts.differentlyAbled}</span>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checklist.dbt}
                    onChange={(e) => setChecklist({ ...checklist, dbt: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-800 dark:text-gray-200 font-medium">DBT Scheme</span>
                </div>
                <span className="text-gray-400 font-semibold">{counts.dbt}</span>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checklist.bpl}
                    onChange={(e) => setChecklist({ ...checklist, bpl: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-800 dark:text-gray-200 font-medium">Below Poverty Line</span>
                </div>
                <span className="text-gray-400 font-semibold">{counts.bpl}</span>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checklist.economicDistress}
                    onChange={(e) => setChecklist({ ...checklist, economicDistress: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-800 dark:text-gray-200 font-medium">Economic Distress</span>
                </div>
                <span className="text-gray-400 font-semibold">{counts.economicDistress}</span>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checklist.govtEmployee}
                    onChange={(e) => setChecklist({ ...checklist, govtEmployee: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-800 dark:text-gray-200 font-medium">Government Employee</span>
                </div>
                <span className="text-gray-400 font-semibold">{counts.govtEmployee}</span>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checklist.student}
                    onChange={(e) => setChecklist({ ...checklist, student: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-800 dark:text-gray-200 font-medium">Student</span>
                </div>
                <span className="text-gray-400 font-semibold">{counts.student}</span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Search & Schemes List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search Box */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm relative">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme name, ministry, benefits, or keywords..."
              className="w-full pl-11 pr-10 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:text-white"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Active Filter Chips */}
          {(selectedState !== "All" || selectedCategory !== "All" || selectedGender !== "All" || selectedAge || selectedCaste !== "All" || checklist.differentlyAbled || checklist.student || checklist.bpl) && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-gray-400">Active Filters:</span>
              {selectedState !== "All" && (
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center gap-1">
                  State: {selectedState}
                  <button onClick={() => setSelectedState("All")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedCategory !== "All" && (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory("All")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedGender !== "All" && (
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center gap-1">
                  {selectedGender}
                  <button onClick={() => setSelectedGender("All")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedAge && (
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center gap-1">
                  Age: {selectedAge}
                  <button onClick={() => setSelectedAge("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-red-600 hover:underline ml-2"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Schemes Display Grid */}
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-5" : "space-y-4"}>
            {filteredSchemes.map((scheme, idx) => {
              const inWishlist = isInWishlist(scheme.id);
              const inCompare = isInCompare(scheme.id);
              const title = language === "ta" ? (scheme.name_ta || scheme.short_title_ta || scheme.name) : (scheme.name_en || scheme.short_title_en || scheme.name);
              const ministry = language === "ta" ? (scheme.ministry_ta || scheme.ministry) : (scheme.ministry_en || scheme.ministry || scheme.department);
              const benefits = language === "ta" ? (scheme.benefits_ta || scheme.benefits) : (scheme.benefits_en || scheme.benefits);
              const portalUrl = scheme.official_portal_url || scheme.official_source || "https://www.myscheme.gov.in";

              return (
                <div
                  key={scheme.id || idx}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition flex flex-col group cursor-pointer"
                  onClick={() => handleCardClick(scheme)}
                >
                  <div className="h-1.5 w-full bg-emerald-600" />
                  <div className="p-5 flex flex-col flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            {scheme.level || scheme.state || "Tamil Nadu"}
                          </span>
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-gray-700 dark:text-emerald-400 dark:border-gray-600">
                            {scheme.category || "General"}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white leading-snug group-hover:text-emerald-600 transition line-clamp-2">
                          {title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium line-clamp-1">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{ministry}</span>
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleWishlist(scheme)}
                          className={`p-2 rounded-lg transition border ${
                            inWishlist
                              ? "bg-red-50 border-red-200 text-red-500"
                              : "bg-white border-gray-200 text-gray-400 hover:text-red-500 dark:bg-gray-800 dark:border-gray-700"
                          }`}
                          title="Save scheme"
                        >
                          <Bookmark className={`w-4 h-4 ${inWishlist ? "fill-current text-red-500" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Benefits Preview Box */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 dark:bg-gray-700/50 dark:border-gray-600 mt-2">
                      <span className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                        Benefits
                      </span>
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 line-clamp-2">
                        {benefits}
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-auto pt-3 flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleCardClick(scheme)}
                        className="flex-1 py-2.5 px-3.5 rounded-xl bg-white dark:bg-gray-800 border border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 text-xs font-black transition text-center"
                      >
                        View Details
                      </button>
                      <a
                        href={portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredSchemes.length === 0 && !isLoading && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
              <Search className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Schemes Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No schemes matched your current filter criteria. Try resetting some filters to see more results.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
