import React from 'react';
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
import { AdminModal } from './components/AdminModal';
import { PopupModal } from './components/PopupModal';
import { SyncDebugOverlay } from './components/SyncDebugOverlay';

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
    <FoundationProvider>
      <div className="min-h-screen flex flex-col bg-[#FFFDF8] text-slate-800 selection:bg-orange-500 selection:text-white">
        <Header />
        <MainContent />
        <NewsletterSection />
        <Footer />
        <FloatingQuickMenu />
        <ModalViewer />
        <AdminModal />
        <PopupModal />
        <SyncDebugOverlay />
      </div>
    </FoundationProvider>
  );
}
