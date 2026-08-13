import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  FoundationSettings,
  TimelineItem,
  ProgramItem,
  NoticeItem,
  GalleryItem,
  DonationApplication,
  ContactInquiry,
  NewsletterSubscriber,
  ActiveTab,
  AboutSubTab
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_TIMELINE,
  INITIAL_PROGRAMS,
  INITIAL_NOTICES,
  INITIAL_GALLERY,
  INITIAL_DONATIONS
} from '../data/initialData';

interface FoundationContextType {
  settings: FoundationSettings;
  timeline: TimelineItem[];
  programs: ProgramItem[];
  notices: NoticeItem[];
  gallery: GalleryItem[];
  donations: DonationApplication[];
  inquiries: ContactInquiry[];
  subscribers: NewsletterSubscriber[];
  hasNewDonation: boolean;
  pendingDonationsCount: number;
  markDonationsAsRead: () => void;
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
  previousTab: ActiveTab;
  goBackFromDetail: (fallbackTab?: ActiveTab) => void;
  viewNoticeDetail: (notice: NoticeItem) => void;
  viewGalleryDetail: (gallery: GalleryItem) => void;
  viewProgramDetail: (program: ProgramItem) => void;
  
  // Programs CRUD
  addProgram: (program: Omit<ProgramItem, 'id' | 'code'>) => void;
  updateProgram: (id: string, program: Partial<ProgramItem>) => void;
  deleteProgram: (id: string) => void;

  // Notices CRUD
  addNotice: (notice: Omit<NoticeItem, 'id' | 'views' | 'date'> & { date?: string }) => void;
  updateNotice: (id: string, notice: Partial<NoticeItem>) => void;
  deleteNotice: (id: string) => void;

  // Gallery CRUD
  addGallery: (item: Omit<GalleryItem, 'id' | 'date'> & { date?: string; author?: string; isProtected?: boolean }) => void;
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

