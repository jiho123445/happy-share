import React from 'react';

interface AcademyLogoSealProps {
  className?: string;
  size?: number;
}

export const AcademyLogoSeal: React.FC<AcademyLogoSealProps> = ({
  className = "w-10 h-10",
}) => {
  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      <img
        src="/seal_logo.svg"
        alt="홍천 중앙정보처리학원 심볼"
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
        onError={(e) => {
          if (!e.currentTarget.src.endsWith('.png')) {
            e.currentTarget.src = '/seal_logo.png';
          }
        }}
      />
    </div>
  );
};

export default AcademyLogoSeal;
