import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  FoundationData,
  FoundationSettings,
  ProgramItem,
  NoticeItem,
  GalleryItem,
  DonationItem,
  InquiryItem,
  SubscriberItem,
  PopupItem,
  TimelineItem,
  TabType,
  AboutSubTab
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_PROGRAMS,
  INITIAL_NOTICES,
  INITIAL_GALLERY,
  INITIAL_DONATIONS,
  INITIAL_INQUIRIES,
  INITIAL_SUBSCRIBERS,
  INITIAL_POPUPS,
  INITIAL_TIMELINE
} from '../data/initialData';
import {
  loadStoreFromFirestore,
  saveStoreToFirestore,
  saveDonationsToFirestore,
  saveInquiriesToFirestore,
  saveSubscribersToFirestore
} from '../lib/firestoreService';
import { getImageUrl } from '../utils/imageUrl';

interface FoundationContextType {
  settings: FoundationSettings;
  updateSettings: (newSettings: Partial<FoundationSettings>) => void;
  programs: ProgramItem[];
  addProgram: (item: Omit<ProgramItem, 'id' | 'code' | 'createdAt'>) => void;
  updateProgram: (id: string, item: Partial<ProgramItem>) => void;
  deleteProgram: (id: string) => void;
  notices: NoticeItem[];
  addNotice: (item: Omit<NoticeItem, 'id' | 'views' | 'createdAt'>) => void;
  updateNotice: (id: string, item: Partial<NoticeItem>) => void;
  deleteNotice: (id: string) => void;
  gallery: GalleryItem[];
  addGallery: (item: Omit<GalleryItem, 'id' | 'createdAt'>) => void;
  updateGallery: (id: string, item: Partial<GalleryItem>) => void;
  deleteGallery: (id: string) => void;
  donations: DonationItem[];
  addDonation: (item: Omit<DonationItem, 'id' | 'createdAt' | 'status'>) => void;
  updateDonationStatus: (id: string, status: DonationItem['status']) => void;
  deleteDonation: (id: string) => void;
  inquiries: InquiryItem[];
  addInquiry: (item: Omit<InquiryItem, 'id' | 'createdAt' | 'status'>) => void;
  updateInquiryStatus: (id: string, status: InquiryItem['status']) => void;
  deleteInquiry: (id: string) => void;
  subscribers: SubscriberItem[];
  addSubscriber: (email: string) => boolean;
  updateSubscriberStatus: (id: string, status: SubscriberItem['status']) => void;
  deleteSubscriber: (id: string) => void;
  popups: PopupItem[];
  addPopup: (item: Omit<PopupItem, 'id' | 'createdAt'>) => void;
  updatePopup: (id: string, item: Partial<PopupItem>) => void;
  deletePopup: (id: string) => void;
  togglePopupActive: (id: string) => void;
  timeline: TimelineItem[];
  resetToDefaults: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  aboutSubTab: AboutSubTab;
  setAboutSubTab: (subTab: AboutSubTab) => void;
  adminOpen: boolean;
  setAdminOpen: (open: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  hasNewDonation: boolean;
  pendingDonationsCount: number;
  markDonationsAsRead: () => void;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncTime: Date | null;
  syncError: string | null;
  forceSyncNow: () => Promise<void>;
  getImageUrl: (path: string | undefined | null) => string;
}

const FoundationContext = createContext<FoundationContextType | undefined>(undefined);

export const FoundationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<FoundationSettings>(() => {
    try {
      const local = localStorage.getItem('foundation_settings');
      return local ? JSON.parse(local) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [programs, setPrograms] = useState<ProgramItem[]>(() => {
    try {
      const local = localStorage.getItem('foundation_programs');
      return local ? JSON.parse(local) : INITIAL_PROGRAMS;
    } catch {
      return INITIAL_PROGRAMS;
    }
  });

  const [notices, setNotices] = useState<NoticeItem[]>(() => {
    try {
      const local = localStorage.getItem('foundation_notices');
      return local ? JSON.parse(local) : INITIAL_NOTICES;
    } catch {
      return INITIAL_NOTICES;
    }
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    try {
      const local = localStorage.getItem('foundation_gallery');
      return local ? JSON.parse(local) : INITIAL_GALLERY;
    } catch {
      return INITIAL_GALLERY;
    }
  });

  const [donations, setDonations] = useState<DonationItem[]>(() => {
    try {
      const local = localStorage.getItem('foundation_donations');
      return local ? JSON.parse(local) : INITIAL_DONATIONS;
    } catch {
      return INITIAL_DONATIONS;
    }
  });

  const [inquiries, setInquiries] = useState<InquiryItem[]>(() => {
    try {
      const local = localStorage.getItem('foundation_inquiries');
      return local ? JSON.parse(local) : INITIAL_INQUIRIES;
    } catch {
      return INITIAL_INQUIRIES;
    }
  });

  const [subscribers, setSubscribers] = useState<SubscriberItem[]>(() => {
    try {
      const local = localStorage.getItem('foundation_subscribers');
      return local ? JSON.parse(local) : INITIAL_SUBSCRIBERS;
    } catch {
      return INITIAL_SUBSCRIBERS;
    }
  });

  const [popups, setPopups] = useState<PopupItem[]>(() => {
    try {
      const local = localStorage.getItem('foundation_popups');
      return local ? JSON.parse(local) : INITIAL_POPUPS;
    } catch {
      return INITIAL_POPUPS;
    }
  });

  const [timeline] = useState<TimelineItem[]>(INITIAL_TIMELINE);
  const [activeTab, setActiveTab] = useState<TabType>('main');
  const [aboutSubTab, setAboutSubTab] = useState<AboutSubTab>('greeting');
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [hasNewDonation, setHasNewDonation] = useState<boolean>(false);
  const [pendingDonationsCount, setPendingDonationsCount] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const initialLoadedRef = useRef(false);

  // 1회 초기 로드만 안전하게 실행 (무한 반복 제거)
  useEffect(() => {
    if (initialLoadedRef.current) return;
    initialLoadedRef.current = true;

    const loadData = async () => {
      try {
        setSyncStatus('syncing');
        const remoteData = await loadStoreFromFirestore();
        if (remoteData) {
          if (remoteData.settings) {
            setSettings(remoteData.settings);
            localStorage.setItem('foundation_settings', JSON.stringify(remoteData.settings));
          }
          if (remoteData.programs) {
            setPrograms(remoteData.programs);
            localStorage.setItem('foundation_programs', JSON.stringify(remoteData.programs));
          }
          if (remoteData.notices) {
            setNotices(remoteData.notices);
            localStorage.setItem('foundation_notices', JSON.stringify(remoteData.notices));
          }
          if (remoteData.gallery) {
            setGallery(remoteData.gallery);
            localStorage.setItem('foundation_gallery', JSON.stringify(remoteData.gallery));
          }
          if (remoteData.donations) {
            setDonations(remoteData.donations);
            localStorage.setItem('foundation_donations', JSON.stringify(remoteData.donations));
          }
          if (remoteData.inquiries) {
            setInquiries(remoteData.inquiries);
            localStorage.setItem('foundation_inquiries', JSON.stringify(remoteData.inquiries));
          }
          if (remoteData.subscribers) {
            setSubscribers(remoteData.subscribers);
            localStorage.setItem('foundation_subscribers', JSON.stringify(remoteData.subscribers));
          }
          if (remoteData.popups) {
            setPopups(remoteData.popups);
            localStorage.setItem('foundation_popups', JSON.stringify(remoteData.popups));
          }
        }
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err: any) {
        console.error('Firestore initial load error:', err);
        setSyncStatus('error');
        setSyncError(err?.message || '동기화 오류');
      }
    };

    loadData();
  }, []);

  // 미확인 후원건수 계산
  useEffect(() => {
    const pending = donations.filter(d => d.status === '접수완료').length;
    setPendingDonationsCount(pending);
    setHasNewDonation(pending > 0);
  }, [donations]);

  const updateSettings = async (newSettings: Partial<FoundationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('foundation_settings', JSON.stringify(updated));
    await saveStoreToFirestore({ settings: updated, programs, notices, gallery, donations, inquiries, subscribers, popups });
  };

  const addProgram = async (item: Omit<ProgramItem, 'id' | 'code' | 'createdAt'>) => {
    const newItem: ProgramItem = {
      ...item,
      id: `prog-${Date.now()}`,
      code: `P${String(programs.length + 1).padStart(2, '0')}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newItem, ...programs];
    setPrograms(updated);
    localStorage.setItem('foundation_programs', JSON.stringify(updated));
    await saveStoreToFirestore({ settings, programs: updated, notices, gallery, donations, inquiries, subscribers, popups });
  };

  const updateProgram = async (id: string, item: Partial<ProgramItem>) => {
    const updated = programs.map(p => p.id === id ? { ...p, ...item } : p);
    setPrograms(updated);
    localStorage.setItem('foundation_programs', JSON.stringify(updated));
    await saveStoreToFirestore({ settings, programs: updated, notices, gallery, donations, inquiries, subscribers, popups });
  };

  const deleteProgram = async (id: string) => {
    const updated = programs.filter(p => p.id !== id);
    setPrograms(updated);
    localStorage.setItem('foundation_programs', JSON.stringify(updated));
    await saveStoreToFirestore({ settings, programs: updated, notices, gallery, donations, inquiries, subscribers, popups });
  };

  const addNotice = async (item: Omit<NoticeItem, 'id' | 'views' | 'createdAt'>) => {
    const newItem: NoticeItem = {
      ...item,
      id: `not-${Date.now()}`,
      views: 0,
      createdAt: new Date().toISOString()
    };
    const updated = [newItem, ...notices];
    setNotices(updated);
    localStorage.setItem('foundation_notices', JSON.stringify(updated));
    await saveStoreToFirestore({ settings, programs, notices: updated, gallery, donations, inquiries, subscribers, popups });
  };

  const updateNotice = async (id: string, item: Partial<NoticeItem>) => {
    const updated = notices.map(n => n.id === id ? { ...n, ...item } : n);
    setNotices(updated);
    localStorage.setItem('foundation_notices', JSON.stringify(updated));
    await saveStoreToFirestore({ settings, programs, notices: updated, gallery, donations, inquiries, subscribers, popups });
  };

  const deleteNotice = async (id: string) => {
    const updated = notices.filter(n => n.id !== id);
    setNotices(updated);
    localStorage.setItem('foundation_notices', JSON.stringify(updated));
    await saveStoreToFirestore({ settings, programs, notices: updated, gallery, donations, inquiries, subscribers, popups });
  };

  const addGallery = async (item: Omit<GalleryItem, 'id' | 'createdAt'>) => {
    const newItem: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newItem, ...gallery];
    setGallery(updated);
    localStorage.setItem('foundation_gallery', JSON.stringify(updated));
    await saveStoreToFirestore({ settings, programs, notices, gallery: updated, donations, inquiries, subscribers, popups });
  };

  const updateGallery = async (id: string, item: Partial<GalleryItem>) => {
    const updated = gallery.map(g => g.id === id ? { ...g, ...item } : g);
    setGallery(updated);
    localStorage.setItem('foundation_gallery', JSON.stringify(updated));
    await saveStoreToFirestore({ settings, programs, notices, gallery: updated, donations, inquiries, subscribers, popups });
  };

  const deleteGallery = async (id: string) => {
    const updated = gallery.filter(g => g.id !== id);
    setGallery(updated);
    localStorage.setItem('foundation_gallery', JSON.stringify(updated));
    await saveStoreToFirestore({ settings, programs, notices, gallery: updated, donations, inquiries, subscribers, popups });
  };

  const addDonation = async (item: Omit<DonationItem, 'id' | 'createdAt' | 'status'>) => {
    const newItem: DonationItem = {
      ...item,
      id: `don-${Date.now()}`,
      status: '접수완료',
      createdAt: new Date().toISOString()
    };
    const updated = [newItem, ...donations];
    setDonations(updated);
    localStorage.setItem('foundation_donations', JSON.stringify(updated));
    await saveDonationsToFirestore(updated);
  };

  const updateDonationStatus = async (id: string, status: DonationItem['status']) => {
    const updated = donations.map(d => d.id === id ? { ...d, status } : d);
    setDonations(updated);
    localStorage.setItem('foundation_donations', JSON.stringify(updated));
    await saveDonationsToFirestore(updated);
  };

  const deleteDonation = async (id: string) => {
    const updated = donations.filter(d => d.id !== id);
    setDonations(updated);
    localStorage.setItem('foundation_donations', JSON.stringify(updated));
    await saveDonationsToFirestore(updated);
  };

  const addInquiry = async (item: Omit<InquiryItem, 'id' | 'createdAt' | 'status'>) => {
    const newItem: InquiryItem = {
      ...item,
      id: `inq-${Date.now()}`,
      status: '대기중',
      createdAt: new Date().toISOString()
    };
    const updated = [newItem, ...inquiries];
    setInquiries(updated);
    localStorage.setItem('foundation_inquiries', JSON.stringify(updated));
    await saveInquiriesToFirestore(updated);
  };

  const updateInquiryStatus = async (id: string, status: InquiryItem['status']) => {
    const updated = inquiries.map(i => i.id === id ? { ...i, status } : i);
    setInquiries(updated);
    localStorage.setItem('foundation_inquiries', JSON.stringify(updated));
    await saveInquiriesToFirestore(updated);
  };

  const deleteInquiry = async (id: string) => {
    const updated = inquiries.filter(i => i.id !== id);
    setInquiries(updated);
    localStorage.setItem('foundation_inquiries', JSON.stringify(updated));
    await saveInquiriesToFirestore(updated);
  };

  const addSubscriber = (email: string): boolean => {
    if (subscribers.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }
    const newItem: SubscriberItem = {
      id: `sub-${Date.now()}`,
      email,
      status: '구독중',
      subscribedAt: new Date().toISOString()
    };
    const updated = [newItem, ...subscribers];
    setSubscribers(updated);
    localStorage.setItem('foundation_subscribers', JSON.stringify(updated));
    saveSubscribersToFirestore(updated);
    return true;
  };

  const updateSubscriberStatus = async (id: string, status: SubscriberItem['status']) => {
    const updated = subscribers.map(s => s.id === id ? { ...s, status } : s);
    setSubscribers(updated);
    localStorage.setItem('foundation_subscribers', JSON.stringify(updated));
    await saveSubscribersToFirestore(updated);
  };

  const deleteSubscriber = async (id: string) => {
    const updated = subscribers.filter(s => s.id !== id);
    setSubscribers(updated);
    localStorage.setItem('foundation_subscribers', JSON.stringify(updated));
    await saveSubscribersToFirestore(updated);
  };

  const addPopup = async (item: Omit<PopupItem, 'id' | 'createdAt'>) => {
    const newItem: PopupItem = {
      ...item,
      id: `pop-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newItem, ...popups];
    setPopups(updated);
    localStorage.setItem('foundation_popups', JSON.stringify(updated));
    await saveStoreToFirestore({ settings, programs, notices, gallery, donations, inquiries, subscribers, popups: updated });
  };

  const updatePopup = async (id: string, item: Partial<PopupItem>) => {
    const updated = popups.map(p => p.id === id ? { ...p, ...item } : p);
    setPopups(updated);
    localStorage.setItem('foundation_popups', JSON.stringify(updated));
    await saveStoreToFirestore({ settings, programs, notices, gallery, donations, inquiries, subscribers, popups: updated });
  };

  const deletePopup = async (id: string) => {
    const updated = popups.filter(p => p.id !== id);
    setPopups(updated);
    localStorage.setItem('foundation_popups', JSON.stringify(updated));
    await saveStoreToFirestore({ settings, programs, notices, gallery, donations, inquiries, subscribers, popups: updated });
  };

  const togglePopupActive = async (id: string) => {
    const updated = popups.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p);
    setPopups(updated);
    localStorage.setItem('foundation_popups', JSON.stringify(updated));
    await saveStoreToFirestore({ settings, programs, notices, gallery, donations, inquiries, subscribers, popups: updated });
  };

  const resetToDefaults = async () => {
    localStorage.clear();
    setSettings(INITIAL_SETTINGS);
    setPrograms(INITIAL_PROGRAMS);
    setNotices(INITIAL_NOTICES);
    setGallery(INITIAL_GALLERY);
    setDonations(INITIAL_DONATIONS);
    setInquiries(INITIAL_INQUIRIES);
    setSubscribers(INITIAL_SUBSCRIBERS);
    setPopups(INITIAL_POPUPS);
    await saveStoreToFirestore({
      settings: INITIAL_SETTINGS,
      programs: INITIAL_PROGRAMS,
      notices: INITIAL_NOTICES,
      gallery: INITIAL_GALLERY,
      donations: INITIAL_DONATIONS,
      inquiries: INITIAL_INQUIRIES,
      subscribers: INITIAL_SUBSCRIBERS,
      popups: INITIAL_POPUPS
    });
  };

  const markDonationsAsRead = () => {
    setHasNewDonation(false);
  };

  const forceSyncNow = async () => {
    setSyncStatus('syncing');
    try {
      const remoteData = await loadStoreFromFirestore();
      if (remoteData) {
        if (remoteData.settings) setSettings(remoteData.settings);
        if (remoteData.programs) setPrograms(remoteData.programs);
        if (remoteData.notices) setNotices(remoteData.notices);
        if (remoteData.gallery) setGallery(remoteData.gallery);
        if (remoteData.donations) setDonations(remoteData.donations);
        if (remoteData.inquiries) setInquiries(remoteData.inquiries);
        if (remoteData.subscribers) setSubscribers(remoteData.subscribers);
        if (remoteData.popups) setPopups(remoteData.popups);
      }
      setSyncStatus('synced');
      setLastSyncTime(new Date());
    } catch (err: any) {
      setSyncStatus('error');
      setSyncError(err?.message || '동기화 실패');
    }
  };

  return (
    <FoundationContext.Provider
      value={{
        settings,
        updateSettings,
        programs,
        addProgram,
        updateProgram,
        deleteProgram,
        notices,
        addNotice,
        updateNotice,
        deleteNotice,
        gallery,
        addGallery,
        updateGallery,
        deleteGallery,
        donations,
        addDonation,
        updateDonationStatus,
        deleteDonation,
        inquiries,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,
        subscribers,
        addSubscriber,
        updateSubscriberStatus,
        deleteSubscriber,
        popups,
        addPopup,
        updatePopup,
        deletePopup,
        togglePopupActive,
        timeline,
        resetToDefaults,
        activeTab,
        setActiveTab,
        aboutSubTab,
        setAboutSubTab,
        adminOpen,
        setAdminOpen,
        isAdmin,
        setIsAdmin,
        hasNewDonation,
        pendingDonationsCount,
        markDonationsAsRead,
        syncStatus,
        lastSyncTime,
        syncError,
        forceSyncNow,
        getImageUrl
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
