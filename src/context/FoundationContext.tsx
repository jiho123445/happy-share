import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  FoundationSettings,
  TimelineItem,
  ProgramItem,
  NoticeItem,
  GalleryItem,
  DonationApplication,
  ContactInquiry,
  ActiveTab,
  AboutSubTab
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_TIMELINE,
  INITIAL_PROGRAMS,
  INITIAL_NOTICES,
  INITIAL_GALLERY
} from '../data/initialData';

interface FoundationContextType {
  settings: FoundationSettings;
  timeline: TimelineItem[];
  programs: ProgramItem[];
  notices: NoticeItem[];
  gallery: GalleryItem[];
  donations: DonationApplication[];
  inquiries: ContactInquiry[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  aboutSubTab: AboutSubTab;
  setAboutSubTab: (tab: AboutSubTab) => void;
  adminOpen: boolean;
  setAdminOpen: (open: boolean) => void;
  
  // Modal & Page selections
  selectedProgram: ProgramItem | null;
  setSelectedProgram: (program: ProgramItem | null) => void;
  selectedNotice: NoticeItem | null;
  setSelectedNotice: (notice: NoticeItem | null) => void;
  selectedGallery: GalleryItem | null;
  setSelectedGallery: (gallery: GalleryItem | null) => void;
  
  // Navigation View Helpers
  viewNoticeDetail: (notice: NoticeItem) => void;
  viewGalleryDetail: (gallery: GalleryItem) => void;
  viewProgramDetail: (program: ProgramItem) => void;
  
  // Actions
  addNotice: (notice: Omit<NoticeItem, 'id' | 'views' | 'date'>) => void;
  deleteNotice: (id: string) => void;
  addGallery: (item: Omit<GalleryItem, 'id' | 'date'>) => void;
  deleteGallery: (id: string) => void;
  addDonation: (donation: Omit<DonationApplication, 'id' | 'createdAt' | 'status'>) => void;
  addInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) => void;
  updateSettings: (newSettings: Partial<FoundationSettings>) => void;
  resetToDefaults: () => void;
  incrementNoticeViews: (id: string) => void;
}

const FoundationContext = createContext<FoundationContextType | undefined>(undefined);

export const FoundationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<FoundationSettings>(() => {
    const saved = localStorage.getItem('nerve_nae_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [timeline] = useState<TimelineItem[]>(INITIAL_TIMELINE);
  const [programs] = useState<ProgramItem[]>(INITIAL_PROGRAMS);

  const [notices, setNotices] = useState<NoticeItem[]>(() => {
    const saved = localStorage.getItem('nerve_nae_notices');
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('nerve_nae_gallery');
    return saved ? JSON.parse(saved) : INITIAL_GALLERY;
  });

  const [donations, setDonations] = useState<DonationApplication[]>(() => {
    const saved = localStorage.getItem('nerve_nae_donations');
    return saved ? JSON.parse(saved) : [];
  });

  const [inquiries, setInquiries] = useState<ContactInquiry[]>(() => {
    const saved = localStorage.getItem('nerve_nae_inquiries');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('main');
  const [aboutSubTab, setAboutSubTab] = useState<AboutSubTab>('greeting');
  const [adminOpen, setAdminOpen] = useState<boolean>(false);

  const [selectedProgram, setSelectedProgram] = useState<ProgramItem | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('nerve_nae_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('nerve_nae_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('nerve_nae_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem('nerve_nae_donations', JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem('nerve_nae_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  const addNotice = (item: Omit<NoticeItem, 'id' | 'views' | 'date'>) => {
    const newNotice: NoticeItem = {
      ...item,
      id: `not-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      views: 1
    };
    setNotices(prev => [newNotice, ...prev]);
  };

  const deleteNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  const addGallery = (item: Omit<GalleryItem, 'id' | 'date'>) => {
    const newGallery: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setGallery(prev => [newGallery, ...prev]);
  };

  const deleteGallery = (id: string) => {
    setGallery(prev => prev.filter(g => g.id !== id));
  };

  const addDonation = (item: Omit<DonationApplication, 'id' | 'createdAt' | 'status'>) => {
    const newDonation: DonationApplication = {
      ...item,
      id: `don-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: '접수완료'
    };
    setDonations(prev => [newDonation, ...prev]);
  };

  const addInquiry = (item: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInquiry: ContactInquiry = {
      ...item,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: '대기중'
    };
    setInquiries(prev => [newInquiry, ...prev]);
  };

  const updateSettings = (newSettings: Partial<FoundationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    setSettings(INITIAL_SETTINGS);
    setNotices(INITIAL_NOTICES);
    setGallery(INITIAL_GALLERY);
    setDonations([]);
    setInquiries([]);
    localStorage.clear();
  };

  const incrementNoticeViews = (id: string) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, views: n.views + 1 } : n));
  };

  const viewNoticeDetail = (notice: NoticeItem) => {
    incrementNoticeViews(notice.id);
    setSelectedNotice(notice);
    setActiveTab('notice-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewGalleryDetail = (item: GalleryItem) => {
    setSelectedGallery(item);
    setActiveTab('gallery-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewProgramDetail = (program: ProgramItem) => {
    setSelectedProgram(program);
    setActiveTab('program-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <FoundationContext.Provider
      value={{
        settings,
        timeline,
        programs,
        notices,
        gallery,
        donations,
        inquiries,
        activeTab,
        setActiveTab,
        aboutSubTab,
        setAboutSubTab,
        adminOpen,
        setAdminOpen,
        selectedProgram,
        setSelectedProgram,
        selectedNotice,
        setSelectedNotice,
        selectedGallery,
        setSelectedGallery,
        viewNoticeDetail,
        viewGalleryDetail,
        viewProgramDetail,
        addNotice,
        deleteNotice,
        addGallery,
        deleteGallery,
        addDonation,
        addInquiry,
        updateSettings,
        resetToDefaults,
        incrementNoticeViews
      }}
    >
      {children}
    </FoundationContext.Provider>
  );
};

export const useFoundation = () => {
  const context = useContext(FoundationContext);
  if (!context) {
    throw new Error('useFoundation must be used within a FoundationProvider');
  }
  return context;
};