  // Subscribers CRUD
  addSubscriber: (email: string) => void;
  updateSubscriberStatus: (id: string, status: '구독중' | '해지') => void;
  deleteSubscriber: (id: string) => void;

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
        let bankAccounts = parsed.bankAccounts;
        if (
          !bankAccounts ||
          !Array.isArray(bankAccounts) ||
          bankAccounts.length < 2 ||
          !bankAccounts.some((acc: any) => (acc.bank || acc.bankName || '').includes('신한')) ||
          bankAccounts.some((acc: any) =>
            !acc.accountNumber ||
            acc.accountNumber.includes('관리자') ||
            acc.accountNumber.includes('필요') ||
            acc.accountNumber.includes('계좌번호') ||
            acc.accountNumber.includes('[') ||
            acc.accountNumber.includes('관리지')
          )
        ) {
          bankAccounts = [
            { bank: '농협', accountNumber: '351-1040-2310-53', holder: '(사)너브내행복나눔재단' },
            { bank: '신한은행', accountNumber: '100-026-882834', holder: '(사)너브내행복나눔재단' }
          ];
        } else {
          bankAccounts = bankAccounts.map((acc: any) => {
            let cleanNumber = (acc.accountNumber || '')
              .replace(/\[.*?\]/g, '')
              .replace(/관리자/g, '')
              .replace(/입력/g, '')
              .replace(/필요/g, '')
              .replace(/계좌번호/g, '')
              .trim();
            if (acc.bank?.includes('농협') && cleanNumber.length < 5) {
              cleanNumber = '351-1040-2310-53';
            }
            if (acc.bank?.includes('신한') && cleanNumber.length < 5) {
              cleanNumber = '100-026-882834';
            }
            return {
              ...acc,
              accountNumber: cleanNumber || '351-1040-2310-53',
              holder: acc.holder || '(사)너브내행복나눔재단'
            };
          });
        }
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          heroImageUrl: parsed.heroImageUrl || INITIAL_SETTINGS.heroImageUrl,
          chairmanImageUrl: parsed.chairmanImageUrl || INITIAL_SETTINGS.chairmanImageUrl,
          bankAccounts,
          phone: (parsed.phone && parsed.phone.includes('033-433')) ? '033-436-1925' : (parsed.phone || '033-436-1925'),
          fax: (parsed.fax && parsed.fax.includes('033-433')) ? '033-436-1910' : (parsed.fax || '033-436-1910'),
          familyCenterPhone: parsed.familyCenterPhone || '033-433-1925',
          familyCenterFax: parsed.familyCenterFax || '033-433-1910',
        };
      } catch {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  const [timeline] = useState<TimelineItem[]>(() => {
    return [...INITIAL_TIMELINE].sort((a, b) => {
      const yearA = parseInt(a.year.match(/\d{4}/)?.[0] || '0', 10);
      const yearB = parseInt(b.year.match(/\d{4}/)?.[0] || '0', 10);
      return yearB - yearA;
    });
  });

  const [programs, setPrograms] = useState<ProgramItem[]>(() => {
    const saved = localStorage.getItem('nerve_nae_programs');
    if (saved) {
      try {
        const parsed: ProgramItem[] = JSON.parse(saved);
        return parsed.map(p => {
          if (p.code === '06' || p.id === 'prog-06' || p.title.includes('AI') || p.title.includes('디지털')) {
            const latest06 = INITIAL_PROGRAMS.find(item => item.code === '06');
            if (latest06) return latest06;
          }
          return p;
        });
      } catch (e) {
        console.error('Failed to parse saved programs', e);
      }
    }
    return INITIAL_PROGRAMS;
  });

  const [notices, setNotices] = useState<NoticeItem[]>(() => {
    const saved = localStorage.getItem('nerve_nae_notices');
    if (saved) {
      try {
        const parsed: NoticeItem[] = JSON.parse(saved);
        return parsed.map(n => {
          if (n.id === 'not-04') {
            const latestNot04 = INITIAL_NOTICES.find(item => item.id === 'not-04');
            if (latestNot04) return latestNot04;
          }
          return n;
        });
      } catch (e) {
        console.error('Failed to parse saved notices', e);
      }
    }
    return INITIAL_NOTICES;
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('nerve_nae_gallery');
    const list: GalleryItem[] = saved ? JSON.parse(saved) : INITIAL_GALLERY;
    return list.map(g => {
      if (g.id === 'gal-06') {
        const latestGal06 = INITIAL_GALLERY.find(item => item.id === 'gal-06');
        if (latestGal06) return latestGal06;
      }
      return {
        ...g,
        author: g.author || '재단 관리자',
        isProtected: g.isProtected ?? true
      };
    });
  });

  const [donations, setDonations] = useState<DonationApplication[]>(() => {
    const saved = localStorage.getItem('nerve_nae_donations');
    return saved ? JSON.parse(saved) : INITIAL_DONATIONS;
  });

  const pendingDonationsCount = donations.filter(d => d.status === '접수완료').length;
  const hasNewDonation = pendingDonationsCount > 0;

  const markDonationsAsRead = () => {
    setDonations(prev => prev.map(d => d.status === '접수완료' ? { ...d, status: '확인중' } : d));
  };

  const [inquiries, setInquiries] = useState<ContactInquiry[]>(() => {
    const saved = localStorage.getItem('nerve_nae_inquiries');
    return saved ? JSON.parse(saved) : [];
  });

  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(() => {
    const saved = localStorage.getItem('nerve_nae_subscribers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      { id: 'sub-1', email: 'nerve_nae_fan@naver.com', subscribedAt: '2026-08-01 10:30', status: '구독중' },
      { id: 'sub-2', email: 'hongcheon_love@gmail.com', subscribedAt: '2026-08-05 14:15', status: '구독중' }
    ];
  });

  const [activeTab, setActiveTabState] = useState<ActiveTab>('main');
  const [previousTab, setPreviousTab] = useState<ActiveTab>('main');
  const [aboutSubTab, setAboutSubTab] = useState<AboutSubTab>('greeting');
  const [adminOpen, setAdminOpen] = useState<boolean>(false);

  const [selectedProgram, setSelectedProgram] = useState<ProgramItem | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(null);

  const setActiveTab = (tab: ActiveTab) => {
    if (tab !== 'program-detail') {
      setSelectedProgram(null);
    }
    if (tab !== 'notice-detail') {
      setSelectedNotice(null);
    }
    if (tab !== 'gallery-detail') {
      setSelectedGallery(null);
    }
    setActiveTabState(tab);
  };

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

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_subscribers', JSON.stringify(subscribers));
    } catch (e) {
      console.warn('Failed to save subscribers to localStorage', e);
    }
  }, [subscribers]);

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
  const addNotice = (item: Omit<NoticeItem, 'id' | 'views' | 'date'> & { date?: string }) => {
    const newNotice: NoticeItem = {
      ...item,
      id: `not-${Date.now()}`,
      date: item.date || new Date().toISOString().split('T')[0],
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
  const addGallery = (item: Omit<GalleryItem, 'id' | 'date'> & { date?: string; author?: string; isProtected?: boolean }) => {
    const newGallery: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
      date: item.date || new Date().toISOString().split('T')[0],
      author: item.author || '재단 관리자',
      isProtected: item.isProtected ?? true
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

  // Subscribers CRUD
  const addSubscriber = (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) return;
    const existing = subscribers.find(s => s.email.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      if (existing.status === '해지') {
        setSubscribers(prev => prev.map(s => s.id === existing.id ? { ...s, status: '구독중', subscribedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) } : s));
      }
      return;
    }
    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email: trimmed,
      subscribedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: '구독중'
    };
    setSubscribers(prev => [newSub, ...prev]);
  };

  const updateSubscriberStatus = (id: string, status: '구독중' | '해지') => {
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const deleteSubscriber = (id: string) => {
    setSubscribers(prev => prev.filter(s => s.id !== id));
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
    setSubscribers([]);
    localStorage.clear();
  };

  const incrementNoticeViews = (id: string) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, views: n.views + 1 } : n));
  };

  const goBackFromDetail = (fallbackTab: ActiveTab = 'news') => {
    setSelectedNotice(null);
    setSelectedGallery(null);
    setSelectedProgram(null);
    const targetTab = (previousTab && !['notice-detail', 'gallery-detail', 'program-detail'].includes(previousTab))
      ? previousTab
      : fallbackTab;
    setActiveTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewNoticeDetail = (notice: NoticeItem) => {
    if (!['notice-detail', 'gallery-detail', 'program-detail'].includes(activeTab)) {
      setPreviousTab(activeTab);
    }
    incrementNoticeViews(notice.id);
    setSelectedNotice(notice);
    setActiveTab('notice-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewGalleryDetail = (item: GalleryItem) => {
    if (!['notice-detail', 'gallery-detail', 'program-detail'].includes(activeTab)) {
      setPreviousTab(activeTab);
    }
    setSelectedGallery(item);
    setActiveTab('gallery-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewProgramDetail = (program: ProgramItem) => {
    if (!['notice-detail', 'gallery-detail', 'program-detail'].includes(activeTab)) {
      setPreviousTab(activeTab);
    }
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
        hasNewDonation,
        pendingDonationsCount,
        markDonationsAsRead,
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
        previousTab,
        goBackFromDetail,
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

        // Subscribers CRUD
        subscribers,
        addSubscriber,
        updateSubscriberStatus,
        deleteSubscriber,

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
