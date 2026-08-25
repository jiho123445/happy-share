import React from 'react';
import { Phone, FileText, Bot, MapPin } from 'lucide-react';
import { ACADEMY_INFO } from '../data/coursesData';

interface MobileQuickBarProps {
  onNavigate: (sectionId: string) => void;
  onOpenAiModal: () => void;
}

export const MobileQuickBar: React.FC<MobileQuickBarProps> = ({
  onNavigate,
  onOpenAiModal,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 text-white shadow-2xl py-2 px-3">
      <div className="grid grid-cols-4 gap-1 text-center">
        
        {/* Direct Call */}
        <a
          href={`tel:${ACADEMY_INFO.phoneClean}`}
          className="flex flex-col items-center justify-center p-2 rounded-2xl text-emerald-400 hover:bg-white/10 active:scale-95 transition-all"
        >
          <Phone className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">전화상담</span>
        </a>

        {/* Online Inquiry */}
        <button
          onClick={() => onNavigate('inquiry')}
          className="flex flex-col items-center justify-center p-2 rounded-2xl text-blue-400 hover:bg-white/10 active:scale-95 transition-all"
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">수강문의</span>
        </button>

        {/* AI Advisor */}
        <button
          onClick={onOpenAiModal}
          className="flex flex-col items-center justify-center p-2 rounded-2xl text-purple-300 hover:bg-white/10 active:scale-95 transition-all"
        >
          <Bot className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">AI상담</span>
        </button>

        {/* Location */}
        <button
          onClick={() => onNavigate('location')}
          className="flex flex-col items-center justify-center p-2 rounded-2xl text-amber-300 hover:bg-white/10 active:scale-95 transition-all"
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">오시는길</span>
        </button>

      </div>
    </div>
  );
};
