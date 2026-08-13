import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  AboutSubTab,
  PopupItem
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_TIMELINE,
  INITIAL_PROGRAMS,
  INITIAL_NOTICES,
  INITIAL_GALLERY,
  INITIAL_DONATIONS,
  INITIAL_POPUPS
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
  popups: PopupItem[];
  hasNewDonation: boolean;
  pendingDonationsCount: number;
  markDonationsAsRead: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  aboutSubTab: AboutSubTab;
  setAboutSubTab: (tab: AboutSubTab) => void;
  noticeCategory: string;
  setNoticeCategory: (category: string) => void;
  navigateToNewsCategory: (category?: string) => void;
  adminOpen: boolean;
  setAdminOpen: (open: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  refreshData: () => Promise<void>;
  isSyncing: boolean;
  
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

  // Popups CRUD
  addPopup: (popup: Omit<PopupItem, 'id' | 'createdAt'>) => void;
  updatePopup: (id: string, popup: Partial<PopupItem>) => void;
  deletePopup: (id: string) => void;
  togglePopupActive: (id: string) => void;
  triggerPopupShow: () => void;
  showPopupsFlag: number;

  // Other Settings
  updateSettings: (newSettings: Partial<FoundationSettings>) => void;
  resetToDefaults: () => void;
  incrementNoticeViews: (id: string) => void;
}

const FoundationContext = createContext<FoundationContextType | undefined>(undefined);

// Helper to build URL hash from state
const buildHash = (state: {
  tab: ActiveTab;
  aboutSubTab?: AboutSubTab;
  noticeCategory?: string;
  noticeId?: string;
  programId?: string;
  galleryId?: string;
}): string => {
  const { tab, aboutSubTab, noticeCategory, noticeId, programId, galleryId } = state;
  if (tab === 'notice-detail' && noticeId) {
    return `#notice-detail?id=${encodeURIComponent(noticeId)}`;
  }
  if (tab === 'program-detail' && programId) {
    return `#program-detail?id=${encodeURIComponent(programId)}`;
  }
  if (tab === 'gallery-detail' && galleryId) {
    return `#gallery-detail?id=${encodeURIComponent(galleryId)}`;
  }
  if (tab === 'about') {
    return aboutSubTab && aboutSubTab !== 'greeting'
      ? `#about?sub=${encodeURIComponent(aboutSubTab)}`
      : '#about';
  }
  if (tab === 'news') {
    return noticeCategory && noticeCategory !== '전체'
      ? `#news?cat=${encodeURIComponent(noticeCategory)}`
      : '#news';
  }
  if (tab === 'main') {
    return '#main';
  }
  return `#${tab}`;
};

