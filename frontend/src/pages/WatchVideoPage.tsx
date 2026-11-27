import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Eye,
  ListChecks,
  ListVideo,
  Lock,
  Maximize2,
  Minimize2,
  Play,
  Search,
  Terminal,
  UserCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/useContexts';
import { VideoLesson, VideoWatchContextResponse } from '../types';
import { InLMSVideoPlayer } from '../components/lms/InLMSVideoPlayer';
import { VideoShareButton } from '../components/videos/VideoShareButton';

const WATCHED_STORAGE_KEY = 'ctf_watched_video_ids';

function readWatchedVideoIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(WATCHED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function extractYouTubeId(embedUrl: string, fallbackId: string): string {
  const match = embedUrl.match(/\/embed\/([A-Za-z0-9_-]{6,})/);
  return match ? match[1] : fallbackId;
}

export const WatchVideoPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [context, setContext] = useState<VideoWatchContextResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'takeaways' | 'code'>('overview');
  const [queueSearch, setQueueSearch] = useState<string>('');
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [autoPlayTrigger, setAutoPlayTrigger] = useState<boolean>(false);
  const [watchedIds, setWatchedIds] = useState<string[]>(() => readWatchedVideoIds());

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    api
      .getVideoWatchContext(videoId)
      .then((res) => {
        if (cancelled) return;
        setContext(res);
        setLoadError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Unable to load video.');
      });
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  const markWatched = useCallback((id: string) => {
    setWatchedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        window.localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  }, []);

  const toggleWatched = (id: string) => {
    setWatchedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        window.localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  };

  const handleNavigateEpisode = useCallback(
    (target: VideoLesson, autoplay = false) => {
      setAutoPlayTrigger(autoplay);
      setActiveTab('overview');
      navigate(`/app/videos/${target.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [navigate]
  );

  const handleVideoEnded = useCallback(() => {
    if (!context) return;
    markWatched(context.video.id);
    if (autoAdvance && context.next_video) {
      showToast(
        `Completed episode — starting #${context.next_video.episode_order || ''} ${context.next_video.title}`,
        'success'
      );
      handleNavigateEpisode(context.next_video, true);
    } else {
      showToast('Video marked as watched.', 'success');
    }
  }, [autoAdvance, context, handleNavigateEpisode, markWatched, showToast]);

  const filteredQueue = useMemo(() => {
    if (!context) return [];
    const term = queueSearch.trim().toLowerCase();
    if (!term) return context.series_videos;
    return context.series_videos.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        String(item.episode_order || '').includes(term) ||
        item.instructor.toLowerCase().includes(term)
    );
  }, [context, queueSearch]);

  const isLoading =
    Boolean(videoId) &&
    (!context || (context.video.id !== videoId && context.video.slug !== videoId)) &&
    !loadError;

  if (!videoId) {
    return null;
  }

  if (loadError) {
    return (
      <div className="max-w-4xl mx-auto p-6 sm:p-10 text-center space-y-4">
        <div className="rounded-xl border border-[#e5484d]/30 bg-[#19191b] p-8 space-y-3">
          <h1 className="text-xl font-semibold text-[#ededed]">Video lesson not found</h1>
          <p className="text-sm text-[#a1a1a6]">{loadError}</p>
          <Link
            to="/app/videos"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Return to video library
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !context) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5 animate-pulse">
        <div className="h-12 rounded-xl bg-[#19191b] border border-white/[0.08]" />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-4">
            <div className="aspect-video rounded-xl bg-[#19191b] border border-white/[0.08]" />
            <div className="h-36 rounded-xl bg-[#19191b] border border-white/[0.08]" />
          </div>
          <div className="xl:col-span-4 h-[540px] rounded-xl bg-[#19191b] border border-white/[0.08]" />
        </div>
      </div>
    );
  }

  const {
    video,
    series,
    series_videos: seriesVideos,
    prev_video: prevVideo,
    next_video: nextVideo,
    platform_share_path: sharePath,
  } = context;
  const episodeNumber =
    video.episode_order || Math.max(1, seriesVideos.findIndex((v) => v.id === video.id) + 1);
  const totalSeriesCount = series?.video_count || seriesVideos.length || 1;
  const isWatched = watchedIds.includes(video.id);
  const seriesWatchedCount = seriesVideos.filter((v) => watchedIds.includes(v.id)).length;
  const durationLabel = video.duration_label || `${video.duration_minutes}:00`;

  const playerLesson = {
    id: video.id,
    order: episodeNumber,
    video_id: extractYouTubeId(video.video_url, video.id),
    video_url: video.video_url,
    thumbnail_url: video.thumbnail_url,
    title: video.title,
    duration_label: durationLabel,
  };

  return (
    <div className="max-w-[1440px] mx-auto p-3 sm:p-6 space-y-5">
      {/* Top Watch Theater Toolbar */}
      <div className="rounded-xl border border-white/[0.08] bg-[#19191b] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          <Link
            to={series ? `/app/videos?playlist=${encodeURIComponent(series.playlist_id)}` : '/app/videos'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
            {series ? 'All episodes' : 'Video library'}
          </Link>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141415] border border-white/[0.08] text-xs font-medium text-[#4cc38a]">
            <Lock className="w-3 h-3" strokeWidth={1.5} />
            Platform watch mode
          </span>

          {series && (
            <span className="text-xs font-medium text-[#a1a1a6] truncate max-w-md tabular-nums">
              {series.title} · <span className="text-[#ededed] font-mono">{episodeNumber}/{totalSeriesCount}</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoAdvance((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              autoAdvance
                ? 'bg-[#e5a00d]/15 border-[#e5a00d]/40 text-[#e5a00d]'
                : 'bg-[#141415] border-white/[0.08] text-[#85858b]'
            }`}
          >
            Auto-next: {autoAdvance ? 'On' : 'Off'}
          </button>

          <button
            type="button"
            onClick={() => setTheaterMode((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
          >
            {theaterMode ? (
              <Minimize2 className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
            )}
            {theaterMode ? 'Standard view' : 'Theater view'}
          </button>

          <VideoShareButton
            title={video.title}
            sharePath={sharePath}
            subtitle={series?.title || video.category}
            align="right"
          />
        </div>
      </div>

      {/* Main Watch Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Video Stage + Details */}
        <div className={`${theaterMode ? 'xl:col-span-12' : 'xl:col-span-8'} space-y-5`}>
          <InLMSVideoPlayer
            key={video.id}
            lesson={playerLesson}
            isCompleted={isWatched}
            isDL={false}
            playerModeLabel="Locked watch theater"
            badgeVariant="episode"
            seriesBadge={
              series
                ? `Episode #${episodeNumber} of ${totalSeriesCount} · ${durationLabel}`
                : `Masterclass · ${durationLabel}`
            }
            autoPlay={autoPlayTrigger}
            onVideoEnded={handleVideoEnded}
          />

          {/* Video Header, Prev/Next Controls & Platform Actions */}
          <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 tabular-nums">
                <span className="px-2.5 py-0.5 rounded-md bg-[#222225] border border-white/[0.08] text-[#ededed] text-xs font-medium">
                  {video.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#141415] border border-white/[0.08] text-[#a1a1a6] text-xs font-mono">
                  {video.difficulty}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#a1a1a6] font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
                  {durationLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#85858b] font-mono">
                  <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {video.views_count.toLocaleString()} views
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs text-[#a1a1a6] font-medium">
                <UserCheck className="w-3.5 h-3.5 text-[#4cc38a]" strokeWidth={1.5} />
                {video.instructor}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold text-[#ededed] leading-snug tracking-tight">
              {video.title}
            </h1>

            {/* Episode Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-white/[0.06]">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!prevVideo}
                  onClick={() => prevVideo && handleNavigateEpisode(prevVideo, false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] disabled:opacity-40 disabled:cursor-not-allowed border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                  Previous episode
                </button>

                <button
                  type="button"
                  disabled={!nextVideo}
                  onClick={() => nextVideo && handleNavigateEpisode(nextVideo, false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ededed] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-[#141415] transition-colors"
                >
                  Next episode
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </button>

                <button
                  type="button"
                  onClick={() => toggleWatched(video.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    isWatched
                      ? 'bg-[#4cc38a]/15 border-[#4cc38a]/35 text-[#4cc38a]'
                      : 'bg-[#141415] border-white/[0.08] text-[#a1a1a6] hover:text-[#ededed]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {isWatched ? 'Watched' : 'Mark watched'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <VideoShareButton
                  title={video.title}
                  sharePath={sharePath}
                  subtitle={series?.title || video.category}
                  align="left"
                />
                {video.related_challenge_id && (
                  <Link
                    to={`/app/workspace/${video.related_challenge_id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#e5a00d]/15 hover:bg-[#e5a00d]/25 border border-[#e5a00d]/35 text-[#e5a00d] text-xs font-medium transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Practice in IDE
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Study Breakdown Tabs */}
          <div className="rounded-xl border border-white/[0.08] bg-[#19191b] overflow-hidden">
            <div className="flex items-center border-b border-white/[0.08] bg-[#141415]">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-5 py-3 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-[#e5a00d] text-[#ededed] bg-[#19191b]'
                    : 'border-transparent text-[#85858b] hover:text-[#ededed]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
                Overview &amp; chapters
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('takeaways')}
                className={`px-5 py-3 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-colors tabular-nums ${
                  activeTab === 'takeaways'
                    ? 'border-[#e5a00d] text-[#ededed] bg-[#19191b]'
                    : 'border-transparent text-[#85858b] hover:text-[#ededed]'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" strokeWidth={1.5} />
                Key takeaways ({video.key_takeaways.length})
              </button>
              {video.code_snippet && (
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`px-5 py-3 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-colors ${
                    activeTab === 'code'
                      ? 'border-[#e5a00d] text-[#ededed] bg-[#19191b]'
                      : 'border-transparent text-[#85858b] hover:text-[#ededed]'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Starter code
                </button>
              )}
            </div>

            <div className="p-5">
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  <p className="text-sm text-[#a1a1a6] leading-relaxed">{video.description}</p>
                  {video.chapters.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-medium text-[#85858b]">
                        Lecture sections &amp; pacing
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {video.chapters.map((ch, idx) => (
                          <div
                            key={`${ch.title}-${idx}`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-[#141415] px-3.5 py-2.5"
                          >
                            <span className="text-xs font-medium text-[#ededed] truncate">{ch.title}</span>
                            <span className="shrink-0 text-[11px] font-mono text-[#e5a00d] bg-[#222225] px-2 py-0.5 rounded tabular-nums">
                              {ch.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'takeaways' && (
                <ul className="space-y-2.5">
                  {video.key_takeaways.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 rounded-lg border border-white/[0.08] bg-[#141415] p-3 text-sm text-[#a1a1a6]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#4cc38a] shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'code' && video.code_snippet && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#85858b]">Reference code snippet</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(video.code_snippet || '');
                        showToast('Code copied to clipboard.', 'success');
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
                      Copy code
                    </button>
                  </div>
                  <pre className="rounded-lg bg-[#0f0f10] border border-white/[0.08] p-4 text-xs font-mono text-[#ededed] overflow-x-auto leading-relaxed">
                    <code>{video.code_snippet}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Series Playlist Queue Sidebar */}
        <div className={`${theaterMode ? 'xl:col-span-12' : 'xl:col-span-4 xl:sticky xl:top-4'}`}>
          <div className="rounded-xl border border-white/[0.08] bg-[#0f0f10] overflow-hidden">
            <div className="p-4 border-b border-white/[0.08] bg-[#141415] space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#e5a00d]">
                    <ListVideo className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {series ? 'Series playlist queue' : 'Engineering masterclasses'}
                  </div>
                  <h2 className="text-sm font-medium text-[#ededed] truncate">
                    {series ? series.title : 'Core Video Masterclasses'}
                  </h2>
                  <p className="text-xs text-[#85858b] truncate tabular-nums">
                    {series ? series.channel : 'Coding Task Factory curated'} ·{' '}
                    <span className="text-[#4cc38a] font-mono">
                      {seriesWatchedCount}/{seriesVideos.length} watched
                    </span>
                  </p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-md bg-[#19191b] border border-white/[0.08] text-[11px] font-mono text-[#ededed] tabular-nums">
                  {episodeNumber}/{seriesVideos.length}
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#85858b] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                <input
                  type="text"
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  placeholder={`Search ${seriesVideos.length} episodes...`}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#19191b] border border-white/[0.08] text-xs text-[#ededed] placeholder:text-[#85858b] focus:outline-none focus:border-[#e5a00d]/60"
                />
              </div>
            </div>

            <div className="max-h-[46dvh] xl:max-h-[600px] overflow-y-auto divide-y divide-white/[0.06] custom-scrollbar">
              {filteredQueue.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#85858b]">
                  No matching episodes found for &ldquo;{queueSearch}&rdquo;.
                </div>
              ) : (
                filteredQueue.map((ep, idx) => {
                  const isCurrent = ep.id === video.id;
                  const epWatched = watchedIds.includes(ep.id);
                  const epNum = ep.episode_order || idx + 1;
                  return (
                    <button
                      key={ep.id}
                      type="button"
                      onClick={() => handleNavigateEpisode(ep, false)}
                      className={`w-full p-3 flex items-start gap-3 text-left transition-colors ${
                        isCurrent
                          ? 'bg-[#222225] border-l-2 border-l-[#e5a00d]'
                          : 'hover:bg-[#19191b] border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className="w-6 shrink-0 pt-2 text-center font-mono text-[11px] tabular-nums">
                        {isCurrent ? (
                          <Play className="w-3.5 h-3.5 text-[#e5a00d] fill-[#e5a00d] mx-auto" strokeWidth={1.5} />
                        ) : (
                          <span className="text-[#85858b]">{epNum}</span>
                        )}
                      </div>

                      <div className="relative w-24 aspect-video shrink-0 rounded-md overflow-hidden bg-[#141415] border border-white/[0.08]">
                        <img
                          src={ep.thumbnail_url}
                          alt={ep.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#0f0f10]/90 text-[10px] font-mono text-[#ededed] tabular-nums">
                          {ep.duration_label || `${ep.duration_minutes}:00`}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div
                          className={`text-xs font-medium leading-snug line-clamp-2 ${
                            isCurrent ? 'text-[#ededed]' : 'text-[#a1a1a6]'
                          }`}
                        >
                          {ep.title}
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-[#85858b]">
                          <span className="truncate">{ep.instructor}</span>
                          {epWatched && (
                            <span className="inline-flex items-center gap-0.5 text-[#4cc38a] font-medium shrink-0">
                              <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
                              Watched
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
