import React, { useState, useEffect } from 'react';
import { InquiryRecord, Notice, Course } from '../types';
import { ScheduleItem, PopupNoticeConfig } from './NoticePopupModal';
import { MaterialsAdminPanel } from './MaterialsAdminPanel';
import { StudentApprovalPanel } from './StudentApprovalPanel';
import { AccountManagementPanel } from './AccountManagementPanel';
import ExcelJS from 'exceljs';
import { loginAdmin, logoutAdmin, onAdminAuthStateChanged, changeAdminPassword, getCurrentAdminEmail } from '../lib/adminAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  subscribeApplicationsFromFirestore,
  updateApplicationStatusInFirestore,
  deleteApplicationFromFirestore,
  batchDeleteApplicationsFromFirestore,
  subscribeOpeningPopupFromFirestore,
  saveOpeningPopupToFirestore,
  subscribeNoticesFromFirestore,
  addNoticeToFirestore,
  updateNoticeInFirestore,
  deleteNoticeFromFirestore,
  subscribePopularCoursesFromFirestore,
  addPopularCourseToFirestore,
  updatePopularCourseInFirestore,
  deletePopularCourseFromFirestore,
  subscribeCoursesFromFirestore,
  addCourseToFirestore,
  updateCourseInFirestore,
  deleteCourseFromFirestore,
  ensureCoursesSeeded,
  subscribeErrorLogsFromFirestore,
  deleteErrorLog,
  clearAllErrorLogs,
  ErrorLogItem,
  DEFAULT_OPENING_POPUP,
  formatReceiptNumber,
  formatFirestoreTimestamp,
} from '../lib/firestoreService';
import {
  X,
  Download,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  UserCheck,
  Trash2,
  Edit3,
  FileSpreadsheet,
  Lock,
  Phone,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Megaphone,
  Save,
  Eye,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Check,
  Plus,
  RotateCcw,
  BookOpen,
  Bell,
  FileText,
  AlertTriangle,
  Flame,
  Award,
  Users,
} from 'lucide-react';

export interface PopularCourseAdminItem {
  id: string;
  badge: string;
  badgeColor?: string;
  timeSlot: string;
  startDate?: string;
  createdAt?: string;
  title: string;
  description: string;
}

interface InquiryAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoticeUpdated?: () => void;
}

