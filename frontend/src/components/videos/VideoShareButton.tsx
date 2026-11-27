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
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://coding-task-factory.vercel.app';
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
      showToast('Platform watch link copied to clipboard.', 'success');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Copy failed — please copy the link manually.', 'error');
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
          title="Share Coding Task Factory video link"
          aria-label={`Share ${title}`}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
        >
          <Share2 className="w-3 h-3 text-[#85858b]" strokeWidth={1.5} />
          Share
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-[#a1a1a6]" strokeWidth={1.5} />
          Share lecture link
        </button>
      )}

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            className={`fixed inset-x-3 bottom-20 z-50 sm:inset-x-auto sm:bottom-auto sm:absolute sm:z-40 sm:mt-2 sm:w-96 rounded-xl border border-white/[0.12] bg-[#19191b] shadow-2xl p-4 space-y-3 ${
              align === 'left' ? 'sm:left-0' : 'sm:right-0'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4cc38a]">
                  <Lock className="w-3 h-3" strokeWidth={1.5} />
                  Platform-only video share
                </div>
                <p className="text-xs text-[#a1a1a6] leading-snug">
                  Recipients open this lecture directly inside{' '}
                  <strong className="font-medium text-[#ededed]">Coding Task Factory</strong> without leaving the workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-[#85858b] hover:text-[#ededed] hover:bg-[#222225] transition-colors"
                aria-label="Close share popover"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Read-only Platform Watch URL + Copy */}
            <div className="flex items-center gap-1.5 rounded-lg bg-[#141415] border border-white/[0.08] p-1.5">
              <input
                type="text"
                readOnly
                value={platformWatchUrl}
                onFocus={(e) => e.target.select()}
                aria-label="Platform Video Share URL"
                className="w-full bg-transparent text-[11px] font-mono text-[#ededed] px-2 py-1 focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Social Share Actions (all carrying platformWatchUrl) */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <a
                href={`https://wa.me/?text=${encodedMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#4cc38a]" strokeWidth={1.5} />
                WhatsApp
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#a1a1a6]" strokeWidth={1.5} />
                LinkedIn
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodedShortText}&url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#a1a1a6]" strokeWidth={1.5} />
                Share on X
              </a>
            </div>

            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
              >
                Open device share sheet
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
