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
  ListVideo,
  Lock,
  Maximize2,
  Minimize2,
  Play,
  Search,
  Sparkles,
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
      showToast(`Completed Episode — starting #${context.next_video.episode_order || ''} ${context.next_video.title}`, 'success');
      handleNavigateEpisode(context.next_video, true);
    } else {
      showToast('Video marked as watched!', 'success');
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

  const isLoading = Boolean(videoId) && (!context || (context.video.id !== videoId && context.video.slug !== videoId)) && !loadError;

  if (!videoId) {
    return null;
  }

  if (loadError) {
    return (
      <div className="max-w-4xl mx-auto p-6 sm:p-10 text-center space-y-4">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8 space-y-3">
          <h1 className="text-xl font-bold text-white">Video Lesson Not Found</h1>
          <p className="text-sm text-slate-400">{loadError}</p>
          <Link
            to="/app/videos"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Video Library
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !context) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5 animate-pulse">
        <div className="h-12 rounded-2xl bg-slate-900 border border-slate-800" />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-4">
            <div className="aspect-video rounded-2xl bg-slate-900 border border-slate-800" />
            <div className="h-36 rounded-2xl bg-slate-900 border border-slate-800" />
          </div>
          <div className="xl:col-span-4 h-[540px] rounded-2xl bg-slate-900 border border-slate-800" />
        </div>
      </div>
    );
  }

  const { video, series, series_videos: seriesVideos, prev_video: prevVideo, next_video: nextVideo, platform_share_path: sharePath } = context;
  const episodeNumber = video.episode_order || Math.max(1, seriesVideos.findIndex((v) => v.id === video.id) + 1);
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
      <div className="rounded-2xl border border-slate-800 bg-[#0A0F1D] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          <Link
            to={series ? `/app/videos?playlist=${encodeURIComponent(series.playlist_id)}` : '/app/videos'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {series ? 'All Series Episodes' : 'Video Library'}
          </Link>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-300">
            <Lock className="w-3 h-3" />
            Platform Watch Mode
          </span>

          {series && (
            <span className="text-xs font-semibold text-slate-300 truncate max-w-md">
              {series.title} · <span className="text-indigo-300 font-mono">{episodeNumber} / {totalSeriesCount}</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoAdvance((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
              autoAdvance
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-200'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Auto-Next: {autoAdvance ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setTheaterMode((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition"
          >
            {theaterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            {theaterMode ? 'Standard View' : 'Theater View'}
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
            playerModeLabel="LOCKED WATCH THEATER"
            badgeVariant="episode"
            seriesBadge={series ? `Episode #${episodeNumber} of ${totalSeriesCount} · ${durationLabel}` : `Masterclass · ${durationLabel}`}
            autoPlay={autoPlayTrigger}
            onVideoEnded={handleVideoEnded}
          />

          {/* Video Header, Prev/Next Controls & Platform Actions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                  {video.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono">
                  {video.difficulty}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  {durationLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  {video.views_count.toLocaleString()} views
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                {video.instructor}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
              {video.title}
            </h1>

            {/* Episode Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!prevVideo}
                  onClick={() => prevVideo && handleNavigateEpisode(prevVideo, false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-200 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous Episode
                </button>

                <button
                  type="button"
                  disabled={!nextVideo}
                  onClick={() => nextVideo && handleNavigateEpisode(nextVideo, false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-extrabold text-white transition shadow-lg shadow-indigo-500/20"
                >
                  Next Episode
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => toggleWatched(video.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition ${
                    isWatched
                      ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                      : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-emerald-500/35'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isWatched ? 'Watched' : 'Mark Watched'}
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/35 text-cyan-200 text-xs font-bold transition"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    Practice in IDE
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Study Breakdown Tabs */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/75 overflow-hidden">
            <div className="flex items-center border-b border-slate-800 bg-[#0A0F1D]">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-5 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-white bg-indigo-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Overview &amp; Chapters
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('takeaways')}
                className={`px-5 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition ${
                  activeTab === 'takeaways'
                    ? 'border-emerald-500 text-white bg-emerald-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Key Takeaways ({video.key_takeaways.length})
              </button>
              {video.code_snippet && (
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`px-5 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition ${
                    activeTab === 'code'
                      ? 'border-cyan-500 text-white bg-cyan-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Starter Code
                </button>
              )}
            </div>

            <div className="p-5">
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  <p className="text-sm text-slate-300 leading-relaxed">{video.description}</p>
                  {video.chapters.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Lecture Sections &amp; Pacing
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {video.chapters.map((ch, idx) => (
                          <div
                            key={`${ch.title}-${idx}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5"
                          >
                            <span className="text-xs font-medium text-slate-200 truncate">{ch.title}</span>
                            <span className="shrink-0 text-[11px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md">
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
                      className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'code' && video.code_snippet && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Reference Code Snippet</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(video.code_snippet || '');
                        showToast('Code copied to clipboard!', 'success');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Code
                    </button>
                  </div>
                  <pre className="rounded-xl bg-[#050814] border border-slate-800 p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
                    <code>{video.code_snippet}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Series Playlist Queue Sidebar */}
        <div className={`${theaterMode ? 'xl:col-span-12' : 'xl:col-span-4 xl:sticky xl:top-4'}`}>
          <div className="rounded-2xl border border-slate-800 bg-[#0A0F1D] overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-bold">
                    <ListVideo className="w-3.5 h-3.5" />
                    {series ? 'Series Playlist Queue' : 'More Engineering Masterclasses'}
                  </div>
                  <h2 className="text-sm font-extrabold text-white truncate">
                    {series ? series.title : 'Core Video Masterclasses'}
                  </h2>
                  <p className="text-xs text-slate-400 truncate">
                    {series ? series.channel : 'Coding Task Factory Curated'} ·{' '}
                    <span className="text-emerald-400 font-mono">
                      {seriesWatchedCount}/{seriesVideos.length} watched
                    </span>
                  </p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono font-bold text-slate-300">
                  {episodeNumber}/{seriesVideos.length}
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  placeholder={`Search ${seriesVideos.length} episodes...`}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-800/70">
              {filteredQueue.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
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
                      className={`w-full p-3 flex items-start gap-3 text-left transition ${
                        isCurrent
                          ? 'bg-indigo-600/20 border-l-4 border-l-indigo-500'
                          : 'hover:bg-slate-900/90 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="w-6 shrink-0 pt-2 text-center font-mono text-[11px] font-bold">
                        {isCurrent ? (
                          <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400 mx-auto" />
                        ) : (
                          <span className="text-slate-500">{epNum}</span>
                        )}
                      </div>

                      <div className="relative w-24 aspect-video shrink-0 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                        <img
                          src={ep.thumbnail_url}
                          alt={ep.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                          {ep.duration_label || `${ep.duration_minutes}:00`}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div
                          className={`text-xs font-bold leading-snug line-clamp-2 ${
                            isCurrent ? 'text-white' : 'text-slate-200'
                          }`}
                        >
                          {ep.title}
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
                          <span className="truncate">{ep.instructor}</span>
                          {epWatched && (
                            <span className="inline-flex items-center gap-0.5 text-emerald-400 font-bold shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
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
