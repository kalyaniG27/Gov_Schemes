import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import FloatingVoiceButton from "./components/FloatingVoiceButton";

// Pages
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import EligibilityForm from "./pages/EligibilityForm";
import SchemeExplorer from "./pages/SchemeExplorer";
import SchemeDetails from "./pages/SchemeDetails";
import AdminPanel from "./pages/AdminPanel";

// Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import { LanguageProvider } from "./hooks/useLanguage";

// 🔊 Unlock Speech Synthesis Autoplay Restriction (important)
document.addEventListener(
  "click",
  () => {
    try {
      window.speechSynthesis.resume();
      console.log("🔊 Speech synthesis unlocked by user interaction");
    } catch (error) {
      console.warn("Speech unlock failed:", error);
    }
  },
  { once: true }
);

function App() {
  return (
    <Router>
      <LanguageProvider>
        <div className="flex flex-col min-h-screen bg-neutral-50">
          <Header />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/eligibility" element={<EligibilityForm />} />
                <Route path="/schemes" element={<SchemeExplorer />} />
                <Route path="/schemes/:id" element={<SchemeDetails />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedAdminRoute>
                      <AdminPanel />
                    </ProtectedAdminRoute>
                  }
                />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
          <FloatingVoiceButton /> {/* 🎤 Floating mic button */}
        </div>
      </LanguageProvider>
    </Router>
  );
}

export default App;
