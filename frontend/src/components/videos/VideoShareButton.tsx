import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Lock,
  MessageCircle,
  Share2,
  X,
} from 'lucide-react';
import { useToast } from '../../context/useContexts';

interface VideoShareButtonProps {
  title: string;
  sharePath: string;
  subtitle?: string;
  variant?: 'button' | 'compact';
  align?: 'left' | 'right';
}

/**
 * Shares ONLY the internal Coding Task Factory Watch URL (`/app/videos/...` or LMS route),
 * never any external YouTube website URL.
 */
export const VideoShareButton: React.FC<VideoShareButtonProps> = ({
  title,
  sharePath,
  subtitle,
  variant = 'button',
  align = 'right',
}) => {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const normalizedPath = sharePath.startsWith('/') ? sharePath : `/${sharePath}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://coding-task-factory.vercel.app';
  const platformWatchUrl = `${origin}${normalizedPath}`;

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(platformWatchUrl);
      setCopied(true);
      showToast('Platform Watch Link copied! Opens directly inside Coding Task Factory.', 'success');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Copy failed — please copy the link manually from the box.', 'error');
    }
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${title} — Coding Task Factory`,
          text: subtitle
            ? `Watch "${title}" (${subtitle}) directly inside Coding Task Factory:`
            : `Watch "${title}" inside Coding Task Factory:`,
          url: platformWatchUrl,
        });
      } catch {
        // User dismissed share sheet
      }
    }
  };

  const encodedUrl = encodeURIComponent(platformWatchUrl);
  const encodedMsg = encodeURIComponent(
    `Watch "${title}"${subtitle ? ` (${subtitle})` : ''} inside Coding Task Factory: ${platformWatchUrl}`
  );
  const encodedShortText = encodeURIComponent(`Watching "${title}" on Coding Task Factory`);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
    >
      {variant === 'compact' ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          title="Share Coding Task Factory Video Link"
          aria-label={`Share ${title}`}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500/40 text-[11px] font-bold text-slate-200 hover:text-indigo-200 transition"
        >
          <Share2 className="w-3 h-3" />
          Share
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-indigo-600/25 border border-slate-700 hover:border-indigo-500/40 text-xs font-bold text-slate-100 hover:text-indigo-200 transition"
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          Share Platform Video
        </button>
      )}

      {open && (
        <div
          className={`absolute z-40 mt-2 w-80 sm:w-96 rounded-2xl border border-indigo-500/30 bg-[#0A0F1D] shadow-2xl p-4 space-y-3 ${
            align === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                <Lock className="w-3 h-3" />
                Platform-Only Video Share
              </div>
              <p className="text-xs text-slate-400 leading-snug">
                Recipients open this video directly inside <strong className="text-slate-200">Coding Task Factory</strong> — never YouTube.com.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close share popover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Read-only Platform Watch URL + Copy */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-950 border border-slate-800 p-1.5">
            <input
              type="text"
              readOnly
              value={platformWatchUrl}
              onFocus={(e) => e.target.select()}
              aria-label="Platform Video Share URL"
              className="w-full bg-transparent text-[11px] font-mono text-cyan-300 px-2 py-1 focus:outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Social Share Actions (all carrying platformWatchUrl) */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <a
              href={`https://wa.me/?text=${encodedMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-[11px] font-bold text-emerald-300 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-[11px] font-bold text-sky-300 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              LinkedIn
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodedShortText}&url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-200 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Share on X
            </a>
          </div>

          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition"
            >
              Open Device Share Sheet
            </button>
          )}
        </div>
      )}
    </div>
  );
};
