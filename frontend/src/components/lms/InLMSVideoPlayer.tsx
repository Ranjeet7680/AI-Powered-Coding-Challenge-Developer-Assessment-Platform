import React, { useEffect, useState } from 'react';
import { CheckCircle2, Lock, Play, ShieldCheck } from 'lucide-react';
import { MLLessonItem } from '../../types';

interface InLMSVideoPlayerProps {
  lesson: Pick<
    MLLessonItem,
    'id' | 'order' | 'video_id' | 'video_url' | 'thumbnail_url' | 'title' | 'duration_label'
  >;
  isCompleted: boolean;
  isDL?: boolean;
  accentDot?: boolean;
  onVideoEnded: () => void;
  playerModeLabel?: string;
  seriesBadge?: string;
  badgeVariant?: 'lecture' | 'episode';
  autoPlay?: boolean;
}

export const InLMSVideoPlayer: React.FC<InLMSVideoPlayerProps> = ({
  lesson,
  isCompleted,
  isDL = false,
  accentDot,
  onVideoEnded,
  playerModeLabel = 'Locked classroom player',
  seriesBadge,
  badgeVariant = 'lecture',
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);

  // Listen to YouTube IFrame postMessage state changes (state 0 === ended)
  useEffect(() => {
    if (!isPlaying) return;

    const handleMessage = (event: MessageEvent) => {
      if (
        !event.origin.includes('youtube-nocookie.com') &&
        !event.origin.includes('youtube.com')
      ) {
        return;
      }
      if (typeof event.data !== 'string') return;
      try {
        const parsed = JSON.parse(event.data) as {
          event?: string;
          info?: { playerState?: number };
          data?: number;
        };
        if (
          (parsed.event === 'infoDelivery' && parsed.info?.playerState === 0) ||
          (parsed.event === 'onStateChange' && parsed.data === 0)
        ) {
          onVideoEnded();
        }
      } catch {
        // Ignore non-JSON control messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isPlaying, onVideoEnded]);

  const joiner = lesson.video_url.includes('?') ? '&' : '?';
  const originParam =
    typeof window !== 'undefined' ? `&origin=${encodeURIComponent(window.location.origin)}` : '';
  const embedSrc = `${lesson.video_url}${joiner}autoplay=1&enablejsapi=1${originParam}`;
  const badgeText =
    seriesBadge ||
    `${badgeVariant === 'episode' ? 'Episode' : 'Lecture'} #${lesson.order} · ${lesson.duration_label}`;
  const streamTag =
    badgeVariant === 'episode' ? `CTF theater · #${lesson.order}` : `Classroom stream · #${lesson.order}`;

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#0f0f10] border border-white/[0.08]"
    >
      {!isPlaying ? (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          className="relative w-full h-full group text-left block focus:outline-none"
          aria-label={`Play Lecture #${lesson.order}: ${lesson.title} inside LMS`}
        >
          <img
            src={lesson.thumbnail_url}
            alt={lesson.title}
            className="w-full h-full object-cover opacity-50 group-hover:opacity-65 transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] via-[#0f0f10]/60 to-[#0f0f10]/30" />

          {/* Top Bar Inside Cover */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#141415]/90 border border-white/[0.10] text-xs font-medium text-[#ededed] tabular-nums">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  (accentDot ?? isDL) ? 'bg-[#e5a00d]' : 'bg-[#ededed]/60'
                }`}
              />
              {badgeText}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141415]/90 border border-white/[0.10] text-[11px] font-mono text-[#a1a1a6]">
              <Lock className="w-3 h-3 text-[#4cc38a]" strokeWidth={1.5} />
              {playerModeLabel}
            </span>
          </div>

          {/* Center Play Trigger */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center gap-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-[#ededed] text-[#141415] border border-white/20 group-hover:bg-[#e5a00d] transition-colors">
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" strokeWidth={1.5} />
            </div>
            <div className="space-y-1 max-w-xl">
              <div className="text-xs font-mono text-[#e5a00d]">
                Stream inside classroom
              </div>
              <div className="text-sm sm:text-lg font-semibold text-[#ededed] line-clamp-2">
                {lesson.title}
              </div>
            </div>
          </div>

          {/* Bottom Readiness Strip */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-[#a1a1a6] px-3 py-2 rounded-lg bg-[#141415]/90 border border-white/[0.08]">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#a1a1a6]" strokeWidth={1.5} />
              Privacy-enhanced classroom embed without external redirects
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-[#4cc38a] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                Watched
              </span>
            )}
          </div>
        </button>
      ) : (
        <>
          <iframe
            key={lesson.video_id}
            src={embedSrc}
            title={lesson.title}
            className="w-full h-full"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
          />
          {/* Corner lock pill masking YouTube top-right copy/share overlay during active playback */}
          <div
            className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#141415]/95 border border-white/[0.12] text-[11px] font-mono text-[#a1a1a6] flex items-center gap-1.5 select-none"
            title="Playback locked inside LMS classroom"
          >
            <Lock className="w-3 h-3 text-[#4cc38a]" strokeWidth={1.5} />
            {streamTag}
          </div>
        </>
      )}
    </div>
  );
};
