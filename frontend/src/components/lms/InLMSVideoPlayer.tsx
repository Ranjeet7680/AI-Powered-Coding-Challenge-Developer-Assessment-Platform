import React, { useEffect, useState } from 'react';
import { CheckCircle2, Lock, Play, ShieldCheck } from 'lucide-react';
import { MLLessonItem } from '../../types';

interface InLMSVideoPlayerProps {
  lesson: MLLessonItem;
  isCompleted: boolean;
  isDL: boolean;
  onVideoEnded: () => void;
}

export const InLMSVideoPlayer: React.FC<InLMSVideoPlayerProps> = ({
  lesson,
  isCompleted,
  isDL,
  onVideoEnded,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

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

  const embedSrc = `${lesson.video_url}&autoplay=1&enablejsapi=1`;

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl"
    >
      {!isPlaying ? (
        /* Clean Pre-Play In-LMS Theater Cover (eliminates distracting YouTube external buttons) */
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          className="relative w-full h-full group text-left block focus:outline-none"
          aria-label={`Play Lecture #${lesson.order}: ${lesson.title} inside LMS`}
        >
          <img
            src={lesson.thumbnail_url}
            alt={lesson.title}
            className="w-full h-full object-cover opacity-55 group-hover:opacity-70 group-hover:scale-[1.02] transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-[#050814]/55 to-[#050814]/40" />

          {/* Top Bar Inside Cover */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span
              className={`px-3 py-1 rounded-xl text-[11px] font-bold border backdrop-blur-md ${
                isDL
                  ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                  : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-200'
              }`}
            >
              Lecture #{lesson.order} · {lesson.duration_label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/90 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300 backdrop-blur-md">
              <Lock className="w-3 h-3" />
              LOCKED IN-LMS PLAYER
            </span>
          </div>

          {/* Center Giant Play Trigger */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center gap-3">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/25 group-hover:scale-110 transition duration-300 ${
                isDL
                  ? 'bg-rose-600/95 shadow-rose-600/40'
                  : 'bg-indigo-600/95 shadow-indigo-600/40'
              }`}
            >
              <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white ml-1" />
            </div>
            <div className="space-y-1 max-w-xl">
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">
                Click to Stream Inside Classroom
              </div>
              <div className="text-sm sm:text-lg font-extrabold text-white line-clamp-2 drop-shadow">
                {lesson.title}
              </div>
            </div>
          </div>

          {/* Bottom Readiness Strip */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Ad-Reduced &amp; Privacy-Enhanced Stream (Zero Redirects)
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
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
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
          {/* Corner lock pill masking YouTube top-right copy/share overlay during active playback */}
          <div
            className="absolute top-2.5 right-2.5 px-3 py-1 rounded-xl bg-slate-950/90 border border-indigo-500/40 text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1.5 backdrop-blur-md shadow-lg select-none"
            title="Playback locked inside LMS classroom"
          >
            <Lock className="w-3 h-3 text-emerald-400" />
            IN-LMS STREAM · #{lesson.order}
          </div>
        </>
      )}
    </div>
  );
};
