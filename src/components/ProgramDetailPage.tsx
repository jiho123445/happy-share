import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Users,
  Heart,
  ChevronRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  HeartHandshake,
  Home,
  Cpu,
  Phone
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap className="w-8 h-8 text-orange-500" />,
  HeartHandshake: <HeartHandshake className="w-8 h-8 text-red-500" />,
  Home: <Home className="w-8 h-8 text-amber-500" />,
  Users: <Users className="w-8 h-8 text-emerald-500" />,
  Building2: <Building2 className="w-8 h-8 text-blue-500" />,
  Cpu: <Cpu className="w-8 h-8 text-purple-500" />,
};

export const ProgramDetailPage: React.FC = () => {
  const { selectedProgram, programs, gallery, notices, setActiveTab, setSelectedProgram } = useFoundation();

  if (!selectedProgram) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-500">선택된 공익사업이 없습니다.</p>
        <button
          onClick={() => setActiveTab('programs')}
          className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm"
        >
          사업 목록으로 이동
        </button>
      </div>
    );
  }

  // Related programs
  const otherPrograms = programs.filter((p) => p.id !== selectedProgram.id);

  // Filter gallery photos related to this program category
  const programGallery = gallery.filter((g) =>
    g.category.includes(selectedProgram.title) ||
    g.title.includes(selectedProgram.title) ||
    (selectedProgram.code === '01' && g.category.includes('장학')) ||
    (selectedProgram.code === '02' && (g.category.includes('나눔') || g.category.includes('삼계탕'))) ||
    (selectedProgram.code === '03' && g.category.includes('주거')) ||
    (selectedProgram.code === '04' && g.category.includes('가족')) ||
    (selectedProgram.code === '05' && g.category.includes('복지시설'))
  );

  return (
    <div className="py-10 md:py-16 bg-[#FFFDF8] min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button onClick={() => setActiveTab('main')} className="hover:text-orange-600">홈</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <button onClick={() => setActiveTab('programs')} className="hover:text-orange-600">주요사업</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-orange-600 font-bold">사업 0{selectedProgram.code}. {selectedProgram.title}</span>
        </div>

        {/* Back Button */}
        <div>
          <button
            onClick={() => setActiveTab('programs')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-orange-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs hover:border-orange-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500" />
            <span>전체 사업 목록으로 돌아가기</span>
          </button>
        </div>

        {/* Main Program Article Container */}
        <article className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl">
                  {ICON_MAP[selectedProgram.iconName] || <Sparkles className="w-8 h-8 text-orange-500" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-orange-600 bg-orange-100/80 px-2.5 py-0.5 rounded border border-orange-200">
                    핵심 공익사업 0{selectedProgram.code}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    {selectedProgram.title}
                  </h1>
                </div>
              </div>

              {selectedProgram.badge && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 hidden sm:inline-block">
                  {selectedProgram.badge}
                </span>
              )}
            </div>

            <p className="text-base font-semibold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              "{selectedProgram.subtitle}" - {selectedProgram.summary}
            </p>
          </div>

          {/* Details & Execution Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>주요 지원 내용 및 실행 세부사항</span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {selectedProgram.details.map((detail, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-orange-50/40 border border-orange-100/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="text-sm text-slate-800 font-medium">
                    {detail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Audience & Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-500">지원 대상</div>
              <div className="text-sm font-bold text-slate-900">{selectedProgram.targetAudience}</div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="text-xs font-bold text-emerald-700">기대 효과 및 비전</div>
              <div className="text-sm font-bold text-emerald-900">{selectedProgram.impactMessage}</div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-lg font-extrabold text-white">이 사업을 후원하거나 참여하고 싶으신가요?</h4>
              <p className="text-xs text-orange-100">
                후원자님의 따뜻한 손길로 홍천의 소외 이웃에게 실질적인 희망을 전달합니다. (문의: 033-433-1925)
              </p>
            </div>

            <button
              onClick={() => setActiveTab('donate')}
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm px-6 py-3 rounded-2xl shadow-lg transition-all shrink-0 flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>사업 후원 신청하기</span>
            </button>
          </div>

        </article>

        {/* Related Gallery Photos if available */}
        {programGallery.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-slate-900">본 사업 관련 나눔 현장 사진</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {programGallery.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-3 space-y-2">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover rounded-xl" />
                  <div className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</div>
                  <div className="text-[11px] text-slate-500">{item.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation to Other Programs */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-700">다른 주요 공익사업 둘러보기</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {otherPrograms.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProgram(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-3 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-xl font-bold text-slate-700 hover:text-orange-600 transition-colors text-left"
              >
                <div className="text-[10px] text-orange-500">사업 0{p.code}</div>
                <div className="truncate mt-0.5">{p.title}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
