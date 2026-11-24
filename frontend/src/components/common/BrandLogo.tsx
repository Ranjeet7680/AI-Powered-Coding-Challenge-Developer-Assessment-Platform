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
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-3 group transition-transform duration-200 active:scale-95 ${className}`}>
      {/* Brand Hexagon/Circuit Icon */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 p-0.5 ${iconSizes[size]}`}>
        <div className="w-full h-full bg-[#0A0D17]/80 rounded-[10px] flex items-center justify-center backdrop-blur-sm group-hover:bg-[#0A0D17]/60 transition-colors">
          <svg
            className="w-5 h-5 text-indigo-400 group-hover:text-cyan-400 transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-300 -z-10" />
      </div>

      {!iconOnly && (
        <div className="flex flex-col text-left">
          <span className={`font-bold tracking-tight text-white flex items-center gap-1.5 ${textSizes[size]}`}>
            Coding Task <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-extrabold">Factory</span>
          </span>
          {size === 'lg' && (
            <span className="text-xs text-slate-400 font-mono tracking-widest uppercase">
              AI Challenge & Assessment Platform
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
