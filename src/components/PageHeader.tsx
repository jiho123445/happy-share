import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  categoryName?: string;
  onNavigateHome: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  categoryName = '안내',
  onNavigateHome,
}) => {
  return (
    <div className="bg-white/40 backdrop-blur-md border-b border-white/60 py-6 sm:py-8 mb-6 sm:mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>홈</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-blue-600 font-black">{title}</span>
          </div>

          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/70 hover:bg-white text-slate-700 text-xs font-bold border border-white/80 shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>메인으로 돌아가기</span>
          </button>
        </div>

        {/* Page Title & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-blue-100/80 text-blue-700 font-extrabold text-[11px] mb-2 border border-blue-200/60 shadow-sm">
              {categoryName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              {subtitle}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