export const InquiryAdminModal: React.FC<InquiryAdminModalProps> = ({
  isOpen,
  onClose,
  onNoticeUpdated,
}) => {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('전체');
  
  // Firebase Authentication 기반 관리자 로그인 상태
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // 비밀번호 변경 모달 상태
  const [isChangePwOpen, setIsChangePwOpen] = useState<boolean>(false);
  const [currentPwInput, setCurrentPwInput] = useState<string>('');
  const [newPwInput, setNewPwInput] = useState<string>('');
  const [newPwConfirmInput, setNewPwConfirmInput] = useState<string>('');
  const [changePwError, setChangePwError] = useState<string>('');
  const [changePwSuccess, setChangePwSuccess] = useState<string>('');
  const [changePwLoading, setChangePwLoading] = useState<boolean>(false);

  // Tab state: 'inquiries' | 'notice' | 'boardNotices' | 'popularCourses' | 'courses' | 'errorLogs'
  const [activeTab, setActiveTab] = useState<'inquiries' | 'notice' | 'boardNotices' | 'popularCourses' | 'courses' | 'errorLogs' | 'materials' | 'students' | 'accounts'>('inquiries');

  // Board Notices (공지사항 & 자격시험 일정) State
  const [boardNotices, setBoardNotices] = useState<Notice[]>([]);
  const [isNoticeFormOpen, setIsNoticeFormOpen] = useState<boolean>(false);
  const [editingBoardNotice, setEditingBoardNotice] = useState<Notice | null>(null);
  const [noticeFormTitle, setNoticeFormTitle] = useState<string>('');
  const [noticeFormCategory, setNoticeFormCategory] = useState<Notice['category']>('모집안내');
  const [noticeFormDate, setNoticeFormDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [noticeFormImportant, setNoticeFormImportant] = useState<boolean>(false);
  const [noticeFormContent, setNoticeFormContent] = useState<string>('');
  const [boardNoticeSuccessMsg, setBoardNoticeSuccessMsg] = useState<string>('');

  // Real-time Popular Courses State (실시간 인기 수강 강좌)
  const [popularCourses, setPopularCourses] = useState<PopularCourseAdminItem[]>([]);
  const [isPopFormOpen, setIsPopFormOpen] = useState<boolean>(false);
  const [editingPopCourse, setEditingPopCourse] = useState<PopularCourseAdminItem | null>(null);
  const [popFormTitle, setPopFormTitle] = useState<string>('');
  const [popFormBadge, setPopFormBadge] = useState<string>('모집중 · 국비지원');
  const [popFormBadgeColor, setPopFormBadgeColor] = useState<string>('blue');
  const [popFormTimeSlot, setPopFormTimeSlot] = useState<string>('09:30 - 12:30');
  const [popFormStartDate, setPopFormStartDate] = useState<string>('2026-09-01 개강');
  const [popFormDescription, setPopFormDescription] = useState<string>('');
  const [popSuccessMsg, setPopSuccessMsg] = useState<string>('');

  // 교육과정 페이지(전체 강좌 카드) 관리 State
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCourseFormOpen, setIsCourseFormOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseFormTitle, setCourseFormTitle] = useState<string>('');
  const [courseFormCategory, setCourseFormCategory] = useState<Course['category']>('자격증');
  const [courseFormSummary, setCourseFormSummary] = useState<string>('');
  const [courseFormDescription, setCourseFormDescription] = useState<string>('');
  const [courseFormTarget, setCourseFormTarget] = useState<string>('');
  const [courseFormDuration, setCourseFormDuration] = useState<string>('');
  const [courseFormSchedule, setCourseFormSchedule] = useState<string>('');
  const [courseFormNationalSupport, setCourseFormNationalSupport] = useState<boolean>(true);
  const [courseFormSubsidyRate, setCourseFormSubsidyRate] = useState<string>('');
  const [courseFormTuition, setCourseFormTuition] = useState<string>('');
  const [courseFormSelfPayEstimate, setCourseFormSelfPayEstimate] = useState<string>('카드 유형별 상이');
  const [courseFormCertTags, setCourseFormCertTags] = useState<string>('');
  const [courseFormCurriculum, setCourseFormCurriculum] = useState<string>('');
  const [courseFormFeatured, setCourseFormFeatured] = useState<boolean>(false);
  const [courseSuccessMsg, setCourseSuccessMsg] = useState<string>('');

  // 클라이언트 오류 로그 관리 State
  const [errorLogs, setErrorLogs] = useState<ErrorLogItem[]>([]);
  const [expandedErrorLogId, setExpandedErrorLogId] = useState<string | null>(null);

  // Edit memo inline state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMemo, setEditingMemo] = useState<string>('');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Default 4 schedules
  const defaultSchedules: ScheduleItem[] = [
    { courseName: '컴퓨터활용능력 (1급 / 2급)', startDate: '9월 08일 개강', timeSlot: '오전 10:00 / 야간 19:00' },
    { courseName: '전산세무회계 (전산회계1급/세무2급)', startDate: '9월 15일 개강', timeSlot: '오후 14:00 / 야간 19:00' },
    { courseName: '시니어 어르신 왕초보 컴퓨터&스마트폰', startDate: '9월 10일 개강', timeSlot: '오후 13:30 ~ 15:00' },
    { courseName: '정보처리기능사 / GTQ 포토샵 자격증', startDate: '10월 01일 개강', timeSlot: '오후 15:30 / 야간 19:00' },
  ];

  // Popup Notice State
  const [noticeConfig, setNoticeConfig] = useState<PopupNoticeConfig>({
    enabled: true,
    badgeText: '2026년 하반기 신규 개강 안내',
    title: '홍천 중앙정보처리학원 8~9월 수강생 모집',
    subtitle: '국비지원 최대 100% 지원 & 1:1 맞춤 실습 교육',
    content: '컴퓨터활용능력(1급/2급), 전산세무회계, 정보처리기능사/기사, GTQ/ITQ 자격증, 시니어 어르신 기초반 수강생을 모집합니다! 지금 신청하시고 국민내일배움카드 혜택을 받으세요.',
    dateText: '개강일: 2026년 8월 ~ 9월 수시 개강 (오전/오후/야간반 운영)',
    schedules: defaultSchedules,
    actionText: '지금 온라인 수강신청하기',
    buttonLabel: '',
  });
  const [savingNotice, setSavingNotice] = useState<boolean>(false);
  const [noticeSuccessMsg, setNoticeSuccessMsg] = useState<string>('');

  // Custom In-App Confirmation Dialog State (Replaces native window.confirm to work in sandboxed iframes)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '삭제하기',
    onConfirm: () => {},
  });

  const requestConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = '삭제하기'
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      onConfirm,
    });
  };

  // --- Firebase Auth 상태 감지 (로그인 여부는 앱 전역에서 계속 추적) ---
  // 이제 수강생도 같은 Firebase Auth를 공유해서 로그인하므로, 단순히
  // "로그인돼 있는지"가 아니라 "실제로 admins 컬렉션에 등록된 관리자 계정인지"
  // 까지 확인해야 합니다. (안 그러면 수강생 계정으로 로그인한 상태에서 관리자
  // 화면을 열었을 때 로그인 화면을 건너뛰고 빈 오류투성이 화면이 보이게 됩니다.
  // 실제 데이터 접근은 Firestore 규칙이 최종적으로 막아주지만, 화면 자체는
  // 로그인 폼으로 돌아가는 게 훨씬 자연스럽습니다.)
  useEffect(() => {
    const unsubAuth = onAdminAuthStateChanged(async (user) => {
      if (!user) {
        setIsAuthenticated(false);
        setAuthChecking(false);
        return;
      }
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        const confirmed = adminDoc.exists();
        setIsAuthenticated(confirmed);
        // 관리자 로그인이 실제로 확인된 이 시점에서 courses 컬렉션이
        // 비어있으면 시드 데이터를 채워 넣습니다. 이 시점에는 이미 Firebase
        // Auth 세션 복원이 끝나 있는 게 보장되므로, Firestore 구독 안쪽의
        // auth.currentUser 체크와 달리 타이밍 문제 없이 확실하게 동작합니다.
        if (confirmed) {
          ensureCoursesSeeded().catch(console.error);
        }
      } catch (err) {
        console.error('관리자 여부 확인 실패:', err);
        setIsAuthenticated(false);
      } finally {
        setAuthChecking(false);
      }
    });
    return () => unsubAuth();
  }, []);

  // --- Firestore Handlers & Real-time Subscriptions ---

  useEffect(() => {
    if (!isOpen) return;

    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    setSelectedIds([]);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // notices/popular_courses/settings는 Firestore 규칙상 누구나 읽을 수 있으므로
    // 로그인 여부와 무관하게 구독해도 안전합니다.
    const unsubPopup = subscribeOpeningPopupFromFirestore((cfg) => {
      setNoticeConfig(cfg);
    });

    const unsubNotices = subscribeNoticesFromFirestore((data) => {
      setBoardNotices(data);
    });

    const unsubPopular = subscribePopularCoursesFromFirestore((data) => {
      setPopularCourses(data);
    });

    const unsubCourses = subscribeCoursesFromFirestore((data) => {
      setCourses(data);
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unsubPopup();
      unsubNotices();
      unsubPopular();
      unsubCourses();
    };
  }, [isOpen, onClose]);

  // applications(수강신청 개인정보)는 Firestore 규칙상 관리자만 읽을 수 있습니다.
  // 모달이 열려 있어도 아직 로그인 전이면 이 구독을 시도하지 않도록 분리했습니다.
  // (예전에는 모달을 열기만 해도 로그인 전부터 구독을 시도해 매번 권한 오류가
  //  발생했습니다.)
  useEffect(() => {
    if (!isOpen || !isAuthenticated) {
      if (!isAuthenticated) setLoading(true);
      return;
    }

    const unsubApps = subscribeApplicationsFromFirestore((records) => {
      setInquiries(records);
      setLoading(false);
    });

    return () => {
      unsubApps();
    };
  }, [isOpen, isAuthenticated]);

  // errorLogs(방문자 브라우저 오류 기록)도 applications와 동일하게
  // Firestore 규칙상 관리자만 읽을 수 있으므로, 로그인 확인 후에만 구독합니다.
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    const unsubErrorLogs = subscribeErrorLogsFromFirestore((logs) => {
      setErrorLogs(logs);
    });

    return () => {
      unsubErrorLogs();
    };
  }, [isOpen, isAuthenticated]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await loginAdmin(loginEmail.trim(), loginPassword);
      // onAdminAuthStateChanged 리스너가 isAuthenticated를 true로 갱신해 줍니다.
      setLoginPassword('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await logoutAdmin();
    } catch (err) {
      console.error('로그아웃 오류:', err);
    }
  };

  const openChangePwModal = () => {
    setCurrentPwInput('');
    setNewPwInput('');
    setNewPwConfirmInput('');
    setChangePwError('');
    setChangePwSuccess('');
    setIsChangePwOpen(true);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwError('');
    setChangePwSuccess('');

    if (newPwInput.length < 6) {
      setChangePwError('새 비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (newPwInput !== newPwConfirmInput) {
      setChangePwError('새 비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    setChangePwLoading(true);
    try {
      await changeAdminPassword(currentPwInput, newPwInput);
      setChangePwSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPwInput('');
      setNewPwInput('');
      setNewPwConfirmInput('');
    } catch (err) {
      setChangePwError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
    } finally {
      setChangePwLoading(false);
    }
  };

  // Schedule editing helpers
  const handleScheduleChange = (index: number, field: keyof ScheduleItem, value: string) => {
    const currentSchedules = noticeConfig.schedules && noticeConfig.schedules.length > 0
      ? [...noticeConfig.schedules]
      : [...defaultSchedules];

    currentSchedules[index] = {
      ...currentSchedules[index],
      [field]: value,
    };

    setNoticeConfig((prev) => ({
      ...prev,
      schedules: currentSchedules,
    }));
  };

  const handleAddScheduleRow = () => {
    const currentSchedules = noticeConfig.schedules && noticeConfig.schedules.length > 0
      ? [...noticeConfig.schedules]
      : [...defaultSchedules];

    currentSchedules.unshift({ courseName: '', startDate: '', timeSlot: '' });

    setNoticeConfig((prev) => ({
      ...prev,
      schedules: currentSchedules,
    }));
  };

  const handleRemoveScheduleRow = (index: number) => {
    const item = (noticeConfig.schedules || [])[index];
    const courseTitle = item?.courseName ? item.courseName : '선택한 항목';

    requestConfirm(
      '개강 과정 삭제 확인',
      `[${courseTitle}] 개강 과정 항목을 정말 삭제하시겠습니까?`,
      async () => {
        const currentSchedules = (noticeConfig.schedules || []).filter((_, i) => i !== index);
        const updatedConfig = { ...noticeConfig, schedules: currentSchedules };
        setNoticeConfig(updatedConfig);

        try {
          await saveOpeningPopupToFirestore(updatedConfig);
          setNoticeSuccessMsg('개강 과정 항목이 삭제되고 Firestore DB에 실시간 반영되었습니다.');
          window.dispatchEvent(new Event('notice_popup_updated'));
          if (onNoticeUpdated) onNoticeUpdated();
          setTimeout(() => setNoticeSuccessMsg(''), 4000);
        } catch (err) {
          console.error('Failed to save schedule deletion in Firestore:', err);
        }
      }
    );
  };

  const handleResetSchedules = () => {
    setNoticeConfig((prev) => ({
      ...prev,
      schedules: defaultSchedules,
    }));
  };

  const handleOpenCreateNoticeForm = () => {
    setEditingBoardNotice(null);
    setNoticeFormTitle('');
    setNoticeFormCategory('모집안내');
    setNoticeFormDate(new Date().toISOString().slice(0, 10));
    setNoticeFormImportant(false);
    setNoticeFormContent('');
    setIsNoticeFormOpen(true);
  };

  const handleOpenEditNoticeForm = (notice: Notice) => {
    setEditingBoardNotice(notice);
    setNoticeFormTitle(notice.title);
    setNoticeFormCategory(notice.category);
    setNoticeFormDate(notice.date || new Date().toISOString().slice(0, 10));
    setNoticeFormImportant(Boolean(notice.important));
    setNoticeFormContent(notice.content);
    setIsNoticeFormOpen(true);
  };

  const handleSaveBoardNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeFormTitle.trim() || !noticeFormContent.trim()) {
      alert('제목과 내용을 입력해 주세요.');
      return;
    }

    try {
      if (editingBoardNotice) {
        await updateNoticeInFirestore(editingBoardNotice.id, {
          title: noticeFormTitle,
          category: noticeFormCategory,
          date: noticeFormDate,
          important: noticeFormImportant,
          content: noticeFormContent,
        });
      } else {
        await addNoticeToFirestore({
          title: noticeFormTitle,
          category: noticeFormCategory,
          date: noticeFormDate,
          important: noticeFormImportant,
          content: noticeFormContent,
        });
      }

      setIsNoticeFormOpen(false);
      window.dispatchEvent(new Event('board_notices_updated'));
      setBoardNoticeSuccessMsg(editingBoardNotice ? '공지사항이 Firestore DB에 수정되었습니다.' : '새 공지사항이 Firestore DB에 등록되었습니다.');
      setTimeout(() => setBoardNoticeSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Notice save failed:', err);
      alert('공지 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteBoardNoticeItem = (id: string, title: string) => {
    requestConfirm(
      '공지사항 삭제 확인',
      `[${title}]\n\n이 공지사항 항목을 정말 삭제하시겠습니까?`,
      async () => {
        try {
          await deleteNoticeFromFirestore(id);
          window.dispatchEvent(new Event('board_notices_updated'));
          setBoardNoticeSuccessMsg('공지사항이 삭제되었으며 홈페이지에 실시간 반영되었습니다.');
          setTimeout(() => setBoardNoticeSuccessMsg(''), 4000);
        } catch (err) {
          console.error('Failed to delete notice item:', err);
          alert('삭제 중 오류가 발생했습니다.');
        }
      }
    );
  };

  const handleOpenCreatePopForm = () => {
    setEditingPopCourse(null);
    setPopFormTitle('');
    setPopFormBadge('모집중 · 국비지원');
    setPopFormBadgeColor('blue');
    setPopFormTimeSlot('09:30 - 12:30');
    setPopFormStartDate('2026-09-01 개강');
    setPopFormDescription('');
    setIsPopFormOpen(true);
  };

  const handleOpenEditPopForm = (item: PopularCourseAdminItem) => {
    setEditingPopCourse(item);
    setPopFormTitle(item.title);
    setPopFormBadge(item.badge);
    setPopFormBadgeColor(item.badgeColor || 'blue');
    setPopFormTimeSlot(item.timeSlot);
    setPopFormStartDate(item.startDate || '수시 개강');
    setPopFormDescription(item.description || '');
    setIsPopFormOpen(true);
  };

  const handleSavePopCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!popFormTitle.trim()) {
      alert('강좌명을 입력해 주세요.');
      return;
    }

    try {
      if (editingPopCourse) {
        await updatePopularCourseInFirestore(editingPopCourse.id, {
          title: popFormTitle,
          badge: popFormBadge,
          badgeColor: popFormBadgeColor,
          timeSlot: popFormTimeSlot,
          startDate: popFormStartDate,
          description: popFormDescription,
        });
      } else {
        await addPopularCourseToFirestore({
          title: popFormTitle,
          badge: popFormBadge,
          badgeColor: popFormBadgeColor,
          timeSlot: popFormTimeSlot,
          startDate: popFormStartDate,
          description: popFormDescription,
        });
      }

      setIsPopFormOpen(false);
      window.dispatchEvent(new Event('popular_courses_updated'));
      setPopSuccessMsg(editingPopCourse ? '실시간 인기 강좌가 Firestore DB에 수정되었습니다.' : '새 인기 강좌가 Firestore DB에 등록되었습니다.');
      setTimeout(() => setPopSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Popular course save failed:', err);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeletePopCourseItem = (id: string, title: string) => {
    requestConfirm(
      '인기 강좌 삭제 확인',
      `[${title}]\n\n이 인기 강좌 항목을 정말 삭제하시겠습니까?`,
      async () => {
        try {
          await deletePopularCourseFromFirestore(id);
          window.dispatchEvent(new Event('popular_courses_updated'));
          setPopSuccessMsg('인기 강좌가 Firestore DB에서 삭제되었습니다.');
          setTimeout(() => setPopSuccessMsg(''), 4000);
        } catch (err) {
          console.error('Failed to delete course item:', err);
          alert('삭제 중 오류가 발생했습니다.');
        }
      }
    );
  };

  const courseCategoryOptions: Course['category'][] = ['국비지원', '자격증', '실무·기초', '코딩·AI', '학생·특강'];

  const handleOpenCreateCourseForm = () => {
    setEditingCourse(null);
    setCourseFormTitle('');
    setCourseFormCategory('자격증');
    setCourseFormSummary('');
    setCourseFormDescription('');
    setCourseFormTarget('');
    setCourseFormDuration('');
    setCourseFormSchedule('');
    setCourseFormNationalSupport(true);
    setCourseFormSubsidyRate('');
    setCourseFormTuition('');
    setCourseFormSelfPayEstimate('카드 유형별 상이');
    setCourseFormCertTags('');
    setCourseFormCurriculum('');
    setCourseFormFeatured(false);
    setIsCourseFormOpen(true);
  };

  const handleOpenEditCourseForm = (item: Course) => {
    setEditingCourse(item);
    setCourseFormTitle(item.title);
    setCourseFormCategory(item.category);
    setCourseFormSummary(item.summary);
    setCourseFormDescription(item.description);
    setCourseFormTarget(item.target);
    setCourseFormDuration(item.duration);
    setCourseFormSchedule(item.schedule);
    setCourseFormNationalSupport(item.nationalSupport);
    setCourseFormSubsidyRate(item.subsidyRate);
    setCourseFormTuition(item.tuition ? String(item.tuition) : '');
    setCourseFormSelfPayEstimate(item.selfPayEstimate || '카드 유형별 상이');
    setCourseFormCertTags((item.certificationTags || []).join(', '));
    setCourseFormCurriculum((item.curriculum || []).join('\n'));
    setCourseFormFeatured(Boolean(item.featured));
    setIsCourseFormOpen(true);
  };

  const handleSaveCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormTitle.trim()) {
      alert('강좌명을 입력해 주세요.');
      return;
    }

    const payload = {
      title: courseFormTitle.trim(),
      category: courseFormCategory,
      summary: courseFormSummary.trim(),
      description: courseFormDescription.trim(),
      target: courseFormTarget.trim(),
      duration: courseFormDuration.trim(),
      schedule: courseFormSchedule.trim(),
      nationalSupport: courseFormNationalSupport,
      subsidyRate: courseFormSubsidyRate.trim(),
      tuition: courseFormTuition ? Number(courseFormTuition) || 0 : 0,
      selfPayEstimate: courseFormSelfPayEstimate.trim() || '카드 유형별 상이',
      certificationTags: courseFormCertTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      curriculum: courseFormCurriculum
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean),
      featured: courseFormFeatured,
    };

    try {
      if (editingCourse) {
        await updateCourseInFirestore(editingCourse.id, payload);
      } else {
        await addCourseToFirestore(payload);
      }

      setIsCourseFormOpen(false);
      setCourseSuccessMsg(editingCourse ? '교육과정이 Firestore DB에 수정되었습니다.' : '새 교육과정이 Firestore DB에 등록되었습니다.');
      setTimeout(() => setCourseSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Course save failed:', err);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteCourseItem = (id: string, title: string) => {
    requestConfirm(
      '교육과정 삭제 확인',
      `[${title}]\n\n이 교육과정을 정말 삭제하시겠습니까?\n삭제하면 교육과정 페이지 카드 목록에서 즉시 사라집니다.`,
      async () => {
        try {
          await deleteCourseFromFirestore(id);
          setCourseSuccessMsg('교육과정이 Firestore DB에서 삭제되었습니다.');
          setTimeout(() => setCourseSuccessMsg(''), 4000);
        } catch (err) {
          console.error('Failed to delete course item:', err);
          alert('삭제 중 오류가 발생했습니다.');
        }
      }
    );
  };

  const handleDeleteErrorLog = (id: string) => {
    requestConfirm(
      '오류 로그 삭제 확인',
      '이 오류 로그를 삭제하시겠습니까?',
      async () => {
        try {
          await deleteErrorLog(id);
        } catch (err) {
          console.error('Failed to delete error log:', err);
          alert('삭제 중 오류가 발생했습니다.');
        }
      }
    );
  };

  const handleClearAllErrorLogs = () => {
    if (errorLogs.length === 0) return;
    requestConfirm(
      '전체 오류 로그 삭제 확인',
      `현재 기록된 오류 로그 ${errorLogs.length}건을 전부 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      async () => {
        try {
          await clearAllErrorLogs(errorLogs.map((l) => l.id));
        } catch (err) {
          console.error('Failed to clear error logs:', err);
          alert('삭제 중 오류가 발생했습니다.');
        }
      }
    );
  };

  const handleSaveNotice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingNotice(true);
    setNoticeSuccessMsg('');
    try {
      await saveOpeningPopupToFirestore(noticeConfig);
      setNoticeSuccessMsg('개강 공지 팝업 설정 및 과정이 Firestore DB 및 홈페이지 팝업에 실시간 반영되었습니다!');
      window.dispatchEvent(new Event('notice_popup_updated'));
      if (onNoticeUpdated) onNoticeUpdated();
      setTimeout(() => setNoticeSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Opening popup save failed:', err);
      alert('공지 설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSavingNotice(false);
    }
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = (filteredList: InquiryRecord[]) => {
    const allFilteredIds = filteredList.map((item) => item.id);
    const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.includes(id));

    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  // Batch Delete Handler
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    requestConfirm(
      '선택 내역 삭제 확인',
      `선택한 ${selectedIds.length}건의 수강 신청 내역을 정말 삭제하시겠습니까?`,
      async () => {
        try {
          await batchDeleteApplicationsFromFirestore(selectedIds);
          setSelectedIds([]);
          window.dispatchEvent(new Event('inquiry_updated'));
        } catch (err) {
          console.error('Failed to delete selected inquiries:', err);
          alert('선택 내역 삭제 중 오류가 발생했습니다.');
        }
      }
    );
  };

  // Clear All Handler
  const handleClearAll = () => {
    if (inquiries.length === 0) return;
    requestConfirm(
      '전체 내역 삭제 경고',
      '🚨 전체 수강 신청 내역을 삭제하시겠습니까?\n이 작업은 복구할 수 없습니다.',
      async () => {
        try {
          await batchDeleteApplicationsFromFirestore(inquiries.map((i) => i.id));
          setSelectedIds([]);
          window.dispatchEvent(new Event('inquiry_updated'));
        } catch (err) {
          console.error('Failed to clear all inquiries:', err);
          alert('전체 내역 삭제 중 오류가 발생했습니다.');
        }
      }
    );
  };

  // Status Change Handler
  const handleStatusChange = async (id: string, newStatus: InquiryRecord['status']) => {
    try {
      await updateApplicationStatusInFirestore(id, newStatus);
      window.dispatchEvent(new Event('inquiry_updated'));
    } catch (err) {
      console.error('Status change error:', err);
      alert('상태 변경에 실패했습니다.');
    }
  };

  // Save Admin Notes Handler
  const handleSaveMemo = async (id: string) => {
    try {
      await updateApplicationStatusInFirestore(id, undefined, editingMemo);
      setEditingId(null);
    } catch (err) {
      console.error('Memo save error:', err);
      alert('메모 저장에 실패했습니다.');
    }
  };

  // Delete Handler
  const handleDelete = (id: string, name: string) => {
    requestConfirm(
      '신청 내역 삭제 확인',
      `${name}님의 수강 신청 내역을 정말 삭제하시겠습니까?`,
      async () => {
        try {
          await deleteApplicationFromFirestore(id);
          window.dispatchEvent(new Event('inquiry_updated'));
        } catch (err) {
          console.error('Failed to delete inquiry:', err);
          alert('삭제 중 오류가 발생했습니다.');
        }
      }
    );
  };

  // Filtered list
  const filteredInquiries = inquiries.filter((item) => {
    const matchesStatus =
      selectedStatusFilter === '전체' || item.status === selectedStatusFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      item.courseInterest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.message && item.message.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Excel Export
  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = '홍천 중앙정보처리학원';

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateString = `${yyyy}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const borderThin = {
      top: { style: 'thin' as const, color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin' as const, color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin' as const, color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin' as const, color: { argb: 'FFCBD5E1' } },
    };

    const formatDateKo = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const m = d.getMonth() + 1;
        const day = d.getDate();
        const hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? '오후' : '오전';
        const formattedHours = String(hours % 12 || 12).padStart(2, '0');
        return `${m}월 ${day}일 ${ampm} ${formattedHours}:${minutes}`;
      } catch {
        return dateStr;
      }
    };

    if (activeTab === 'inquiries') {
      if (inquiries.length === 0) {
        alert('다운로드할 수강 신청 데이터가 없습니다.');
        return;
      }

      const dataToExport = filteredInquiries.length > 0 ? filteredInquiries : inquiries;
      const worksheet = workbook.addWorksheet('수강신청접수명단');
      worksheet.views = [{ showGridLines: true }];

      worksheet.columns = [
        { key: 'no', width: 8 },         // A: 연번
        { key: 'name', width: 15 },       // B: 성함
        { key: 'phone', width: 18 },      // C: 연락처
        { key: 'course', width: 32 },     // D: 희망 강좌
        { key: 'status', width: 16 },     // E: 상담 상태
        { key: 'message', width: 38 },    // F: 비고 및 전달사항
        { key: 'date', width: 22 },       // G: 신청 일시
      ];

      // 1. Title Banner
      worksheet.mergeCells('A1:G2');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = '홍천 중앙정보처리학원 수강 신청 및 상담 접수 명단';
      titleCell.font = { name: '맑은 고딕', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006644' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).height = 22;
      worksheet.getRow(2).height = 22;

      // 2. Meta Info
      worksheet.getRow(3).height = 20;
      worksheet.mergeCells('A3:G3');
      const metaCell = worksheet.getCell('A3');
      metaCell.value = `출력일시: ${dateString}  |  총 제출 건수: ${dataToExport.length}건`;
      metaCell.font = { name: '맑은 고딕', size: 9.5, italic: true, color: { argb: 'FF475569' } };
      metaCell.alignment = { vertical: 'middle', horizontal: 'right' };

      // 3. Summary Table
      const pendingCnt = dataToExport.filter((i) => i.status === '상담대기' || !i.status).length;
      const inProgressCnt = dataToExport.filter((i) => i.status === '상담진행중').length;
      const completedCnt = dataToExport.filter((i) => i.status === '상담완료').length;
      const canceledCnt = dataToExport.filter((i) => i.status === '취소/보류' || i.status === '보류').length;
      const totalCnt = dataToExport.length;

      worksheet.getRow(5).height = 24;
      worksheet.getRow(6).height = 26;

      worksheet.getCell('A5').value = '구분';
      worksheet.getCell('B5').value = '상담 대기';
      worksheet.getCell('C5').value = '상담 진행중';
      worksheet.getCell('D5').value = '상담 완료';
      worksheet.getCell('E5').value = '취소 / 보류';
      worksheet.mergeCells('F5:G5');
      worksheet.getCell('F5').value = '전체 제출';

      ['A5','B5','C5','D5','E5','F5','G5'].forEach((ref) => {
        const cell = worksheet.getCell(ref);
        cell.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF334155' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      worksheet.getCell('A6').value = '인원(명)';
      worksheet.getCell('A6').font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF334155' } };
      worksheet.getCell('A6').alignment = { vertical: 'middle', horizontal: 'center' };

      const b6 = worksheet.getCell('B6');
      b6.value = `${pendingCnt} 명`;
      b6.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FF15803D' } };
      b6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
      b6.alignment = { vertical: 'middle', horizontal: 'center' };

      const c6 = worksheet.getCell('C6');
      c6.value = `${inProgressCnt} 명`;
      c6.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FFC2410C' } };
      c6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
      c6.alignment = { vertical: 'middle', horizontal: 'center' };

      const d6 = worksheet.getCell('D6');
      d6.value = `${completedCnt} 명`;
      d6.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FF1D4ED8' } };
      d6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
      d6.alignment = { vertical: 'middle', horizontal: 'center' };

      const e6 = worksheet.getCell('E6');
      e6.value = `${canceledCnt} 명`;
      e6.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FF475569' } };
      e6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      e6.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.mergeCells('F6:G6');
      const f6 = worksheet.getCell('F6');
      f6.value = `${totalCnt} 명`;
      f6.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FF0F172A' } };
      f6.alignment = { vertical: 'middle', horizontal: 'center' };

      ['A5','B5','C5','D5','E5','F5','G5','A6','B6','C6','D6','E6','F6','G6'].forEach((ref) => {
        worksheet.getCell(ref).border = borderThin;
      });

      // 4. Main Table Header
      worksheet.getRow(8).height = 28;
      const headers = ['연번', '성함', '연락처', '희망 강좌', '상담 상태', '비고 및 전달사항', '신청 일시'];
      const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

      cols.forEach((col, idx) => {
        const cell = worksheet.getCell(`${col}8`);
        cell.value = headers[idx];
        cell.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006644' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = borderThin;
      });

      // 5. Main Data Rows
      dataToExport.forEach((item, index) => {
        const rowIdx = 9 + index;
        const row = worksheet.getRow(rowIdx);
        row.height = 24;

        const formattedDate = formatDateKo(item.createdAt);
        let fullMessage = item.message || '';
        if (item.preferredTime) fullMessage = `[희망시간: ${item.preferredTime}] ${fullMessage}`.trim();
        if (item.userCategory) fullMessage = `[구분: ${item.userCategory}] ${fullMessage}`.trim();
        if (item.hasNaeilCard) fullMessage = `[카드: ${item.hasNaeilCard}] ${fullMessage}`.trim();
        if (item.adminNotes) fullMessage = `${fullMessage} (메모: ${item.adminNotes})`.trim();
        if (!fullMessage) fullMessage = '-';

        const statusText = item.status || '상담대기';

        worksheet.getCell(`A${rowIdx}`).value = index + 1;
        worksheet.getCell(`B${rowIdx}`).value = item.name;
        worksheet.getCell(`C${rowIdx}`).value = item.phone;
        worksheet.getCell(`D${rowIdx}`).value = item.courseInterest;
        worksheet.getCell(`E${rowIdx}`).value = statusText;
        worksheet.getCell(`F${rowIdx}`).value = fullMessage;
        worksheet.getCell(`G${rowIdx}`).value = formattedDate;

        worksheet.getCell(`A${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`B${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`C${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`D${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'left' };
        worksheet.getCell(`E${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`F${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'left' };
        worksheet.getCell(`G${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };

        cols.forEach((col) => {
          const cell = worksheet.getCell(`${col}${rowIdx}`);
          cell.font = { name: '맑은 고딕', size: 10, color: { argb: 'FF1E293B' } };
          cell.border = borderThin;
        });

        const statusCell = worksheet.getCell(`E${rowIdx}`);
        if (statusText === '상담대기' || statusText === '대기') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
          statusCell.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF15803D' } };
        } else if (statusText === '상담진행중' || statusText === '진행중') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
          statusCell.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FFC2410C' } };
        } else if (statusText === '상담완료' || statusText === '완료') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
          statusCell.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF1D4ED8' } };
        } else {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
          statusCell.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF475569' } };
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `홍천중앙정보처리학원_수강신청접수명단_${yyyy}${mm}${dd}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

    } else if (activeTab === 'boardNotices') {
      if (boardNotices.length === 0) {
        alert('다운로드할 공지사항 데이터가 없습니다.');
        return;
      }

      const worksheet = workbook.addWorksheet('공지사항목록');
      worksheet.views = [{ showGridLines: true }];

      worksheet.columns = [
        { key: 'no', width: 8 },         // A: 연번
        { key: 'category', width: 16 },  // B: 분류 카테고리
        { key: 'important', width: 14 }, // C: 중요도 구분
        { key: 'title', width: 42 },     // D: 공지글 제목
        { key: 'author', width: 14 },    // E: 작성자
        { key: 'views', width: 10 },     // F: 조회수
        { key: 'date', width: 18 },      // G: 작성/등록일
      ];

      // 1. Title Banner
      worksheet.mergeCells('A1:G2');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = '홍천 중앙정보처리학원 공지사항 및 자격시험 일정 목록';
      titleCell.font = { name: '맑은 고딕', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006644' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).height = 22;
      worksheet.getRow(2).height = 22;

      // 2. Meta Info
      worksheet.getRow(3).height = 20;
      worksheet.mergeCells('A3:G3');
      const metaCell = worksheet.getCell('A3');
      metaCell.value = `출력일시: ${dateString}  |  총 등록 게시글: ${boardNotices.length}건`;
      metaCell.font = { name: '맑은 고딕', size: 9.5, italic: true, color: { argb: 'FF475569' } };
      metaCell.alignment = { vertical: 'middle', horizontal: 'right' };

      // 3. Summary Table
      const importantCnt = boardNotices.filter((n) => n.important).length;
      const normalCnt = boardNotices.filter((n) => !n.important).length;
      const totalCnt = boardNotices.length;

      worksheet.getRow(5).height = 24;
      worksheet.getRow(6).height = 26;

      worksheet.getCell('A5').value = '구분';
      worksheet.getCell('B5').value = '필독 / 중요 공지';
      worksheet.getCell('C5').value = '일반 공지사항';
      worksheet.mergeCells('D5:E5');
      worksheet.getCell('D5').value = '최신 등록일';
      worksheet.mergeCells('F5:G5');
      worksheet.getCell('F5').value = '총 게시글';

      ['A5','B5','C5','D5','E5','F5','G5'].forEach((ref) => {
        const cell = worksheet.getCell(ref);
        cell.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF334155' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      worksheet.getCell('A6').value = '수(건)';
      worksheet.getCell('A6').font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF334155' } };
      worksheet.getCell('A6').alignment = { vertical: 'middle', horizontal: 'center' };

      const b6 = worksheet.getCell('B6');
      b6.value = `${importantCnt} 건`;
      b6.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FFC2410C' } };
      b6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
      b6.alignment = { vertical: 'middle', horizontal: 'center' };

      const c6 = worksheet.getCell('C6');
      c6.value = `${normalCnt} 건`;
      c6.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FF1D4ED8' } };
      c6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
      c6.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.mergeCells('D6:E6');
      const d6 = worksheet.getCell('D6');
      d6.value = boardNotices[0]?.date || '최신 등록';
      d6.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF1E293B' } };
      d6.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.mergeCells('F6:G6');
      const f6 = worksheet.getCell('F6');
      f6.value = `${totalCnt} 건`;
      f6.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FF0F172A' } };
      f6.alignment = { vertical: 'middle', horizontal: 'center' };

      ['A5','B5','C5','D5','E5','F5','G5','A6','B6','C6','D6','E6','F6','G6'].forEach((ref) => {
        worksheet.getCell(ref).border = borderThin;
      });

      // 4. Main Table Header
      worksheet.getRow(8).height = 28;
      const headers = ['연번', '분류 카테고리', '중요도 구분', '공지글 제목', '작성자', '조회수', '등록일자'];
      const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

      cols.forEach((col, idx) => {
        const cell = worksheet.getCell(`${col}8`);
        cell.value = headers[idx];
        cell.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006644' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = borderThin;
      });

      // 5. Data Rows
      boardNotices.forEach((item, index) => {
        const rowIdx = 9 + index;
        const row = worksheet.getRow(rowIdx);
        row.height = 24;

        worksheet.getCell(`A${rowIdx}`).value = index + 1;
        worksheet.getCell(`B${rowIdx}`).value = item.category;
        worksheet.getCell(`C${rowIdx}`).value = item.important ? '필독 공지' : '일반 공지';
        worksheet.getCell(`D${rowIdx}`).value = item.title;
        worksheet.getCell(`E${rowIdx}`).value = item.author || '관리자';
        worksheet.getCell(`F${rowIdx}`).value = item.views || 0;
        worksheet.getCell(`G${rowIdx}`).value = item.date;

        worksheet.getCell(`A${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`B${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`C${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`D${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'left' };
        worksheet.getCell(`E${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`F${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`G${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };

        cols.forEach((col) => {
          const cell = worksheet.getCell(`${col}${rowIdx}`);
          cell.font = { name: '맑은 고딕', size: 10, color: { argb: 'FF1E293B' } };
          cell.border = borderThin;
        });

        const impCell = worksheet.getCell(`C${rowIdx}`);
        if (item.important) {
          impCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
          impCell.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FFC2410C' } };
        } else {
          impCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `홍천중앙정보처리학원_공지사항목록_${yyyy}${mm}${dd}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

    } else if (activeTab === 'popularCourses') {
      if (popularCourses.length === 0) {
        alert('다운로드할 실시간 인기강좌 데이터가 없습니다.');
        return;
      }

      const worksheet = workbook.addWorksheet('인기강좌목록');
      worksheet.views = [{ showGridLines: true }];

      worksheet.columns = [
        { key: 'no', width: 8 },          // A: 연번
        { key: 'badge', width: 22 },       // B: 모집 상태 배지
        { key: 'color', width: 12 },       // C: 테마 컬러
        { key: 'title', width: 32 },       // D: 강좌/과정명
        { key: 'startDate', width: 18 },   // E: 개강 일정
        { key: 'timeSlot', width: 22 },    // F: 수강 시간대
        { key: 'desc', width: 40 },        // G: 강좌 개요 및 안내
        { key: 'createdAt', width: 16 },   // H: 등록/수정일
      ];

      // 1. Title Banner
      worksheet.mergeCells('A1:H2');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = '홍천 중앙정보처리학원 실시간 인기 및 추천강좌 관리 목록';
      titleCell.font = { name: '맑은 고딕', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006644' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).height = 22;
      worksheet.getRow(2).height = 22;

      // 2. Meta Info
      worksheet.getRow(3).height = 20;
      worksheet.mergeCells('A3:H3');
      const metaCell = worksheet.getCell('A3');
      metaCell.value = `출력일시: ${dateString}  |  총 개강 등록 강좌: ${popularCourses.length}개`;
      metaCell.font = { name: '맑은 고딕', size: 9.5, italic: true, color: { argb: 'FF475569' } };
      metaCell.alignment = { vertical: 'middle', horizontal: 'right' };

      // 3. Summary Table
      const cardCnt = popularCourses.filter((c) => c.badge.includes('국비') || c.badge.includes('카드')).length;
      const recCnt = popularCourses.filter((c) => c.badge.includes('인기') || c.badge.includes('추천')).length;
      const totalCnt = popularCourses.length;

      worksheet.getRow(5).height = 24;
      worksheet.getRow(6).height = 26;

      worksheet.getCell('A5').value = '구분';
      worksheet.mergeCells('B5:C5');
      worksheet.getCell('B5').value = '국비지원 강좌';
      worksheet.mergeCells('D5:F5');
      worksheet.getCell('D5').value = '인기 / 추천 강좌';
      worksheet.mergeCells('G5:H5');
      worksheet.getCell('G5').value = '총 등록 강좌 수';

      ['A5','B5','C5','D5','E5','F5','G5','H5'].forEach((ref) => {
        const cell = worksheet.getCell(ref);
        cell.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF334155' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      worksheet.getCell('A6').value = '개수';
      worksheet.getCell('A6').font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF334155' } };
      worksheet.getCell('A6').alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.mergeCells('B6:C6');
      const b6 = worksheet.getCell('B6');
      b6.value = `${cardCnt} 개`;
      b6.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FF1D4ED8' } };
      b6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
      b6.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.mergeCells('D6:F6');
      const d6 = worksheet.getCell('D6');
      d6.value = `${recCnt} 개`;
      d6.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FF15803D' } };
      d6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
      d6.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.mergeCells('G6:H6');
      const g6 = worksheet.getCell('G6');
      g6.value = `${totalCnt} 개`;
      g6.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FF0F172A' } };
      g6.alignment = { vertical: 'middle', horizontal: 'center' };

      ['A5','B5','C5','D5','E5','F5','G5','H5','A6','B6','C6','D6','E6','F6','G6','H6'].forEach((ref) => {
        worksheet.getCell(ref).border = borderThin;
      });

      // 4. Main Table Header
      worksheet.getRow(8).height = 28;
      const headers = ['연번', '모집 상태 배지', '테마 색상', '강좌 / 과정명', '개강 일정', '수강 시간대', '강좌 안내 및 설명', '등록/수정일'];
      const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

      cols.forEach((col, idx) => {
        const cell = worksheet.getCell(`${col}8`);
        cell.value = headers[idx];
        cell.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006644' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = borderThin;
      });

      // 5. Data Rows
      popularCourses.forEach((item, index) => {
        const rowIdx = 9 + index;
        const row = worksheet.getRow(rowIdx);
        row.height = 24;

        worksheet.getCell(`A${rowIdx}`).value = index + 1;
        worksheet.getCell(`B${rowIdx}`).value = item.badge;
        worksheet.getCell(`C${rowIdx}`).value = item.badgeColor;
        worksheet.getCell(`D${rowIdx}`).value = item.title;
        worksheet.getCell(`E${rowIdx}`).value = item.startDate || '수시 개강';
        worksheet.getCell(`F${rowIdx}`).value = item.timeSlot;
        worksheet.getCell(`G${rowIdx}`).value = item.description || '-';
        worksheet.getCell(`H${rowIdx}`).value = item.createdAt || '2026-08-01';

        worksheet.getCell(`A${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`B${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`C${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`D${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'left' };
        worksheet.getCell(`E${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`F${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`G${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'left' };
        worksheet.getCell(`H${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };

        cols.forEach((col) => {
          const cell = worksheet.getCell(`${col}${rowIdx}`);
          cell.font = { name: '맑은 고딕', size: 10, color: { argb: 'FF1E293B' } };
          cell.border = borderThin;
        });

        const badgeCell = worksheet.getCell(`B${rowIdx}`);
        badgeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
        badgeCell.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF15803D' } };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `홍천중앙정보처리학원_인기강좌목록_${yyyy}${mm}${dd}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

    } else if (activeTab === 'notice') {
      const schedules = noticeConfig.schedules || [];
      const worksheet = workbook.addWorksheet('메인팝업공지설정');
      worksheet.views = [{ showGridLines: true }];

      worksheet.columns = [
        { key: 'no', width: 8 },          // A: 연번
        { key: 'badge', width: 18 },       // B: 일정 구분 배지
        { key: 'course', width: 38 },      // C: 과정/자격증 시험명
        { key: 'date', width: 22 },        // D: 개강/시험 일시
        { key: 'time', width: 32 },        // E: 수강 시간대 및 상세 안내
      ];

      // 1. Title Banner
      worksheet.mergeCells('A1:E2');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = '홍천 중앙정보처리학원 메인 팝업공지 및 개강 일정 설정';
      titleCell.font = { name: '맑은 고딕', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006644' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).height = 22;
      worksheet.getRow(2).height = 22;

      // 2. Meta Info
      worksheet.getRow(3).height = 20;
      worksheet.mergeCells('A3:E3');
      const metaCell = worksheet.getCell('A3');
      metaCell.value = `출력일시: ${dateString}  |  등록된 주요 일정: ${schedules.length}건`;
      metaCell.font = { name: '맑은 고딕', size: 9.5, italic: true, color: { argb: 'FF475569' } };
      metaCell.alignment = { vertical: 'middle', horizontal: 'right' };

      // 3. Summary Table
      worksheet.getRow(5).height = 24;
      worksheet.getRow(6).height = 26;

      worksheet.getCell('A5').value = '구분';
      worksheet.getCell('B5').value = '팝업 노출 상태';
      worksheet.mergeCells('C5:D5');
      worksheet.getCell('C5').value = '메인 팝업 타이틀';
      worksheet.getCell('E5').value = '등록된 일정 수';

      ['A5','B5','C5','D5','E5'].forEach((ref) => {
        const cell = worksheet.getCell(ref);
        cell.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF334155' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      worksheet.getCell('A6').value = '정보';
      worksheet.getCell('A6').font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF334155' } };
      worksheet.getCell('A6').alignment = { vertical: 'middle', horizontal: 'center' };

      const b6 = worksheet.getCell('B6');
      b6.value = noticeConfig.enabled ? '노출 중 (활성)' : '비활성화';
      b6.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: noticeConfig.enabled ? 'FF15803D' : 'FFC2410C' } };
      b6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: noticeConfig.enabled ? 'FFDCFCE7' : 'FFFEF3C7' } };
      b6.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.mergeCells('C6:D6');
      const c6 = worksheet.getCell('C6');
      c6.value = noticeConfig.title;
      c6.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF1E293B' } };
      c6.alignment = { vertical: 'middle', horizontal: 'center' };

      const e6 = worksheet.getCell('E6');
      e6.value = `${schedules.length} 건`;
      e6.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FF0F172A' } };
      e6.alignment = { vertical: 'middle', horizontal: 'center' };

      ['A5','B5','C5','D5','E5','A6','B6','C6','D6','E6'].forEach((ref) => {
        worksheet.getCell(ref).border = borderThin;
      });

      // 4. Main Table Header
      worksheet.getRow(8).height = 28;
      const headers = ['연번', '일정 구분 배지', '개강 과정 / 자격증 시험명', '개강 / 시험 일시', '수강 시간대 및 세부 안내'];
      const cols = ['A', 'B', 'C', 'D', 'E'];

      cols.forEach((col, idx) => {
        const cell = worksheet.getCell(`${col}8`);
        cell.value = headers[idx];
        cell.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006644' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = borderThin;
      });

      // 5. Data Rows
      schedules.forEach((item, index) => {
        const rowIdx = 9 + index;
        const row = worksheet.getRow(rowIdx);
        row.height = 24;

        worksheet.getCell(`A${rowIdx}`).value = index + 1;
        worksheet.getCell(`B${rowIdx}`).value = item.badgeText || '개강안내';
        worksheet.getCell(`C${rowIdx}`).value = item.courseName || item.title || '';
        worksheet.getCell(`D${rowIdx}`).value = item.startDate || item.dateText || '';
        worksheet.getCell(`E${rowIdx}`).value = item.timeSlot || item.timeText || '';

        worksheet.getCell(`A${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`B${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`C${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'left' };
        worksheet.getCell(`D${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`E${rowIdx}`).alignment = { vertical: 'middle', horizontal: 'left' };

        cols.forEach((col) => {
          const cell = worksheet.getCell(`${col}${rowIdx}`);
          cell.font = { name: '맑은 고딕', size: 10, color: { argb: 'FF1E293B' } };
          cell.border = borderThin;
        });

        const badgeCell = worksheet.getCell(`B${rowIdx}`);
        badgeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
        badgeCell.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF1D4ED8' } };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `홍천중앙정보처리학원_메인팝업공지설정_${yyyy}${mm}${dd}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  // Stats
  const totalCount = inquiries.length;
  const pendingCount = inquiries.filter((i) => i.status === '상담대기').length;
  const completedCount = inquiries.filter((i) => i.status === '상담완료').length;
  const registeredCount = inquiries.filter((i) => i.status === '등록완료').length;

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/30 border border-blue-400/40 rounded-2xl text-blue-300">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full">
                  원장님 / 관리자 전용
                </span>
                <span className="text-xs text-slate-300">홍천 중앙정보처리학원</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                온라인 수강신청 누적 데이터 관리
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <span className="hidden sm:inline text-[11px] text-slate-400 font-bold mr-1" title="현재 로그인된 관리자">
                  {getCurrentAdminEmail()}
                </span>
                <button
                  type="button"
                  onClick={openChangePwModal}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 border border-white/10"
                  title="비밀번호 변경"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-300" />
                  <span>비밀번호 변경</span>
                </button>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 border border-white/10 mr-1"
                  title="관리자 인증 잠금"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-300" />
                  <span>로그아웃</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar (When Authenticated) */}
        {isAuthenticated && (() => {
          const pendingCount = inquiries.filter((item) => item.status === '상담대기' || !item.status).length;
          return (
            <div className="bg-slate-900 border-t border-slate-800 px-5 sm:px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 overflow-x-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('inquiries')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                    activeTab === 'inquiries'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>수강 신청 목록 ({inquiries.length}건)</span>
                  {pendingCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] bg-red-600 text-white font-black rounded-full animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      대기 {pendingCount}건
                    </span>
                  )}
                </button>

              <button
                type="button"
                onClick={() => setActiveTab('notice')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === 'notice'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>개강 공지 팝업 관리</span>
                {noticeConfig.enabled ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="팝업 노출 중" />
                ) : (
                  <span className="px-1.5 py-0.5 text-[10px] bg-slate-700 text-slate-400 rounded">OFF</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('boardNotices')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === 'boardNotices'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>공지·자격시험 관리 ({boardNotices.length}건)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('popularCourses')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === 'popularCourses'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>실시간 인기강좌 관리 ({popularCourses.length}건)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('courses')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === 'courses'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>교육과정 관리 ({courses.length}건)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('errorLogs')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === 'errorLogs'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="방문자 화면에서 발생한 오류를 자동으로 모아 보여줍니다"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>오류 로그 ({errorLogs.length}건)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('materials')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === 'materials'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>자료실 관리</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('students')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === 'students'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>수강생 승인 관리</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('accounts')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === 'accounts'
                    ? 'bg-slate-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>전체 계정 관리</span>
              </button>
            </div>

            {activeTab !== 'materials' && activeTab !== 'students' && activeTab !== 'accounts' && activeTab !== 'courses' && activeTab !== 'errorLogs' && (
              <button
                onClick={handleExportToExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow transition-all cursor-pointer whitespace-nowrap ml-auto"
                title="엑셀파일로 다운로드"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {activeTab === 'inquiries' && '수강신청 엑셀 다운로드'}
                  {activeTab === 'notice' && '팝업공지 엑셀 다운로드'}
                  {activeTab === 'boardNotices' && '공지사항 엑셀 다운로드'}
                  {activeTab === 'popularCourses' && '인기강좌 엑셀 다운로드'}
                </span>
              </button>
            )}
          </div>
        );
      })()}

        {/* Modal Body */}
        {authChecking ? (
          <div className="p-12 bg-slate-50 flex-1 flex items-center justify-center text-slate-400 text-sm font-bold">
            로그인 상태 확인 중...
          </div>
        ) : !isAuthenticated ? (
          /* Firebase Authentication Login Screen */
          <div className="p-8 sm:p-12 bg-slate-50 flex-1 flex flex-col items-center justify-center text-center my-auto">
            <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-inner">
              <Lock className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
              관리자 로그인
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 font-medium">
              신청내역 조회 및 개강 공지 관리는 원장님/관리자 전용입니다.<br />
              등록된 관리자 계정으로 로그인해 주세요.
            </p>

            <form onSubmit={handleLoginSubmit} className="w-full max-w-xs space-y-3">
              <div className="space-y-2">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="관리자 이메일"
                  autoComplete="username"
                  className={`w-full px-4 py-3 text-sm font-bold rounded-2xl border bg-white shadow-sm focus:outline-none transition-all ${
                    loginError
                      ? 'border-red-500 ring-2 ring-red-200 text-red-600'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900'
                  }`}
                  autoFocus
                />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="비밀번호"
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 text-sm font-bold rounded-2xl border bg-white shadow-sm focus:outline-none transition-all ${
                    loginError
                      ? 'border-red-500 ring-2 ring-red-200 text-red-600'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900'
                  }`}
                />
                {loginError && (
                  <p className="text-xs text-red-600 font-bold mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{loginError}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm rounded-2xl transition-all cursor-pointer"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-1/2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all cursor-pointer"
                >
                  {loginLoading ? '로그인 중...' : '로그인'}
                </button>
              </div>
            </form>

            <p className="text-[11px] text-slate-400 mt-6 font-medium">
              * 계정이 없다면 Firebase 콘솔(Authentication)에서 관리자 계정을 먼저 만들어 주세요.
            </p>
          </div>
        ) : activeTab === 'notice' ? (
          /* Notice Popup Management Tab Content */
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50 space-y-5">
            {noticeSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{noticeSuccessMsg}</span>
                </div>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-100 px-2.5 py-1 rounded-full">
                  실시간 반영 완료
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Edit Form */}
              <form onSubmit={handleSaveNotice} className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-amber-500" />
                      <span>개강 공지 팝업 설정</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      홈페이지 오픈 시 자동으로 뜨는 개강 안내 팝업창을 수정·관리합니다.
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setNoticeConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer border ${
                      noticeConfig.enabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-100 text-slate-500 border-slate-300'
                    }`}
                  >
                    {noticeConfig.enabled ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-emerald-600" />
                        <span>팝업 노출 중 (ON)</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-slate-400" />
                        <span>팝업 비활성 (OFF)</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    1. 상단 뱃지 문구
                  </label>
                  <input
                    type="text"
                    value={noticeConfig.badgeText}
                    onChange={(e) => setNoticeConfig({ ...noticeConfig, badgeText: e.target.value })}
                    placeholder="예: 2026년 하반기 신규 개강 안내"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    2. 팝업 메인 제목
                  </label>
                  <input
                    type="text"
                    value={noticeConfig.title}
                    onChange={(e) => setNoticeConfig({ ...noticeConfig, title: e.target.value })}
                    placeholder="예: 홍천 중앙정보처리학원 8~9월 수강생 모집"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-black focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    3. 서브 타이틀 / 소제목
                  </label>
                  <input
                    type="text"
                    value={noticeConfig.subtitle}
                    onChange={(e) => setNoticeConfig({ ...noticeConfig, subtitle: e.target.value })}
                    placeholder="예: 국비지원 최대 100% 지원 & 1:1 맞춤 실습 교육"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    4. 개강 공지 상세 내용
                  </label>
                  <textarea
                    rows={4}
                    value={noticeConfig.content}
                    onChange={(e) => setNoticeConfig({ ...noticeConfig, content: e.target.value })}
                    placeholder="개강하는 주요 과목, 수강 대상, 국민내일배움카드 안내 등을 적어주세요."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
                    required
                  />
                </div>

                {/* 5. 개강 일정 및 시간대 (4개 항목 관리) */}
                <div className="space-y-3 bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-blue-950 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>5. 개강 일정 및 시간대 안내 (과정별 4개 항목 관리)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetSchedules}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 cursor-pointer"
                        title="기본 4개 과정으로 초기화"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>기본4개 초기화</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddScheduleRow}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 border border-blue-300 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>항목 추가</span>
                      </button>
                    </div>
                  </div>

                  {/* Single fallback text input for general notice summary */}
                  <div className="mb-2">
                    <span className="text-[11px] font-bold text-slate-600 mb-1 block">요약 안내문구 (선택)</span>
                    <input
                      type="text"
                      value={noticeConfig.dateText}
                      onChange={(e) => setNoticeConfig({ ...noticeConfig, dateText: e.target.value })}
                      placeholder="예: 개강일: 2026년 8월 ~ 9월 수시 개강 (오전/오후/야간반 운영)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  {/* Structured Schedule List (4+ slots) */}
                  <div className="space-y-3 pt-1">
                    {(noticeConfig.schedules || defaultSchedules).map((sch, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white border border-blue-200 rounded-xl shadow-sm space-y-2 relative group"
                      >
                        <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5">
                          <span className="font-black text-blue-900 flex items-center gap-1">
                            <span className="w-4 h-4 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span>개강 과정 #{idx + 1}</span>
                          </span>
                          {(noticeConfig.schedules || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveScheduleRow(idx)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">과정명</label>
                            <input
                              type="text"
                              value={sch.courseName}
                              onChange={(e) => handleScheduleChange(idx, 'courseName', e.target.value)}
                              placeholder="예: 컴퓨터활용능력 1급/2급"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">개강일</label>
                            <input
                              type="text"
                              value={sch.startDate}
                              onChange={(e) => handleScheduleChange(idx, 'startDate', e.target.value)}
                              placeholder="예: 8월 18일 개강"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">수강시간</label>
                            <input
                              type="text"
                              value={sch.timeSlot}
                              onChange={(e) => handleScheduleChange(idx, 'timeSlot', e.target.value)}
                              placeholder="예: 오전 10:00 / 야간 19:00"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:ring-1 focus:ring-blue-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveNotice()}
                      disabled={savingNotice}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-white" />
                      <span>{savingNotice ? '저장 중...' : '개강 과정 수정 사항 저장 & 팝업 즉시 반영'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    6. 신청 버튼 문구
                  </label>
                  <input
                    type="text"
                    value={noticeConfig.actionText}
                    onChange={(e) => setNoticeConfig({ ...noticeConfig, actionText: e.target.value })}
                    placeholder="예: 지금 온라인 수강신청하기"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    7. 우측 하단 플로팅 버튼 문구 (선택)
                  </label>
                  <input
                    type="text"
                    value={noticeConfig.buttonLabel || ''}
                    onChange={(e) => setNoticeConfig({ ...noticeConfig, buttonLabel: e.target.value })}
                    placeholder={`비워두면 "1. 상단 뱃지 문구"와 자동으로 동일하게 표시됩니다`}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    팝업을 닫았을 때 화면 우측 하단에 뜨는 재오픈 버튼의 문구입니다. 비워두면 위 1번 뱃지 문구를 그대로 따라갑니다.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingNotice}
                    className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingNotice ? '저장 중...' : '공지 설정 저장 및 홈페이지 실시간 적용'}</span>
                  </button>
                </div>
              </form>

              {/* Right: Live Preview */}
              <div className="lg:col-span-5 bg-slate-900 p-5 rounded-3xl text-white space-y-4 shadow-xl border border-slate-800 sticky top-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>홈페이지 팝업 실시간 미리보기</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    noticeConfig.enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {noticeConfig.enabled ? '팝업 노출 ON' : '팝업 비활성 OFF'}
                  </span>
                </div>

                {/* Mock Card */}
                <div className="bg-white rounded-2xl overflow-hidden text-slate-900 shadow-2xl border border-slate-200">
                  <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-4 text-white">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] mb-2">
                      <Megaphone className="w-3 h-3" />
                      <span>{noticeConfig.badgeText || '공지사항'}</span>
                    </span>
                    <h4 className="font-black text-base leading-snug">{noticeConfig.title || '공지 제목'}</h4>
                    {noticeConfig.subtitle && (
                      <p className="text-[11px] text-blue-200 font-medium mt-0.5">{noticeConfig.subtitle}</p>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                      {noticeConfig.content || '공지 내용 영역'}
                    </div>

                    {/* Schedule List Preview */}
                    {noticeConfig.schedules && noticeConfig.schedules.length > 0 ? (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-black text-blue-900 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>주요 과목 개강 일정 및 강의시간</span>
                        </p>
                        <div className="space-y-1">
                          {noticeConfig.schedules.map((item, idx) => (
                            <div key={idx} className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-[11px] flex justify-between items-center">
                              <span className="font-bold text-slate-900 truncate max-w-[130px]">{item.courseName || '과정명'}</span>
                              <div className="flex items-center gap-1 text-[10px]">
                                {item.startDate && <span className="text-blue-800 font-semibold">{item.startDate}</span>}
                                {item.timeSlot && <span className="text-amber-950 bg-amber-100 px-1 py-0.5 rounded font-bold">{item.timeSlot}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : noticeConfig.dateText ? (
                      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 text-xs flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-bold">{noticeConfig.dateText}</span>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs rounded-xl shadow flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{noticeConfig.actionText || '온라인 수강 신청하기'}</span>
                    </button>
                  </div>

                  <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>오늘 하루 동안 보지 않기</span>
                    <span>닫기</span>
                  </div>
                </div>

                {/* Floating "재오픈" button preview — syncs with badgeText unless buttonLabel is set */}
                <div className="pt-1">
                  <p className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>팝업을 닫으면 우측 하단에 뜨는 재오픈 버튼</span>
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-full shadow border-2 border-white">
                    <Megaphone className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                    <span>{noticeConfig.buttonLabel || noticeConfig.badgeText || '공지사항'}</span>
                  </span>
                  {!noticeConfig.buttonLabel && (
                    <span className="block text-[10px] text-slate-500 mt-1">
                      * 1번 뱃지 문구와 자동 연동 중입니다
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'boardNotices' ? (
          /* Board Notices (공지사항 & 자격시험 일정) Management Tab */
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50 space-y-5">
            {boardNoticeSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{boardNoticeSuccessMsg}</span>
                </div>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-100 px-2.5 py-1 rounded-full">
                  실시간 반영 완료
                </span>
              </div>
            )}

            {/* Header & Write Button */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <span>공지사항 & 자격시험 일정 관리</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  홈페이지 '공지사항 & 자격시험 일정' 및 메인화면 소식란에 실시간 반영되는 공지글을 등록·수정·삭제합니다.
                </p>
              </div>

              {!isNoticeFormOpen && (
                <button
                  type="button"
                  onClick={handleOpenCreateNoticeForm}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>새 공지/시험일정 작성</span>
                </button>
              )}
            </div>

            {/* Add / Edit Form Box */}
            {isNoticeFormOpen && (
              <form onSubmit={handleSaveBoardNoticeSubmit} className="bg-white p-6 rounded-3xl border border-blue-200 shadow-md space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-blue-600" />
                    <span>{editingBoardNotice ? '공지사항 / 시험일정 수정' : '새 공지사항 / 시험일정 작성'}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsNoticeFormOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      공지 제목 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={noticeFormTitle}
                      onChange={(e) => setNoticeFormTitle(e.target.value)}
                      placeholder="예: 2026년도 국민내일배움카드 신규 수강생 모집 안내"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">카테고리</label>
                    <select
                      value={noticeFormCategory}
                      onChange={(e) => setNoticeFormCategory(e.target.value as Notice['category'])}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="모집안내">모집안내</option>
                      <option value="시험일정">시험일정</option>
                      <option value="국비지원">국비지원</option>
                      <option value="학원소개">학원소개</option>
                    </select>
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">작성/등록일자</label>
                    <input
                      type="date"
                      value={noticeFormDate}
                      onChange={(e) => setNoticeFormDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="md:col-span-6 flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer mt-5">
                      <input
                        type="checkbox"
                        checked={noticeFormImportant}
                        onChange={(e) => setNoticeFormImportant(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                      />
                      <span className="text-xs font-extrabold text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>중요 공지로 지정 (붉은색 강조 라벨)</span>
                      </span>
                    </label>
                  </div>

                  <div className="md:col-span-12">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      공지 내용 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={noticeFormContent}
                      onChange={(e) => setNoticeFormContent(e.target.value)}
                      placeholder="상세 내용을 입력하세요..."
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsNoticeFormOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingBoardNotice ? '수정 내용 저장' : '공지사항 등록하기'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* List of Board Notices */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-600">
                <span>등록된 공지 목록 ({boardNotices.length}개)</span>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new Event('board_notices_updated'));
                  }}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>새로고침</span>
                </button>
              </div>

              {boardNotices.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-medium">
                  등록된 공지사항이 없습니다. [새 공지/시험일정 작성] 버튼을 클릭해 등록하세요.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {boardNotices.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                              item.important
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {item.category}
                          </span>
                          {item.important && (
                            <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black">
                              중요
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.date}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {item.title}
                        </h4>

                        <p className="text-xs text-slate-600 line-clamp-2 whitespace-pre-line leading-relaxed">
                          {item.content}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditNoticeForm(item)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>수정</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBoardNoticeItem(item.id, item.title)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold text-xs border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>삭제</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'popularCourses' ? (
          /* Real-time Popular Courses (실시간 인기 수강 강좌) Management Tab */
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50 space-y-5">
            {popSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{popSuccessMsg}</span>
                </div>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-100 px-2.5 py-1 rounded-full">
                  실시간 반영 완료
                </span>
              </div>
            )}

            {/* Header & Create Button */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>실시간 인기 수강 강좌 관리</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  메인화면(Hero 카드)에 노출되는 대표 수강 모집 정보(강좌명, 수강시간대, 배지, 지원혜택 설명)를 실시간 등록·수정·삭제합니다.
                </p>
              </div>

              {!isPopFormOpen && (
                <button
                  type="button"
                  onClick={handleOpenCreatePopForm}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>새 인기 강좌 등록</span>
                </button>
              )}
            </div>

            {/* Add / Edit Form Box */}
            {isPopFormOpen && (
              <form onSubmit={handleSavePopCourseSubmit} className="bg-white p-6 rounded-3xl border border-purple-200 shadow-md space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-purple-600" />
                    <span>{editingPopCourse ? '인기 수강 강좌 수정' : '새 인기 수강 강좌 등록'}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsPopFormOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      강좌명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={popFormTitle}
                      onChange={(e) => setPopFormTitle(e.target.value)}
                      placeholder="예: 컴퓨터활용능력 1급/2급 (실기)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">개강일</label>
                    <input
                      type="text"
                      value={popFormStartDate}
                      onChange={(e) => setPopFormStartDate(e.target.value)}
                      placeholder="예: 2026-09-01 개강 또는 수시 개강"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">수강 시간대</label>
                    <input
                      type="text"
                      value={popFormTimeSlot}
                      onChange={(e) => setPopFormTimeSlot(e.target.value)}
                      placeholder="예: 09:30 - 12:30 또는 야간 19:00"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">라벨 / 배지 문구</label>
                    <input
                      type="text"
                      value={popFormBadge}
                      onChange={(e) => setPopFormBadge(e.target.value)}
                      placeholder="예: 모집중 · 국비지원"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">배지 강조 색상</label>
                    <select
                      value={popFormBadgeColor}
                      onChange={(e) => setPopFormBadgeColor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="blue">파란색 (국비/기본)</option>
                      <option value="emerald">초록색 (인기/신규)</option>
                      <option value="amber">주황색 (추천/시니어)</option>
                      <option value="purple">보라색 (특화/코딩)</option>
                    </select>
                  </div>

                  <div className="md:col-span-12">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">지원 혜택 및 상세 설명</label>
                    <input
                      type="text"
                      value={popFormDescription}
                      onChange={(e) => setPopFormDescription(e.target.value)}
                      placeholder="예: 자부담금 0원~최대 100% 정부지원 / 1:1 기출 체크 지원"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPopFormOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingPopCourse ? '수정 내용 저장' : '인기 강좌 등록하기'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* List of Popular Courses */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-600">
                <span>현재 노출 중인 인기 강좌 목록 ({popularCourses.length}개)</span>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new Event('popular_courses_updated'));
                  }}
                  className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 cursor-pointer font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>새로고침</span>
                </button>
              </div>

              {popularCourses.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-medium">
                  등록된 인기 강좌가 없습니다. [새 인기 강좌 등록] 버튼을 눌러 등록해 보세요.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {popularCourses.map((item) => {
                    const badgeColor = item.badgeColor || 'blue';
                    const colorClasses = badgeColor === 'emerald'
                      ? { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
                      : badgeColor === 'amber'
                      ? { bg: 'bg-amber-100 text-amber-800 border-amber-200' }
                      : badgeColor === 'purple'
                      ? { bg: 'bg-purple-100 text-purple-800 border-purple-200' }
                      : { bg: 'bg-blue-100 text-blue-800 border-blue-200' };

                    return (
                      <div
                        key={item.id}
                        className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1.5 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${colorClasses.bg}`}
                            >
                              {item.badge}
                            </span>
                            <span className="text-xs text-blue-800 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-blue-600" />
                              개강: {item.startDate || '수시 개강'}
                            </span>
                            <span className="text-xs text-slate-500 font-mono font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {item.timeSlot}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 ml-auto sm:ml-0">
                              등록일: {item.createdAt || '2026-08-01'}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {item.title}
                          </h4>

                          {item.description && (
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditPopForm(item)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold text-xs border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>수정</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePopCourseItem(item.id, item.title)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold text-xs border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>삭제</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'courses' ? (
          /* 교육과정 페이지(전체 강좌 카드) 관리 Tab */
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50 space-y-5">
            {courseSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{courseSuccessMsg}</span>
                </div>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-100 px-2.5 py-1 rounded-full">
                  실시간 반영 완료
                </span>
              </div>
            )}

            {/* Header & Create Button */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span>교육과정 관리</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  홈페이지 "전체 교육과정" 페이지에 노출되는 강좌 카드(제목, 설명, 대상, 기간/시간대, 자격증 태그, 커리큘럼 등)를 등록·수정·삭제합니다.
                </p>
              </div>

              {!isCourseFormOpen && (
                <button
                  type="button"
                  onClick={handleOpenCreateCourseForm}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>새 교육과정 등록</span>
                </button>
              )}
            </div>

            {/* Add / Edit Form Box */}
            {isCourseFormOpen && (
              <form onSubmit={handleSaveCourseSubmit} className="bg-white p-6 rounded-3xl border border-indigo-200 shadow-md space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-indigo-600" />
                    <span>{editingCourse ? '교육과정 수정' : '새 교육과정 등록'}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsCourseFormOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      강좌명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={courseFormTitle}
                      onChange={(e) => setCourseFormTitle(e.target.value)}
                      placeholder="예: 컴퓨터활용능력 2급/1급 취득반"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">카테고리</label>
                    <select
                      value={courseFormCategory}
                      onChange={(e) => setCourseFormCategory(e.target.value as Course['category'])}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      {courseCategoryOptions.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-12">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">한줄 요약 (카드에 표시)</label>
                    <input
                      type="text"
                      value={courseFormSummary}
                      onChange={(e) => setCourseFormSummary(e.target.value)}
                      placeholder="예: 사무직 필수 자격증! 엑셀 및 액세스 실무 실습과 필기/실기 기출 집중 분석"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="md:col-span-12">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">상세 설명 (커리큘럼 모달 상단)</label>
                    <textarea
                      rows={3}
                      value={courseFormDescription}
                      onChange={(e) => setCourseFormDescription(e.target.value)}
                      placeholder="과정에 대한 상세 소개를 적어주세요."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">수강 대상</label>
                    <input
                      type="text"
                      value={courseFormTarget}
                      onChange={(e) => setCourseFormTarget(e.target.value)}
                      placeholder="예: 취업준비생, 공무원 준비생, 대학생, 직장인"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">기간/시간 총량</label>
                    <input
                      type="text"
                      value={courseFormDuration}
                      onChange={(e) => setCourseFormDuration(e.target.value)}
                      placeholder="예: 1개월 ~ 2개월 (총 40~60시간)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="md:col-span-12">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">시간대</label>
                    <input
                      type="text"
                      value={courseFormSchedule}
                      onChange={(e) => setCourseFormSchedule(e.target.value)}
                      placeholder="예: 오전반(10:00~12:00) / 오후반(14:00~16:00) / 야간반(19:00~21:00)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">지원율 / 배지 문구</label>
                    <input
                      type="text"
                      value={courseFormSubsidyRate}
                      onChange={(e) => setCourseFormSubsidyRate(e.target.value)}
                      placeholder="예: 최대 100% 국비지원"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">예상 자부담금 문구</label>
                    <input
                      type="text"
                      value={courseFormSelfPayEstimate}
                      onChange={(e) => setCourseFormSelfPayEstimate(e.target.value)}
                      placeholder="예: 카드 유형별 상이"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">일반 수강료 (원, 참고용)</label>
                    <input
                      type="number"
                      value={courseFormTuition}
                      onChange={(e) => setCourseFormTuition(e.target.value)}
                      placeholder="예: 320000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="md:col-span-6 flex items-end gap-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={courseFormNationalSupport}
                        onChange={(e) => setCourseFormNationalSupport(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <span className="text-xs font-bold text-slate-700">국비지원 가능 과정</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={courseFormFeatured}
                        onChange={(e) => setCourseFormFeatured(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-slate-700">"추천강좌" 뱃지 표시</span>
                    </label>
                  </div>

                  <div className="md:col-span-12">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">관련 자격증 태그 (쉼표로 구분)</label>
                    <input
                      type="text"
                      value={courseFormCertTags}
                      onChange={(e) => setCourseFormCertTags(e.target.value)}
                      placeholder="예: 컴퓨터활용능력 1급, 컴퓨터활용능력 2급"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="md:col-span-12">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">커리큘럼 (한 줄에 한 항목씩)</label>
                    <textarea
                      rows={5}
                      value={courseFormCurriculum}
                      onChange={(e) => setCourseFormCurriculum(e.target.value)}
                      placeholder={'1주차: ...\n2주차: ...\n3주차: ...'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCourseFormOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingCourse ? '수정 내용 저장' : '교육과정 등록하기'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* List of Courses */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-600">
                <span>현재 노출 중인 교육과정 ({courses.length}개)</span>
              </div>

              {courses.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-medium">
                  등록된 교육과정을 불러오는 중이거나 없습니다. [새 교육과정 등록] 버튼을 눌러 등록해 보세요.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {courses.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border bg-blue-100 text-blue-800 border-blue-200">
                            {item.category}
                          </span>
                          {item.nationalSupport && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border bg-emerald-100 text-emerald-800 border-emerald-200">
                              {item.subsidyRate || '국비지원'}
                            </span>
                          )}
                          {item.featured && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border bg-amber-100 text-amber-800 border-amber-200">
                              추천강좌
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {item.title}
                        </h4>

                        {item.summary && (
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {item.summary}
                          </p>
                        )}

                        <p className="text-[11px] text-slate-400 font-mono">
                          {item.duration}{item.schedule ? ` · ${item.schedule}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCourseForm(item)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>수정</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourseItem(item.id, item.title)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold text-xs border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>삭제</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'errorLogs' ? (
          /* 클라이언트(방문자 브라우저) 오류 로그 조회 Tab */
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50 space-y-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <span>오류 로그</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  방문자 브라우저에서 실제로 발생한 오류(화면 렌더링 실패, 처리되지 않은 예외 등)를 자동으로 모아 보여줍니다.
                  방문자에게 별도로 안내하지 않아도 여기서 문제를 미리 확인할 수 있습니다.
                </p>
              </div>
              {errorLogs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllErrorLogs}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>전체 삭제</span>
                </button>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-600">
                <span>기록된 오류 ({errorLogs.length}건)</span>
              </div>

              {errorLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-medium">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  현재까지 기록된 오류가 없습니다.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {errorLogs.map((log) => {
                    const isExpanded = expandedErrorLogId === log.id;
                    return (
                      <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => setExpandedErrorLogId(isExpanded ? null : log.id)}
                          >
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              {log.context && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold border bg-rose-100 text-rose-800 border-rose-200">
                                  {log.context}
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400 font-mono">
                                {formatFirestoreTimestamp(log.createdAt)}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 text-sm break-words">{log.message}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{log.url}</p>
                            {isExpanded && (
                              <div className="mt-3 space-y-2">
                                {log.stack && (
                                  <pre className="p-3 bg-slate-900 text-slate-200 text-[10px] rounded-xl overflow-x-auto whitespace-pre-wrap break-words">
                                    {log.stack}
                                  </pre>
                                )}
                                {log.userAgent && (
                                  <p className="text-[10px] text-slate-400 break-words">{log.userAgent}</p>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteErrorLog(log.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold text-xs border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'materials' ? (
          <MaterialsAdminPanel />
        ) : activeTab === 'students' ? (
          <StudentApprovalPanel />
        ) : activeTab === 'accounts' ? (
          <AccountManagementPanel />
        ) : (
          /* Admin Inquiry List Content */
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          
          {/* Summary Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500">전체 수강신청</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}건</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-700">상담 대기</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}건</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-700">상담 완료</p>
                <p className="text-2xl font-black text-blue-600 mt-1">{completedCount}건</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-700">최종 등록완료</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{registeredCount}건</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search, Filter & Delete Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="이름, 연락처, 강좌 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Batch delete buttons */}
              {selectedIds.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  title="선택한 항목 삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>선택 삭제 ({selectedIds.length}건)</span>
                </button>
              )}

              {inquiries.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1 cursor-pointer ml-auto sm:ml-0"
                  title="전체 신청자 명단 초기화/삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>전체 명단 삭제</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                <Filter className="w-4 h-4 text-slate-400" />
                <span>상태 필터:</span>
              </div>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="전체">전체 보기 ({inquiries.length})</option>
                <option value="상담대기">상담대기 ({pendingCount})</option>
                <option value="상담완료">상담완료 ({completedCount})</option>
                <option value="등록완료">등록완료 ({registeredCount})</option>
                <option value="보류">보류</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new Event('inquiry_updated'));
                }}
                disabled={loading}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="실시간 동기화 상태"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200 uppercase tracking-wider">
                  <th className="p-3.5 text-center w-10 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={
                        filteredInquiries.length > 0 &&
                        filteredInquiries.every((item) => selectedIds.includes(item.id))
                      }
                      onChange={() => handleSelectAllFiltered(filteredInquiries)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      title="전체 선택/해제"
                    />
                  </th>
                  <th className="p-3.5 whitespace-nowrap">접수번호 / 일시</th>
                  <th className="p-3.5 whitespace-nowrap">신청자 성함</th>
                  <th className="p-3.5 whitespace-nowrap">연락처</th>
                  <th className="p-3.5">관심 강좌</th>
                  <th className="p-3.5 whitespace-nowrap">시간대 / 카드 / 구분</th>
                  <th className="p-3.5 min-w-[160px]">추가 문의사항</th>
                  <th className="p-3.5 whitespace-nowrap">진행 상태</th>
                  <th className="p-3.5 min-w-[180px]">관리자 메모</th>
                  <th className="p-3.5 text-center whitespace-nowrap">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 font-medium">
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileSpreadsheet className="w-8 h-8 text-slate-300" />
                        <p className="font-bold text-slate-500">신청 내역이 존재하지 않습니다.</p>
                        <p className="text-xs text-slate-400">온라인 수강신청이 접수되면 이곳에 실시간으로 기록됩니다.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-red-50/60 font-semibold' : 'hover:bg-blue-50/40'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3.5 text-center w-10 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(item.id)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        {/* ID & Date */}
                        <td className="p-3.5 whitespace-nowrap">
                          {(() => {
                            const receiptLabel = formatReceiptNumber(item, item.createdAt, inquiries);
                            const isFallbackId = receiptLabel.includes('-T');
                            return (
                              <span className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800">{receiptLabel}</span>
                                {isFallbackId && (
                                  <span
                                    className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200"
                                    title="접수번호 자동채번 실패로 임시번호가 발급되었습니다. 접수 내용 자체는 정상 저장된 신청 건입니다."
                                  >
                                    임시번호
                                  </span>
                                )}
                              </span>
                            );
                          })()}
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {new Date(item.createdAt).toLocaleString('ko-KR', {
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>

                      {/* Name */}
                      <td className="p-3.5 whitespace-nowrap font-black text-slate-900 text-sm">
                        {item.name}
                      </td>

                      {/* Phone */}
                      <td className="p-3.5 whitespace-nowrap">
                        <a
                          href={`tel:${item.phone}`}
                          className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{item.phone}</span>
                        </a>
                      </td>

                      {/* Course */}
                      <td className="p-3.5 text-slate-800 font-bold max-w-xs">
                        {item.courseInterest}
                      </td>

                      {/* Details */}
                      <td className="p-3.5 whitespace-nowrap text-slate-600 space-y-0.5 text-[11px]">
                        <p>🕒 {item.preferredTime}</p>
                        <p>💳 내일배움: <span className="font-bold text-slate-800">{item.hasNaeilCard}</span></p>
                        <p>👤 {item.userCategory}</p>
                      </td>

                      {/* Message */}
                      <td className="p-3.5 text-slate-600 text-xs">
                        {item.message ? (
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/60 line-clamp-3 italic">
                            "{item.message}"
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-3.5 whitespace-nowrap">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleStatusChange(item.id, e.target.value as InquiryRecord['status'])
                          }
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                            item.status === '상담대기'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : item.status === '상담완료'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : item.status === '등록완료'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-slate-200 text-slate-800 border-slate-300'
                          }`}
                        >
                          <option value="상담대기">⏳ 상담대기</option>
                          <option value="상담완료">💬 상담완료</option>
                          <option value="등록완료">✅ 등록완료</option>
                          <option value="보류">⏸ 보류</option>
                        </select>
                      </td>

                      {/* Memo Inline Edit */}
                      <td className="p-3.5 text-xs">
                        {editingId === item.id ? (
                          <div className="flex gap-1 items-center">
                            <input
                              type="text"
                              value={editingMemo}
                              onChange={(e) => setEditingMemo(e.target.value)}
                              placeholder="상담 메모 입력..."
                              className="p-1.5 rounded-lg border border-blue-300 text-xs w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveMemo(item.id)}
                              className="px-2 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold whitespace-nowrap"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-1.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingId(item.id);
                              setEditingMemo(item.adminNotes || '');
                            }}
                            className="group cursor-pointer p-1.5 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-between text-slate-700"
                            title="클릭하여 메모 수정"
                          >
                            <span className={item.adminNotes ? 'font-medium' : 'text-slate-300 italic'}>
                              {item.adminNotes || '메모 작성...'}
                            </span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>

        </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>상담 신청 데이터는 서버에 안전하게 관리·보관됩니다.</span>
          </p>
          <div className="flex items-center gap-3">
            {isAuthenticated && activeTab !== 'materials' && activeTab !== 'students' && activeTab !== 'accounts' && activeTab !== 'courses' && activeTab !== 'errorLogs' && (
              <button
                onClick={handleExportToExcel}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {activeTab === 'inquiries' && '수강신청 엑셀 다운로드'}
                  {activeTab === 'notice' && '팝업공지 엑셀 다운로드'}
                  {activeTab === 'boardNotices' && '공지사항 엑셀 다운로드'}
                  {activeTab === 'popularCourses' && '인기강좌 엑셀 다운로드'}
                </span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>

        {/* Custom Confirmation Modal for Sandboxed Iframes */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-100 transform transition-all">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-2.5 bg-red-100 rounded-2xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900">{confirmDialog.title}</h3>
              </div>
              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                {confirmDialog.message}
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const action = confirmDialog.onConfirm;
                    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                    action();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  {confirmDialog.confirmText || '삭제하기'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {isChangePwOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-blue-600">
                  <div className="p-2.5 bg-blue-100 rounded-2xl">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">비밀번호 변경</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangePwOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                현재 로그인 중인 <span className="font-bold text-slate-700">{getCurrentAdminEmail()}</span> 계정의 비밀번호를 변경합니다.
              </p>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
                <input
                  type="password"
                  value={currentPwInput}
                  onChange={(e) => { setCurrentPwInput(e.target.value); setChangePwError(''); }}
                  placeholder="현재 비밀번호"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 text-sm font-bold rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900"
                  required
                />
                <input
                  type="password"
                  value={newPwInput}
                  onChange={(e) => { setNewPwInput(e.target.value); setChangePwError(''); }}
                  placeholder="새 비밀번호 (6자 이상)"
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 text-sm font-bold rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900"
                  required
                />
                <input
                  type="password"
                  value={newPwConfirmInput}
                  onChange={(e) => { setNewPwConfirmInput(e.target.value); setChangePwError(''); }}
                  placeholder="새 비밀번호 확인"
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 text-sm font-bold rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900"
                  required
                />

                {changePwError && (
                  <p className="text-xs text-red-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{changePwError}</span>
                  </p>
                )}
                {changePwSuccess && (
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{changePwSuccess}</span>
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsChangePwOpen(false)}
                    className="w-1/2 py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    disabled={changePwLoading}
                    className="w-1/2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {changePwLoading ? '변경 중...' : '변경하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
