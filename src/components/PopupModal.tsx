import React, { useState, useEffect } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { validateImageFile } from '../utils/uploadValidation';
import { storage } from '../lib/firebase';
import {
  X,
  ExternalLink,
  Calendar,
  Bell,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  Upload,
  Shield,
  Save,
  Check,
  Image as ImageIcon,
  Settings,
  Link as LinkIcon
} from 'lucide-react';
import { PopupItem } from '../types';

export const PopupModal: React.FC = () => {
  const {
    popups,
    activeTab,
    setActiveTab,
    showPopupsFlag,
    updatePopup,
    deletePopup,
    addPopup,
    isAdmin,
    setAdminOpen,
    navigateToNewsCategory,
    getImageUrl
  } = useFoundation();

  const [closedPopupIds, setClosedPopupIds] = useState<string[]>([]);
  const [dontShowTodayMap, setDontShowTodayMap] = useState<Record<string, boolean>>({});

  // SECURITY (2026 audit): this used to have its own separate "admin"
  // unlock, checked entirely in the browser against a plaintext password
  // (`settings.adminPassword`, falling back to a hardcoded '1026' that was
  // visible in the deployed JS bundle) — completely unrelated to real
  // Firebase Authentication. Anyone who guessed or found that string could
  // "unlock" popup editing without ever logging in. It now simply reuses
  // the real `isAdmin` value from context, which is only true after a
  // genuine Firebase Auth sign-in (see AdminModal.tsx). If someone who
  // isn't logged in tries to edit a popup, we send them to the real admin
  // login instead of asking for a second, weaker password here.

  // Editing state for specific popup
  const [editingPopupId, setEditingPopupId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // New popup state inside modal
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Delete confirmation ID
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Toast feedback inside modal
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Tracks in-progress popup image upload (Firebase Storage). Declared
  // here — before the early `return null` below — because React requires
  // every hook to be called in the same order on every render. This was
  // previously declared further down the component body, after that
  // early return, which meant it was skipped entirely whenever no popup
  // was visible (e.g. right after closing one) but WAS called on renders
  // where a popup was showing — a classic "hooks called conditionally"
  // bug that crashes the whole app with React error #300 the moment the
  // hook count changes between renders.
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // When showPopupsFlag changes or activeTab becomes 'main', reset session closed states
  useEffect(() => {
    setClosedPopupIds([]);
  }, [showPopupsFlag]);

  // Filter active popups or ALL popups if admin is editing
  const visiblePopups = popups.filter(popup => {
    // If admin (real Firebase Auth login) is editing, show even if inactive/closed unless closed by user in this session
    if (isAdmin) {
      if (closedPopupIds.includes(popup.id)) return false;
      return true;
    }

    if (!popup.isActive) return false;
    if (closedPopupIds.includes(popup.id)) return false;

    // Check localStorage "do not show today"
    const hideDate = localStorage.getItem(`hide_popup_${popup.id}`);
    if (hideDate === todayStr) {
      return false;
    }
    return true;
  });

  if (activeTab !== 'main' || visiblePopups.length === 0) {
    return null;
  }

  const handleClose = (popupId: string) => {
    if (dontShowTodayMap[popupId]) {
      try {
        localStorage.setItem(`hide_popup_${popupId}`, todayStr);
      } catch (e) {
        console.warn('Failed to set hide_popup in localStorage', e);
      }
    }
    setClosedPopupIds(prev => [...prev, popupId]);
  };

  const handleCloseAll = () => {
    visiblePopups.forEach(p => {
      if (dontShowTodayMap[p.id]) {
        try {
          localStorage.setItem(`hide_popup_${p.id}`, todayStr);
        } catch (e) {
          console.warn('Failed to set hide_popup in localStorage', e);
        }
      }
    });
    setClosedPopupIds(prev => [...prev, ...visiblePopups.map(p => p.id)]);
  };

  const toggleDontShowToday = (popupId: string) => {
    setDontShowTodayMap(prev => ({
      ...prev,
      [popupId]: !prev[popupId]
    }));
  };

  const handleNavigate = (popup: PopupItem) => {
    handleClose(popup.id);

    // 1. External URL
    if (popup.linkUrl && (popup.linkUrl.startsWith('http://') || popup.linkUrl.startsWith('https://'))) {
      window.open(popup.linkUrl, '_blank');
      return;
    }

    // 2. Specific other top-level tab if explicitly set (about, programs, gallery, family-center, contact)
    const specificOtherTabs = ['about', 'programs', 'gallery', 'family-center', 'contact'];
    if (popup.linkUrl && specificOtherTabs.includes(popup.linkUrl)) {
      setActiveTab(popup.linkUrl as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 3. Category specified in linkUrl if valid (e.g. '재단소식', '공지사항', etc.)
    const categories = ['공지사항', '재단소식', '사업소식', '후원소식', '모집공고', '보도자료'];
    if (popup.linkUrl && categories.includes(popup.linkUrl)) {
      navigateToNewsCategory(popup.linkUrl);
      return;
    }

    // 4. Default: Navigate directly to 공지사항 및 소식 (news) page with '전체' category
    navigateToNewsCategory('전체');
  };

  // Start Editing a Popup — requires the real Firebase Auth admin login.
  // If not signed in, open the actual admin login panel instead of a
  // separate local password prompt.
  const handleStartEdit = (popup: PopupItem) => {
    if (!isAdmin) {
      setAdminOpen(true);
      showToast('팝업을 수정하려면 먼저 관리자 로그인이 필요합니다.');
      return;
    }
    setEditingPopupId(popup.id);
    setEditTitle(popup.title);
    setEditContent(popup.content);
    setEditImageUrl(popup.imageUrl || '');
    setEditLinkUrl(popup.linkUrl || '');
    setEditIsActive(popup.isActive);
  };

  // Save Popup Edit
  const handleSaveEdit = (popupId: string) => {
    if (!editTitle.trim() || !editContent.trim()) {
      showToast('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    updatePopup(popupId, {
      title: editTitle.trim(),
      content: editContent.trim(),
      imageUrl: editImageUrl.trim() || undefined,
      linkUrl: editLinkUrl.trim() || undefined,
      isActive: editIsActive
    });

    setEditingPopupId(null);
    showToast('팝업 정보가 성공적으로 수정되었습니다.');
  };

  // Handle Image File Upload for Edit or New
  //
  // SECURITY / EFFICIENCY (2026 audit follow-up): this used to read the
  // file with FileReader and store the raw base64 data: URL directly as
  // `imageUrl` on the popup document. That embeds the whole image inside
  // the Firestore `foundation/global` document, which is capped at 1MB
  // total — a handful of popup images (or a couple of large ones) can
  // silently push that shared document over the limit and break saving
  // for every other part of the site (notices, gallery, settings...).
  // It now compresses the image client-side and uploads it to Firebase
  // Storage under `settings/` (admin-only write, same as the chairman/
  // hero image uploader in AdminModal.tsx), storing only the short
  // download URL on the popup instead.
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      validateImageFile(file);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '이미지 업로드가 허용되지 않습니다.');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        setIsUploadingImage(false);
        return;
      }

      const img = new Image();
      img.onload = async () => {
        // Compress to max 1200px on the longest side, JPEG quality 0.85 —
        // same approach used for gallery/notice/settings images elsewhere.
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
          processedUrl = canvas.toDataURL('image/jpeg', 0.85);
        }

        try {
          const blob = await (await fetch(processedUrl)).blob();
          const uniqueName = `${Date.now()}_${crypto.randomUUID()}_popup.jpg`;
          const storageRef = ref(storage, `settings/${uniqueName}`);
          const snapshot = await uploadBytes(storageRef, blob, {
            contentType: 'image/jpeg',
            cacheControl: 'public,max-age=31536000,immutable'
          });
          const downloadUrl = await getDownloadURL(snapshot.ref);

          if (isEditMode) {
            setEditImageUrl(downloadUrl);
          } else {
            setNewImageUrl(downloadUrl);
          }
          showToast('이미지가 업로드되었습니다.');
        } catch (uploadErr) {
          console.error('팝업 이미지 업로드 실패', uploadErr);
          showToast('이미지 업로드에 실패했습니다. 관리자 로그인 상태를 확인해 주세요.');
        } finally {
          setIsUploadingImage(false);
        }
      };
      img.onerror = () => {
        setIsUploadingImage(false);
        showToast('이미지를 불러올 수 없습니다.');
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      setIsUploadingImage(false);
      showToast('파일을 읽을 수 없습니다.');
    };
    reader.readAsDataURL(file);
  };

  // Delete Popup
  const handleDeletePopup = (popupId: string) => {
    deletePopup(popupId);
    setDeleteConfirmId(null);
    showToast('팝업이 삭제되었습니다.');
  };

  // Create New Popup from Modal
  const handleCreateNewPopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showToast('팝업 제목과 내용을 입력해 주세요.');
      return;
    }

    addPopup({
      title: newTitle.trim(),
      content: newContent.trim(),
      imageUrl: newImageUrl.trim() || undefined,
      linkUrl: newLinkUrl.trim() || undefined,
      isActive: true
    });

    setNewTitle('');
    setNewContent('');
    setNewImageUrl('');
    setNewLinkUrl('');
    setIsAddingNew(false);
    showToast('새 팝업이 등록되었습니다.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white shadow-md">
          <div className="flex items-center gap-2 font-bold text-base sm:text-lg">
            <Bell className="w-5 h-5 animate-bounce shrink-0" />
            <span className="truncate">(사)너브내행복나눔재단 알림</span>
          </div>

          <button
            onClick={handleCloseAll}
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
            title="모두 닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toast Feedback Banner inside Modal */}
        {toastMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-center gap-2 animate-in fade-in duration-150">
            <Check className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Modal Body Content - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Admin Header Action if Unlocked */}
          {isAdmin && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs font-bold text-amber-900">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-600 shrink-0" />
                <span>관리자 모드 실행 중 (팝업 직접 편집/삭제 가능)</span>
              </div>

              <button
                onClick={() => setIsAddingNew(true)}
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer font-extrabold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>새 팝업 추가</span>
              </button>
            </div>
          )}

          {/* New Popup Form Modal inside Admin */}
          {isAdmin && isAddingNew && (
            <form onSubmit={handleCreateNewPopup} className="bg-orange-50/70 border-2 border-orange-400 p-5 rounded-2xl space-y-4 text-xs animate-in fade-in">
              <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                <h4 className="font-extrabold text-orange-900 text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-orange-600" />
                  <span>새 팝업창 등록</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">팝업 제목 *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="예: 2026년 너브내 행복나눔 후원자 모집"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">팝업 내용 *</label>
                  <textarea
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="안내문 내용을 입력하세요."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium leading-relaxed focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">대표 이미지 설정</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="이미지 URL 또는 파일 선택"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                    <label className={`bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-2 rounded-xl shrink-0 flex items-center gap-1 text-xs ${isUploadingImage ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingImage ? '업로드 중...' : '파일'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        onChange={(e) => handleImageUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {newImageUrl && (
                    <div className="mt-2 w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={newImageUrl} alt="미리보기" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">이동 링크 (선택)</label>
                  <input
                    type="text"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="예: donate 또는 https://..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-orange-200">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 text-white font-extrabold rounded-xl hover:bg-orange-600 shadow-md flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>팝업 등록</span>
                </button>
              </div>
            </form>
          )}

          {/* Render Popups List */}
          {visiblePopups.map((popup) => {
            const isEditingThis = editingPopupId === popup.id;

            if (isEditingThis) {
              return (
                <div key={popup.id} className="bg-amber-50/80 border-2 border-orange-500 rounded-2xl p-5 space-y-4 text-xs shadow-lg animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <Edit className="w-4 h-4 text-orange-600" />
                      <span>팝업 내용 수정 중</span>
                    </span>
                    <button
                      onClick={() => setEditingPopupId(null)}
                      className="text-slate-400 hover:text-slate-600 font-bold"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">제목</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">상세 내용</label>
                      <textarea
                        rows={5}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium leading-relaxed focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">이미지 수정</label>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={editImageUrl}
                          onChange={(e) => setEditImageUrl(e.target.value)}
                          placeholder="이미지 URL 입력 또는 파일 직접 선택"
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                        <label className={`bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-2 rounded-xl shrink-0 flex items-center gap-1 text-xs ${isUploadingImage ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingImage ? '업로드 중...' : '업로드'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingImage}
                            onChange={(e) => handleImageUpload(e, true)}
                            className="hidden"
                          />
                        </label>
                        {editImageUrl && (
                          <button
                            type="button"
                            onClick={() => setEditImageUrl('')}
                            className="px-2.5 py-2 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 shrink-0 text-xs"
                          >
                            제거
                          </button>
                        )}
                      </div>

                      {editImageUrl && (
                        <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                          <img src={editImageUrl} alt="미리보기" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">이동 연결 링크 (선택)</label>
                      <input
                        type="text"
                        value={editLinkUrl}
                        onChange={(e) => setEditLinkUrl(e.target.value)}
                        placeholder="예: donate 또는 https://..."
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={editIsActive}
                          onChange={(e) => setEditIsActive(e.target.checked)}
                          className="w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-400"
                        />
                        <span>팝업 게시 활성화 (메인 화면 노출)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-amber-200">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(popup.id)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-colors flex items-center gap-1 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>팝업 삭제</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingPopupId(null)}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors text-xs"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(popup.id)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1 text-xs cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>변경사항 저장</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={popup.id}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs relative group"
              >
                {/* Control Bar on Card */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2 text-xs font-semibold text-orange-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>게시일: {popup.createdAt}</span>
                  </div>

                  {/* Admin Edit & Delete Trigger Buttons */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(popup)}
                        className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-slate-300 hover:border-orange-300 text-slate-700 hover:text-orange-600 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="이 팝업 이미지, 제목, 내용 직접 수정"
                      >
                        <Edit className="w-3 h-3 text-orange-500" />
                        <span>수정</span>
                      </button>

                      {deleteConfirmId === popup.id ? (
                        <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200 p-1 rounded-lg animate-in fade-in">
                          <span className="text-[10px] font-bold text-red-700">삭제할까요?</span>
                          <button
                            onClick={() => handleDeletePopup(popup.id)}
                            className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded cursor-pointer"
                          >
                            확인
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="bg-slate-200 text-slate-700 font-bold text-[10px] px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(popup.id)}
                          className="p-1 bg-white hover:bg-red-50 border border-slate-300 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Image if present */}
                {popup.imageUrl && (
                  <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden bg-slate-200 relative group/img">
                    <img
                      src={getImageUrl(popup.imageUrl)}
                      alt={popup.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                    />
                    {/* Admin Image Edit Button Hover Overlay */}
                    {isAdmin && (
                      <button
                        onClick={() => handleStartEdit(popup)}
                        className="absolute top-2 right-2 px-2.5 py-1.5 bg-slate-900/80 hover:bg-orange-600 text-white font-extrabold text-[11px] rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-xs flex items-center gap-1 cursor-pointer shadow-md"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>이미지 변경</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Title */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {popup.title}
                  </h3>
                </div>

                {/* Body Content */}
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                  {popup.content}
                </p>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleNavigate(popup)}
                    className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>자세히 보기</span>
                    {popup.linkUrl && popup.linkUrl.startsWith('http') ? (
                      <ExternalLink className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Bottom bar for individual popup */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer select-none font-medium hover:text-slate-900 transition-colors">
                    <input
                      type="checkbox"
                      checked={!!dontShowTodayMap[popup.id]}
                      onChange={() => toggleDontShowToday(popup.id)}
                      className="w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-400 cursor-pointer"
                    />
                    <span>오늘 하루 동안 보지 않기</span>
                  </label>

                  <button
                    onClick={() => handleClose(popup.id)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    닫기
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Modal Bottom Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={handleCloseAll}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            전체 팝업 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
