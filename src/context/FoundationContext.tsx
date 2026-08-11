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
  
  // Programs CRUD
  addProgram: (program: Omit<ProgramItem, 'id' | 'code'>) => void;
  updateProgram: (id: string, program: Partial<ProgramItem>) => void;
  deleteProgram: (id: string) => void;

  // Notices CRUD
  addNotice: (notice: Omit<NoticeItem, 'id' | 'views' | 'date'>) => void;
  updateNotice: (id: string, notice: Partial<NoticeItem>) => void;
  deleteNotice: (id: string) => void;

  // Gallery CRUD
  addGallery: (item: Omit<GalleryItem, 'id' | 'date'>) => void;
  updateGallery: (id: string, item: Partial<GalleryItem>) => void;
  deleteGallery: (id: string) => void;

  // Donations CRUD
  addDonation: (donation: Omit<DonationApplication, 'id' | 'createdAt' | 'status'>) => void;
  updateDonationStatus: (id: string, status: '접수완료' | '확인중' | '처리완료') => void;
  deleteDonation: (id: string) => void;

  // Inquiries CRUD
  addInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) => void;
  updateInquiryStatus: (id: string, status: '대기중' | '답변완료') => void;
  deleteInquiry: (id: string) => void;

  // Other Settings
  updateSettings: (newSettings: Partial<FoundationSettings>) => void;
  resetToDefaults: () => void;
  incrementNoticeViews: (id: string) => void;
}

const FoundationContext = createContext<FoundationContextType | undefined>(undefined);

export const FoundationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<FoundationSettings>(() => {
    const saved = localStorage.getItem('nerve_nae_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          phone: (parsed.phone === '033-436-1926' || parsed.phone === '033-436-1925') ? '033-433-1925' : (parsed.phone || '033-433-1925'),
          fax: parsed.fax === '033-436-1910' ? '033-433-1910' : (parsed.fax || '033-433-1910'),
        };
      } catch {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  const [timeline] = useState<TimelineItem[]>(INITIAL_TIMELINE);

  const [programs, setPrograms] = useState<ProgramItem[]>(() => {
    const saved = localStorage.getItem('nerve_nae_programs');
    return saved ? JSON.parse(saved) : INITIAL_PROGRAMS;
  });

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

  // Sync to local storage with safe error handling
  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_programs', JSON.stringify(programs));
    } catch (e) {
      console.warn('Failed to save programs to localStorage', e);
    }
  }, [programs]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_notices', JSON.stringify(notices));
    } catch (e) {
      console.warn('Failed to save notices to localStorage', e);
    }
  }, [notices]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_gallery', JSON.stringify(gallery));
    } catch (e) {
      console.warn('Failed to save gallery to localStorage', e);
    }
  }, [gallery]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_donations', JSON.stringify(donations));
    } catch (e) {
      console.warn('Failed to save donations to localStorage', e);
    }
  }, [donations]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_inquiries', JSON.stringify(inquiries));
    } catch (e) {
      console.warn('Failed to save inquiries to localStorage', e);
    }
  }, [inquiries]);

  // Program CRUD
  const addProgram = (item: Omit<ProgramItem, 'id' | 'code'>) => {
    const nextCode = String(programs.length + 1).padStart(2, '0');
    const newProgram: ProgramItem = {
      ...item,
      id: `prg-${Date.now()}`,
      code: nextCode
    };
    setPrograms(prev => [...prev, newProgram]);
  };

  const updateProgram = (id: string, updated: Partial<ProgramItem>) => {
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const deleteProgram = (id: string) => {
    setPrograms(prev => prev.filter(p => p.id !== id));
  };

  // Notice CRUD
  const addNotice = (item: Omit<NoticeItem, 'id' | 'views' | 'date'>) => {
    const newNotice: NoticeItem = {
      ...item,
      id: `not-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      views: 1
    };
    setNotices(prev => [newNotice, ...prev]);
  };

  const updateNotice = (id: string, updated: Partial<NoticeItem>) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, ...updated } : n));
  };

  const deleteNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  // Gallery CRUD
  const addGallery = (item: Omit<GalleryItem, 'id' | 'date'>) => {
    const newGallery: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setGallery(prev => [newGallery, ...prev]);
  };

  const updateGallery = (id: string, updated: Partial<GalleryItem>) => {
    setGallery(prev => prev.map(g => g.id === id ? { ...g, ...updated } : g));
  };

  const deleteGallery = (id: string) => {
    setGallery(prev => prev.filter(g => g.id !== id));
  };

  // Donations CRUD
  const addDonation = (item: Omit<DonationApplication, 'id' | 'createdAt' | 'status'>) => {
    const newDonation: DonationApplication = {
      ...item,
      id: `don-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: '접수완료'
    };
    setDonations(prev => [newDonation, ...prev]);
  };

  const updateDonationStatus = (id: string, status: '접수완료' | '확인중' | '처리완료') => {
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  const deleteDonation = (id: string) => {
    setDonations(prev => prev.filter(d => d.id !== id));
  };

  // Inquiries CRUD
  const addInquiry = (item: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInquiry: ContactInquiry = {
      ...item,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: '대기중'
    };
    setInquiries(prev => [newInquiry, ...prev]);
  };

  const updateInquiryStatus = (id: string, status: '대기중' | '답변완료') => {
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const deleteInquiry = (id: string) => {
    setInquiries(prev => prev.filter(i => i.id !== id));
  };

  const updateSettings = (newSettings: Partial<FoundationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    setSettings(INITIAL_SETTINGS);
    setPrograms(INITIAL_PROGRAMS);
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

        // Programs CRUD
        addProgram,
        updateProgram,
        deleteProgram,

        // Notices CRUD
        addNotice,
        updateNotice,
        deleteNotice,

        // Gallery CRUD
        addGallery,
        updateGallery,
        deleteGallery,

        // Donations CRUD
        addDonation,
        updateDonationStatus,
        deleteDonation,

        // Inquiries CRUD
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,

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
