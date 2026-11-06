import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { EmergencyBanner } from './components/EmergencyBanner.js';
import { CompatibilityMatrixModal } from './components/CompatibilityMatrixModal.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { AboutPage } from './pages/AboutPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { SearchDonorsPage } from './pages/SearchDonorsPage.js';
import { BloodRequestFormPage } from './pages/BloodRequestFormPage.js';
import { RequestStatusPage } from './pages/RequestStatusPage.js';
import { DonationHistoryPage } from './pages/DonationHistoryPage.js';
import { UserProfilePage } from './pages/UserProfilePage.js';
import { ContactPage } from './pages/ContactPage.js';

// Dashboards
import { DonorDashboard } from './dashboards/DonorDashboard.js';
import { RequesterDashboard } from './dashboards/RequesterDashboard.js';
import { AdminDashboard } from './dashboards/AdminDashboard.js';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'home';
  });

  const [compatibilityModalOpen, setCompatibilityModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentPage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} onOpenCompatibility={() => setCompatibilityModalOpen(true)} />;
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'register':
        return <RegisterPage onNavigate={navigate} />;
      case 'donors':
        return <SearchDonorsPage onOpenCompatibility={() => setCompatibilityModalOpen(true)} />;
      case 'request-blood':
        return <BloodRequestFormPage onNavigate={navigate} />;
      case 'requests':
        return <RequestStatusPage onNavigate={navigate} />;
      case 'donor-dashboard':
        return <DonorDashboard onNavigate={navigate} />;
      case 'requester-dashboard':
        return <RequesterDashboard onNavigate={navigate} />;
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={navigate} />;
      case 'history':
        return <DonationHistoryPage onNavigate={navigate} />;
      case 'profile':
        return <UserProfilePage onNavigate={navigate} />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage onNavigate={navigate} onOpenCompatibility={() => setCompatibilityModalOpen(true)} />;
    }
  };

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-red-500 selection:text-white">
          {/* Active Emergency Broadcast Banner */}
          <EmergencyBanner onNavigate={navigate} />

          {/* Top Bar Contract Navbar */}
          <Navbar
            currentPage={currentPage}
            onNavigate={navigate}
            onOpenCompatibility={() => setCompatibilityModalOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1">
            {renderContent()}
          </main>

          {/* Footer */}
          <Footer
            onNavigate={navigate}
            onOpenCompatibility={() => setCompatibilityModalOpen(true)}
          />

          {/* Global Blood Group Compatibility Matrix Modal */}
          <CompatibilityMatrixModal
            isOpen={compatibilityModalOpen}
            onClose={() => setCompatibilityModalOpen(false)}
          />
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}
