import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, BarChart3, Database, Search, Menu, X, Globe, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check initial dark mode preference
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
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

  const navLinks = [
    { name: 'AI Assistant', href: '/agent', icon: Bot },
    { name: 'Find Schemes For You', href: '/schemes', highlight: true },
    { name: 'Eligibility', href: '/matching' },
    { name: 'Applications', href: '/applications' },
    { name: 'Admin', href: '/admin', icon: Database }
  ];

  return (
    <>
      {/* Top Gov Bar */}
      <div className="bg-white dark:bg-myscheme-dark border-b border-gray-100 dark:border-gray-800 text-xs py-1 px-4 sm:px-6 flex justify-between items-center z-50 relative">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <span>GOVERNMENT OF INDIA</span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-myscheme-green">Skip to main content</a>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`w-full z-40 transition-all duration-300 bg-white dark:bg-myscheme-dark shadow-sm ${
        isScrolled ? 'fixed top-0 shadow-md' : 'relative'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-myscheme-green dark:text-white flex items-center">
                  myScheme<span className="text-sm font-mono bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-1 py-0.5 rounded ml-1">AI</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                      isActive 
                        ? 'text-myscheme-green dark:text-white bg-green-50 dark:bg-gray-800' 
                        : item.highlight
                        ? 'bg-myscheme-green text-white hover:bg-myscheme-primaryHover shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:text-myscheme-green hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center space-x-4 border-l border-gray-200 dark:border-gray-700 pl-4">
              <button className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-myscheme-green">
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium">English</span>
              </button>
              
              <button 
                onClick={toggleDarkMode}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button className="px-5 py-2 text-sm font-medium text-white bg-myscheme-green hover:bg-myscheme-primaryHover rounded-md transition-colors shadow-sm">
                Sign In
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-2">
              <button 
                onClick={toggleDarkMode}
                className="p-2 text-gray-700 dark:text-gray-300"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-myscheme-dark border-t border-gray-200 dark:border-gray-800 px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === item.href
                    ? 'text-myscheme-green bg-green-50 dark:bg-gray-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col space-y-2">
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300">
                <Globe className="w-5 h-5" />
                <span>English</span>
              </button>
              <button className="w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-myscheme-green hover:bg-myscheme-primaryHover">
                Sign In
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
