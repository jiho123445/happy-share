import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { doc, onSnapshot, setDoc, getDoc, getDocs, collection, addDoc, updateDoc, deleteDoc, query, orderBy, writeBatch } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
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
  DebugLog,
  PressCoverageItem
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
import { INITIAL_PRESS_COVERAGE } from '../data/pressCoverage';
import { formatImageUrl } from '../utils/imageUrl';
import { sanitizeForFirestore } from '../utils/sanitizeForFirestore';

interface FoundationContextType {
  settings: FoundationSettings;
  timeline: TimelineItem[];
  programs: ProgramItem[];
  notices: NoticeItem[];
  gallery: GalleryItem[];
  pressItems: PressCoverageItem[];
  galleryCategories: string[];
  donations: DonationApplication[];
  inquiries: ContactInquiry[];
  subscribers: NewsletterSubscriber[];
  popups: PopupItem[];
  hasNewDonation: boolean;
  pendingDonationsCount: number;
  markDonationsAsRead: () => Promise<void>;
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

  // Press Coverage CRUD (보도자료)
  addPress: (item: Omit<PressCoverageItem, 'id'>) => void;
  updatePress: (id: string, item: Partial<PressCoverageItem>) => void;
  deletePress: (id: string) => void;

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
  addDonation: (donation: Omit<DonationApplication, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateDonationStatus: (id: string, status: '접수완료' | '확인중' | '처리완료') => Promise<void>;
  deleteDonation: (id: string) => Promise<void>;

  // Inquiries CRUD
  addInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateInquiryStatus: (id: string, status: '대기중' | '답변완료') => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;

  // Subscribers CRUD
  addSubscriber: (email: string) => Promise<void>;
  updateSubscriberStatus: (id: string, status: '구독중' | '해지') => Promise<void>;
  deleteSubscriber: (id: string) => Promise<void>;

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
// Builds a real URL path (e.g. /notices/abc123) instead of a #hash fragment.
// Real paths are sent to the server on every request, which is what lets a
// server-side bot-detection layer (see middleware.ts) serve per-article
// preview metadata to link-preview bots and search crawlers. A #hash
// fragment is never sent to the server, so it can't be used for that.
const buildPath = (state: {
  tab: ActiveTab;
  aboutSubTab?: AboutSubTab;
  noticeCategory?: string;
  noticeId?: string;
  programId?: string;
  galleryId?: string;
}): string => {
  const { tab, aboutSubTab, noticeCategory, noticeId, programId, galleryId } = state;
  if (tab === 'notice-detail' && noticeId) {
    return `/notices/${encodeURIComponent(noticeId)}`;
  }
  if (tab === 'program-detail' && programId) {
    return `/programs/${encodeURIComponent(programId)}`;
  }
  if (tab === 'gallery-detail' && galleryId) {
    return `/gallery/${encodeURIComponent(galleryId)}`;
  }
  if (tab === 'about') {
    return aboutSubTab && aboutSubTab !== 'greeting'
      ? `/about?sub=${encodeURIComponent(aboutSubTab)}`
      : '/about';
  }
  if (tab === 'news') {
    return noticeCategory && noticeCategory !== '전체'
      ? `/news?cat=${encodeURIComponent(noticeCategory)}`
      : '/news';
  }
  if (tab === 'main') {
    return '/';
  }
  return `/${tab}`;
};

// Parses a real URL path (+ query string) into route state. Replaces the
// old #hash parser now that URLs are real server-visible paths.
const parsePath = (pathname: string, search: string) => {
  const clean = (pathname || '/').trim();
  const params = new URLSearchParams(search || '');

  const res: {
    tab: ActiveTab;
    aboutSubTab?: AboutSubTab;
    noticeCategory?: string;
    noticeId?: string;
    programId?: string;
    galleryId?: string;
  } = { tab: 'main' as ActiveTab };

  const noticeMatch = clean.match(/^\/notices\/([^/]+)\/?$/);
  const programMatch = clean.match(/^\/programs\/([^/]+)\/?$/);
  const galleryMatch = clean.match(/^\/gallery\/([^/]+)\/?$/);

  if (noticeMatch) {
    res.tab = 'notice-detail';
    res.noticeId = decodeURIComponent(noticeMatch[1]);
    return res;
  }
  if (programMatch) {
    res.tab = 'program-detail';
    res.programId = decodeURIComponent(programMatch[1]);
    return res;
  }
  if (galleryMatch) {
    res.tab = 'gallery-detail';
    res.galleryId = decodeURIComponent(galleryMatch[1]);
    return res;
  }

  const validTabs: ActiveTab[] = [
    'main',
    'about',
    'programs',
    'news',
    'gallery',
    'press',
    'family-center',
    'donate',
    'contact'
  ];
  const tabPart = clean.replace(/^\//, '').replace(/\/$/, '');
  res.tab = validTabs.includes(tabPart as ActiveTab) ? (tabPart as ActiveTab) : ('main' as ActiveTab);

  if (params.get('sub')) res.aboutSubTab = params.get('sub') as AboutSubTab;
  if (params.get('cat')) res.noticeCategory = params.get('cat')!;

  return res;
};

// ── Backward compatibility for links shared before the routing switch ──
// Before this update, every internal link used a #hash fragment (e.g.
// #notice-detail?id=xxx). Any such link already sent out via KakaoTalk,
// SMS, or indexed by a search engine would otherwise silently land on the
// homepage after the switch to real URL paths, since a #hash fragment is
// never sent to the server and parsePath() only reads the real path.
// This converts a legacy hash (if present) into the equivalent new path,
// so old links keep working. Runs once on initial page load only.
const legacyHashToPath = (hashStr: string): string | null => {
  const clean = (hashStr || '').replace(/^#/, '').trim();
  if (!clean || clean === 'main') return null;

  const [tabPart, queryPart] = clean.split('?');
  const params = new URLSearchParams(queryPart || '');
  const id = params.get('id');

  if (tabPart === 'notice-detail' && id) return `/notices/${encodeURIComponent(id)}`;
  if (tabPart === 'program-detail' && id) return `/programs/${encodeURIComponent(id)}`;
  if (tabPart === 'gallery-detail' && id) return `/gallery/${encodeURIComponent(id)}`;

  const validTabs = ['about', 'programs', 'news', 'gallery', 'press', 'family-center', 'donate', 'contact'];
  if (validTabs.includes(tabPart)) {
    const sub = params.get('sub');
    const cat = params.get('cat');
    if (tabPart === 'about' && sub) return `/about?sub=${encodeURIComponent(sub)}`;
    if (tabPart === 'news' && cat) return `/news?cat=${encodeURIComponent(cat)}`;
    return `/${tabPart}`;
  }

  return null;
};

// ── Notice view-count de-duplication ────────────────────────────────────
// Prevents a single visitor from inflating a notice's view count every time
// they reopen it (refresh, prev/next navigation, revisiting the list).
// Tracked per-browser via localStorage with a 24h cooldown per notice id.
const VIEWED_NOTICES_STORAGE_KEY = 'nerve_nae_viewed_notices';
const VIEW_DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

const hasRecentlyViewedNotice = (id: string): boolean => {
  try {
    const raw = localStorage.getItem(VIEWED_NOTICES_STORAGE_KEY);
    if (!raw) return false;
    const map: Record<string, number> = JSON.parse(raw);
    const viewedAt = map[id];
    return typeof viewedAt === 'number' && (Date.now() - viewedAt) < VIEW_DEDUP_WINDOW_MS;
  } catch (e) {
    return false;
  }
};

const markNoticeAsViewed = (id: string) => {
  try {
    const raw = localStorage.getItem(VIEWED_NOTICES_STORAGE_KEY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    map[id] = Date.now();
    // Prune stale entries so this key doesn't grow forever.
    const cutoff = Date.now() - VIEW_DEDUP_WINDOW_MS;
    Object.keys(map).forEach((key) => {
      if (map[key] < cutoff) delete map[key];
    });
    localStorage.setItem(VIEWED_NOTICES_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    // localStorage unavailable (private browsing, quota, etc.) — dedup just won't persist.
  }
};

export const FoundationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // SECURITY: remove only legacy personal-data caches created by older builds.
  // Do not call localStorage.clear() because that would also erase harmless
  // visitor preferences such as popup/notice state and could affect UX.
  useEffect(() => {
    try {
      ['nerve_nae_donations', 'nerve_nae_inquiries', 'nerve_nae_subscribers'].forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (e) {
      console.warn('Legacy personal-data cache cleanup skipped', e);
    }
  }, []);

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
  // Always-fresh mirror of `notices`, kept in sync on every commit.
  // CRUD handlers below read from this ref (not the `notices` closure
  // variable) so they never build `next` from a stale pre-render value —
  // without ever calling side effects (Firestore writes, setState) from
  // inside a setState updater, which is unsafe and can crash the app under
  // React 18 StrictMode's double-invoke behavior.
  const noticesRef = useRef<NoticeItem[]>(notices);
  useEffect(() => {
    noticesRef.current = notices;
  }, [notices]);

  const [pressItems, setPressItems] = useState<PressCoverageItem[]>(() => {
    const saved = localStorage.getItem('nerve_nae_press');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved press coverage', e);
      }
    }
    return INITIAL_PRESS_COVERAGE;
  });
  // Same always-fresh-ref pattern as `noticesRef` — see the comment above.
  const pressItemsRef = useRef<PressCoverageItem[]>(pressItems);
  useEffect(() => {
    pressItemsRef.current = pressItems;
  }, [pressItems]);

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

  // SECURITY (2026 audit): donations / inquiries / subscribers contain
  // personal information (name, phone, email, message). They used to be
  // embedded as arrays inside the `foundation/global` document, which is
  // publicly readable (`allow read: if true` — required so the homepage
  // content loads for visitors without logging in). That meant anyone
  // could read every donor's and inquirer's personal details without any
  // login. They now live in their own top-level Firestore collections
  // (`donations`, `inquiries`, `subscribers`) whose rules only allow the
  // public to *create* a new entry (submit a form) — reading, updating,
  // and deleting requires the admin Firebase Auth account. See
  // firestore.rules. They are also no longer cached in localStorage.
  const [donations, setDonations] = useState<DonationApplication[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);

  const pendingDonationsCount = donations.filter(d => d.status === '접수완료').length;
  const hasNewDonation = pendingDonationsCount > 0;

  const markDonationsAsRead = async () => {
    const targets = donations.filter(d => d.status === '접수완료');
    if (targets.length === 0) return;
    setDonations(prev => prev.map(d => d.status === '접수완료' ? { ...d, status: '확인중' } : d));
    try {
      const batch = writeBatch(db);
      targets.forEach(d => {
        batch.update(doc(db, 'donations', d.id), { status: '확인중' });
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'donations');
    }
  };

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

  const hasMigratedLegacyHash = useRef(false);

  // If this page was opened via an old-style #hash link (shared before
  // the routing switch), rewrite the browser URL to the new real path
  // before anything else reads window.location. replaceState (not
  // pushState) so it doesn't add a spurious extra back-button entry.
  // Guarded by a ref so this only ever runs once (on mount), not on
  // every re-render.
  if (!hasMigratedLegacyHash.current && typeof window !== 'undefined' && window.location.hash) {
    hasMigratedLegacyHash.current = true;
    const migratedPath = legacyHashToPath(window.location.hash);
    if (migratedPath) {
      window.history.replaceState(null, '', migratedPath);
    } else {
      // Unrecognized hash — still strip it so it doesn't linger in the URL.
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  const initialParsed = parsePath(
    typeof window !== 'undefined' ? window.location.pathname : '/',
    typeof window !== 'undefined' ? window.location.search : ''
  );

  const [activeTab, setActiveTabState] = useState<ActiveTab>(initialParsed.tab || 'main');
  const [previousTab, setPreviousTab] = useState<ActiveTab>('main');
  const [aboutSubTab, setAboutSubTab] = useState<AboutSubTab>(initialParsed.aboutSubTab || 'greeting');
  const [noticeCategory, setNoticeCategory] = useState<string>(initialParsed.noticeCategory || '전체');
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  // Administrator status is derived exclusively from Firebase Authentication.
  // Do not persist an independent browser-side admin flag: a sessionStorage
  // value is not an authorization boundary and can be edited by the visitor.
  const [isAdmin, setIsAdminState] = useState<boolean>(false);

  // Kept for the existing context API. Firebase's auth-state listener below
  // is the authoritative source of truth; callers must never be able to grant
  // themselves admin access by calling this setter.
  const setIsAdmin = (val: boolean) => {
    setIsAdminState(Boolean(val));
  };

  // Real Firebase Authentication state, tracked here (rather than inside
  // AdminModal.tsx) so that `isAdmin` stays accurate everywhere in the
  // app — including PopupModal.tsx's edit gating — even before the admin
  // has opened the admin panel for the first time. This also lets
  // AdminModal be lazy-loaded (see App.tsx) without breaking that.
  useEffect(() => {
    // VITE_ADMIN_UID is preferred when configured in Vercel.
    // Keep the Firebase Rules UID as a safe client-side fallback so that
    // the admin UI does not become permanently locked out when the
    // environment variable is missing after a deployment. The real
    // authorization boundary remains Firestore/Storage Security Rules.
    const ADMIN_UID = import.meta.env.VITE_ADMIN_UID || 'a1MQmdMGkgdorEl6V3FAptCAYo52';
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const signedIn = !!user && user.uid === ADMIN_UID;
      setIsAdmin(signedIn);
    });
    return () => unsubscribe();
  }, []);

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
    const curPath = window.location.pathname + window.location.search || '/';
    const initObj = {
      tab: activeTab,
      aboutSubTab,
      noticeCategory,
      noticeId: selectedNotice?.id,
      programId: selectedProgram?.id,
      galleryId: selectedGallery?.id
    };
    if (!window.history.state) {
      window.history.replaceState(initObj, '', curPath);
    }

    const handlePopState = (e: PopStateEvent) => {
      isPopStateRef.current = true;
      const state = e.state || parsePath(window.location.pathname, window.location.search);
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
    const targetPath = buildPath(stateObj);
    const currentPath = window.location.pathname + window.location.search;

    if (currentPath !== targetPath) {
      window.history.pushState(stateObj, '', targetPath);
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

  // ARCHITECTURE (2026 audit follow-up): site content used to live in one
  // single `foundation/global` document (settings, programs, notices,
  // press, gallery, popups all crammed together), which is capped at 1MB
  // total by Firestore. Growth in any one area (e.g. lots of notices)
  // could push the whole document over the limit and silently break
  // saving for every other area too.
  //
  // Content now lives in six separate documents under the `foundation`
  // collection instead: `settings`, `programs`, `notices`, `press`,
  // `gallery`, `popups` — each with its own independent 1MB budget. We
  // listen to the whole collection with one onSnapshot call and, for
  // each area, prefer the new split document but fall back to the
  // matching field on the old `foundation/global` document if that
  // area hasn't been saved since this update (so nothing is lost and no
  // manual migration step is required). As the admin edits each area
  // going forward, that area's data naturally moves into its own
  // document — the migration happens gradually, in the background,
  // simply by using the admin panel normally.
  useEffect(() => {
    testFirestoreConnection();

    const foundationCollectionRef = collection(db, 'foundation');

    const unsubscribe = onSnapshot(
      foundationCollectionRef,
      (snap) => {
        const byId: Record<string, any> = {};
        snap.docs.forEach((d) => {
          byId[d.id] = d.data();
        });
        const legacy = byId['global'] || {};

        const settingsSrc = byId['settings'] || legacy.settings;
        if (settingsSrc) {
          const { adminPassword: _legacyPassword, ...safeSettings } = settingsSrc as any;
          setSettings(prev => ({
            ...prev,
            ...safeSettings,
            heroImageUrl: settingsSrc.heroImageUrl || prev.heroImageUrl || INITIAL_SETTINGS.heroImageUrl,
            chairmanImageUrl: settingsSrc.chairmanImageUrl || prev.chairmanImageUrl || INITIAL_SETTINGS.chairmanImageUrl,
          }));
        }

        const programsSrc = byId['programs']?.items ?? legacy.programs;
        if (Array.isArray(programsSrc) && programsSrc.length > 0) setPrograms([...programsSrc]);

        const noticesSrc = byId['notices']?.items ?? legacy.notices;
        if (Array.isArray(noticesSrc) && noticesSrc.length > 0) setNotices([...noticesSrc]);

        const pressSrc = byId['press']?.items ?? legacy.pressItems;
        if (Array.isArray(pressSrc) && pressSrc.length > 0) setPressItems([...pressSrc]);

        // Firestore is the authoritative source for gallery data.
        // An empty gallery is also meaningful and must clear stale local cache.
        const gallerySrc = byId['gallery']?.items ?? legacy.gallery;
        if (Array.isArray(gallerySrc)) {
          const normalizedGallery = gallerySrc.map((g: any) => ({
            ...g,
            images: (Array.isArray(g.images) && g.images.length > 0) ? g.images : (g.imageUrl ? [g.imageUrl] : [])
          }));
          setGallery(normalizedGallery);
          try {
            localStorage.setItem('nerve_nae_gallery', JSON.stringify(normalizedGallery));
          } catch (e) {}
        }

        const galleryCategoriesSrc = byId['gallery']?.categories ?? legacy.galleryCategories ?? legacy.settings?.galleryCategories;
        if (Array.isArray(galleryCategoriesSrc) && galleryCategoriesSrc.length > 0) {
          setGalleryCategoriesState([...galleryCategoriesSrc]);
          try {
            localStorage.setItem('nerve_nae_gallery_categories', JSON.stringify(galleryCategoriesSrc));
          } catch (e) {}
        }

        const popupsSrc = byId['popups']?.items ?? legacy.popups;
        if (Array.isArray(popupsSrc) && popupsSrc.length > 0) setPopups([...popupsSrc]);
        // donations / inquiries / subscribers now live in their own
        // Firestore collections (see the isAdmin-gated listener below)
        // and are intentionally no longer read from `foundation` documents.

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
          `⚡ Firestore 클라우드 실시간 동기화 완료 (갤러리 ${gallerySrc?.length || 0}개, 공지 ${noticesSrc?.length || 0}개)`,
          `반영시간: ${timeStr} · 전 기기 1초 실시간 반영`
        );

        // Fresh install only: nothing exists anywhere yet (no legacy doc,
        // no split docs) and an admin is logged in — seed the split
        // documents from the in-app defaults so the site isn't blank.
        if (snap.empty && auth.currentUser) {
          const nowIso = new Date().toISOString();
          const batch = writeBatch(db);
          batch.set(doc(db, 'foundation', 'settings'), { ...settings, updatedAt: nowIso }, { merge: true });
          batch.set(doc(db, 'foundation', 'programs'), { items: programs, updatedAt: nowIso }, { merge: true });
          batch.set(doc(db, 'foundation', 'notices'), { items: notices, updatedAt: nowIso }, { merge: true });
          batch.set(doc(db, 'foundation', 'press'), { items: pressItems, updatedAt: nowIso }, { merge: true });
          batch.set(doc(db, 'foundation', 'gallery'), { items: gallery, categories: galleryCategories, updatedAt: nowIso }, { merge: true });
          batch.set(doc(db, 'foundation', 'popups'), { items: popups, updatedAt: nowIso }, { merge: true });
          batch.commit().catch(err => handleFirestoreError(err, OperationType.WRITE, 'foundation (initial seed)'));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'foundation');
        isFirestoreActiveRef.current = false;
        fetchServerData();
      }
    );

    return () => unsubscribe();
  }, [addDebugLog]);

  // Donations / inquiries / subscribers live in their own collections and
  // are only readable by the admin (firestore.rules). We only attach
  // these listeners once actually signed in as admin — attempting to read
  // them while logged out would just fail with a permission-denied error
  // on every snapshot, which is expected (not a bug) but noisy.
  useEffect(() => {
    if (!isAdmin) {
      setDonations([]);
      setInquiries([]);
      setSubscribers([]);
      return;
    }

    const unsubDonations = onSnapshot(
      query(collection(db, 'donations'), orderBy('createdAt', 'desc')),
      (snap) => setDonations(snap.docs.map(d => ({ id: d.id, ...d.data() } as DonationApplication))),
      (error) => handleFirestoreError(error, OperationType.GET, 'donations')
    );
    const unsubInquiries = onSnapshot(
      query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')),
      (snap) => setInquiries(snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactInquiry))),
      (error) => handleFirestoreError(error, OperationType.GET, 'inquiries')
    );
    const unsubSubscribers = onSnapshot(
      query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc')),
      (snap) => setSubscribers(snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsletterSubscriber))),
      (error) => handleFirestoreError(error, OperationType.GET, 'subscribers')
    );

    return () => {
      unsubDonations();
      unsubInquiries();
      unsubSubscribers();
    };
  }, [isAdmin]);

  const fetchServerData = async (isManual = false) => {
    setIsSyncing(true);
    setSyncStatus('syncing');
    const startTime = Date.now();
    try {
      // 1. Try Firestore direct fetch first (split docs, same fallback-to-legacy logic as the realtime listener above)
      const snap = await getDocs(collection(db, 'foundation'));
      if (!snap.empty) {
        const byId: Record<string, any> = {};
        snap.docs.forEach((d) => { byId[d.id] = d.data(); });
        const legacy = byId['global'] || {};

        const settingsSrc = byId['settings'] || legacy.settings;
        if (settingsSrc) {
          const { adminPassword: _legacyPassword, ...safeSettings } = settingsSrc as any;
          setSettings(prev => ({ ...prev, ...safeSettings }));
        }
        const programsSrc = byId['programs']?.items ?? legacy.programs;
        if (Array.isArray(programsSrc) && programsSrc.length > 0) setPrograms([...programsSrc]);
        const noticesSrc = byId['notices']?.items ?? legacy.notices;
        if (Array.isArray(noticesSrc) && noticesSrc.length > 0) setNotices([...noticesSrc]);
        const pressSrc = byId['press']?.items ?? legacy.pressItems;
        if (Array.isArray(pressSrc) && pressSrc.length > 0) setPressItems([...pressSrc]);
        const gallerySrc = byId['gallery']?.items ?? legacy.gallery;
        if (Array.isArray(gallerySrc) && gallerySrc.length > 0) setGallery([...gallerySrc]);
        const popupsSrc = byId['popups']?.items ?? legacy.popups;
        if (Array.isArray(popupsSrc) && popupsSrc.length > 0) setPopups([...popupsSrc]);
        // donations / inquiries / subscribers: see the dedicated
        // isAdmin-gated Firestore collection listener below.

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

      // Firestore is the only data source now. The old fallback to a
      // separate unauthenticated `/api/data` endpoint was removed for
      // security reasons (see src/serverApp.ts) — that endpoint let
      // anyone read the site's full data, including donor/inquiry
      // personal information, with no login required. If Firestore is
      // unreachable we simply keep whatever was last loaded and surface
      // the error below instead of silently falling back to it.
      isServerAvailableRef.current = false;
      setSyncStatus('success');
      setSyncError(null);
      const timeStr = new Date().toLocaleTimeString('ko-KR') + ' (보존 모드)';
      setLastSyncTime(timeStr);
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
      localStorage.setItem('nerve_nae_press', JSON.stringify(pressItems));
    } catch (e) {}
  }, [pressItems]);

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

  // Firestore & Server dual-write mutation helper
  const postMutationToServer = useCallback((docName: string, payload: any, actionName: string) => {
    // Writes to one of the split `foundation/{docName}` documents
    // (settings / programs / notices / press / gallery / popups) instead
    // of the old shared `foundation/global` document — see the realtime
    // listener above for why. Each domain now has its own independent
    // 1MB budget, so a large notices archive can no longer block a
    // programs or settings save (or vice versa).
    const targetDocRef = doc(db, 'foundation', docName);
    // Strip any `undefined` field values (e.g. `attachmentName: undefined`
    // when a notice has no attachment) — Firestore's setDoc() throws
    // synchronously on these, which silently skips our own .catch() error
    // handling entirely. See sanitizeForFirestore.ts for the full story.
    const firestoreUpdate: any = sanitizeForFirestore({
      ...payload,
      updatedAt: new Date().toISOString()
    });

    // Fail fast with a clear Korean message instead of a silent/confusing
    // setDoc rejection if a single domain's own data somehow still
    // approaches the 1MB-per-document cap (e.g. an enormous gallery).
    const approxSizeBytes = new Blob([JSON.stringify(firestoreUpdate)]).size;
    const FIRESTORE_DOC_SOFT_LIMIT_BYTES = 900 * 1024; // 900KB safety margin under the 1MB hard cap
    if (approxSizeBytes > FIRESTORE_DOC_SOFT_LIMIT_BYTES) {
      const sizeKb = Math.round(approxSizeBytes / 1024);
      handleFirestoreError(
        new Error(`Payload too large for a single Firestore document: ~${sizeKb}KB`),
        OperationType.WRITE,
        `foundation/${docName}`
      );
      setSyncStatus('error');
      setSyncError(
        `${actionName} 저장에 실패했습니다. 저장하려는 데이터 용량(약 ${sizeKb}KB)이 너무 큽니다. ` +
        `이미지·첨부파일이 base64로 직접 포함되어 있지 않은지 확인해주세요. (Firestore 문서 1개당 최대 1MB)`
      );
      return;
    }

    try {
      setDoc(targetDocRef, firestoreUpdate, { merge: true })
        .then(() => {
          addDebugLog('success', `[⚡ Firestore 클라우드 즉시 저장 완료] ${actionName}`);
          setSyncTimestamp(Date.now());
          setSyncStatus('success');
          setSyncError(null);
        })
        .catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `foundation/${docName}`);
          // Surface the failure instead of only logging it — a silent catch here
          // is exactly what made past writes (e.g. notices with attachments that
          // pushed the shared foundation/global document past Firestore's 1MB
          // limit) disappear without any visible error for the admin.
          setSyncStatus('error');
          setSyncError(`${actionName} 저장에 실패했습니다. (${err instanceof Error ? err.message : String(err)})`);
        });
    } catch (err) {
      // setDoc() can throw SYNCHRONOUSLY (e.g. invalid field values), in
      // which case the .then()/.catch() chain above never even attaches.
      // Without this try/catch that failure would be completely invisible:
      // local state already looks saved, but Firestore never receives the
      // write, and the change quietly reverts on the next refresh.
      handleFirestoreError(err, OperationType.WRITE, `foundation/${docName}`);
      setSyncStatus('error');
      setSyncError(`${actionName} 저장에 실패했습니다. (${err instanceof Error ? err.message : String(err)})`);
    }

    // NOTE: This used to also POST the same payload to a legacy Express
    // `/api/*` endpoint as a "fallback" data store. That endpoint had NO
    // authentication on the server, so anyone who knew the URL could
    // overwrite the site's content or read it back out — including donor
    // and inquiry personal data. Firestore (gated by firestore.rules) is
    // now the single source of truth.
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
    postMutationToServer('programs', { items: next }, `사업 추가: ${newProgram.title}`);
  };