// Helper to parse URL hash to state
const parseHash = (hashStr: string) => {
  const clean = (hashStr || '').replace(/^#/, '').trim();
  if (!clean || clean === 'main') {
    return { tab: 'main' as ActiveTab };
  }
  const [tabPart, queryPart] = clean.split('?');
  const validTabs: ActiveTab[] = [
    'main',
    'about',
    'programs',
    'news',
    'gallery',
    'family-center',
    'donate',
    'contact',
    'notice-detail',
    'gallery-detail',
    'program-detail'
  ];
  const tab = validTabs.includes(tabPart as ActiveTab) ? (tabPart as ActiveTab) : ('main' as ActiveTab);
  const params = new URLSearchParams(queryPart || '');

  const res: {
    tab: ActiveTab;
    aboutSubTab?: AboutSubTab;
    noticeCategory?: string;
    noticeId?: string;
    programId?: string;
    galleryId?: string;
  } = { tab };

  if (tab === 'notice-detail' && params.get('id')) res.noticeId = params.get('id')!;
  if (tab === 'program-detail' && params.get('id')) res.programId = params.get('id')!;
  if (tab === 'gallery-detail' && params.get('id')) res.galleryId = params.get('id')!;
  if (params.get('sub')) res.aboutSubTab = params.get('sub') as AboutSubTab;
  if (params.get('cat')) res.noticeCategory = params.get('cat')!;

  return res;
};

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
        const loadedAddress = (parsed.address && parsed.address.includes('산림조합길'))
          ? '강원특별자치도 홍천군 홍천읍 송학로3길 26, 2층 (너브내행복나눔재단)'
          : (parsed.address || INITIAL_SETTINGS.address);
        const loadedPhone = (parsed.phone && (parsed.phone.includes('033-433') || parsed.phone.includes('1915')))
          ? '033-436-1925'
          : (parsed.phone || '033-436-1925');
        const loadedEmail = (parsed.email && (parsed.email.includes('example.or.kr') || parsed.email.includes('nerve_nae')))
          ? 'hcdmh1026@naver.com'
          : (parsed.email || 'hcdmh1026@naver.com');

        const loadedChairmanImage = (parsed.chairmanImageUrl && !parsed.chairmanImageUrl.includes('photo-1560250097-0b93528c311a'))
          ? parsed.chairmanImageUrl
          : INITIAL_SETTINGS.chairmanImageUrl;

        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          address: loadedAddress,
          email: loadedEmail,
          heroImageUrl: parsed.heroImageUrl || INITIAL_SETTINGS.heroImageUrl,
          chairmanImageUrl: loadedChairmanImage,
          bankAccounts,
          phone: loadedPhone,
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
    try {
      const saved = localStorage.getItem('nerve_nae_gallery');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((g: GalleryItem) => ({
            ...g,
            author: g.author || '재단 관리자',
            isProtected: g.isProtected ?? true
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached gallery', e);
    }
    return INITIAL_GALLERY;
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

  const [popups, setPopups] = useState<PopupItem[]>(() => {
    const saved = localStorage.getItem('nerve_nae_popups');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: PopupItem) => p.linkUrl === 'donate' ? { ...p, linkUrl: 'news' } : p);
        }
      } catch (e) {
        console.warn('Failed to parse saved popups', e);
      }
    }
    return INITIAL_POPUPS;
  });

  const [showPopupsFlag, setShowPopupsFlag] = useState<number>(1);

  const triggerPopupShow = () => {
    setShowPopupsFlag(prev => prev + 1);
  };

  const initialParsed = parseHash(typeof window !== 'undefined' ? window.location.hash : '');

  const [activeTab, setActiveTabState] = useState<ActiveTab>(initialParsed.tab || 'main');
  const [previousTab, setPreviousTab] = useState<ActiveTab>('main');
  const [aboutSubTab, setAboutSubTab] = useState<AboutSubTab>(initialParsed.aboutSubTab || 'greeting');
  const [noticeCategory, setNoticeCategory] = useState<string>(initialParsed.noticeCategory || '전체');
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [isAdmin, setIsAdminState] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('nerve_nae_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const setIsAdmin = (val: boolean) => {
    setIsAdminState(val);
    try {
      if (val) {
        sessionStorage.setItem('nerve_nae_admin_auth', 'true');
      } else {
        sessionStorage.removeItem('nerve_nae_admin_auth');
      }
    } catch (e) {
      console.warn('Session storage error', e);
    }
  };

  const [selectedProgram, setSelectedProgram] = useState<ProgramItem | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(null);

  const isPopStateRef = useRef<boolean>(false);

  const navigateToNewsCategory = (category: string = '전체') => {
    setNoticeCategory(category);
    setSelectedNotice(null);
    setSelectedProgram(null);
    setSelectedGallery(null);
    setActiveTabState('news');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    if (tab === 'main') {
      triggerPopupShow();
    }
    setActiveTabState(tab);
  };

  // Synchronize initial deep-link items once data is loaded
  useEffect(() => {
    if (initialParsed.tab === 'notice-detail' && initialParsed.noticeId && !selectedNotice) {
      const found = notices.find(n => n.id === initialParsed.noticeId) || INITIAL_NOTICES.find(n => n.id === initialParsed.noticeId);
      if (found) setSelectedNotice(found);
    }
    if (initialParsed.tab === 'program-detail' && initialParsed.programId && !selectedProgram) {
      const found = programs.find(p => p.id === initialParsed.programId) || INITIAL_PROGRAMS.find(p => p.id === initialParsed.programId);
      if (found) setSelectedProgram(found);
    }
    if (initialParsed.tab === 'gallery-detail' && initialParsed.galleryId && !selectedGallery) {
      const found = gallery.find(g => g.id === initialParsed.galleryId) || INITIAL_GALLERY.find(g => g.id === initialParsed.galleryId);
      if (found) setSelectedGallery(found);
    }
  }, [notices, programs, gallery]);

  // Handle browser Back / Forward navigation (PopState)
  useEffect(() => {
    // Set initial history state if not present
    const curHash = window.location.hash || '#main';
    const initObj = {
      tab: activeTab,
      aboutSubTab,
      noticeCategory,
      noticeId: selectedNotice?.id,
      programId: selectedProgram?.id,
      galleryId: selectedGallery?.id
    };
    if (!window.history.state) {
      window.history.replaceState(initObj, '', curHash);
    }

    const handlePopState = (e: PopStateEvent) => {
      isPopStateRef.current = true;
      const state = e.state || parseHash(window.location.hash);
      const targetTab: ActiveTab = state.tab || 'main';

      if (targetTab === 'notice-detail') {
        const found = notices.find(n => n.id === state.noticeId) || INITIAL_NOTICES.find(n => n.id === state.noticeId);
        if (found) {
          setSelectedNotice(found);
          setActiveTabState('notice-detail');
        } else {
          setSelectedNotice(null);
          setActiveTabState('news');
        }
      } else if (targetTab === 'program-detail') {
        const found = programs.find(p => p.id === state.programId) || INITIAL_PROGRAMS.find(p => p.id === state.programId);
        if (found) {
          setSelectedProgram(found);
          setActiveTabState('program-detail');
        } else {
          setSelectedProgram(null);
          setActiveTabState('programs');
        }
      } else if (targetTab === 'gallery-detail') {
        const found = gallery.find(g => g.id === state.galleryId) || INITIAL_GALLERY.find(g => g.id === state.galleryId);
        if (found) {
          setSelectedGallery(found);
          setActiveTabState('gallery-detail');
        } else {
          setSelectedGallery(null);
          setActiveTabState('gallery');
        }
      } else {
        setSelectedNotice(null);
        setSelectedProgram(null);
        setSelectedGallery(null);
        setActiveTabState(targetTab);
        if (targetTab === 'main') {
          triggerPopupShow();
        }
      }

      if (state.aboutSubTab) {
        setAboutSubTab(state.aboutSubTab);
      }
      if (state.noticeCategory) {
        setNoticeCategory(state.noticeCategory);
      }

      setTimeout(() => {
        isPopStateRef.current = false;
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [notices, programs, gallery]);

  // Push history state whenever tab / subTab / category / detail item changes from user action
  useEffect(() => {
    if (isPopStateRef.current) return;

    const stateObj = {
      tab: activeTab,
      aboutSubTab,
      noticeCategory,
      noticeId: selectedNotice?.id,
      programId: selectedProgram?.id,
      galleryId: selectedGallery?.id
    };
    const targetHash = buildHash(stateObj);

    if (window.location.hash !== targetHash) {
      window.history.pushState(stateObj, '', targetHash);
    }
  }, [activeTab, aboutSubTab, noticeCategory, selectedNotice?.id, selectedProgram?.id, selectedGallery?.id]);

  // Sync popups to local storage
  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_popups', JSON.stringify(popups));
    } catch (e) {
      console.warn('Failed to save popups to localStorage', e);
    }
  }, [popups]);

  const isServerLoaded = useRef(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchServerData = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/data?t=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const d = json.data;
          if (d.settings) {
            const serverChairmanImg = (d.settings.chairmanImageUrl && !d.settings.chairmanImageUrl.includes('photo-1560250097-0b93528c311a'))
              ? d.settings.chairmanImageUrl
              : INITIAL_SETTINGS.chairmanImageUrl;

            setSettings(prev => ({
              ...prev,
              ...d.settings,
              heroImageUrl: d.settings.heroImageUrl || prev.heroImageUrl,
              chairmanImageUrl: serverChairmanImg || prev.chairmanImageUrl || INITIAL_SETTINGS.chairmanImageUrl,
            }));
          }
          if (Array.isArray(d.programs) && d.programs.length > 0) setPrograms(d.programs);
          if (Array.isArray(d.notices) && d.notices.length > 0) setNotices(d.notices);
          if (Array.isArray(d.gallery) && d.gallery.length > 0) {
            setGallery(d.gallery);
            try {
              localStorage.setItem('nerve_nae_gallery', JSON.stringify(d.gallery));
            } catch (e) {
              console.warn('Failed to cache gallery to localStorage', e);
            }
          }
          if (Array.isArray(d.popups) && d.popups.length > 0) setPopups(d.popups);
          if (Array.isArray(d.donations)) setDonations(d.donations);
          if (Array.isArray(d.inquiries)) setInquiries(d.inquiries);
          if (Array.isArray(d.subscribers)) setSubscribers(d.subscribers);
        }
      }
    } catch (err) {
      console.warn('Server sync not available or offline', err);
    } finally {
      isServerLoaded.current = true;
      setIsSyncing(false);
    }
  };

  const refreshData = async () => {
    await fetchServerData();
  };

  // Load latest state from server on mount & periodically sync PC changes to Mobile
  useEffect(() => {
    fetchServerData();

    // Auto sync on tab focus or visibility change (e.g. mobile app switch)
    const handleFocus = () => fetchServerData();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    // Periodic sync every 2.5 seconds for instant cross-device updates
    const interval = setInterval(fetchServerData, 2500);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Sync to local storage with safe error handling & server persistence
  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
    // Only push to server if data has already been initialized from server
    if (isServerLoaded.current) {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      }).catch(() => {});
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_programs', JSON.stringify(programs));
    } catch (e) {
      console.warn('Failed to save programs to localStorage', e);
    }
    if (isServerLoaded.current) {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programs })
      }).catch(() => {});
    }
  }, [programs]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_notices', JSON.stringify(notices));
    } catch (e) {
      console.warn('Failed to save notices to localStorage', e);
    }
    if (isServerLoaded.current) {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notices })
      }).catch(() => {});
    }
  }, [notices]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_gallery', JSON.stringify(gallery));
    } catch (e) {
      console.warn('Failed to save gallery to localStorage', e);
    }
    if (isServerLoaded.current) {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gallery })
      }).catch(() => {});
    }
  }, [gallery]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_popups', JSON.stringify(popups));
    } catch (e) {
      console.warn('Failed to save popups to localStorage', e);
    }
    if (isServerLoaded.current) {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popups })
      }).catch(() => {});
    }
  }, [popups]);

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
    setGallery(prev => {
      const next = [newGallery, ...prev];
      fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gallery: next })
      }).catch(() => {});
      return next;
    });
  };

  const updateGallery = (id: string, updated: Partial<GalleryItem>) => {
    setGallery(prev => {
      const next = prev.map(g => g.id === id ? { ...g, ...updated } : g);
      fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gallery: next })
      }).catch(() => {});
      return next;
    });
  };

  const deleteGallery = (id: string) => {
    setGallery(prev => {
      const next = prev.filter(g => g.id !== id);
      fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gallery: next })
      }).catch(() => {});
      return next;
    });
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

  const addPopup = (popupData: Omit<PopupItem, 'id' | 'createdAt'>) => {
    const newPopup: PopupItem = {
      ...popupData,
      id: `popup-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setPopups(prev => [newPopup, ...prev]);
  };

  const updatePopup = (id: string, updatedData: Partial<PopupItem>) => {
    setPopups(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const deletePopup = (id: string) => {
    setPopups(prev => prev.filter(p => p.id !== id));
  };

  const togglePopupActive = (id: string) => {
    setPopups(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const updateSettings = (newSettings: Partial<FoundationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    setSettings(INITIAL_SETTINGS);
    setPrograms(INITIAL_PROGRAMS);
    setNotices(INITIAL_NOTICES);
    setGallery(INITIAL_GALLERY);
    setPopups(INITIAL_POPUPS);
    setDonations([]);
    setInquiries([]);
    setSubscribers([]);
    localStorage.clear();
  };

  const incrementNoticeViews = (id: string) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, views: n.views + 1 } : n));
  };

  const goBackFromDetail = (fallbackTab: ActiveTab = 'news') => {
    if (typeof window !== 'undefined' && window.history.state && window.history.length > 1) {
      window.history.back();
    } else {
      setSelectedNotice(null);
      setSelectedGallery(null);
      setSelectedProgram(null);
      const targetTab = (previousTab && !['notice-detail', 'gallery-detail', 'program-detail'].includes(previousTab))
        ? previousTab
        : fallbackTab;
      setActiveTab(targetTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        noticeCategory,
        setNoticeCategory,
        navigateToNewsCategory,
        adminOpen,
        setAdminOpen,
        isAdmin,
        setIsAdmin,
        refreshData,
        isSyncing,
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

        // Popups CRUD
        popups,
        addPopup,
        updatePopup,
        deletePopup,
        togglePopupActive,
        triggerPopupShow,
        showPopupsFlag,

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
