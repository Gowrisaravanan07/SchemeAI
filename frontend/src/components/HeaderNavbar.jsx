import React, { useState, useEffect } from "react";
import {
  Sparkles, Globe, Bot, BarChart3, Database, BookOpen, Layers,
  Heart, MapPin, Wrench, FileSearch, Menu, X, Sun, Moon
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useWishlist } from "../context/WishlistContext";

export default function HeaderNavbar({ activeView, setActiveView }) {
  const { language, toggleLanguage, t, getLangLabel } = useLanguage();
  const { wishlist } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const navItems = [
    { id: "home", label: t("navHome"), icon: Layers },
    { id: "wizard", label: t("navFindBenefits"), icon: Sparkles, highlight: true },
    { id: "all_schemes", label: t("navAllSchemes"), icon: BookOpen },
    { id: "chat", label: t("navChat"), icon: Bot, isAgent: true },
    { id: "wishlist", label: t("navWishlist"), icon: Heart, badge: wishlist.length },
    { id: "map", label: t("navMap"), icon: MapPin },
    { id: "tools", label: t("navTools"), icon: Wrench },
    { id: "doc_analyzer", label: t("navDocAnalyzer"), icon: FileSearch },
    { id: "evaluation", label: t("navEval"), icon: BarChart3 },
  ];

  const handleNav = (id) => {
    setActiveView(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className={`sticky top-0 z-50 bg-white dark:bg-myscheme-dark transition-all duration-300 ${scrolled ? "shadow-md" : "border-b border-gray-100 dark:border-gray-800"}`}>
      {/* Top Gov Bar */}
      <div className="bg-gray-100 dark:bg-myscheme-secondary text-gray-600 dark:text-gray-300 text-xs font-medium px-4 sm:px-8 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold uppercase tracking-wider">
            Government of India
          </span>
          <span className="text-gray-400 hidden sm:inline">|</span>
          <span className="hidden sm:inline">Ministry of Electronics and Information Technology</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-myscheme-green transition">Skip to main content</a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => handleNav("home")}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="flex flex-col">
            <div className="font-bold text-2xl text-myscheme-green dark:text-white tracking-tight flex items-center">
              myScheme<span className="text-xs font-mono bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-1.5 py-0.5 rounded ml-1">AI</span>
            </div>
            <p className="text-[10px] text-gray-500 font-medium hidden sm:block leading-none mt-0.5">
              One-stop search and discovery platform
            </p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {navItems.slice(0, 7).map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "text-myscheme-green dark:text-white bg-green-50 dark:bg-gray-800"
                    : item.highlight
                    ? "bg-myscheme-green text-white hover:bg-myscheme-primaryHover"
                    : item.isAgent
                    ? "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800"
                    : "text-gray-700 dark:text-gray-300 hover:text-myscheme-green hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0 border-l border-gray-200 dark:border-gray-700 pl-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:text-myscheme-green hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{getLangLabel()}</span>
          </button>
          
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors hidden md:flex"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => handleNav("chat")}
            className="hidden md:flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-myscheme-green hover:bg-myscheme-primaryHover text-white text-sm font-bold transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>AI Agent</span>
          </button>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center">
            <button 
              onClick={toggleDarkMode}
              className="p-2 mr-1 text-gray-700 dark:text-gray-300"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-myscheme-dark animate-fade-in shadow-inner">
          <div className="px-4 py-3 grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-2 px-3 py-3 rounded-md text-sm font-bold transition ${
                    isActive
                      ? "text-myscheme-green bg-green-50 dark:bg-gray-800"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
