import React, { Suspense, lazy } from 'react';
import { FoundationProvider, useFoundation } from './context/FoundationContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StatCounter } from './components/StatCounter';
import { MainDashboardQuickPortal } from './components/MainDashboardQuickPortal';
import { AboutSection } from './components/AboutSection';
import { TimelineSection } from './components/TimelineSection';
import { ProgramsSection } from './components/ProgramsSection';
import { AIFeatureShowcase } from './components/AIFeatureShowcase';
import { GallerySection } from './components/GallerySection';
import { PressSection } from './components/PressSection';
import { NoticeSection } from './components/NoticeSection';
import { FamilyCenterSection } from './components/FamilyCenterSection';
import { DonateSection } from './components/DonateSection';
import { LocationSection } from './components/LocationSection';
import { NoticeDetailPage } from './components/NoticeDetailPage';
import { GalleryDetailPage } from './components/GalleryDetailPage';
import { ProgramDetailPage } from './components/ProgramDetailPage';
import { Footer } from './components/Footer';
import { NewsletterSection } from './components/NewsletterSection';
import { FloatingQuickMenu } from './components/FloatingQuickMenu';
import { ModalViewer } from './components/ModalViewer';
import { PopupModal } from './components/PopupModal';
import { SyncErrorBanner } from './components/SyncErrorBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsPage } from './components/TermsPage';

// BUNDLE SIZE (2026 audit follow-up): AdminModal.tsx pulls in the exceljs
// export library and a large amount of admin-only UI/logic that ordinary
// visitors never touch. It used to be mounted unconditionally (just
// internally returning null when closed), so every visitor downloaded
// and parsed that whole chunk before ever seeing the homepage. It's now
// loaded on demand — only once the admin actually opens the panel — via
// a separate code-split chunk. `isAdmin` itself is tracked in
// FoundationContext (not inside AdminModal) precisely so this lazy split
// doesn't delay that from being accurate.
const AdminModal = lazy(() =>
  import('./components/AdminModal').then((m) => ({ default: m.AdminModal }))
);

const MainContent: React.FC = () => {
  const { activeTab } = useFoundation();

  return (
    <main className="min-h-screen">
      {activeTab === 'main' && (
        <>
          <Hero />
          <StatCounter />
          <MainDashboardQuickPortal />
        </>
      )}

      {activeTab === 'about' && (
        <div className="pt-4">
          <AboutSection />
          <TimelineSection />
        </div>
      )}

      {activeTab === 'programs' && (
        <div className="pt-4">
          <ProgramsSection />
          <AIFeatureShowcase />
        </div>
      )}

      {activeTab === 'news' && (
        <div className="pt-4">
          <NoticeSection />
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="pt-4">
          <GallerySection />
        </div>
      )}

      {activeTab === 'press' && (
        <div className="pt-4">
          <PressSection />
        </div>
      )}

      {activeTab === 'family-center' && (
        <div className="pt-4">
          <FamilyCenterSection />
        </div>
      )}

      {activeTab === 'donate' && (
        <div className="pt-4">
          <DonateSection />
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="pt-4">
          <LocationSection />
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="pt-4">
          <PrivacyPolicyPage />
        </div>
      )}

      {activeTab === 'terms' && (
        <div className="pt-4">
          <TermsPage />
        </div>
      )}

      {activeTab === 'notice-detail' && (
        <NoticeDetailPage />
      )}

      {activeTab === 'gallery-detail' && (
        <GalleryDetailPage />
      )}

      {activeTab === 'program-detail' && (
        <ProgramDetailPage />
      )}
    </main>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <FoundationProvider>
        <div className="min-h-screen flex flex-col bg-[#FFFDF8] text-slate-800 selection:bg-orange-500 selection:text-white">
          <Header />
          <MainContent />
          <NewsletterSection />
          <Footer />
          <FloatingQuickMenu />
          <ModalViewer />
          <AdminModalGate />
          <PopupModal />
          <SyncErrorBanner />
        </div>
      </FoundationProvider>
    </ErrorBoundary>
  );
}

// Only mount (and therefore only download) the AdminModal chunk once the
// admin actually opens the panel. Rendering it unconditionally here would
// trigger the lazy import() immediately on every page load regardless of
// `adminOpen`, defeating the point of the code-split.
const AdminModalGate: React.FC = () => {
  const { adminOpen } = useFoundation();
  if (!adminOpen) return null;
  return (
    <Suspense fallback={null}>
      <AdminModal />
    </Suspense>
  );
};
