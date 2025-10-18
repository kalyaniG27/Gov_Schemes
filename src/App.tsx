import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import EligibilityForm from './pages/EligibilityForm';
import SchemeExplorer from './pages/SchemeExplorer';
import SchemeDetails from './pages/SchemeDetails';
import AdminPanel from './pages/AdminPanel';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import VoiceCallButton from './components/VoiceCallButton.tsx';

function App() {
  return (
    <Router>
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
        {/* This will add the floating call button to all pages */}
        <VoiceCallButton />
      </div>
    </Router>
  );
}

export default App;