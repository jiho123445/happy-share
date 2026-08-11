import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { Logo } from './Logo';
import { ProgramItem, NoticeItem, GalleryItem } from '../types';
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
  RefreshCw
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
    inquiries,
    updateInquiryStatus,
    deleteInquiry,
    resetToDefaults,
    adminOpen,
    setAdminOpen
  } = useFoundation();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'settings' | 'programs' | 'notices' | 'gallery' | 'donations' | 'inquiries'>('settings');

  // Editing States
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editProgramData, setEditProgramData] = useState<Partial<ProgramItem>>({});

  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [editNoticeData, setEditNoticeData] = useState<Partial<NoticeItem>>({});

  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [editGalleryData, setEditGalleryData] = useState<Partial<GalleryItem>>({});

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
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeImportant, setNewNoticeImportant] = useState(false);

  // New Gallery Form State
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCategory, setNewGalCategory] = useState('명절 나눔');
  const [newGalUrl, setNewGalUrl] = useState('');
  const [newGalDesc, setNewGalDesc] = useState('');
  const [newGalLocation, setNewGalLocation] = useState('홍천군 관내');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [newGalFileName, setNewGalFileName] = useState('');

  // Editable Settings state
  const [editSettings, setEditSettings] = useState(settings);

  if (!adminOpen) return null;

  // Password Authentication Handler (Expected password: 1026)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1026') {
      setIsAuthenticated(true);
      setLoginError(null);
      setPasswordInput('');
    } else {
      setLoginError('비밀번호가 올바르지 않습니다. (비밀번호: 1026)');
    }
  };

  const handleSaveSettings = () => {
    updateSettings(editSettings);
    alert('재단 기본 정보 및 계좌 설정이 성공적으로 저장되었습니다.');
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
    alert('새로운 주요 사업이 등록되었습니다.');
  };

  const handleSaveProgramEdit = (id: string) => {
    updateProgram(id, editProgramData);
    setEditingProgramId(null);
    setEditProgramData({});
    alert('사업 정보가 수정되었습니다.');
  };

  // Notice Handlers
  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;
    addNotice({
      title: newNoticeTitle,
      category: newNoticeCategory,
      content: newNoticeContent,
      isImportant: newNoticeImportant,
      author: '관리자'
    });
    setNewNoticeTitle('');
    setNewNoticeContent('');
    alert('새로운 공지사항이 등록되었습니다.');
  };

  const handleSaveNoticeEdit = (id: string) => {
    updateNotice(id, editNoticeData);
    setEditingNoticeId(null);
    setEditNoticeData({});
    alert('공지사항 내용이 수정되었습니다.');
  };

  // Gallery File Upload Handlers (with HTML5 Canvas compression)
  const processImageFile = (file: File, callback: (dataUrl: string, fileName: string) => void) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(JPG, PNG, WEBP, GIF 등)만 업로드 가능합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) return;

      // Compress photo using Canvas to max 1200px width/height and 0.82 quality
      const img = new Image();
      img.onload = () => {
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
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          callback(compressedDataUrl, file.name);
        } else {
          callback(rawDataUrl, file.name);
        }
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
      imageUrl: newGalUrl,
      description: newGalDesc || newGalTitle,
      location: newGalLocation
    });
    setNewGalTitle('');
    setNewGalDesc('');
    setNewGalUrl('');
    setNewGalFileName('');
    alert('새로운 활동 사진이 갤러리에 추가되었습니다.');
  };

  const handleSaveGalleryEdit = (id: string) => {
    updateGallery(id, editGalleryData);
    setEditingGalleryId(null);
    setEditGalleryData({});
    alert('갤러리 항목이 수정되었습니다.');
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
                onClick={() => setIsAuthenticated(false)}
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
                    placeholder="관리자 비밀번호 입력 (초기: 1026)"
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

              <div className="pt-2 text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                🔑 비밀번호 안내: <span className="font-bold text-slate-700">1026</span>
              </div>
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
                onClick={() => setActiveTab('donations')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 ${
                  activeTab === 'donations' ? 'bg-white text-orange-600 shadow-2xs' : 'hover:bg-slate-200'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-red-500" /> 후원 신청 ({donations.length})
              </button>

              <button
                onClick={() => setActiveTab('inquiries')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 ${
                  activeTab === 'inquiries' ? 'bg-white text-orange-600 shadow-2xs' : 'hover:bg-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> 문의 내역 ({inquiries.length})
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
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">재단명</label>
                      <input
                        type="text"
                        value={editSettings.name}
                        onChange={(e) => setEditSettings({ ...editSettings, name: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">대표 전화번호</label>
                        <input
                          type="text"
                          value={editSettings.phone}
                          onChange={(e) => setEditSettings({ ...editSettings, phone: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">FAX 번호</label>
                        <input
                          type="text"
                          value={editSettings.fax || ''}
                          onChange={(e) => setEditSettings({ ...editSettings, fax: e.target.value })}
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

                    <div className="border-t pt-4">
                      <label className="block font-bold text-slate-800 mb-2">후원금 계좌 1 (농협)</label>
                      <input
                        type="text"
                        value={editSettings.bankAccounts[0]?.accountNumber || ''}
                        onChange={(e) => {
                          const newBanks = [...editSettings.bankAccounts];
                          newBanks[0] = { ...newBanks[0], accountNumber: e.target.value };
                          setEditSettings({ ...editSettings, bankAccounts: newBanks });
                        }}
                        className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
                      />
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
                          <div className="space-y-3 bg-orange-50/50 p-3 rounded-xl border border-orange-200">
                            <div className="font-bold text-orange-600">사업 내용 수정</div>
                            <input
                              type="text"
                              value={editProgramData.title ?? p.title}
                              onChange={(e) => setEditProgramData({ ...editProgramData, title: e.target.value })}
                              className="w-full p-2 bg-white border rounded-lg text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={editProgramData.subtitle ?? p.subtitle}
                              onChange={(e) => setEditProgramData({ ...editProgramData, subtitle: e.target.value })}
                              className="w-full p-2 bg-white border rounded-lg text-xs"
                            />
                            <textarea
                              rows={2}
                              value={editProgramData.summary ?? p.summary}
                              onChange={(e) => setEditProgramData({ ...editProgramData, summary: e.target.value })}
                              className="w-full p-2 bg-white border rounded-lg text-xs"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingProgramId(null)}
                                className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg"
                              >
                                취소
                              </button>
                              <button
                                onClick={() => handleSaveProgramEdit(p.id)}
                                className="px-3 py-1.5 bg-orange-600 text-white font-bold rounded-lg"
                              >
                                저장
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
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
                              <p className="text-slate-600 font-medium">{p.subtitle}</p>
                              <p className="text-slate-500 pt-1 leading-relaxed">{p.summary}</p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingProgramId(p.id);
                                  setEditProgramData(p);
                                }}
                                className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl"
                                title="수정"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`'${p.title}' 사업을 삭제하시겠습니까?`)) {
                                    deleteProgram(p.id);
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                title="삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="공지글 제목"
                          value={newNoticeTitle}
                          onChange={(e) => setNewNoticeTitle(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                        />
                      </div>

                      <select
                        value={newNoticeCategory}
                        onChange={(e) => setNewNoticeCategory(e.target.value as any)}
                        className="p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                      >
                        <option value="공지사항">공지사항</option>
                        <option value="재단소식">재단소식</option>
                        <option value="사업소식">사업소식</option>
                        <option value="후원소식">후원소식</option>
                        <option value="모집공고">모집공고</option>
                        <option value="보도자료">보도자료</option>
                      </select>
                    </div>

                    <textarea
                      rows={3}
                      required
                      placeholder="공지글 내용"
                      value={newNoticeContent}
                      onChange={(e) => setNewNoticeContent(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                    />

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newNoticeImportant}
                          onChange={(e) => setNewNoticeImportant(e.target.checked)}
                          className="rounded"
                        />
                        <span>[필독] 상단 고지 공지글로 지정</span>
                      </label>

                      <button
                        type="submit"
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> 등록
                      </button>
                    </div>
                  </form>

                  {/* Notice List & Edit */}
                  <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                    {notices.map((n) => (
                      <div key={n.id} className="p-4 text-xs">
                        {editingNoticeId === n.id ? (
                          <div className="space-y-3 bg-orange-50/50 p-3 rounded-xl border border-orange-200">
                            <div className="font-bold text-orange-600">공지사항 수정</div>
                            <input
                              type="text"
                              value={editNoticeData.title ?? n.title}
                              onChange={(e) => setEditNoticeData({ ...editNoticeData, title: e.target.value })}
                              className="w-full p-2 bg-white border rounded-lg text-xs font-bold"
                            />
                            <textarea
                              rows={3}
                              value={editNoticeData.content ?? n.content}
                              onChange={(e) => setEditNoticeData({ ...editNoticeData, content: e.target.value })}
                              className="w-full p-2 bg-white border rounded-lg text-xs"
                            />
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
                              <span className="text-slate-400 shrink-0 ml-auto sm:ml-0">({n.date})</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingNoticeId(n.id);
                                  setEditNoticeData(n);
                                }}
                                className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded"
                                title="수정"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`'${n.title}' 공지를 삭제하시겠습니까?`)) {
                                    deleteNotice(n.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
                  <form onSubmit={handleCreateGallery} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-600" />
                        <span>새 활동 갤러리 사진 등록</span>
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="활동 제목 (예: 2026 홍천군 어르신 삼계탕 나눔 행사)"
                        value={newGalTitle}
                        onChange={(e) => setNewGalTitle(e.target.value)}
                        className="p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                      />
                      <select
                        value={newGalCategory}
                        onChange={(e) => setNewGalCategory(e.target.value)}
                        className="p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
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

                    <input
                      type="text"
                      placeholder="활동 내용 간단 설명"
                      value={newGalDesc}
                      onChange={(e) => setNewGalDesc(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                    />

                    <div className="text-right">
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> 갤러리 추가
                      </button>
                    </div>
                  </form>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gallery.map((g) => (
                      <div key={g.id} className="bg-white p-3 rounded-2xl border border-slate-200 flex gap-3 items-center">
                        {editingGalleryId === g.id ? (
                          <div className="w-full space-y-2.5 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                            <div className="text-xs font-bold text-emerald-800">갤러리 항목 수정</div>
                            <input
                              type="text"
                              value={editGalleryData.title ?? g.title}
                              onChange={(e) => setEditGalleryData({ ...editGalleryData, title: e.target.value })}
                              className="w-full p-2 bg-white border rounded-lg text-xs font-bold"
                              placeholder="활동 제목"
                            />

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
                                <span>내 PC에서 사진 파일 교체</span>
                              </label>
                            </div>

                            <input
                              type="text"
                              value={editGalleryData.imageUrl ?? g.imageUrl}
                              onChange={(e) => setEditGalleryData({ ...editGalleryData, imageUrl: e.target.value })}
                              className="w-full p-2 bg-white border rounded-lg text-xs font-mono text-slate-600"
                              placeholder="또는 이미지 URL"
                            />

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => setEditingGalleryId(null)}
                                className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                              >
                                취소
                              </button>
                              <button
                                onClick={() => handleSaveGalleryEdit(g.id)}
                                className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                              >
                                저장
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <img
                              src={g.imageUrl}
                              alt={g.title}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80';
                              }}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                            <div className="flex-1 min-w-0 text-xs">
                              <div className="font-bold text-slate-900 truncate">{g.title}</div>
                              <div className="text-slate-500">{g.category} · {g.date}</div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingGalleryId(g.id);
                                  setEditGalleryData(g);
                                }}
                                className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                                title="수정"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`'${g.title}' 항목을 삭제하시겠습니까?`)) {
                                    deleteGallery(g.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Donations List Tab */}
              {activeTab === 'donations' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm">실시간 신청된 후원/봉사자 목록 ({donations.length}건)</h4>
                  {donations.length === 0 ? (
                    <div className="p-8 bg-white rounded-2xl border text-center text-slate-500 text-xs">
                      아직 접수된 신청서가 없습니다. (홈페이지 후원신청서 제출 시 실시간 표시됩니다)
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {donations.map((d) => (
                        <div key={d.id} className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-orange-600">[{d.donationType}] {d.name} ({d.phone})</span>
                            <div className="flex items-center gap-2">
                              <select
                                value={d.status}
                                onChange={(e) => updateDonationStatus(d.id, e.target.value as any)}
                                className="p-1 bg-slate-100 border rounded text-[11px] font-bold"
                              >
                                <option value="접수완료">접수완료</option>
                                <option value="확인중">확인중</option>
                                <option value="처리완료">처리완료</option>
                              </select>
                              <button
                                onClick={() => deleteDonation(d.id)}
                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                                title="삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-slate-600">
                            이메일: {d.email || '미입력'} | 희망 분야: {d.targetCategory} | 금액/물품: {d.amountOrItem || '미지정'}
                          </div>
                          {d.message && <div className="text-slate-500 italic bg-slate-50 p-2 rounded">"{d.message}"</div>}
                          <div className="text-[10px] text-slate-400 pt-1">신청일시: {d.createdAt}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 6. Inquiries Tab */}
              {activeTab === 'inquiries' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm">실시간 접수된 문의사항 ({inquiries.length}건)</h4>
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
                              <button
                                onClick={() => deleteInquiry(inq.id)}
                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                                title="삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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

            </div>

            {/* Footer actions */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
              <button
                onClick={() => {
                  if (confirm('모든 데이터를 시드 데이터 초기 상태로 되돌리시겠습니까?')) {
                    resetToDefaults();
                    alert('데이터가 초기화되었습니다.');
                  }
                }}
                className="text-slate-500 hover:text-red-600 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 초기 시드 데이터로 재설정
              </button>

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