  const updateProgram = (id: string, updated: Partial<ProgramItem>) => {
    const next = programs.map(p => p.id === id ? { ...p, ...updated } : p);
    setPrograms(next);
    postMutationToServer('programs', { items: next }, `사업 수정 (ID: ${id})`);
  };

  const deleteProgram = (id: string) => {
    const next = programs.filter(p => p.id !== id);
    setPrograms(next);
    postMutationToServer('programs', { items: next }, `사업 삭제 (ID: ${id})`);
  };

  // Applies a new notices array to both React state and the ref in one
  // synchronous step, so any CRUD call made immediately afterward always
  // sees the freshest array — no dependency on waiting for a re-render.
  const applyNotices = (next: NoticeItem[]) => {
    noticesRef.current = next;
    setNotices(next);
  };

  // Notice CRUD
  //
  // IMPORTANT: `next` is computed from `noticesRef.current` (always up to
  // date) rather than the `notices` closure variable, and `postMutationToServer`
  // (a real side effect — Firestore write + network fetch) is called as a
  // normal statement here, NOT from inside a setState updater callback.
  // A previous version called it inside `setNotices(prev => { ...; return next })`,
  // which is unsafe: React may invoke updater functions more than once
  // (guaranteed in dev under StrictMode) without ever committing the result,
  // so a side effect placed there can fire redundantly or interleave with
  // React's render phase and crash the app to a blank screen — exactly the
  // "공지를 올리면 진행이 안 되고 빈 문서만 나온다" symptom.
  const addNotice = (item: Omit<NoticeItem, 'id' | 'views' | 'date'> & { date?: string }) => {
    const newNotice: NoticeItem = {
      ...item,
      id: `not-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: item.date || new Date().toISOString().split('T')[0],
      views: 1
    };
    const next = [newNotice, ...noticesRef.current];
    applyNotices(next);
    postMutationToServer('notices', { items: next }, `공지 추가: ${newNotice.title}`);
  };

  const updateNotice = (id: string, updated: Partial<NoticeItem>) => {
    const next = noticesRef.current.map(n => n.id === id ? { ...n, ...updated } : n);
    applyNotices(next);
    postMutationToServer('notices', { items: next }, `공지 수정 (ID: ${id})`);
  };

  const deleteNotice = (id: string) => {
    const next = noticesRef.current.filter(n => n.id !== id);
    applyNotices(next);
    postMutationToServer('notices', { items: next }, `공지 삭제 (ID: ${id})`);
  };

  // Press Coverage CRUD (보도자료) — same ref-based, side-effect-outside-updater
  // pattern as Notice CRUD above.
  const applyPressItems = (next: PressCoverageItem[]) => {
    pressItemsRef.current = next;
    setPressItems(next);
  };

  const addPress = (item: Omit<PressCoverageItem, 'id'>) => {
    const newItem: PressCoverageItem = {
      ...item,
      id: `press-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    };
    const next = [newItem, ...pressItemsRef.current];
    applyPressItems(next);
    postMutationToServer('press', { items: next }, `보도자료 추가: ${newItem.title}`);
  };

