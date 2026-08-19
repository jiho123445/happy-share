import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';
import { testFirestoreConnection, GLOBAL_FOUNDATION_DOC, handleFirestoreError, OperationType } from '../lib/firestoreService';
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
  PopupItem,
  DebugLog
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_TIMELINE,
  INITIAL_PROGRAMS,
  INITIAL_NOTICES,
  INITIAL_GALLERY,
  INITIAL_DONATIONS,
  INITIAL_POPUPS,
  INITIAL_GALLERY_CATEGORIES
} from '../data/initialData';
import { formatImageUrl } from '../utils/imageUrl';

interface FoundationContextType {
  settings: FoundationSettings;
  timeline: TimelineItem[];
  programs: ProgramItem[];
  notices: NoticeItem[];
  gallery: GalleryItem[];
  galleryCategories: string[];
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
  syncTimestamp: number;
  getImageUrl: (url?: string) => string;
  debugLogs: DebugLog[];
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncTime: string | null;
  syncError: string | null;
  clearDebugLogs: () => void;
  showDebugOverlay: boolean;
  setShowDebugOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  
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
  updateGallery: (id: string, item: Partial<GalleryItem>) => Promise<void>;
  deleteGallery: (id: string) => Promise<void>;

  // Gallery Categories CRUD (카테고리 항목 추가/수정/삭제/재정렬)
  addGalleryCategory: (category: string) => Promise<void>;
  updateGalleryCategory: (oldCategory: string, newCategory: string) => Promise<void>;
  deleteGalleryCategory: (category: string) => Promise<void>;
  setGalleryCategories: (categories: string[]) => Promise<void>;

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
            images: (g.images && g.images.length > 0) ? g.images : (g.imageUrl ? [g.imageUrl] : []),
            author: g.author || '재단 관리자',
            isProtected: g.isProtected ?? true
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached gallery', e);
    }
    return INITIAL_GALLERY.map((g) => ({
      ...g,
      images: (g.images && g.images.length > 0) ? g.images : (g.imageUrl ? [g.imageUrl] : [])
    }));
  });

  const [galleryCategories, setGalleryCategoriesState] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nerve_nae_gallery_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached gallery categories', e);
    }
    return INITIAL_GALLERY_CATEGORIES;
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

  // Keep selectedGallery updated when gallery array changes
  useEffect(() => {
    if (selectedGallery) {
      const updated = gallery.find(g => g.id === selectedGallery.id);
      if (updated && (updated.images?.length !== selectedGallery.images?.length || updated.imageUrl !== selectedGallery.imageUrl || updated.title !== selectedGallery.title)) {
        setSelectedGallery(updated);
      }
    }
  }, [gallery]);

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
  const isServerAvailableRef = useRef<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncTimestamp, setSyncTimestamp] = useState<number>(() => Date.now());
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showDebugOverlay, setShowDebugOverlay] = useState<boolean>(true);
  const lastSyncTimeRef = useRef<number>(Date.now());
  const isFirestoreActiveRef = useRef<boolean>(true);

  const addDebugLog = useCallback((type: 'info' | 'success' | 'warn' | 'error', message: string, details?: string) => {
    const time = new Date().toLocaleTimeString('ko-KR', { hour12: false });
    setDebugLogs(prev => [
      { id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, time, type, message, details },
      ...prev.slice(0, 49) // keep last 50 logs
    ]);
  }, []);

  const clearDebugLogs = useCallback(() => {
    setDebugLogs([]);
  }, []);

  const getImageUrl = useCallback((url?: string) => {
    return formatImageUrl(url, syncTimestamp);
  }, [syncTimestamp]);

  // Real-time Firestore Cloud Synchronization (Sub-second mobile & desktop cross-device sync)
  useEffect(() => {
    testFirestoreConnection();

    const globalDocRef = doc(db, 'foundation', 'global');

    // Subscribe to real-time Cloud Firestore updates
    const unsubscribe = onSnapshot(
      globalDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data();
          if (d) {
            if (d.settings) {
              const { adminPassword: _legacyPassword, ...safeSettings } = d.settings as any;
              setSettings(prev => ({
                ...prev,
                ...safeSettings,
                heroImageUrl: d.settings.heroImageUrl || prev.heroImageUrl || INITIAL_SETTINGS.heroImageUrl,
                chairmanImageUrl: d.settings.chairmanImageUrl || prev.chairmanImageUrl || INITIAL_SETTINGS.chairmanImageUrl,
              }));
            }
            if (Array.isArray(d.programs) && d.programs.length > 0) setPrograms([...d.programs]);
            if (Array.isArray(d.notices) && d.notices.length > 0) setNotices([...d.notices]);
            // Firestore is the authoritative source for gallery data.
            // An empty gallery is also meaningful and must clear stale local cache.
            if (Array.isArray(d.gallery)) {
              const normalizedGallery = d.gallery.map((g: any) => ({
                ...g,
                images: (Array.isArray(g.images) && g.images.length > 0) ? g.images : (g.imageUrl ? [g.imageUrl] : [])
              }));
              setGallery(normalizedGallery);
              try {
                localStorage.setItem('nerve_nae_gallery', JSON.stringify(normalizedGallery));
              } catch (e) {}
            }
            if (Array.isArray(d.galleryCategories) && d.galleryCategories.length > 0) {
              setGalleryCategoriesState([...d.galleryCategories]);
              try {
                localStorage.setItem('nerve_nae_gallery_categories', JSON.stringify(d.galleryCategories));
              } catch (e) {}
            } else if (Array.isArray(d.settings?.galleryCategories) && d.settings.galleryCategories.length > 0) {
              setGalleryCategoriesState([...d.settings.galleryCategories]);
              try {
                localStorage.setItem('nerve_nae_gallery_categories', JSON.stringify(d.settings.galleryCategories));
              } catch (e) {}
            }
            if (Array.isArray(d.popups) && d.popups.length > 0) setPopups([...d.popups]);
            if (Array.isArray(d.donations)) setDonations([...d.donations]);
            if (Array.isArray(d.inquiries)) setInquiries([...d.inquiries]);
            if (Array.isArray(d.subscribers)) setSubscribers([...d.subscribers]);

            const now = Date.now();
            setSyncTimestamp(now);
            lastSyncTimeRef.current = now;
            const timeStr = new Date().toLocaleTimeString('ko-KR');
            setLastSyncTime(timeStr);
            setSyncStatus('success');
            setSyncError(null);
            isFirestoreActiveRef.current = true;

            addDebugLog(
              'success',
              `⚡ Firestore 클라우드 실시간 동기화 완료 (갤러리 ${d.gallery?.length || 0}개, 공지 ${d.notices?.length || 0}개)`,
              `반영시간: ${timeStr} · 전 기기 1초 실시간 반영`
            );
          }
        } else {
          // Initial seed to Firestore if document does not exist yet
          const initialPayload = {
            settings,
            programs,
            notices,
            gallery,
            popups,
            donations,
            inquiries,
            subscribers,
            updatedAt: new Date().toISOString()
          };
          if (auth.currentUser) {
            setDoc(globalDocRef, initialPayload, { merge: true }).catch(err => {
              handleFirestoreError(err, OperationType.WRITE, 'foundation/global');
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'foundation/global');
        isFirestoreActiveRef.current = false;
        fetchServerData();
      }
    );

    return () => unsubscribe();
  }, [addDebugLog]);

  const fetchServerData = async (isManual = false) => {
    setIsSyncing(true);
    setSyncStatus('syncing');
    const startTime = Date.now();
    try {
      // 1. Try Firestore direct fetch first
      const globalDocRef = doc(db, 'foundation', 'global');
      const snap = await getDoc(globalDocRef);
      if (snap.exists()) {
        const d = snap.data();
        if (d.settings) {
          const { adminPassword: _legacyPassword, ...safeSettings } = d.settings as any;
          setSettings(prev => ({ ...prev, ...safeSettings }));
        }
        if (Array.isArray(d.programs) && d.programs.length > 0) setPrograms([...d.programs]);
        if (Array.isArray(d.notices) && d.notices.length > 0) setNotices([...d.notices]);
        if (Array.isArray(d.gallery) && d.gallery.length > 0) setGallery([...d.gallery]);
        if (Array.isArray(d.popups) && d.popups.length > 0) setPopups([...d.popups]);
        if (Array.isArray(d.donations)) setDonations([...d.donations]);
        if (Array.isArray(d.inquiries)) setInquiries([...d.inquiries]);
        if (Array.isArray(d.subscribers)) setSubscribers([...d.subscribers]);

        const now = Date.now();
        setSyncTimestamp(now);
        lastSyncTimeRef.current = now;
        const timeStr = new Date().toLocaleTimeString('ko-KR');
        setLastSyncTime(timeStr);
        setSyncStatus('success');
        setSyncError(null);
        if (isManual) {
          addDebugLog('success', 'Firestore 클라우드에서 최신 데이터를 새로고침했습니다.');
        }
        return;
      }

      // 2. Fallback to API endpoint
      const cacheBust = `?_t=${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const res = await fetch('/api/data' + cacheBust, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Accept': 'application/json'
        }
      });

      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (res.ok && isJson) {
        const json = await res.json();
        isServerAvailableRef.current = true;

        if (json && json.data) {
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
          if (Array.isArray(d.programs) && d.programs.length > 0) setPrograms([...d.programs]);
          if (Array.isArray(d.notices) && d.notices.length > 0) setNotices([...d.notices]);
          if (Array.isArray(d.gallery) && d.gallery.length > 0) {
            const normalizedGallery = d.gallery.map((g: any) => ({
              ...g,
              images: (Array.isArray(g.images) && g.images.length > 0) ? g.images : (g.imageUrl ? [g.imageUrl] : [])
            }));
            setGallery(normalizedGallery);
            try {
              localStorage.setItem('nerve_nae_gallery', JSON.stringify(normalizedGallery));
            } catch (e) {
              console.warn('Failed to cache gallery to localStorage', e);
            }
          }
          if (Array.isArray(d.galleryCategories) && d.galleryCategories.length > 0) {
            setGalleryCategoriesState([...d.galleryCategories]);
            try {
              localStorage.setItem('nerve_nae_gallery_categories', JSON.stringify(d.galleryCategories));
            } catch (e) {}
          } else if (Array.isArray(d.settings?.galleryCategories) && d.settings.galleryCategories.length > 0) {
            setGalleryCategoriesState([...d.settings.galleryCategories]);
          }
          if (Array.isArray(d.popups) && d.popups.length > 0) setPopups([...d.popups]);
          if (Array.isArray(d.donations)) setDonations([...d.donations]);
          if (Array.isArray(d.inquiries)) setInquiries([...d.inquiries]);
          if (Array.isArray(d.subscribers)) setSubscribers([...d.subscribers]);

          const now = Date.now();
          setSyncTimestamp(now);
          lastSyncTimeRef.current = now;
          const timeStr = new Date().toLocaleTimeString('ko-KR');
          setLastSyncTime(timeStr);
          setSyncStatus('success');
          setSyncError(null);

          addDebugLog(
            'success',
            `동기화 성공 (갤러리 ${d.gallery?.length || 0}개, 공지 ${d.notices?.length || 0}개, 사업 ${d.programs?.length || 0}개)`,
            `소요시간: ${Date.now() - startTime}ms · ${isManual ? '수동 요청' : '자동 동기화'}`
          );
        } else {
          setSyncStatus('success');
          setSyncError(null);
          setLastSyncTime(new Date().toLocaleTimeString('ko-KR'));
        }
      } else {
        isServerAvailableRef.current = false;
        setSyncStatus('success');
        setSyncError(null);
        const timeStr = new Date().toLocaleTimeString('ko-KR') + ' (보존 모드)';
        setLastSyncTime(timeStr);
      }
    } catch (err: any) {
      console.warn('Server sync notice:', err?.message);
      isServerAvailableRef.current = false;
      setSyncStatus('success');
      setSyncError(null);
      setLastSyncTime(new Date().toLocaleTimeString('ko-KR'));
    } finally {
      isServerLoaded.current = true;
      setIsSyncing(false);
    }
  };

  const refreshData = async () => {
    addDebugLog('info', '사용자 즉시 동기화 요청 시작...');
    await fetchServerData(true);
  };

  // Listen to mobile background / resume events
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchServerData();
      }
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      fetchServerData();
    };

    const handleOnline = () => {
      addDebugLog('info', '네트워크 온라인 감지: 최신 데이터 동기화 시도');
      fetchServerData();
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('pageshow', handlePageShow as any);
    window.addEventListener('online', handleOnline);
    window.addEventListener('resume' as any, handleVisibilityOrFocus);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('pageshow', handlePageShow as any);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('resume' as any, handleVisibilityOrFocus);
    };
  }, [addDebugLog]);

  // Local storage caching for offline backup
  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_programs', JSON.stringify(programs));
    } catch (e) {}
  }, [programs]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_notices', JSON.stringify(notices));
    } catch (e) {}
  }, [notices]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_gallery_categories', JSON.stringify(galleryCategories));
    } catch (e) {}
  }, [galleryCategories]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_popups', JSON.stringify(popups));
    } catch (e) {}
  }, [popups]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_donations', JSON.stringify(donations));
    } catch (e) {}
  }, [donations]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_inquiries', JSON.stringify(inquiries));
    } catch (e) {}
  }, [inquiries]);

  useEffect(() => {
    try {
      localStorage.setItem('nerve_nae_subscribers', JSON.stringify(subscribers));
    } catch (e) {}
  }, [subscribers]);

  // Firestore & Server dual-write mutation helper
  const postMutationToServer = useCallback((endpoint: string, payload: any, actionName: string) => {
    // 1. Immediately write to Cloud Firestore for instant 1s cross-device synchronization
    const globalDocRef = doc(db, 'foundation', 'global');
    const firestoreUpdate: any = {
      ...payload,
      updatedAt: new Date().toISOString()
    };

    setDoc(globalDocRef, firestoreUpdate, { merge: true })
      .then(() => {
        addDebugLog('success', `[⚡ Firestore 클라우드 즉시 저장 완료] ${actionName}`);
        setSyncTimestamp(Date.now());
        setSyncStatus('success');
        setSyncError(null);
      })
      .catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'foundation/global');
        // Surface the failure instead of only logging it — a silent catch here
        // is exactly what made past writes (e.g. notices with attachments that
        // pushed the shared foundation/global document past Firestore's 1MB
        // limit) disappear without any visible error for the admin.
        setSyncStatus('error');
        setSyncError(`${actionName} 저장에 실패했습니다. (${err instanceof Error ? err.message : String(err)})`);
      });

    // 2. Also send to Express /api/ endpoint if available
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (res.ok) {
          setSyncTimestamp(Date.now());
        }
      })
      .catch(() => {});
  }, [addDebugLog]);

  // Program CRUD
  const addProgram = (item: Omit<ProgramItem, 'id' | 'code'>) => {
    const nextCode = String(programs.length + 1).padStart(2, '0');
    const newProgram: ProgramItem = {
      ...item,
      id: `prg-${Date.now()}`,
      code: nextCode
    };
    const next = [...programs, newProgram];
    setPrograms(next);
    postMutationToServer('/api/sync', { programs: next }, `사업 추가: ${newProgram.title}`);
  };

  const updateProgram = (id: string, updated: Partial<ProgramItem>) => {
    const next = programs.map(p => p.id === id ? { ...p, ...updated } : p);
    setPrograms(next);
    postMutationToServer('/api/sync', { programs: next }, `사업 수정 (ID: ${id})`);
  };

  const deleteProgram = (id: string) => {
    const next = programs.filter(p => p.id !== id);
    setPrograms(next);
    postMutationToServer('/api/sync', { programs: next }, `사업 삭제 (ID: ${id})`);
  };

  // Notice CRUD
  const addNotice = (item: Omit<NoticeItem, 'id' | 'views' | 'date'> & { date?: string }) => {
    const newNotice: NoticeItem = {
      ...item,
      id: `not-${Date.now()}`,
      date: item.date || new Date().toISOString().split('T')[0],
      views: 1
    };
    const next = [newNotice, ...notices];
    setNotices(next);
    postMutationToServer('/api/sync', { notices: next }, `공지 추가: ${newNotice.title}`);
  };

  const updateNotice = (id: string, updated: Partial<NoticeItem>) => {
    const next = notices.map(n => n.id === id ? { ...n, ...updated } : n);
    setNotices(next);
    postMutationToServer('/api/sync', { notices: next }, `공지 수정 (ID: ${id})`);
  };

  const deleteNotice = (id: string) => {
    const next = notices.filter(n => n.id !== id);
    setNotices(next);
    postMutationToServer('/api/sync', { notices: next }, `공지 삭제 (ID: ${id})`);
  };

  // Gallery CRUD
  const addGallery = (item: Omit<GalleryItem, 'id' | 'date'> & { date?: string; author?: string; isProtected?: boolean }) => {
    const primaryImg = item.imageUrl || (item.images && item.images[0]) || '';
    const allImages = (item.images && item.images.length > 0) ? item.images : (primaryImg ? [primaryImg] : []);
    const primaryStoragePath = item.storagePath || (item.storagePaths && item.storagePaths[0]);
    const allStoragePaths = (item.storagePaths && item.storagePaths.length > 0) ? item.storagePaths : (primaryStoragePath ? [primaryStoragePath] : undefined);

    const newGallery: GalleryItem = {
      ...item,
      imageUrl: primaryImg,
      images: allImages,
      storagePath: primaryStoragePath,
      storagePaths: allStoragePaths,
      id: `gal-${Date.now()}`,
      date: item.date || new Date().toISOString().split('T')[0],
      author: item.author || '재단 관리자',
      isProtected: item.isProtected ?? true
    };

    const next = [newGallery, ...gallery];

    // Optimistic UI update.
    setGallery(next);

    // LocalStorage is cache only, never the source of truth.
    try {
      localStorage.setItem('nerve_nae_gallery', JSON.stringify(next));
    } catch (e) {}

    // IMPORTANT: gallery metadata is written directly to Firestore.
    // Do NOT send gallery data through /api/gallery because that endpoint
    // can convert image data into server-local /uploads files.
    const globalDocRef = doc(db, 'foundation', 'global');

    setDoc(
      globalDocRef,
      {
        gallery: next,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    )
      .then(() => {
        setSyncTimestamp(Date.now());
        setSyncStatus('success');
        setSyncError(null);
        addDebugLog(
          'success',
          `Firebase Storage 갤러리 등록 완료: ${newGallery.title} (사진 ${allImages.length}장)`
        );
      })
      .catch((err) => {
        handleFirestoreError(
          err,
          OperationType.WRITE,
          'foundation/global.gallery'
        );
        setSyncStatus('error');
        setSyncError('갤러리 저장에 실패했습니다.');
      });
  };

  /**
   * Firebase Storage 파일 삭제 helper.
   *
   * 중요:
   * - legacy /uploads 경로에는 절대 접근하지 않습니다.
   * - storagePath가 없으면 아무 작업도 하지 않습니다.
   * - 이미 파일이 없는 경우(object-not-found)만 성공으로 취급합니다.
   * - 권한 오류 등 다른 오류는 호출자에게 전달하여 Firestore와 Storage의
   *   상태가 조용히 어긋나는 것을 막습니다.
   */
  const removeGalleryStorageFile = async (storagePath?: string) => {
    if (!storagePath || !storagePath.startsWith('activities/')) {
      return;
    }

    try {
      await deleteObject(ref(storage, storagePath));
    } catch (error: any) {
      if (error?.code === 'storage/object-not-found') {
        console.warn(`Gallery Storage file already absent: ${storagePath}`);
        return;
      }

      console.error(`Gallery Storage file delete failed: ${storagePath}`, error);
      throw error;
    }
  };

  /**
   * 갤러리 메타데이터 수정.
   *
   * 다중 사진 지원:
   * 1) AdminModal이 추가/수정된 사진들을 Storage에 먼저 업로드
   * 2) Firestore에 새 imageUrl/images/storagePaths 저장
   * 3) Firestore 저장 성공 후 제거된 기존 Storage 파일만 선별 정리
   *
   * 따라서 업로드/저장이 실패해도 기존 사진과 데이터는 완전히 보존됩니다.
   */
  const updateGallery = async (id: string, updated: Partial<GalleryItem>) => {
    const target = gallery.find(g => g.id === id);
    if (!target) {
      throw new Error('수정할 갤러리 항목을 찾을 수 없습니다.');
    }

    const primaryImg = updated.imageUrl ?? (updated.images && updated.images[0]) ?? target.imageUrl;
    const allImages = updated.images ?? (target.images && target.images.length > 0 ? target.images : (primaryImg ? [primaryImg] : []));
    const primaryStoragePath = updated.storagePath ?? (updated.storagePaths && updated.storagePaths[0]) ?? target.storagePath;
    const allStoragePaths = updated.storagePaths ?? target.storagePaths;

    const consolidatedUpdate: Partial<GalleryItem> = {
      ...updated,
      imageUrl: primaryImg,
      images: allImages,
      storagePath: primaryStoragePath,
      storagePaths: allStoragePaths
    };

    const next = gallery.map(g =>
      g.id === id ? { ...g, ...consolidatedUpdate } : g
    );

    const globalDocRef = doc(db, 'foundation', 'global');

    try {
      await setDoc(
        globalDocRef,
        {
          gallery: next,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      // Firestore가 새 이미지 정보를 확정한 뒤 더 이상 사용되지 않는 기존 Storage 파일들을 정리합니다.
      const oldPaths = new Set<string>();
      if (target.storagePath && target.storagePath.startsWith('activities/')) oldPaths.add(target.storagePath);
      if (Array.isArray(target.storagePaths)) {
        target.storagePaths.forEach(p => {
          if (p && p.startsWith('activities/')) oldPaths.add(p);
        });
      }

      const keptPaths = new Set<string>();
      if (consolidatedUpdate.storagePath && consolidatedUpdate.storagePath.startsWith('activities/')) {
        keptPaths.add(consolidatedUpdate.storagePath);
      }
      if (Array.isArray(consolidatedUpdate.storagePaths)) {
        consolidatedUpdate.storagePaths.forEach(p => {
          if (p && p.startsWith('activities/')) keptPaths.add(p);
        });
      }

      // 제거된 파일만 안전하게 정리
      for (const oldP of oldPaths) {
        if (!keptPaths.has(oldP)) {
          try {
            await removeGalleryStorageFile(oldP);
          } catch (storageError) {
            console.warn(`제거된 갤러리 파일 정리 건너뜀 (${oldP}):`, storageError);
          }
        }
      }

      setGallery(next);

      try {
        localStorage.setItem('nerve_nae_gallery', JSON.stringify(next));
      } catch (e) {}

      setSyncTimestamp(Date.now());
      setSyncStatus('success');
      setSyncError(null);
    } catch (err) {
      if (!(err as any)?.code?.startsWith?.('storage/')) {
        handleFirestoreError(
          err,
          OperationType.WRITE,
          'foundation/global.gallery'
        );
        setSyncStatus('error');
        setSyncError('갤러리 수정에 실패했습니다.');
      }
      throw err;
    }
  };

  /**
   * 갤러리 항목 삭제.
   *
   * Firestore 메타데이터를 먼저 확정한 뒤 Firebase Storage 파일들을 삭제합니다.
   * 다중 사진의 모든 storagePaths 및 storagePath를 안전하게 삭제 정리합니다.
   * legacy /uploads 사진은 storagePath가 없으므로 절대 삭제하지 않습니다.
   */
  const deleteGallery = async (id: string) => {
    const target = gallery.find(g => g.id === id);
    if (!target) {
      throw new Error('삭제할 갤러리 항목을 찾을 수 없습니다.');
    }

    const next = gallery.filter(g => g.id !== id);
    const globalDocRef = doc(db, 'foundation', 'global');

    try {
      await setDoc(
        globalDocRef,
        {
          gallery: next,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      setGallery(next);

      try {
        localStorage.setItem('nerve_nae_gallery', JSON.stringify(next));
      } catch (e) {}

      // 신형 Firebase Storage 사진들 전체 삭제 정리
      const pathsToDelete = new Set<string>();
      if (target.storagePath && target.storagePath.startsWith('activities/')) {
        pathsToDelete.add(target.storagePath);
      }
      if (Array.isArray(target.storagePaths)) {
        target.storagePaths.forEach(p => {
          if (p && p.startsWith('activities/')) pathsToDelete.add(p);
        });
      }

      for (const p of pathsToDelete) {
        try {
          await removeGalleryStorageFile(p);
        } catch (storageError) {
          console.warn(`갤러리 파일 정리 건너뜀 (${p}):`, storageError);
        }
      }

      setSyncTimestamp(Date.now());
      setSyncStatus('success');
      setSyncError(null);
    } catch (err) {
      if (!(err as any)?.code?.startsWith?.('storage/')) {
        handleFirestoreError(
          err,
          OperationType.WRITE,
          'foundation/global.gallery'
        );
        setSyncStatus('error');
        setSyncError('갤러리 삭제에 실패했습니다.');
      }
      throw err;
    }
  };

  // Gallery Categories CRUD
  const addGalleryCategory = async (category: string) => {
    const trimmed = category.trim();
    if (!trimmed) return;
    if (galleryCategories.includes(trimmed)) return;

    const next = [...galleryCategories, trimmed];
    setGalleryCategoriesState(next);
    try {
      localStorage.setItem('nerve_nae_gallery_categories', JSON.stringify(next));
    } catch (e) {}

    const globalDocRef = doc(db, 'foundation', 'global');
    try {
      await setDoc(
        globalDocRef,
        {
          galleryCategories: next,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      postMutationToServer('/api/sync', { galleryCategories: next }, `갤러리 카테고리 추가: ${trimmed}`);
      addDebugLog('success', `갤러리 카테고리 항목 추가 완료: ${trimmed}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'foundation/global.galleryCategories');
    }
  };

  const updateGalleryCategory = async (oldCategory: string, newCategory: string) => {
    const trimmedNew = newCategory.trim();
    if (!trimmedNew || oldCategory === trimmedNew) return;

    const nextCategories = galleryCategories.map(c => c === oldCategory ? trimmedNew : c);
    if (!nextCategories.includes(trimmedNew)) {
      nextCategories.push(trimmedNew);
    }
    const uniqueCategories = Array.from(new Set(nextCategories));

    // Update gallery items that have the old category so data integrity is 100% preserved
    const nextGallery = gallery.map(item =>
      item.category === oldCategory ? { ...item, category: trimmedNew } : item
    );

    setGalleryCategoriesState(uniqueCategories);
    setGallery(nextGallery);

    try {
      localStorage.setItem('nerve_nae_gallery_categories', JSON.stringify(uniqueCategories));
      localStorage.setItem('nerve_nae_gallery', JSON.stringify(nextGallery));
    } catch (e) {}

    const globalDocRef = doc(db, 'foundation', 'global');
    try {
      await setDoc(
        globalDocRef,
        {
          galleryCategories: uniqueCategories,
          gallery: nextGallery,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      postMutationToServer(
        '/api/sync',
        { galleryCategories: uniqueCategories, gallery: nextGallery },
        `갤러리 카테고리 수정: ${oldCategory} -> ${trimmedNew}`
      );
      addDebugLog('success', `갤러리 카테고리 항목 수정 완료 (${oldCategory} → ${trimmedNew})`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'foundation/global.galleryCategories');
      throw err;
    }
  };

  const deleteGalleryCategory = async (categoryToDelete: string) => {
    const nextCategories = galleryCategories.filter(c => c !== categoryToDelete);
    setGalleryCategoriesState(nextCategories);

    try {
      localStorage.setItem('nerve_nae_gallery_categories', JSON.stringify(nextCategories));
    } catch (e) {}

    const globalDocRef = doc(db, 'foundation', 'global');
    try {
      await setDoc(
        globalDocRef,
        {
          galleryCategories: nextCategories,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      postMutationToServer('/api/sync', { galleryCategories: nextCategories }, `갤러리 카테고리 삭제: ${categoryToDelete}`);
      addDebugLog('success', `갤러리 카테고리 항목 삭제 완료: ${categoryToDelete}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'foundation/global.galleryCategories');
      throw err;
    }
  };

  const setGalleryCategories = async (newCategories: string[]) => {
    const filtered = Array.from(new Set(newCategories.map(c => c.trim()).filter(Boolean)));
    setGalleryCategoriesState(filtered);
    try {
      localStorage.setItem('nerve_nae_gallery_categories', JSON.stringify(filtered));
    } catch (e) {}

    const globalDocRef = doc(db, 'foundation', 'global');
    try {
      await setDoc(
        globalDocRef,
        {
          galleryCategories: filtered,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      postMutationToServer('/api/sync', { galleryCategories: filtered }, `갤러리 카테고리 일괄 갱신`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'foundation/global.galleryCategories');
    }
  };

  // Donations CRUD
  const addDonation = (item: Omit<DonationApplication, 'id' | 'createdAt' | 'status'>) => {
    const newDonation: DonationApplication = {
      ...item,
      id: `don-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: '접수완료'
    };
    const next = [newDonation, ...donations];
    setDonations(next);
    postMutationToServer('/api/sync', { donations: next }, `후원 신청 접수: ${newDonation.name}`);
  };

  const updateDonationStatus = (id: string, status: '접수완료' | '확인중' | '처리완료') => {
    const next = donations.map(d => d.id === id ? { ...d, status } : d);
    setDonations(next);
    postMutationToServer('/api/sync', { donations: next }, `후원 상태 변경: ${status}`);
  };

  const deleteDonation = (id: string) => {
    const next = donations.filter(d => d.id !== id);
    setDonations(next);
    postMutationToServer('/api/sync', { donations: next }, `후원 내역 삭제`);
  };

  // Inquiries CRUD
  const addInquiry = (item: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInquiry: ContactInquiry = {
      ...item,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: '대기중'
    };
    const next = [newInquiry, ...inquiries];
    setInquiries(next);
    postMutationToServer('/api/sync', { inquiries: next }, `문의 접수: ${newInquiry.name}`);
  };

  const updateInquiryStatus = (id: string, status: '대기중' | '답변완료') => {
    const next = inquiries.map(i => i.id === id ? { ...i, status } : i);
    setInquiries(next);
    postMutationToServer('/api/sync', { inquiries: next }, `문의 상태 변경: ${status}`);
  };

  const deleteInquiry = (id: string) => {
    const next = inquiries.filter(i => i.id !== id);
    setInquiries(next);
    postMutationToServer('/api/sync', { inquiries: next }, `문의 내역 삭제`);
  };

  // Subscribers CRUD
  const addSubscriber = (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) return;
    const existing = subscribers.find(s => s.email.toLowerCase() === trimmed.toLowerCase());
    let next: NewsletterSubscriber[];
    if (existing) {
      if (existing.status === '해지') {
        next = subscribers.map(s => s.id === existing.id ? { ...s, status: '구독중', subscribedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) } : s);
        setSubscribers(next);
        postMutationToServer('/api/sync', { subscribers: next }, `뉴스레터 재구독: ${trimmed}`);
      }
      return;
    }
    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email: trimmed,
      subscribedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: '구독중'
    };
    next = [newSub, ...subscribers];
    setSubscribers(next);
    postMutationToServer('/api/sync', { subscribers: next }, `뉴스레터 신규 구독: ${trimmed}`);
  };

  const updateSubscriberStatus = (id: string, status: '구독중' | '해지') => {
    const next = subscribers.map(s => s.id === id ? { ...s, status } : s);
    setSubscribers(next);
    postMutationToServer('/api/sync', { subscribers: next }, `뉴스레터 상태 변경: ${status}`);
  };

  const deleteSubscriber = (id: string) => {
    const next = subscribers.filter(s => s.id !== id);
    setSubscribers(next);
    postMutationToServer('/api/sync', { subscribers: next }, `뉴스레터 구독자 삭제`);
  };

  const addPopup = (popupData: Omit<PopupItem, 'id' | 'createdAt'>) => {
    const newPopup: PopupItem = {
      ...popupData,
      id: `popup-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const next = [newPopup, ...popups];
    setPopups(next);
    postMutationToServer('/api/sync', { popups: next }, `팝업 추가: ${newPopup.title}`);
  };

  const updatePopup = (id: string, updatedData: Partial<PopupItem>) => {
    const next = popups.map(p => p.id === id ? { ...p, ...updatedData } : p);
    setPopups(next);
    postMutationToServer('/api/sync', { popups: next }, `팝업 수정 (ID: ${id})`);
  };

  const deletePopup = (id: string) => {
    const next = popups.filter(p => p.id !== id);
    setPopups(next);
    postMutationToServer('/api/sync', { popups: next }, `팝업 삭제 (ID: ${id})`);
  };

  const togglePopupActive = (id: string) => {
    const next = popups.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p);
    setPopups(next);
    postMutationToServer('/api/sync', { popups: next }, `팝업 활성 토글 (ID: ${id})`);
  };

  const updateSettings = (newSettings: Partial<FoundationSettings>) => {
    setSettings(prev => {
      const { adminPassword: _legacyPassword, ...safePrev } = prev;
      const { adminPassword: _incomingPassword, ...safeNewSettings } = newSettings as any;
      const next = { ...safePrev, ...safeNewSettings } as FoundationSettings;
      try {
        localStorage.setItem('nerve_nae_settings', JSON.stringify(next));
      } catch (e) {}
      postMutationToServer('/api/settings', { settings: next }, '재단 기본 설정 업데이트');
      setSyncTimestamp(Date.now());
      return next;
    });
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
    postMutationToServer('/api/sync', {
      settings: INITIAL_SETTINGS,
      programs: INITIAL_PROGRAMS,
      notices: INITIAL_NOTICES,
      gallery: INITIAL_GALLERY,
      popups: INITIAL_POPUPS,
      donations: [],
      inquiries: [],
      subscribers: []
    }, '초기 기본값으로 초기화');
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
        syncTimestamp,
        getImageUrl,
        debugLogs,
        syncStatus,
        lastSyncTime,
        syncError,
        clearDebugLogs,
        showDebugOverlay,
        setShowDebugOverlay,
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
        galleryCategories,
        addGallery,
        updateGallery,
        deleteGallery,
        addGalleryCategory,
        updateGalleryCategory,
        deleteGalleryCategory,
        setGalleryCategories,

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
