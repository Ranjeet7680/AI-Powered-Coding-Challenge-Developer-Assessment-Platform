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
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-13 h-13',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 sm:gap-3 shrink-0 whitespace-nowrap group transition-transform duration-200 active:scale-95 ${className}`}
    >
      {/* Bespoke Coding Task Factory Hex-Forge Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 blur opacity-40 group-hover:opacity-85 transition duration-300" />
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="brandHexStroke" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
            <linearGradient id="brandHexBg" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0C1329" />
              <stop offset="100%" stopColor="#060914" />
            </linearGradient>
            <linearGradient id="brandSpark" x1="26" y1="20" x2="38" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="16"
            fill="url(#brandHexBg)"
            stroke="url(#brandHexStroke)"
            strokeWidth="2.8"
          />
          <polygon
            points="32,12 49,22 49,42 32,52 15,42 15,22"
            fill="#0E1730"
            stroke="url(#brandHexStroke)"
            strokeWidth="1.6"
            strokeOpacity="0.7"
          />
          <path
            d="M25.5 24.5L18.5 32L25.5 39.5"
            stroke="#A5B4FC"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:stroke-white transition-colors"
          />
          <path
            d="M38.5 24.5L45.5 32L38.5 39.5"
            stroke="#67E8F9"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:stroke-cyan-200 transition-colors"
          />
          <polygon points="32,22 36.5,32 32,42 27.5,32" fill="url(#brandSpark)" />
          <circle cx="48" cy="16" r="3.5" fill="#FBBF24" />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col text-left leading-tight whitespace-nowrap shrink-0">
          <span className={`font-bold tracking-tight text-white inline-flex items-center gap-1.5 whitespace-nowrap ${textSizes[size]}`}>
            Coding Task{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 font-extrabold whitespace-nowrap">
              Factory
            </span>
          </span>
          {size === 'lg' ? (
            <span className="text-[11px] text-slate-400 font-mono tracking-widest uppercase mt-0.5 whitespace-nowrap">
              AI Challenge &amp; Assessment Cloud
            </span>
          ) : (
            <span className="text-[9.5px] text-indigo-300/80 font-mono tracking-[0.18em] uppercase hidden sm:inline whitespace-nowrap">
              AI CODE FORGE
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
