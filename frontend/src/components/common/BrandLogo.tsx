import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  iconOnly = false,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-[15px]',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 shrink-0 whitespace-nowrap group transition-opacity duration-150 hover:opacity-90 active:scale-[0.98] ${className}`}
    >
      {/* Flat calibration-mark emblem: solid graphite frame, crisp brackets, single signal-amber index */}
      <div className={`flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          <rect
            x="1.5"
            y="1.5"
            width="29"
            height="29"
            rx="7"
            fill="#19191b"
            stroke="rgba(237, 237, 237, 0.16)"
            strokeWidth="1.25"
          />
          <path
            d="M12.5 11L7.5 16L12.5 21"
            stroke="#ededed"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.5 11L24.5 16L19.5 21"
            stroke="#ededed"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="17.2"
            y1="9.5"
            x2="14.8"
            y2="22.5"
            stroke="#e5a00d"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col text-left leading-tight whitespace-nowrap shrink-0">
          <span className={`font-medium tracking-tight text-[#ededed] whitespace-nowrap ${textSizes[size]}`}>
            Coding Task Factory
          </span>
          {size === 'lg' && (
            <span className="text-xs text-[#85858b] font-mono mt-0.5 whitespace-nowrap">
              Code bench &amp; credentials
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
