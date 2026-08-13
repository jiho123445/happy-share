import React, { useState, useEffect } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { INITIAL_SETTINGS } from '../data/initialData';
import { Logo } from './Logo';
import { ProgramItem, NoticeItem, GalleryItem, NoticeAttachment, PopupItem } from '../types';
import { downloadNoticeFile, exportDonationsToExcel, exportInquiriesToExcel, exportSubscribersToExcel } from '../utils/download';
import {
  X,
  Settings,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Newspaper,
  Image as ImageIcon,
  Heart,
  MessageSquare,
  Building,
  Lock,
  Eye,
  EyeOff,
  Edit,
  CheckCircle2,
  ListFilter,
  Sparkles,
  Layers,
  LogOut,
  Upload,
  UploadCloud,
  Link as LinkIcon,
  FileImage,
  RefreshCw,
  Paperclip,
  FileText,
  Camera,
  Download,
  FileCheck,
  Mail,
  ShieldCheck,
  Bell
} from 'lucide-react';

export const AdminModal: React.FC = () => {
  const {
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
    updateDonationStatus,
    deleteDonation,
    hasNewDonation,
    pendingDonationsCount,
    markDonationsAsRead,
    inquiries,
    updateInquiryStatus,
    deleteInquiry,
    subscribers,
    updateSubscriberStatus,
    deleteSubscriber,
    popups,
    addPopup,
    updatePopup,
    deletePopup,
    togglePopupActive,
    resetToDefaults,
    adminOpen,
    setAdminOpen,
    isAdmin,
    setIsAdmin,
    getImageUrl
  } = useFoundation();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isAdmin);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'settings' | 'programs' | 'notices' | 'gallery' | 'donations' | 'inquiries' | 'subscribers' | 'popups'>('settings');
  const [subscriberSearch, setSubscriberSearch] = useState<string>('');

  // Editing States
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editProgramData, setEditProgramData] = useState<Partial<ProgramItem>>({});
  const [editDetailsText, setEditDetailsText] = useState<string>('');

  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [editNoticeData, setEditNoticeData] = useState<Partial<NoticeItem>>({});

  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [editGalleryData, setEditGalleryData] = useState<Partial<GalleryItem>>({});

  const [editingPopupId, setEditingPopupId] = useState<string | null>(null);
  const [editPopupData, setEditPopupData] = useState<Partial<PopupItem>>({});

  // New Popup Form State
  const [newPopupTitle, setNewPopupTitle] = useState('');
  const [newPopupContent, setNewPopupContent] = useState('');
  const [newPopupImageUrl, setNewPopupImageUrl] = useState('');
  const [newPopupLinkUrl, setNewPopupLinkUrl] = useState('');
  const [newPopupIsActive, setNewPopupIsActive] = useState(true);

  // New Program Form State
  const [newProgTitle, setNewProgTitle] = useState('');
  const [newProgSubtitle, setNewProgSubtitle] = useState('');
  const [newProgSummary, setNewProgSummary] = useState('');
  const [newProgTarget, setNewProgTarget] = useState('홍천군 관내 아동·청소년 및 주민');
  const [newProgImpact, setNewProgImpact] = useState('희망과 나눔의 공동체 형성');
  const [newProgDetails, setNewProgDetails] = useState('');

  // New Notice Form State
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<'공지사항' | '재단소식' | '사업소식' | '후원소식' | '모집공고' | '보도자료'>('공지사항');
  const [newNoticeDate, setNewNoticeDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeImportant, setNewNoticeImportant] = useState(false);
  const [newNoticeAttachments, setNewNoticeAttachments] = useState<NoticeAttachment[]>([]);

  // New Gallery Form State
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCategory, setNewGalCategory] = useState('명절 나눔');
  const [newGalDate, setNewGalDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [newGalUrl, setNewGalUrl] = useState('');
  const [newGalDesc, setNewGalDesc] = useState('');
  const [newGalLocation, setNewGalLocation] = useState('홍천군 관내');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [newGalFileName, setNewGalFileName] = useState('');

  // Editable Settings state
  const [editSettings, setEditSettings] = useState(settings);

  useEffect(() => {
    if (adminOpen) {
      setEditSettings(settings);
    }
  }, [settings, adminOpen]);

  // Deletion & Toast UI States (Avoid browser native window.confirm/alert iframe blocking)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Password Change State
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  if (!adminOpen) return null;

  // Password Authentication Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPassword = settings.adminPassword || '1026';
    if (passwordInput === currentPassword) {
      setIsAuthenticated(true);
      setIsAdmin(true);
      setLoginError(null);
      setPasswordInput('');
    } else {
      setLoginError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword) {
      setPasswordChangeError('새 비밀번호를 입력해 주세요.');
      setPasswordChangeSuccess(null);
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordChangeError('비밀번호가 일치하지 않습니다.');
      setPasswordChangeSuccess(null);
      return;
    }
    const updated = {
      ...editSettings,
      adminPassword: newAdminPassword
    };
    updateSettings(updated);
    setEditSettings(updated);
    setNewAdminPassword('');
    setConfirmAdminPassword('');
    setPasswordChangeError(null);
    setPasswordChangeSuccess('관리자 비밀번호가 성공적으로 변경되었습니다.');
    showToast('관리자 비밀번호가 변경되었습니다.');
  };

  const handleSaveSettings = () => {
    updateSettings(editSettings);
    showToast('재단 기본 정보 및 계좌 설정이 저장되었습니다.');
  };

  // Program Handlers
  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgTitle || !newProgSummary) return;
    addProgram({
      title: newProgTitle,
      subtitle: newProgSubtitle || newProgTitle,
      summary: newProgSummary,
      targetAudience: newProgTarget,
      impactMessage: newProgImpact,
      details: newProgDetails ? newProgDetails.split('\n').filter(Boolean) : [newProgSummary],
      iconName: 'Heart',
      badge: '신규사업'
    });
    setNewProgTitle('');
    setNewProgSubtitle('');
    setNewProgSummary('');
    setNewProgDetails('');
    showToast('새로운 주요 복지사업이 등록되었습니다.');
  };

  const handleSaveProgramEdit = (id: string) => {
    const detailsArray = editDetailsText
      ? editDetailsText.split('\n').map(s => s.trim()).filter(Boolean)
      : (editProgramData.details || []);

    updateProgram(id, {
      ...editProgramData,
      details: detailsArray
    });
    setEditingProgramId(null);
    setEditProgramData({});
    setEditDetailsText('');
    showToast('사업 정보가 수정되었습니다.');
  };

  // Notice Handlers
  const handleNoticeFileUpload = (files: FileList | null, isEdit = false) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const addAttachment = (dataUrl: string) => {
        const formattedSize = file.size > 1024 * 1024
          ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
          : Math.round(file.size / 1024) + ' KB';

        const fileExt = file.name.split('.').pop()?.toUpperCase() || 'FILE';
        const attachmentObj: NoticeAttachment = {
          name: file.name,
          url: dataUrl,
          size: formattedSize,
          type: fileExt
        };

        if (isEdit) {
          setEditNoticeData(prev => {
            const nextAtts = [...(prev.attachments || []), attachmentObj];
            return {
              ...prev,
              attachments: nextAtts,
              attachmentName: nextAtts.length > 0 ? nextAtts[0].name : undefined,
              attachmentUrl: nextAtts.length > 0 ? nextAtts[0].url : undefined
            };
          });
        } else {
          setNewNoticeAttachments(prev => [...prev, attachmentObj]);
        }
      };

      if (file.type.startsWith('image/')) {
        processImageFile(file, (dataUrl) => addAttachment(dataUrl));
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          if (dataUrl) addAttachment(dataUrl);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;
    addNotice({
      title: newNoticeTitle,
      category: newNoticeCategory,
      date: newNoticeDate || new Date().toISOString().split('T')[0],
      content: newNoticeContent,
      isImportant: newNoticeImportant,
      author: '관리자',
      attachments: newNoticeAttachments,
      attachmentName: newNoticeAttachments.length > 0 ? newNoticeAttachments[0].name : undefined
    });
    setNewNoticeTitle('');
    setNewNoticeContent('');
    setNewNoticeImportant(false);
    setNewNoticeAttachments([]);
    setNewNoticeDate(new Date().toISOString().split('T')[0]);
    showToast('새로운 공지사항이 등록되었습니다.');
  };

  const handleSaveNoticeEdit = (id: string) => {
    const finalAtts = editNoticeData.attachments || [];
    updateNotice(id, {
      ...editNoticeData,
      attachments: finalAtts,
      attachmentName: finalAtts.length > 0 ? finalAtts[0].name : undefined,
      attachmentUrl: finalAtts.length > 0 ? finalAtts[0].url : undefined
    });
    setEditingNoticeId(null);
    setEditNoticeData({});
    showToast('공지사항 내용이 수정되었습니다.');
  };

  // Gallery File Upload Handlers (with HTML5 Canvas compression + server static upload)
  const processImageFile = (file: File, callback: (finalUrl: string, fileName: string) => void) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(JPG, PNG, WEBP, GIF 등)만 업로드 가능합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) return;

      // Compress photo using Canvas to max 1200px width/height and 0.82 quality (~60-90KB)
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 1200;

        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        let processedUrl = rawDataUrl;
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          processedUrl = canvas.toDataURL('image/jpeg', 0.82);
        }

        // Try direct server static upload for instant multi-device sync
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: processedUrl, prefix: 'upload' })
          });
          if (res.ok) {
            const json = await res.json();
            if (json.url) {
              callback(json.url, file.name);
              return;
            }
          }
        } catch (uploadErr) {
          console.warn('Server upload fallback to dataUrl', uploadErr);
        }

        callback(processedUrl, file.name);
      };
      img.onerror = () => {
        callback(rawDataUrl, file.name);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file, (dataUrl, fileName) => {
      if (isEdit) {
        setEditGalleryData(prev => ({ ...prev, imageUrl: dataUrl }));
      } else {
        setNewGalUrl(dataUrl);
        setNewGalFileName(fileName);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent, isEdit = false) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processImageFile(file, (dataUrl, fileName) => {
        if (isEdit) {
          setEditGalleryData(prev => ({ ...prev, imageUrl: dataUrl }));
        } else {
          setNewGalUrl(dataUrl);
          setNewGalFileName(fileName);
        }
      });
    }
  };

  // Gallery Handlers
  const handleCreateGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalTitle) {
      alert('활동 제목을 입력해 주세요.');
      return;
    }
    if (!newGalUrl) {
      alert('PC에서 사진 파일을 선택하거나 이미지 URL을 입력해 주세요.');
      return;
    }
    addGallery({
      title: newGalTitle,
      category: newGalCategory,
      date: newGalDate || new Date().toISOString().split('T')[0],
      imageUrl: newGalUrl,
      description: newGalDesc || newGalTitle,
      location: newGalLocation,
      author: '재단 관리자',
      isProtected: true
    });
    setNewGalTitle('');
    setNewGalDesc('');
    setNewGalUrl('');
    setNewGalFileName('');
    setNewGalDate(new Date().toISOString().split('T')[0]);
    showToast('새로운 활동 사진이 관리자 계정 보호 모드로 등록되었습니다.');
  };

  const handleSaveGalleryEdit = (id: string) => {
    updateGallery(id, {
      ...editGalleryData,
      author: '재단 관리자',
      isProtected: true
    });
    setEditingGalleryId(null);
    setEditGalleryData({});
    showToast('관리자 승인을 거쳐 갤러리 사진 정보가 정식 수정되었습니다.');
  };

  // Popup Handlers
  const handlePopupImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file, (dataUrl) => {
      if (isEdit) {
        setEditPopupData(prev => ({ ...prev, imageUrl: dataUrl }));
      } else {
        setNewPopupImageUrl(dataUrl);
      }
    });
  };

  const handleCreatePopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPopupTitle.trim() || !newPopupContent.trim()) {
      showToast('팝업 제목과 내용을 입력해 주세요.');
      return;
    }
    addPopup({
      title: newPopupTitle.trim(),
      content: newPopupContent.trim(),
      imageUrl: newPopupImageUrl.trim() || undefined,
      linkUrl: newPopupLinkUrl.trim() || undefined,
      isActive: newPopupIsActive
    });
    setNewPopupTitle('');
    setNewPopupContent('');
    setNewPopupImageUrl('');
    setNewPopupLinkUrl('');
    setNewPopupIsActive(true);
    showToast('새 팝업창이 등록되었습니다.');
  };

  const handleSavePopupEdit = (id: string) => {
    updatePopup(id, editPopupData);
    setEditingPopupId(null);
    setEditPopupData({});
    showToast('팝업창 정보가 수정되었습니다.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Admin Drawer Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 px-6 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-slate-800 rounded-xl border border-slate-700">
              <Logo className="h-7 w-auto" variant="light" showText={false} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>너브내행복나눔재단 통합 관리자</span>
                {isAuthenticated && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                    인증됨
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                게시물(공지/사업/갤러리) 작성, 수정, 삭제 및 신청 내역 실시간 관리
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setIsAdmin(false);
                }}
                className="hidden sm:flex items-center gap-1 text-xs text-slate-400 hover:text-orange-400 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>잠금</span>
              </button>
            )}
            <button
              onClick={() => setAdminOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-6 py-2.5 flex items-center justify-between shadow-md shrink-0 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-200 hover:text-white p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* --- PASSWORD AUTHENTICATION SCREEN --- */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full space-y-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-3xl mx-auto flex items-center justify-center text-orange-600 shadow-inner">
                <Lock className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-extrabold text-slate-900">관리자 인증</h4>
                <p className="text-xs text-slate-500">
                  게시물 등록, 수정, 삭제 및 재단 설정을 관리하려면 비밀번호를 입력해 주세요.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="관리자 비밀번호 입력"
                    className="w-full p-3.5 pl-4 pr-12 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-mono focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {loginError && (
                  <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-200 animate-in fade-in">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>관리자 로그인</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* --- ADMIN AUTHENTICATED SYSTEM PANELS --- */}
            
            {/* Tab Navigation */}
            <div className="bg-slate-100 p-2 flex items-center gap-1 overflow-x-auto shrink-0 border-b border-slate-200 text-xs font-bold text-slate-700">
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 ${
                  activeTab === 'settings' ? 'bg-white text-orange-600 shadow-2xs' : 'hover:bg-slate-200'
                }`}
              >
                <Building className="w-3.5 h-3.5" /> 재단정보 & 계좌
              </button>

              <button
                onClick={() => setActiveTab('programs')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 ${
                  activeTab === 'programs' ? 'bg-white text-orange-600 shadow-2xs' : 'hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" /> 주요사업 관리 ({programs.length})
              </button>

              <button
                onClick={() => setActiveTab('notices')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 ${
                  activeTab === 'notices' ? 'bg-white text-orange-600 shadow-2xs' : 'hover:bg-slate-200'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" /> 공지사항 관리 ({notices.length})
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 ${
                  activeTab === 'gallery' ? 'bg-white text-orange-600 shadow-2xs' : 'hover:bg-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> 갤러리 관리 ({gallery.length})
              </button>

              <button
                onClick={() => {
                  setActiveTab('donations');
                }}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 relative ${
                  activeTab === 'donations' ? 'bg-white text-orange-600 shadow-2xs font-extrabold' : 'hover:bg-slate-200'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                <span>후원 관리 ({donations.length})</span>
                {hasNewDonation && (
                  <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse shadow-xs">
                    신규 {pendingDonationsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('inquiries')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 ${
                  activeTab === 'inquiries' ? 'bg-white text-orange-600 shadow-2xs' : 'hover:bg-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> 문의 내역 ({inquiries.length})
              </button>

              <button
                onClick={() => setActiveTab('subscribers')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 ${
                  activeTab === 'subscribers' ? 'bg-white text-orange-600 shadow-2xs font-extrabold' : 'hover:bg-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-amber-500" /> 소식지 구독자 ({subscribers.length})
              </button>

              <button
                onClick={() => setActiveTab('popups')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 ${
                  activeTab === 'popups' ? 'bg-white text-orange-600 shadow-2xs font-extrabold' : 'hover:bg-slate-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-orange-500" /> 팝업창 관리 ({popups.length})
              </button>
            </div>

            {/* Tab Body Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              
              {/* 1. Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h4 className="font-bold text-slate-900 text-sm">재단 기본 정보 & 후원 계좌 설정</h4>
                    <button
                      onClick={handleSaveSettings}
                      className="bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 hover:bg-orange-700"
                    >
                      <Save className="w-3.5 h-3.5" /> 정보 저장하기
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">재단명</label>
                        <input
                          type="text"
                          value={editSettings.name}
                          onChange={(e) => setEditSettings({ ...editSettings, name: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">이사장 성함</label>
                        <input
                          type="text"
                          value={editSettings.chairmanName}
                          onChange={(e) => setEditSettings({ ...editSettings, chairmanName: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold"
                        />
                      </div>
                    </div>

                    {/* Chairman Photo Upload */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-800">이사장 프로필 사진 (PC/모바일 공통 적용)</label>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          모바일/PC 실시간 동기화
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img
                          src={editSettings.chairmanImageUrl || INITIAL_SETTINGS.chairmanImageUrl}
                          alt="이사장 사진 미리보기"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-300 shrink-0"
                        />
                        <div className="flex-1 space-y-1.5">
                          <label className="px-3.5 py-2 bg-white hover:bg-orange-50 border border-slate-300 hover:border-orange-400 rounded-xl text-xs font-bold text-slate-700 hover:text-orange-600 cursor-pointer flex items-center gap-2 transition-all w-fit">
                            <Upload className="w-4 h-4 text-orange-500" />
                            <span>내 컴퓨터에서 이사장 사진 파일 선택</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  processImageFile(file, (dataUrl) => {
                                    setEditSettings((prev) => ({ ...prev, chairmanImageUrl: dataUrl }));
                                  });
                                }
                              }}
                            />
                          </label>
                          <input
                            type="text"
                            placeholder="또는 사진 이미지 URL 입력"
                            value={editSettings.chairmanImageUrl || ''}
                            onChange={(e) => setEditSettings({ ...editSettings, chairmanImageUrl: e.target.value })}
                            className="w-full p-2 bg-white border rounded-lg text-[11px] font-mono text-slate-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hero Banner Photo Upload */}
                    <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2">
                      <label className="block font-bold text-slate-800">메인 대표 배너 사진 (한국 나눔/봉사 현장 이미지)</label>
                      <div className="flex items-center gap-3">
                        <img
                          src={editSettings.heroImageUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80'}
                          alt="메인 배너 미리보기"
                          className="w-24 h-16 rounded-xl object-cover border border-slate-300 shrink-0"
                        />
                        <div className="flex-1 space-y-1.5">
                          <label className="px-3.5 py-2 bg-white hover:bg-orange-50 border border-slate-300 hover:border-orange-400 rounded-xl text-xs font-bold text-slate-700 hover:text-orange-600 cursor-pointer flex items-center gap-2 transition-all w-fit">
                            <Upload className="w-4 h-4 text-orange-500" />
                            <span>내 컴퓨터에서 배너 이미지 선택</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  processImageFile(file, (dataUrl) => {
                                    setEditSettings((prev) => ({ ...prev, heroImageUrl: dataUrl }));
                                  });
                                }
                              }}
                            />
                          </label>
                          <input
                            type="text"
                            placeholder="또는 이미지 URL 직접 입력"
                            value={editSettings.heroImageUrl || ''}
                            onChange={(e) => setEditSettings({ ...editSettings, heroImageUrl: e.target.value })}
                            className="w-full p-2 bg-white border rounded-lg text-[11px] font-mono text-slate-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">이사장 인사말 문구</label>
                      <textarea
                        rows={6}
                        value={editSettings.chairmanGreeting || ''}
                        onChange={(e) => setEditSettings({ ...editSettings, chairmanGreeting: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-xl leading-relaxed"
                        placeholder="이사장 인사말 내용을 입력하세요."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">재단 대표 전화번호</label>
                        <input
                          type="text"
                          value={editSettings.phone}
                          onChange={(e) => setEditSettings({ ...editSettings, phone: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">재단 FAX 번호</label>
                        <input
                          type="text"
                          value={editSettings.fax || ''}
                          onChange={(e) => setEditSettings({ ...editSettings, fax: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">가족센터 전화번호</label>
                        <input
                          type="text"
                          value={editSettings.familyCenterPhone || '033-433-1925'}
                          onChange={(e) => setEditSettings({ ...editSettings, familyCenterPhone: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">가족센터 FAX 번호</label>
                        <input
                          type="text"
                          value={editSettings.familyCenterFax || '033-433-1910'}
                          onChange={(e) => setEditSettings({ ...editSettings, familyCenterFax: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">재단 대표 이메일</label>
                        <input
                          type="email"
                          value={editSettings.email || 'hcdmh1026@naver.com'}
                          onChange={(e) => setEditSettings({ ...editSettings, email: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">운영시간 안내</label>
                        <input
                          type="text"
                          value={editSettings.operatingHours || '월~금 09:00 - 18:00 (토, 일, 공휴일 휴무)'}
                          onChange={(e) => setEditSettings({ ...editSettings, operatingHours: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">주소</label>
                      <input
                        type="text"
                        value={editSettings.address}
                        onChange={(e) => setEditSettings({ ...editSettings, address: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">메인 슬로건</label>
                      <input
                        type="text"
                        value={editSettings.sloganMain}
                        onChange={(e) => setEditSettings({ ...editSettings, sloganMain: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-xl"
                      />
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="block font-extrabold text-slate-800 text-sm">
                          후원금 계좌 설정
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newBanks = [...(editSettings.bankAccounts || [])];
                              newBanks.push({ bank: '', accountNumber: '', holder: '(사)너브내행복나눔재단' });
                              setEditSettings({ ...editSettings, bankAccounts: newBanks });
                            }}
                            className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200 transition-colors"
                          >
                            + 계좌 추가
                          </button>
                          <span className="text-xs text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full">
                            실시간 반영
                          </span>
                        </div>
                      </div>

                      {(editSettings.bankAccounts || []).map((acc, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 items-end">
                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">은행명</label>
                            <input
                              type="text"
                              value={acc.bank || ''}
                              onChange={(e) => {
                                const newBanks = [...(editSettings.bankAccounts || [])];
                                newBanks[idx] = { ...newBanks[idx], bank: e.target.value };
                                setEditSettings({ ...editSettings, bankAccounts: newBanks });
                              }}
                              placeholder="예: 농협"
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                            />
                          </div>

                          <div className="sm:col-span-5">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">계좌번호</label>
                            <input
                              type="text"
                              value={acc.accountNumber || ''}
                              onChange={(e) => {
                                const newBanks = [...(editSettings.bankAccounts || [])];
                                newBanks[idx] = { ...newBanks[idx], accountNumber: e.target.value };
                                setEditSettings({ ...editSettings, bankAccounts: newBanks });
                              }}
                              placeholder="예: 351-1040-2310-53"
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-extrabold text-slate-900"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">예금주</label>
                            <input
                              type="text"
                              value={acc.holder || ''}
                              onChange={(e) => {
                                const newBanks = [...(editSettings.bankAccounts || [])];
                                newBanks[idx] = { ...newBanks[idx], holder: e.target.value };
                                setEditSettings({ ...editSettings, bankAccounts: newBanks });
                              }}
                              placeholder="예: (사)너브내행복나눔재단"
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                            />
                          </div>

                          <div className="sm:col-span-1 flex justify-end pb-1">
                            {(editSettings.bankAccounts || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newBanks = (editSettings.bankAccounts || []).filter((_, i) => i !== idx);
                                  setEditSettings({ ...editSettings, bankAccounts: newBanks });
                                }}
                                className="px-2 py-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors text-xs font-bold"
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Admin Password Change Section */}
                    <div className="border-t border-slate-200 pt-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-orange-600" />
                        <label className="block font-extrabold text-slate-800 text-sm">
                          관리자 비밀번호 변경
                        </label>
                      </div>

                      <form onSubmit={handlePasswordChange} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">새 비밀번호</label>
                            <input
                              type="password"
                              value={newAdminPassword}
                              onChange={(e) => {
                                setNewAdminPassword(e.target.value);
                                if (passwordChangeError) setPasswordChangeError(null);
                              }}
                              placeholder="새 비밀번호 입력"
                              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">새 비밀번호 확인</label>
                            <input
                              type="password"
                              value={confirmAdminPassword}
                              onChange={(e) => {
                                setConfirmAdminPassword(e.target.value);
                                if (passwordChangeError) setPasswordChangeError(null);
                              }}
                              placeholder="새 비밀번호 재입력"
                              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                            />
                          </div>
                        </div>

                        {passwordChangeError && (
                          <div className="text-red-600 text-xs font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">
                            {passwordChangeError}
                          </div>
                        )}

                        {passwordChangeSuccess && (
                          <div className="text-emerald-700 text-xs font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                            {passwordChangeSuccess}
                          </div>
                        )}

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            <Lock className="w-3.5 h-3.5 text-orange-400" />
                            <span>비밀번호 변경하기</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Programs Tab (주요사업 작성/수정/삭제) */}
              {activeTab === 'programs' && (
                <div className="space-y-6">
                  {/* Create New Program Form */}
                  <form onSubmit={handleCreateProgram} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span>신규 주요 복지사업 등록</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="사업명 (예: 꿈나무 장학사업)"
                        value={newProgTitle}
                        onChange={(e) => setNewProgTitle(e.target.value)}
                        className="p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="부제목 (예: 청소년 학업 및 미래 꿈 지원)"
                        value={newProgSubtitle}
                        onChange={(e) => setNewProgSubtitle(e.target.value)}
                        className="p-2.5 bg-slate-50 border rounded-xl text-xs"
                      />
                    </div>

                    <textarea
                      rows={2}
                      required
                      placeholder="사업 요약 정보"
                      value={newProgSummary}
                      onChange={(e) => setNewProgSummary(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="지원 대상 (예: 홍천군 관내 저소득가정)"
                        value={newProgTarget}
                        onChange={(e) => setNewProgTarget(e.target.value)}
                        className="p-2.5 bg-slate-50 border rounded-xl text-xs"
                      />
                      <input
                        type="text"
                        placeholder="지원 효과 및 메시지"
                        value={newProgImpact}
                        onChange={(e) => setNewProgImpact(e.target.value)}
                        className="p-2.5 bg-slate-50 border rounded-xl text-xs"
                      />
                    </div>

                    <textarea
                      rows={2}
                      placeholder="세부 추진 내용 (줄바꿈으로 구분)"
                      value={newProgDetails}
                      onChange={(e) => setNewProgDetails(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                    />

                    <div className="text-right">
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> 사업 등록하기
                      </button>
                    </div>
                  </form>

                  {/* Program List & Edit */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-800 text-xs">등록된 주요 사업 목록 ({programs.length}건)</h5>
                    {programs.map((p) => (
                      <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
                        {editingProgramId === p.id ? (
                          <div className="space-y-3 bg-orange-50/50 p-4 rounded-2xl border border-orange-200">
                            <div className="font-bold text-orange-600 flex items-center justify-between text-xs">
                              <span>사업 정보 및 세부 실행사항 수정</span>
                              <span className="text-[11px] text-slate-500 font-mono">사업 번호: {p.code}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">사업명</label>
                                <input
                                  type="text"
                                  value={editProgramData.title ?? p.title}
                                  onChange={(e) => setEditProgramData({ ...editProgramData, title: e.target.value })}
                                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">뱃지 라벨</label>
                                <input
                                  type="text"
                                  placeholder="예: 핵심공익사업, 지자체협력"
                                  value={editProgramData.badge ?? p.badge ?? ''}
                                  onChange={(e) => setEditProgramData({ ...editProgramData, badge: e.target.value })}
                                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">부제목 (핵심 슬로건)</label>
                              <input
                                type="text"
                                value={editProgramData.subtitle ?? p.subtitle}
                                onChange={(e) => setEditProgramData({ ...editProgramData, subtitle: e.target.value })}
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">사업 요약 설명</label>
                              <textarea
                                rows={2}
                                value={editProgramData.summary ?? p.summary}
                                onChange={(e) => setEditProgramData({ ...editProgramData, summary: e.target.value })}
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">지원 대상</label>
                                <input
                                  type="text"
                                  value={editProgramData.targetAudience ?? p.targetAudience ?? ''}
                                  onChange={(e) => setEditProgramData({ ...editProgramData, targetAudience: e.target.value })}
                                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">기대 효과 및 비전</label>
                                <input
                                  type="text"
                                  value={editProgramData.impactMessage ?? p.impactMessage ?? ''}
                                  onChange={(e) => setEditProgramData({ ...editProgramData, impactMessage: e.target.value })}
                                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                주요 지원 내용 및 실행 세부사항 (줄바꿈/Enter로 개별 항목 구분)
                              </label>
                              <textarea
                                rows={4}
                                placeholder="줄바꿈으로 구별하여 각 지원 항목을 작성해 주세요"
                                value={editDetailsText}
                                onChange={(e) => setEditDetailsText(e.target.value)}
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs leading-relaxed"
                              />
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProgramId(null);
                                  setEditProgramData({});
                                  setEditDetailsText('');
                                }}
                                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                              >
                                취소
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveProgramEdit(p.id)}
                                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                              >
                                저장하기
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-900 text-white font-mono px-2 py-0.5 rounded text-[10px]">
                                  NO. {p.code}
                                </span>
                                <span className="font-extrabold text-sm text-slate-900">{p.title}</span>
                                {p.badge && (
                                  <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">
                                    {p.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-700 font-semibold">{p.subtitle}</p>
                              <p className="text-slate-500 pt-0.5 leading-relaxed">{p.summary}</p>

                              <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                                <div className="text-slate-600">
                                  🎯 <span className="font-bold">지원 대상:</span> {p.targetAudience}
                                </div>
                                <div className="text-slate-600">
                                  💡 <span className="font-bold">기대 효과:</span> {p.impactMessage}
                                </div>
                                {p.details && p.details.length > 0 && (
                                  <div className="text-slate-600 pt-0.5">
                                    📋 <span className="font-bold">실행 세부사항 ({p.details.length}건):</span>
                                    <ul className="list-disc list-inside text-slate-600 pl-1 mt-0.5 space-y-0.5">
                                      {p.details.map((d, i) => (
                                        <li key={i} className="truncate">{d}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingProgramId(p.id);
                                  setEditProgramData(p);
                                  setEditDetailsText(p.details ? p.details.join('\n') : '');
                                }}
                                className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl cursor-pointer"
                                title="수정"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {deleteConfirmId === p.id ? (
                                <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl animate-in fade-in">
                                  <span className="text-[11px] font-bold text-red-700">삭제할까요?</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteProgram(p.id);
                                      setDeleteConfirmId(null);
                                      showToast('주요 복지사업 항목이 삭제되었습니다.');
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                                  >
                                    삭제
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(p.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                                  title="삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Notices Tab (공지사항 게시/수정/삭제) */}
              {activeTab === 'notices' && (
                <div className="space-y-6">
                  {/* Create Notice Form */}
                  <form onSubmit={handleCreateNotice} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-orange-600" />
                      <span>새 공지사항 등록</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">공지글 제목 *</label>
                        <input
                          type="text"
                          required
                          placeholder="공지글 제목"
                          value={newNoticeTitle}
                          onChange={(e) => setNewNoticeTitle(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">작성 일자</label>
                        <input
                          type="date"
                          value={newNoticeDate}
                          onChange={(e) => setNewNoticeDate(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">카테고리</label>
                        <select
                          value={newNoticeCategory}
                          onChange={(e) => setNewNoticeCategory(e.target.value as any)}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                        >
                          <option value="공지사항">공지사항</option>
                          <option value="재단소식">재단소식</option>
                          <option value="사업소식">사업소식</option>
                          <option value="후원소식">후원소식</option>
                          <option value="모집공고">모집공고</option>
                          <option value="보도자료">보도자료</option>
                        </select>
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      required
                      placeholder="공지글 내용"
                      value={newNoticeContent}
                      onChange={(e) => setNewNoticeContent(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                    />

                    {/* Attachment Upload Field */}
                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Paperclip className="w-4 h-4 text-orange-600" />
                          <span>첨부파일 등록 (신청서식, 안내문, 공고 등)</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">HWP, PDF, DOCX, ZIP 등</span>
                      </div>

                      <label className="cursor-pointer bg-white hover:bg-orange-50 border border-dashed border-slate-300 hover:border-orange-400 p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:text-orange-600 transition-all">
                        <Upload className="w-4 h-4 text-orange-500" />
                        <span>내 컴퓨터에서 파일 선택하여 첨부하기</span>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => handleNoticeFileUpload(e.target.files, false)}
                        />
                      </label>

                      {/* File preview list */}
                      {newNoticeAttachments.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {newNoticeAttachments.map((att, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white border border-orange-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-800">
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                <span className="font-bold truncate">{att.name}</span>
                                <span className="text-[10px] text-slate-500">({att.size})</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNewNoticeAttachments(prev => prev.filter((_, i) => i !== idx))}
                                className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors"
                                title="첨부 삭제"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newNoticeImportant}
                          onChange={(e) => setNewNoticeImportant(e.target.checked)}
                          className="rounded text-orange-600 focus:ring-orange-500"
                        />
                        <span>[필독] 상단 고지 공지글로 지정</span>
                      </label>

                      <button
                        type="submit"
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> 등록하기
                      </button>
                    </div>
                  </form>

                  {/* Notice List & Edit */}
                  <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                    {notices.map((n) => (
                      <div key={n.id} className="p-4 text-xs">
                        {editingNoticeId === n.id ? (
                          <div className="space-y-3 bg-orange-50/50 p-3.5 rounded-xl border border-orange-200">
                            <div className="font-bold text-orange-600">공지사항 수정</div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">제목</label>
                                <input
                                  type="text"
                                  value={editNoticeData.title ?? n.title}
                                  onChange={(e) => setEditNoticeData({ ...editNoticeData, title: e.target.value })}
                                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">작성 일자</label>
                                <input
                                  type="date"
                                  value={editNoticeData.date ?? n.date}
                                  onChange={(e) => setEditNoticeData({ ...editNoticeData, date: e.target.value })}
                                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                                />
                              </div>
                            </div>
                            <textarea
                              rows={3}
                              value={editNoticeData.content ?? n.content}
                              onChange={(e) => setEditNoticeData({ ...editNoticeData, content: e.target.value })}
                              className="w-full p-2 bg-white border rounded-lg text-xs"
                            />

                            {/* Editing attachments */}
                            <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                <span>첨부파일 관리</span>
                                <label className="cursor-pointer text-orange-600 hover:underline inline-flex items-center gap-1 text-[11px]">
                                  <Plus className="w-3.5 h-3.5" /> 파일 추가
                                  <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => handleNoticeFileUpload(e.target.files, true)}
                                  />
                                </label>
                              </div>

                              {((editNoticeData.attachments || []).length > 0) ? (
                                <div className="space-y-1.5">
                                  {(editNoticeData.attachments || []).map((att, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded text-xs">
                                      <div className="flex items-center gap-2 truncate">
                                        <FileText className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                        <span className="font-bold truncate">{att.name}</span>
                                        <span className="text-[10px] text-slate-500">({att.size || '첨부'})</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentAtts = editNoticeData.attachments || [];
                                          const updatedAtts = currentAtts.filter((_, i) => i !== idx);
                                          setEditNoticeData({
                                            ...editNoticeData,
                                            attachments: updatedAtts,
                                            attachmentName: updatedAtts.length > 0 ? updatedAtts[0].name : undefined,
                                            attachmentUrl: updatedAtts.length > 0 ? updatedAtts[0].url : undefined
                                          });
                                        }}
                                        className="text-slate-400 hover:text-red-600 p-0.5"
                                        title="삭제"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400">첨부된 파일이 없습니다.</p>
                              )}
                            </div>

                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingNoticeId(null)}
                                className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg"
                              >
                                취소
                              </button>
                              <button
                                onClick={() => handleSaveNoticeEdit(n.id)}
                                className="px-3 py-1.5 bg-orange-600 text-white font-bold rounded-lg"
                              >
                                저장
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded shrink-0">
                                {n.category}
                              </span>
                              <span className="font-bold text-slate-900 truncate">{n.title}</span>
                              {n.isImportant && (
                                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                                  필독
                                </span>
                              )}
                              {(n.attachments && n.attachments.length > 0) && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 shrink-0">
                                  <Paperclip className="w-3 h-3" />
                                  <span>첨부 {n.attachments.length}</span>
                                </span>
                              )}
                              <span className="text-slate-400 shrink-0 ml-auto sm:ml-0">({n.date})</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingNoticeId(n.id);
                                  const initialAtts = n.attachments && n.attachments.length > 0
                                    ? [...n.attachments]
                                    : (n.attachmentName ? [{ name: n.attachmentName, url: n.attachmentUrl || '#', size: '첨부서식', type: 'FILE' }] : []);
                                  setEditNoticeData({
                                    ...n,
                                    attachments: initialAtts,
                                    attachmentName: initialAtts.length > 0 ? initialAtts[0].name : undefined,
                                    attachmentUrl: initialAtts.length > 0 ? initialAtts[0].url : undefined
                                  });
                                }}
                                className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded"
                                title="수정"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {deleteConfirmId === n.id ? (
                                <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl animate-in fade-in">
                                  <span className="text-[11px] font-bold text-red-700">삭제할까요?</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteNotice(n.id);
                                      setDeleteConfirmId(null);
                                      showToast('공지사항이 삭제되었습니다.');
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                                  >
                                    삭제
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(n.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                  title="삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Gallery Tab (활동사진 작성/수정/삭제) */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-emerald-900 text-sm flex items-center gap-2">
                        <Camera className="w-4 h-4 text-emerald-600" />
                        <span>활동 사진 갤러리 통합 관리</span>
                      </h4>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        내 PC의 나눔 활동 사진을 직접 등록하거나 수정 및 삭제할 수 있습니다.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-300">
                      총 {gallery.length}장
                    </span>
                  </div>

                  <form onSubmit={handleCreateGallery} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-600" />
                        <span>새 활동 사진 파일 등록</span>
                      </h4>

                      {/* Mode Toggle Buttons */}
                      <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                        <button
                          type="button"
                          onClick={() => setUploadMode('file')}
                          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                            uploadMode === 'file'
                              ? 'bg-white text-emerald-600 shadow-2xs'
                              : 'hover:text-slate-900'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>내 PC 사진 업로드</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMode('url')}
                          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                            uploadMode === 'url'
                              ? 'bg-white text-emerald-600 shadow-2xs'
                              : 'hover:text-slate-900'
                          }`}
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>웹 URL 입력</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">활동 제목 *</label>
                        <input
                          type="text"
                          required
                          placeholder="활동 제목 (예: 2026 홍천 관내 장학생 장학금 전달식)"
                          value={newGalTitle}
                          onChange={(e) => setNewGalTitle(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">활동 일자</label>
                        <input
                          type="date"
                          value={newGalDate}
                          onChange={(e) => setNewGalDate(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">카테고리</label>
                        <select
                          value={newGalCategory}
                          onChange={(e) => setNewGalCategory(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                        >
                          <option value="명절 나눔">명절 나눔</option>
                          <option value="장학금 전달">장학금 전달</option>
                          <option value="삼계탕 나눔">삼계탕 나눔</option>
                          <option value="교육지원">교육지원</option>
                          <option value="주거환경 개선">주거환경 개선</option>
                          <option value="복지시설 지원">복지시설 지원</option>
                          <option value="가족센터 활동">가족센터 활동</option>
                        </select>
                      </div>
                    </div>

                    {/* PC File Upload Zone */}
                    {uploadMode === 'file' ? (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">활동 사진 파일 선택 (내 컴퓨터)</label>
                        
                        {!newGalUrl ? (
                          <label
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e)}
                            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                              dragActive
                                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                                : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20'
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e)}
                              className="hidden"
                            />
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 shadow-inner">
                              <UploadCloud className="w-6 h-6 stroke-[2.2]" />
                            </div>
                            <p className="text-xs font-bold text-slate-800">
                              클릭하여 PC에서 이미지 파일 선택
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              또는 여기에 사진 파일을 드래그하여 놓으세요 (JPG, PNG, WEBP)
                            </p>
                          </label>
                        ) : (
                          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center gap-4">
                            <img
                              src={newGalUrl}
                              alt="업로드 미리보기"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80';
                              }}
                              className="w-20 h-20 rounded-xl object-cover border border-emerald-300 shrink-0 shadow-2xs"
                            />
                            <div className="flex-1 min-w-0 text-xs">
                              <div className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px] mb-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>사진 업로드 완료</span>
                              </div>
                              <p className="font-bold text-slate-800 truncate">
                                {newGalFileName || '내 PC 선택 이미지'}
                              </p>
                              <p className="text-[11px] text-slate-500 pt-0.5">
                                선택된 이미지 등록 준비 완료
                              </p>
                            </div>
                            <label className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e)}
                                className="hidden"
                              />
                              사진 변경
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setNewGalUrl('');
                                setNewGalFileName('');
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                              title="삭제"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Web URL Mode */
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">웹 이미지 URL 입력</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="이미지 웹 주소 (https://...)"
                            value={newGalUrl}
                            onChange={(e) => setNewGalUrl(e.target.value)}
                            className="flex-1 p-2.5 bg-slate-50 border rounded-xl text-xs"
                          />
                        </div>
                        {newGalUrl && (
                          <div className="p-2 bg-slate-50 border rounded-xl flex items-center gap-3">
                            <img src={newGalUrl} alt="URL 미리보기" className="w-12 h-12 rounded-lg object-cover" />
                            <span className="text-xs text-slate-500 font-medium">이미지 미리보기</span>
                          </div>
                        )}
                      </div>
                    )}

                    <textarea
                      rows={2}
                      placeholder="활동 내용 및 성과 간단 설명"
                      value={newGalDesc}
                      onChange={(e) => setNewGalDesc(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs leading-relaxed"
                    />

                    <div className="text-right">
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> 갤러리 등록 완료
                      </button>
                    </div>
                  </form>

                  {/* Registered Photo Gallery List */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-800 text-xs flex items-center justify-between">
                      <span>등록된 활동 사진 목록 ({gallery.length}개)</span>
                      <span className="text-slate-400 font-normal">버튼을 클릭하여 수정 및 삭제가 가능합니다</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {gallery.map((g) => (
                        <div key={g.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                          {editingGalleryId === g.id ? (
                            <div className="w-full space-y-2.5 p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                              <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                                <Edit className="w-3.5 h-3.5" />
                                <span>갤러리 항목 수정</span>
                              </div>
                              <input
                                type="text"
                                value={editGalleryData.title ?? g.title}
                                onChange={(e) => setEditGalleryData({ ...editGalleryData, title: e.target.value })}
                                className="w-full p-2 bg-white border rounded-lg text-xs font-bold"
                                placeholder="활동 제목"
                              />

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">활동 일자</label>
                                  <input
                                    type="date"
                                    value={editGalleryData.date ?? g.date}
                                    onChange={(e) => setEditGalleryData({ ...editGalleryData, date: e.target.value })}
                                    className="p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">카테고리</label>
                                  <input
                                    type="text"
                                    value={editGalleryData.category ?? g.category}
                                    onChange={(e) => setEditGalleryData({ ...editGalleryData, category: e.target.value })}
                                    className="p-2 bg-white border border-slate-300 rounded-lg text-xs w-full"
                                    placeholder="카테고리"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">장소</label>
                                  <input
                                    type="text"
                                    value={editGalleryData.location ?? (g.location || '홍천군 관내')}
                                    onChange={(e) => setEditGalleryData({ ...editGalleryData, location: e.target.value })}
                                    className="p-2 bg-white border border-slate-300 rounded-lg text-xs w-full"
                                    placeholder="장소"
                                  />
                                </div>
                              </div>

                              {/* Image preview & PC upload button in edit mode */}
                              <div className="flex items-center gap-2">
                                {editGalleryData.imageUrl && (
                                  <img
                                    src={editGalleryData.imageUrl}
                                    alt="수정 미리보기"
                                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                                  />
                                )}
                                <label className="flex-1 px-3 py-2 bg-white border border-slate-300 hover:border-emerald-500 rounded-lg text-xs font-bold text-slate-700 hover:text-emerald-700 cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, true)}
                                    className="hidden"
                                  />
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>PC 사진 파일 변경</span>
                                </label>
                              </div>

                              <textarea
                                rows={2}
                                value={editGalleryData.description ?? g.description}
                                onChange={(e) => setEditGalleryData({ ...editGalleryData, description: e.target.value })}
                                className="w-full p-2 bg-white border rounded-lg text-xs leading-relaxed"
                                placeholder="활동 내용 설명"
                              />

                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingGalleryId(null)}
                                  className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                                >
                                  취소
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveGalleryEdit(g.id)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                                >
                                  수정 저장
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-3 items-center">
                              <img
                                src={getImageUrl(g.imageUrl)}
                                alt={g.title}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80';
                                }}
                                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                              />
                              <div className="flex-1 min-w-0 text-xs space-y-0.5">
                                <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                  <span className="truncate">{g.title}</span>
                                  {g.isProtected && (
                                    <span className="shrink-0 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5" title="관리자 보호 모드 등록됨 (임의 변경 불가)">
                                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> 관리자 보호
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500 text-[11px] flex items-center gap-1.5 flex-wrap">
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                    {g.category}
                                  </span>
                                  <span>📅 {g.date}</span>
                                  <span className="text-slate-400">({g.author || '재단 관리자'})</span>
                                </div>
                                <p className="text-slate-400 text-[11px] truncate">{g.location || '홍천군 관내'}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingGalleryId(g.id);
                                    setEditGalleryData(g);
                                  }}
                                  className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                  title="수정"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {deleteConfirmId === g.id ? (
                                  <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl animate-in fade-in">
                                    <span className="text-[11px] font-bold text-red-700">삭제할까요?</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        deleteGallery(g.id);
                                        setDeleteConfirmId(null);
                                        showToast('갤러리 사진 항목이 삭제되었습니다.');
                                      }}
                                      className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                                    >
                                      삭제
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                                    >
                                      취소
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(g.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                    title="삭제"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Donations List Tab */}
              {activeTab === 'donations' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <span>실시간 후원 신청 및 봉사 참여 명단</span>
                        <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                          총 {donations.length}건
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        새로운 후원 신청이 접수되면 상단 메뉴에 빨간 불(알림)이 표시되며, 첨부 서식 스타일의 엑셀 다운로드가 가능합니다.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {hasNewDonation && (
                        <button
                          type="button"
                          onClick={() => {
                            markDonationsAsRead();
                            alert('모든 신규 알림이 확인 처리되었습니다.');
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="신규 알림 표시 해제"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span>알림 읽음 처리</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => exportDonationsToExcel(donations)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
                        title="첨부서식 형태의 엑셀 파일 다운로드"
                      >
                        <Download className="w-4 h-4 text-emerald-200" />
                        <span>엑셀 명단 다운로드 (.xls)</span>
                      </button>
                    </div>
                  </div>

                  {donations.length === 0 ? (
                    <div className="p-8 bg-white rounded-2xl border text-center text-slate-500 text-xs">
                      아직 접수된 신청서가 없습니다. (홈페이지 후원신청서 제출 시 실시간 표시됩니다)
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {donations.map((d) => (
                        <div key={d.id} className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between font-bold">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                                d.donationType?.includes('정기')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : d.donationType?.includes('일시')
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {d.donationType}
                              </span>
                              <span className="text-slate-900 text-sm">{d.name}</span>
                              <span className="text-slate-500 font-medium">({d.phone})</span>
                              {d.status === '접수완료' && (
                                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                                  NEW 신규접수
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={d.status}
                                onChange={(e) => updateDonationStatus(d.id, e.target.value as any)}
                                className={`p-1.5 border rounded-lg text-xs font-bold ${
                                  d.status === '접수완료'
                                    ? 'bg-red-50 border-red-300 text-red-700'
                                    : d.status === '확인중'
                                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                                    : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                }`}
                              >
                                <option value="접수완료">🔴 접수완료 (신규)</option>
                                <option value="확인중">🟠 확인중</option>
                                <option value="처리완료">🟢 처리완료</option>
                              </select>
                              {deleteConfirmId === d.id ? (
                                <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl animate-in fade-in">
                                  <span className="text-[11px] font-bold text-red-700">삭제할까요?</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteDonation(d.id);
                                      setDeleteConfirmId(null);
                                      showToast('후원 신청 내역이 삭제되었습니다.');
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                                  >
                                    삭제
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(d.id)}
                                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                  title="삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="text-slate-600 bg-slate-50 p-2.5 rounded-xl flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span><strong className="text-slate-800">이메일:</strong> {d.email || '미입력'}</span>
                            <span><strong className="text-slate-800">희망 분야:</strong> {d.targetCategory}</span>
                            <span><strong className="text-slate-800">금액/물품:</strong> <span className="text-orange-700 font-bold">{d.amountOrItem || '미지정'}</span></span>
                          </div>
                          {d.message && <div className="text-slate-600 italic bg-amber-50/60 border border-amber-100 p-2.5 rounded-xl">"{d.message}"</div>}
                          <div className="text-[10px] text-slate-400 pt-0.5 flex items-center justify-between">
                            <span>신청일시: {d.createdAt}</span>
                            <span>신청번호: {d.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 6. Inquiries Tab */}
              {activeTab === 'inquiries' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">실시간 접수된 문의사항 ({inquiries.length}건)</h4>
                    <button
                      type="button"
                      onClick={() => exportInquiriesToExcel(inquiries)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                      title="문의사항 엑셀 다운로드"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-200" />
                      <span>엑셀 다운로드 (.xlsx)</span>
                    </button>
                  </div>
                  {inquiries.length === 0 ? (
                    <div className="p-8 bg-white rounded-2xl border text-center text-slate-500 text-xs">
                      접수된 문의 내역이 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inquiries.map((inq) => (
                        <div key={inq.id} className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-blue-600">{inq.subject} - {inq.name} ({inq.phone})</span>
                            <div className="flex items-center gap-2">
                              <select
                                value={inq.status}
                                onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                                className="p-1 bg-slate-100 border rounded text-[11px] font-bold"
                              >
                                <option value="대기중">대기중</option>
                                <option value="답변완료">답변완료</option>
                              </select>
                              {deleteConfirmId === inq.id ? (
                                <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl animate-in fade-in">
                                  <span className="text-[11px] font-bold text-red-700">삭제할까요?</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteInquiry(inq.id);
                                      setDeleteConfirmId(null);
                                      showToast('문의 내역이 삭제되었습니다.');
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                                  >
                                    삭제
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(inq.id)}
                                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                  title="삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="text-slate-700 bg-slate-50 p-2.5 rounded">{inq.message}</div>
                          <div className="text-[10px] text-slate-400">접수일시: {inq.createdAt} | 이메일: {inq.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 7. Newsletter Subscribers Tab */}
              {activeTab === 'subscribers' && (
                <div className="space-y-6 max-w-4xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4 text-orange-500" />
                        <span>소식지 구독 신청 내역 관리</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        너브내행복나눔 재단소식지를 신청한 이메일 목록을 조회하고 관리할 수 있습니다.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => exportSubscribersToExcel(subscribers)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                        title="구독자 목록 엑셀 다운로드"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-200" />
                        <span>엑셀 다운로드 (.xlsx)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const activeEmails = subscribers
                            .filter(s => s.status === '구독중')
                            .map(s => s.email)
                            .join(', ');
                          if (!activeEmails) {
                            showToast('구독중인 이메일이 없습니다.');
                            return;
                          }
                          navigator.clipboard.writeText(activeEmails);
                          showToast('구독중인 이메일 목록이 클립보드에 복사되었습니다.');
                        }}
                        className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold px-3 py-2 rounded-xl border border-orange-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>이메일 목록 복사</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Stats Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                      <div className="text-xs text-slate-500 font-medium">전체 신청 건수</div>
                      <div className="text-lg font-black text-slate-900 mt-0.5">{subscribers.length}건</div>
                    </div>
                    <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-center">
                      <div className="text-xs text-emerald-700 font-medium">구독중</div>
                      <div className="text-lg font-black text-emerald-800 mt-0.5">
                        {subscribers.filter(s => s.status === '구독중').length}명
                      </div>
                    </div>
                    <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 text-center">
                      <div className="text-xs text-slate-500 font-medium">구독 해지</div>
                      <div className="text-lg font-black text-slate-600 mt-0.5">
                        {subscribers.filter(s => s.status === '해지').length}명
                      </div>
                    </div>
                  </div>

                  {/* Search Filter */}
                  <div className="relative">
                    <input
                      type="text"
                      value={subscriberSearch}
                      onChange={(e) => setSubscriberSearch(e.target.value)}
                      placeholder="이메일 주소 검색..."
                      className="w-full p-2.5 pl-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* List Table */}
                  {subscribers.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                      <Mail className="w-8 h-8 mx-auto text-slate-300" />
                      <p>신청된 소식지 구독 내역이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3">구독 이메일 주소</th>
                            <th className="p-3">신청 일시</th>
                            <th className="p-3">구독 상태</th>
                            <th className="p-3 text-right">관리</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {subscribers
                            .filter(s => !subscriberSearch || s.email.toLowerCase().includes(subscriberSearch.toLowerCase()))
                            .map((sub) => (
                              <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 font-mono font-bold text-slate-900">{sub.email}</td>
                                <td className="p-3 text-slate-500 text-[11px]">{sub.subscribedAt}</td>
                                <td className="p-3">
                                  <select
                                    value={sub.status}
                                    onChange={(e) => {
                                      updateSubscriberStatus(sub.id, e.target.value as any);
                                      showToast(`구독 상태가 '${e.target.value}'(으)로 변경되었습니다.`);
                                    }}
                                    className={`p-1 rounded text-[11px] font-bold border cursor-pointer ${
                                      sub.status === '구독중'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                        : 'bg-slate-100 text-slate-600 border-slate-300'
                                    }`}
                                  >
                                    <option value="구독중">구독중</option>
                                    <option value="해지">해지</option>
                                  </select>
                                </td>
                                <td className="p-3 text-right">
                                  {deleteConfirmId === sub.id ? (
                                    <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl animate-in fade-in">
                                      <span className="text-[11px] font-bold text-red-700">삭제?</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          deleteSubscriber(sub.id);
                                          setDeleteConfirmId(null);
                                          showToast('구독 이메일이 삭제되었습니다.');
                                        }}
                                        className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                                      >
                                        삭제
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                                      >
                                        취소
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmId(sub.id)}
                                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                      title="삭제"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 8. Popups Tab */}
              {activeTab === 'popups' && (
                <div className="space-y-6">
                  {/* Create New Popup Form */}
                  <form onSubmit={handleCreatePopup} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-orange-500" />
                        <span>새 메인 팝업창 등록</span>
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">
                        첫 화면 입장 또는 메인 클릭 시 노출될 팝업을 등록합니다.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="font-bold text-slate-700">팝업 제목 <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={newPopupTitle}
                          onChange={(e) => setNewPopupTitle(e.target.value)}
                          placeholder="예: 2026년 정기 후원자 모집 안내"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white font-medium"
                          required
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="font-bold text-slate-700">팝업 상세 내용 <span className="text-red-500">*</span></label>
                        <textarea
                          rows={4}
                          value={newPopupContent}
                          onChange={(e) => setNewPopupContent(e.target.value)}
                          placeholder="팝업창에 게재할 안내문 내용을 입력하세요."
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white leading-relaxed resize-y font-medium"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">대표 이미지 (선택)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newPopupImageUrl}
                            onChange={(e) => setNewPopupImageUrl(e.target.value)}
                            placeholder="이미지 URL 또는 파일 업로드"
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white"
                          />
                          <label className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-2.5 rounded-xl cursor-pointer shrink-0 flex items-center gap-1 transition-colors text-xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>파일</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePopupImageUpload(e, false)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">이동 연결 링크 (선택)</label>
                        <input
                          type="text"
                          value={newPopupLinkUrl}
                          onChange={(e) => setNewPopupLinkUrl(e.target.value)}
                          placeholder="예: donate, news, programs 또는 https://..."
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={newPopupIsActive}
                            onChange={(e) => setNewPopupIsActive(e.target.checked)}
                            className="w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-400"
                          />
                          <span>등록 즉시 메인 팝업 활성화 (게시 중)</span>
                        </label>

                        <button
                          type="submit"
                          className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>팝업창 등록하기</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Registered Popups List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-orange-500" />
                        <span>등록된 팝업 목록 ({popups.length}개)</span>
                      </h4>
                    </div>

                    {popups.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                        등록된 팝업창이 없습니다. 위 양식에서 새 팝업을 등록해 보세요.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {popups.map((popup) => {
                          const isEditing = editingPopupId === popup.id;

                          if (isEditing) {
                            return (
                              <div key={popup.id} className="bg-amber-50/50 p-5 rounded-2xl border-2 border-orange-400 shadow-md space-y-4 text-xs">
                                <div className="font-bold text-orange-800 text-sm">팝업 정보 수정</div>
                                <div className="space-y-3">
                                  <div>
                                    <label className="font-bold text-slate-700 block mb-1">제목</label>
                                    <input
                                      type="text"
                                      value={editPopupData.title ?? popup.title}
                                      onChange={(e) => setEditPopupData(prev => ({ ...prev, title: e.target.value }))}
                                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                                    />
                                  </div>
                                  <div>
                                    <label className="font-bold text-slate-700 block mb-1">내용</label>
                                    <textarea
                                      rows={4}
                                      value={editPopupData.content ?? popup.content}
                                      onChange={(e) => setEditPopupData(prev => ({ ...prev, content: e.target.value }))}
                                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl leading-relaxed"
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="font-bold text-slate-700 block mb-1">이미지 URL</label>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={editPopupData.imageUrl ?? popup.imageUrl ?? ''}
                                          onChange={(e) => setEditPopupData(prev => ({ ...prev, imageUrl: e.target.value }))}
                                          className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                                        />
                                        <label className="bg-slate-800 text-white font-bold px-2.5 py-2 rounded-xl cursor-pointer text-[11px] shrink-0">
                                          업로드
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handlePopupImageUpload(e, true)}
                                            className="hidden"
                                          />
                                        </label>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="font-bold text-slate-700 block mb-1">연결 링크</label>
                                      <input
                                        type="text"
                                        value={editPopupData.linkUrl ?? popup.linkUrl ?? ''}
                                        onChange={(e) => setEditPopupData(prev => ({ ...prev, linkUrl: e.target.value }))}
                                        className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-amber-200">
                                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                                    <input
                                      type="checkbox"
                                      checked={editPopupData.isActive ?? popup.isActive}
                                      onChange={(e) => setEditPopupData(prev => ({ ...prev, isActive: e.target.checked }))}
                                      className="w-4 h-4 text-orange-500 rounded"
                                    />
                                    <span>팝업 게시 활성화</span>
                                  </label>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleSavePopupEdit(popup.id)}
                                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-4 py-2 rounded-xl shadow-xs cursor-pointer"
                                    >
                                      저장
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingPopupId(null);
                                        setEditPopupData({});
                                      }}
                                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-2 rounded-xl cursor-pointer"
                                    >
                                      취소
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={popup.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        togglePopupActive(popup.id);
                                        showToast(`팝업 상태가 '${!popup.isActive ? '게시 중' : '중지됨'}'(으)로 변경되었습니다.`);
                                      }}
                                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition-colors ${
                                        popup.isActive
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                          : 'bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200'
                                      }`}
                                    >
                                      {popup.isActive ? '게시 중 (ON)' : '중지됨 (OFF)'}
                                    </button>
                                    <span className="text-[11px] text-slate-400 font-mono">{popup.createdAt}</span>
                                  </div>
                                  <h5 className="font-extrabold text-slate-900 text-base">{popup.title}</h5>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingPopupId(popup.id);
                                      setEditPopupData(popup);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                                    title="수정"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>

                                  {deleteConfirmId === popup.id ? (
                                    <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200 p-1 rounded-xl animate-in fade-in">
                                      <span className="text-[10px] font-bold text-red-700">삭제?</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          deletePopup(popup.id);
                                          setDeleteConfirmId(null);
                                          showToast('팝업이 삭제되었습니다.');
                                        }}
                                        className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-lg cursor-pointer"
                                      >
                                        삭제
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="bg-slate-200 text-slate-700 font-bold text-[10px] px-1.5 py-0.5 rounded-lg cursor-pointer"
                                      >
                                        취소
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmId(popup.id)}
                                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="삭제"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                {popup.content}
                              </p>

                              {popup.imageUrl && (
                                <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                  <img src={popup.imageUrl} alt={popup.title} className="w-full h-full object-cover" />
                                </div>
                              )}

                              {popup.linkUrl && (
                                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                                  <LinkIcon className="w-3 h-3 text-orange-500" />
                                  <span>연결: {popup.linkUrl}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Footer actions */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
              {resetConfirmOpen ? (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl animate-in fade-in">
                  <span className="text-xs font-bold text-red-700">모든 데이터를 초기 상태로 복원할까요?</span>
                  <button
                    type="button"
                    onClick={() => {
                      resetToDefaults();
                      setResetConfirmOpen(false);
                      showToast('데이터가 초기 시드 상태로 복원되었습니다.');
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    복원하기
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetConfirmOpen(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setResetConfirmOpen(true)}
                  className="text-slate-500 hover:text-red-600 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> 초기 시드 데이터로 재설정
                </button>
              )}

              <button
                onClick={() => setAdminOpen(false)}
                className="bg-slate-900 text-white font-bold px-5 py-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                관리자 시스템 닫기
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
