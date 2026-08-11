import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
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
  ShieldAlert,
  Building,
  CheckCircle2
} from 'lucide-react';

export const AdminModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    notices,
    addNotice,
    deleteNotice,
    gallery,
    addGallery,
    deleteGallery,
    donations,
    inquiries,
    resetToDefaults,
    adminOpen,
    setAdminOpen
  } = useFoundation();

  const [activeTab, setActiveTab] = useState<'settings' | 'notices' | 'gallery' | 'donations' | 'inquiries'>('settings');

  // New Notice Form State
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<'공지사항' | '재단소식' | '사업소식' | '후원소식' | '모집공고' | '보도자료'>('공지사항');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeImportant, setNewNoticeImportant] = useState(false);

  // New Gallery Form State
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCategory, setNewGalCategory] = useState('명절 나눔');
  const [newGalUrl, setNewGalUrl] = useState('https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80');
  const [newGalDesc, setNewGalDesc] = useState('');
  const [newGalLocation, setNewGalLocation] = useState('홍천군 관내');

  // Editable Settings state
  const [editSettings, setEditSettings] = useState(settings);

  if (!adminOpen) return null;

  const handleSaveSettings = () => {
    updateSettings(editSettings);
    alert('재단 기본 정보 및 계좌 설정이 성공적으로 저장되었습니다.');
  };

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

  const handleCreateGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalTitle || !newGalUrl) return;
    addGallery({
      title: newGalTitle,
      category: newGalCategory,
      imageUrl: newGalUrl,
      description: newGalDesc || newGalTitle,
      location: newGalLocation
    });
    setNewGalTitle('');
    setNewGalDesc('');
    alert('새로운 활동 사진이 갤러리에 추가되었습니다.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Admin Drawer Top Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                너브내행복나눔재단 홈페이지 통합 관리자 시스템
              </h3>
              <p className="text-xs text-slate-400">
                실시간 데이터 변경, 공지사항/갤러리 등록 및 후원 내역 확인
              </p>
            </div>
          </div>

          <button
            onClick={() => setAdminOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 p-2 flex items-center gap-1 overflow-x-auto shrink-0 border-b border-slate-200 text-xs font-bold text-slate-700">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'settings' ? 'bg-white text-orange-600 shadow-2xs' : 'hover:bg-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" /> 재단정보 & 계좌 설정
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'notices' ? 'bg-white text-orange-600 shadow-2xs' : 'hover:bg-slate-200'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" /> 공지사항 관리 ({notices.length})
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'gallery' ? 'bg-white text-orange-600 shadow-2xs' : 'hover:bg-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> 갤러리 관리 ({gallery.length})
          </button>

          <button
            onClick={() => setActiveTab('donations')}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'donations' ? 'bg-white text-orange-600 shadow-2xs' : 'hover:bg-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-red-500" /> 후원 신청 ({donations.length})
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 ${
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

          {/* 2. Notices Tab */}
          {activeTab === 'notices' && (
            <div className="space-y-6">
              {/* Add Notice Form */}
              <form onSubmit={handleCreateNotice} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">새 공지사항 등록</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="공지글 제목"
                      value={newNoticeTitle}
                      onChange={(e) => setNewNoticeTitle(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                    />
                  </div>

                  <select
                    value={newNoticeCategory}
                    onChange={(e) => setNewNoticeCategory(e.target.value as any)}
                    className="p-2.5 bg-slate-50 border rounded-xl text-xs"
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
                    className="bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> 등록
                  </button>
                </div>
              </form>

              {/* Notice List */}
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                {notices.map((n) => (
                  <div key={n.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded mr-2">
                        {n.category}
                      </span>
                      <span className="font-bold text-slate-900">{n.title}</span>
                      <span className="text-slate-400 ml-2">({n.date})</span>
                    </div>

                    <button
                      onClick={() => deleteNotice(n.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <form onSubmit={handleCreateGallery} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">새 활동 갤러리 등록</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="활동 제목"
                    value={newGalTitle}
                    onChange={(e) => setNewGalTitle(e.target.value)}
                    className="p-2.5 bg-slate-50 border rounded-xl text-xs"
                  />
                  <select
                    value={newGalCategory}
                    onChange={(e) => setNewGalCategory(e.target.value)}
                    className="p-2.5 bg-slate-50 border rounded-xl text-xs"
                  >
                    <option value="명절 나눔">명절 나눔</option>
                    <option value="장학금 전달">장학금 전달</option>
                    <option value="삼계탕 나눔">삼계탕 나눔</option>
                    <option value="교육지원">교육지원</option>
                    <option value="주거환경 개선">주거환경 개선</option>
                    <option value="복지시설 지원">복지시설 지원</option>
                  </select>
                </div>

                <input
                  type="url"
                  required
                  placeholder="이미지 URL (https://...)"
                  value={newGalUrl}
                  onChange={(e) => setNewGalUrl(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                />

                <input
                  type="text"
                  placeholder="활동 설명"
                  value={newGalDesc}
                  onChange={(e) => setNewGalDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                />

                <div className="text-right">
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 inline-flex"
                  >
                    <Plus className="w-3.5 h-3.5" /> 갤러리 추가
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gallery.map((g) => (
                  <div key={g.id} className="bg-white p-3 rounded-2xl border flex gap-3 items-center">
                    <img src={g.imageUrl} alt={g.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-bold text-slate-900 truncate">{g.title}</div>
                      <div className="text-slate-500">{g.category} · {g.date}</div>
                    </div>
                    <button onClick={() => deleteGallery(g.id)} className="text-red-500 p-1.5 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Donations List Tab */}
          {activeTab === 'donations' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">실시간 신청된 후원/봉사자 목록</h4>
              {donations.length === 0 ? (
                <div className="p-8 bg-white rounded-2xl border text-center text-slate-500 text-xs">
                  아직 접수된 신청서가 없습니다. (홈페이지 후원신청서 제출 시 실시간 표시됩니다)
                </div>
              ) : (
                <div className="space-y-3">
                  {donations.map((d) => (
                    <div key={d.id} className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-orange-600">[{d.donationType}] {d.name} ({d.phone})</span>
                        <span className="text-slate-400">{d.createdAt}</span>
                      </div>
                      <div className="text-slate-600">희망 분야: {d.targetCategory} | 금액/물품: {d.amountOrItem || '미지정'}</div>
                      {d.message && <div className="text-slate-500 italic bg-slate-50 p-2 rounded">"{d.message}"</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. Inquiries Tab */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">실시간 접수된 문의사항</h4>
              {inquiries.length === 0 ? (
                <div className="p-8 bg-white rounded-2xl border text-center text-slate-500 text-xs">
                  접수된 문의 내역이 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-blue-600">{inq.subject} - {inq.name} ({inq.phone})</span>
                        <span className="text-slate-400">{inq.createdAt}</span>
                      </div>
                      <div className="text-slate-700 bg-slate-50 p-2.5 rounded mt-1">{inq.message}</div>
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
              if (confirm('초기 데이터로 되돌리시겠습니까?')) {
                resetToDefaults();
                alert('데이터가 초기화되었습니다.');
              }
            }}
            className="text-slate-500 hover:text-red-600 flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 시드 데이터 초기화
          </button>

          <button
            onClick={() => setAdminOpen(false)}
            className="bg-slate-900 text-white font-bold px-5 py-2 rounded-xl"
          >
            관리자 모드 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
