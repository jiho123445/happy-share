import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto'; // 'light' is for dark backgrounds (white text), 'dark' is for light backgrounds
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  variant = 'dark',
  showText = true,
}) => {
  const isLight = variant === 'light';

  // Colors based on background
  const mainTextColor = isLight ? 'text-white' : 'text-slate-900';
  const tagBg = isLight
    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
    : 'bg-emerald-50 text-emerald-800 border-emerald-200/90';

  if (!showText) {
    return (
      <div className={`inline-flex items-center justify-center font-black rounded-lg px-2 py-1 text-xs border ${tagBg} ${className}`}>
        (사)너브내
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* '사단법인' Badge */}
      <span
        className={`px-2 py-0.5 rounded text-[11px] sm:text-xs font-black tracking-tight border shadow-2xs shrink-0 ${tagBg}`}
      >
        사단법인
      </span>

      {/* '너브내행복나눔재단' Text */}
      <span
        className={`text-lg sm:text-2xl md:text-3xl font-black tracking-tight whitespace-nowrap ${mainTextColor}`}
        style={{
          fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif"
        }}
      >
        너브내행복나눔재단
      </span>
    </div>
  );
};