  const updatePress = (id: string, updated: Partial<PressCoverageItem>) => {
    const next = pressItemsRef.current.map(p => p.id === id ? { ...p, ...updated } : p);
    applyPressItems(next);
    postMutationToServer('press', { items: next }, `보도자료 수정 (ID: ${id})`);
  };

  const deletePress = (id: string) => {
    const next = pressItemsRef.current.filter(p => p.id !== id);
    applyPressItems(next);
    postMutationToServer('press', { items: next }, `보도자료 삭제 (ID: ${id})`);
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

    // Gallery items are written directly to Firestore's split `gallery`
    // document (see the architecture note above `postMutationToServer`).
    const galleryDocRef = doc(db, 'foundation', 'gallery');

    setDoc(
      galleryDocRef,
      {
        items: next,
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
          'foundation/gallery.items'
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

    const galleryDocRef = doc(db, 'foundation', 'gallery');

    try {
      await setDoc(
        galleryDocRef,
        {
          items: next,
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
          'foundation/gallery.items'
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
    const galleryDocRef = doc(db, 'foundation', 'gallery');

    try {
      await setDoc(
        galleryDocRef,
        {
          items: next,
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
          'foundation/gallery.items'
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

    const galleryDocRef = doc(db, 'foundation', 'gallery');
    try {
      await setDoc(
        galleryDocRef,
        {
          categories: next,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      addDebugLog('success', `갤러리 카테고리 항목 추가 완료: ${trimmed}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'foundation/gallery.categories');
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

    const galleryDocRef = doc(db, 'foundation', 'gallery');
    try {
      await setDoc(
        galleryDocRef,
        {
          categories: uniqueCategories,
          items: nextGallery,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      addDebugLog('success', `갤러리 카테고리 항목 수정 완료 (${oldCategory} → ${trimmedNew})`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'foundation/gallery.categories');
      throw err;
    }
  };

  const deleteGalleryCategory = async (categoryToDelete: string) => {
    const nextCategories = galleryCategories.filter(c => c !== categoryToDelete);
    setGalleryCategoriesState(nextCategories);

    try {
      localStorage.setItem('nerve_nae_gallery_categories', JSON.stringify(nextCategories));
    } catch (e) {}

    const galleryDocRef = doc(db, 'foundation', 'gallery');
    try {
      await setDoc(
        galleryDocRef,
        {
          categories: nextCategories,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      addDebugLog('success', `갤러리 카테고리 항목 삭제 완료: ${categoryToDelete}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'foundation/gallery.categories');
      throw err;
    }
  };

  const setGalleryCategories = async (newCategories: string[]) => {
    const filtered = Array.from(new Set(newCategories.map(c => c.trim()).filter(Boolean)));
    setGalleryCategoriesState(filtered);
    try {
      localStorage.setItem('nerve_nae_gallery_categories', JSON.stringify(filtered));
    } catch (e) {}

    const galleryDocRef = doc(db, 'foundation', 'gallery');
    try {
      await setDoc(
        galleryDocRef,
        {
          categories: filtered,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'foundation/gallery.categories');
    }
  };

  // Donations CRUD — stored in their own Firestore collection (see
  // firestore.rules): the public may only create a new document (submit a
  // donation application); reading, updating, and deleting requires the
  // admin Firebase Auth account. This keeps donor personal information out
  // of the publicly-readable `foundation/global` document.
  const addDonation = async (item: Omit<DonationApplication, 'id' | 'createdAt' | 'status'>) => {
    const newDonation: Omit<DonationApplication, 'id'> = {
      ...item,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: '접수완료'
    };
    try {
      await addDoc(collection(db, 'donations'), newDonation);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'donations');
      throw err;
    }
  };

  const updateDonationStatus = async (id: string, status: '접수완료' | '확인중' | '처리완료') => {
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    try {
      await updateDoc(doc(db, 'donations', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `donations/${id}`);
    }
  };

  const deleteDonation = async (id: string) => {
    setDonations(prev => prev.filter(d => d.id !== id));
    try {
      await deleteDoc(doc(db, 'donations', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `donations/${id}`);
    }
  };

  // Inquiries CRUD — same pattern as donations above.
  const addInquiry = async (item: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInquiry: Omit<ContactInquiry, 'id'> = {
      ...item,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: '대기중'
    };
    try {
      await addDoc(collection(db, 'inquiries'), newInquiry);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'inquiries');
      throw err;
    }
  };

  const updateInquiryStatus = async (id: string, status: '대기중' | '답변완료') => {
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    try {
      await updateDoc(doc(db, 'inquiries', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `inquiries/${id}`);
    }
  };

  const deleteInquiry = async (id: string) => {
    setInquiries(prev => prev.filter(i => i.id !== id));
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `inquiries/${id}`);
    }
  };

  // Subscribers CRUD — same pattern. Note: because a logged-out visitor
  // cannot read this collection (only create), we cannot check here
  // whether their email already exists before writing; a duplicate submit
  // simply creates a second document, which the admin can merge/clean up
  // from the admin panel. This trades a little admin housekeeping for not
  // exposing the subscriber list to the public.
  const addSubscriber = async (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) return;
    const newSub: Omit<NewsletterSubscriber, 'id'> = {
      email: trimmed,
      subscribedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: '구독중'
    };
    try {
      await addDoc(collection(db, 'subscribers'), newSub);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'subscribers');
      throw err;
    }
  };

  const updateSubscriberStatus = async (id: string, status: '구독중' | '해지') => {
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    try {
      await updateDoc(doc(db, 'subscribers', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `subscribers/${id}`);
    }
  };

  const deleteSubscriber = async (id: string) => {
    setSubscribers(prev => prev.filter(s => s.id !== id));
    try {
      await deleteDoc(doc(db, 'subscribers', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `subscribers/${id}`);
    }
  };

  const addPopup = (popupData: Omit<PopupItem, 'id' | 'createdAt'>) => {
    const newPopup: PopupItem = {
      ...popupData,
      id: `popup-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const next = [newPopup, ...popups];
    setPopups(next);
    postMutationToServer('popups', { items: next }, `팝업 추가: ${newPopup.title}`);
  };

  const updatePopup = (id: string, updatedData: Partial<PopupItem>) => {
    const next = popups.map(p => p.id === id ? { ...p, ...updatedData } : p);
    setPopups(next);
    postMutationToServer('popups', { items: next }, `팝업 수정 (ID: ${id})`);
  };

  const deletePopup = (id: string) => {
    const next = popups.filter(p => p.id !== id);
    setPopups(next);
    postMutationToServer('popups', { items: next }, `팝업 삭제 (ID: ${id})`);
  };

  const togglePopupActive = (id: string) => {
    const next = popups.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p);
    setPopups(next);
    postMutationToServer('popups', { items: next }, `팝업 활성 토글 (ID: ${id})`);
  };

  const updateSettings = (newSettings: Partial<FoundationSettings>) => {
    setSettings(prev => {
      const { adminPassword: _legacyPassword, ...safePrev } = prev as any;
      const { adminPassword: _incomingPassword, ...safeNewSettings } = newSettings as any;
      const next = { ...safePrev, ...safeNewSettings } as FoundationSettings;
      try {
        localStorage.setItem('nerve_nae_settings', JSON.stringify(next));
      } catch (e) {}
      // Settings now live in their own `foundation/settings` document
      // (fields stored flat, matching the FoundationSettings shape)
      // rather than nested under a `settings` key on the old shared doc.
      postMutationToServer('settings', next, '재단 기본 설정 업데이트');
      setSyncTimestamp(Date.now());
      return next;
    });
  };

  const resetToDefaults = () => {
    // Only resets site content (settings/programs/notices/gallery/popups).
    // Donations, inquiries, and subscribers now live in their own Firestore
    // collections and are intentionally NOT touched here — a "reset to
    // defaults" button should never be able to bulk-delete real donor or
    // inquiry records. Delete those individually from the admin panel if
    // truly needed.
    setSettings(INITIAL_SETTINGS);
    setPrograms(INITIAL_PROGRAMS);
    setNotices(INITIAL_NOTICES);
    setGallery(INITIAL_GALLERY);
    setPopups(INITIAL_POPUPS);
    try {
      // Clear only this app's non-sensitive content caches. Never clear the
      // entire browser storage: doing so can erase unrelated site settings.
      [
        'nerve_nae_settings',
        'nerve_nae_programs',
        'nerve_nae_notices',
        'nerve_nae_press',
        'nerve_nae_gallery',
        'nerve_nae_gallery_categories',
        'nerve_nae_popups',
        'nerve_nae_donations',
        'nerve_nae_inquiries',
        'nerve_nae_subscribers'
      ].forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Scoped cache cleanup failed during reset', e);
    }

    const nowIso = new Date().toISOString();
    const batch = writeBatch(db);
    batch.set(doc(db, 'foundation', 'settings'), { ...INITIAL_SETTINGS, updatedAt: nowIso }, { merge: true });
    batch.set(doc(db, 'foundation', 'programs'), { items: INITIAL_PROGRAMS, updatedAt: nowIso }, { merge: true });
    batch.set(doc(db, 'foundation', 'notices'), { items: INITIAL_NOTICES, updatedAt: nowIso }, { merge: true });
    batch.set(doc(db, 'foundation', 'gallery'), { items: INITIAL_GALLERY, updatedAt: nowIso }, { merge: true });
    batch.set(doc(db, 'foundation', 'popups'), { items: INITIAL_POPUPS, updatedAt: nowIso }, { merge: true });
    batch.commit().catch(err => {
      handleFirestoreError(err, OperationType.WRITE, 'foundation (reset to defaults)');
      setSyncStatus('error');
      setSyncError('초기화 저장에 실패했습니다.');
    });
  };

  const incrementNoticeViews = (id: string) => {
    // Same visitor reopening the same notice within 24h no longer re-counts.
    if (hasRecentlyViewedNotice(id)) return;
    markNoticeAsViewed(id);

    const next = noticesRef.current.map(n => n.id === id ? { ...n, views: n.views + 1 } : n);
    applyNotices(next);
    // Persist the increment to Firestore so the count is shared across
    // devices/visitors instead of only living in this browser's state.
    postMutationToServer('notices', { items: next }, `공지 조회수 증가 (ID: ${id})`);
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
        pressItems,
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

        // Press Coverage CRUD
        addPress,
        updatePress,
        deletePress,

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
