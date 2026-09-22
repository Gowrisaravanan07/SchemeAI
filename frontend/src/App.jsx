import React, { useState } from "react";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { CitizenProvider } from "./context/CitizenContext";
import { WishlistProvider } from "./context/WishlistContext";
import HeaderNavbar from "./components/HeaderNavbar";
import HomeView from "./pages/HomeView";
import ScreeningWizard from "./components/ScreeningWizard";
import ScreeningResults from "./components/ScreeningResults";
import AllSchemesView from "./pages/AllSchemesView";
import AgentChatPage from "./pages/AgentChatPage";
import EvaluationDashboard from "./pages/EvaluationDashboard";
import AdminSchemesPage from "./pages/AdminSchemesPage";
import SchemeDetailPage from "./pages/SchemeDetailPage";
import SchemeDetailsModal from "./components/SchemeDetailsModal";
import WishlistPage from "./pages/WishlistPage";
import NearbyMapPage from "./pages/NearbyMapPage";
import ToolsPage from "./pages/ToolsPage";
import DocumentAnalyzerPage from "./pages/DocumentAnalyzerPage";
import CompareSchemesPage from "./pages/CompareSchemesPage";
import ApplicationPreparation from "./pages/ApplicationPreparation";
import ApplicationLifecycleTracker from "./pages/ApplicationLifecycleTracker";
import { evaluateCitizenEligibility } from "./services/api";

function MainApp() {
  const { language, t } = useLanguage();
  const [activeView, setActiveView] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSchemeForDetail, setSelectedSchemeForDetail] = useState(null);
  const [userProfile, setUserProfile] = useState(() => {
    try { const s = localStorage.getItem("civicai_user_profile"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [screeningData, setScreeningData] = useState(() => {
    try { const s = localStorage.getItem("civicai_screening_data"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeModalScheme, setActiveModalScheme] = useState(null);
  const [chatSchemeContext, setChatSchemeContext] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const switchView = (view) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScreeningSubmit = async (formData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setUserProfile(formData);
    try {
      localStorage.setItem("civicai_user_profile", JSON.stringify(formData));
      const result = await evaluateCitizenEligibility(formData);
      setScreeningData(result);
      try { localStorage.setItem("civicai_screening_data", JSON.stringify(result)); } catch {}
      switchView("results");
    } catch (err) {
      setErrorMessage(err.message || "Failed to evaluate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetails = (scheme) => {
    setSelectedSchemeForDetail(scheme);
    switchView("scheme_detail");
  };
  const handleCloseDetails = () => setActiveModalScheme(null);
  const handleAskAI = (scheme) => {
    setChatSchemeContext(scheme);
    switchView("chat");
  };

  const renderView = () => {
    switch (activeView) {
      case "home":
        return <HomeView setActiveView={switchView} />;
      case "wizard":
        return (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <ScreeningWizard onSubmit={handleScreeningSubmit} isLoading={isLoading} error={errorMessage} />
          </div>
        );
      case "results":
        return screeningData ? (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <ScreeningResults
              data={screeningData}
              userProfile={userProfile}
              onOpenDetails={handleOpenDetails}
              onAskAI={handleAskAI}
              onReset={() => { setScreeningData(null); setUserProfile(null); switchView("wizard"); }}
              onViewAllSchemes={(cat) => { setSelectedCategory(cat || "All"); switchView("all_schemes"); }}
            />
          </div>
        ) : <HomeView setActiveView={switchView} />;
      case "all_schemes":
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <AllSchemesView
              initialCategory={selectedCategory}
              onOpenDetails={handleOpenDetails}
              onSelectScheme={handleOpenDetails}
              onAskAI={handleAskAI}
              userProfile={userProfile}
            />
          </div>
        );
      case "scheme_detail":
        return (
          <SchemeDetailPage
            scheme={selectedSchemeForDetail}
            onBack={() => switchView("all_schemes")}
            onAskAI={handleAskAI}
            onNavigate={switchView}
          />
        );
      case "chat":
        return (
          <div className="max-w-5xl mx-auto px-4 py-8">
            <AgentChatPage 
              activeScheme={chatSchemeContext} 
              onClearActiveScheme={() => setChatSchemeContext(null)} 
              onNavigate={switchView}
            />
          </div>
        );
      case "wishlist":
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <WishlistPage onOpenDetails={handleOpenDetails} onAskAI={handleAskAI} setActiveView={switchView} />
          </div>
        );
      case "map":
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <NearbyMapPage />
          </div>
        );
      case "tools":
        return (
          <div className="max-w-5xl mx-auto px-4 py-8">
            <ToolsPage />
          </div>
        );
      case "doc_analyzer":
        return (
          <div className="max-w-5xl mx-auto px-4 py-8">
            <DocumentAnalyzerPage onOpenDetails={handleOpenDetails} />
          </div>
        );
      case "compare":
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <CompareSchemesPage onOpenDetails={handleOpenDetails} />
          </div>
        );
      case "evaluation":
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <EvaluationDashboard />
          </div>
        );
      case "app_prep":
        return (
          <div className="max-w-5xl mx-auto px-4 py-8">
            <ApplicationPreparation 
              scheme={chatSchemeContext}
              userProfile={userProfile}
              onBack={() => switchView("chat")}
              onApplicationReady={() => switchView("app_tracker")}
            />
          </div>
        );
      case "app_tracker":
        return (
          <div className="max-w-5xl mx-auto px-4 py-8">
            <ApplicationLifecycleTracker 
              scheme={chatSchemeContext}
              currentStep={6} // Set to 6 to simulate submitted state after prep
              onBack={() => switchView("app_prep")}
            />
          </div>
        );
      case "admin":
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <AdminSchemesPage />
          </div>
        );
      default:
        return <HomeView setActiveView={switchView} />;
    }
  };

  return (
    <div className="min-h-screen mesh-bg">
      <HeaderNavbar activeView={activeView} setActiveView={switchView} />
      <main>
        {renderView()}
      </main>
      {activeModalScheme && (
        <SchemeDetailsModal
          scheme={activeModalScheme}
          onClose={handleCloseDetails}
          onAskAI={handleAskAI}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <CitizenProvider>
        <WishlistProvider>
          <MainApp />
        </WishlistProvider>
      </CitizenProvider>
    </LanguageProvider>
  );
}
