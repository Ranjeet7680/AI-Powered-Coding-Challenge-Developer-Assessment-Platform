import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  GraduationCap,
  Layers,
  ListVideo,
  Lock,
  Play,
  Search,
  ShieldCheck,
  Terminal,
  Video as VideoIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { VideoLesson, VideoPlaylistSummary } from '../types';
import { VideoShareButton } from '../components/videos/VideoShareButton';
import { CourseShareButton } from '../components/lms/CourseShareButton';
import { COURSE_TRACK_META, COURSE_TRACK_ORDER } from '../constants/courseTracks';

const CATEGORIES = [
  'All',
  'Python Programming',
  'Machine Learning',
  'Deep Learning',
  'Reinforcement Learning',
  'Java Programming',
  'Modern C++',
  'Embedded C',
  'Data Structures',
  'Algorithms',
  'System Design',
];

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Intermediate', 'Hard', 'Advanced'];
const PAGE_SIZE = 24;

export const VideosPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPlaylistId = searchParams.get('playlist') || '';

  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [playlists, setPlaylists] = useState<VideoPlaylistSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const filterKey = `${selectedPlaylistId}|${category}|${difficulty}|${search}`;
  const [pageState, setPageState] = useState<{ key: string; page: number }>({
    key: filterKey,
    page: 1,
  });
  const currentPage = pageState.key === filterKey ? pageState.page : 1;
  const setCurrentPage = (updater: number | ((prev: number) => number)) => {
    setPageState((prev) => {
      const base = prev.key === filterKey ? prev.page : 1;
      const next = typeof updater === 'function' ? updater(base) : updater;
      return { key: filterKey, page: next };
    });
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getVideoPlaylists(), api.getVideos({})])
      .then(([plData, vidData]) => {
        if (cancelled) return;
        setPlaylists(plData);
        setVideos(vidData);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectPlaylist = (pid: string) => {
    const next = selectedPlaylistId === pid ? '' : pid;
    setCategory('All');
    setDifficulty('All');
    if (next) {
      setSearchParams({ playlist: next });
    } else {
      setSearchParams({});
    }
  };

  const filteredVideos = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = videos.filter((v) => {
      if (selectedPlaylistId && v.playlist_id !== selectedPlaylistId) return false;
      if (category !== 'All' && v.category !== category) return false;
      if (difficulty !== 'All' && v.difficulty !== difficulty) return false;
      if (q) {
        const hay = `${v.title} ${v.description} ${v.playlist_title || ''} ${v.instructor} ${v.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (selectedPlaylistId) {
      return [...list].sort((a, b) => (a.episode_order || 0) - (b.episode_order || 0));
    }
    return list;
  }, [videos, selectedPlaylistId, category, difficulty, search]);

  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedVideos = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredVideos.slice(start, start + PAGE_SIZE);
  }, [filteredVideos, safePage]);

  const activePlaylist = useMemo(
    () => playlists.find((p) => p.playlist_id === selectedPlaylistId) || null,
    [playlists, selectedPlaylistId]
  );

  const difficultyBadge = (diff: string) => {
    if (diff === 'Hard' || diff === 'Advanced') return 'bg-[#141415]/90 text-[#e5484d] border-white/[0.12]';
    if (diff === 'Medium' || diff === 'Intermediate') return 'bg-[#141415]/90 text-[#e5a00d] border-white/[0.12]';
    return 'bg-[#141415]/90 text-[#4cc38a] border-white/[0.12]';
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1.5">
          <div className="text-xs font-mono text-[#85858b] tabular-nums">
            Engineering theater · {videos.length || 596} in-platform lectures
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#ededed] tracking-tight">
            Engineering video library
          </h1>
          <p className="text-[#a1a1a6] text-sm">
            Stream every lecture inside Coding Task Factory&apos;s locked watch theater and share direct platform links.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#19191b] border border-white/[0.08] text-xs font-medium text-[#4cc38a] self-start md:self-auto">
          <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
          Platform-only stream &amp; share
        </div>
      </div>

      {/* Featured LMS Flagship Tracks */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {COURSE_TRACK_ORDER.map((trackId) => {
          const meta = COURSE_TRACK_META[trackId];
          return (
            <div
              key={trackId}
              className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <Link
                  to={meta.lmsDetailPath}
                  className="block aspect-video rounded-lg overflow-hidden border border-white/[0.08]"
                >
                  <img
                    src={meta.defaultThumbnail}
                    alt={meta.cardTitle}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#e5a00d] tabular-nums">
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                  <span>{meta.hubBadgeText}</span>
                </div>
                <h2 className="text-base font-semibold text-[#ededed]">{meta.cardTitle}</h2>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">{meta.cardSummary}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={meta.lmsDetailPath}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 h-9 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.10] text-[#ededed] text-xs font-medium transition-colors"
                >
                  Open {meta.shortLabel}
                  <ArrowRight className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
                </Link>
                <CourseShareButton
                  track={trackId}
                  title={meta.cardTitle}
                  instructor={meta.eyebrowLabel}
                  lectureCount={meta.lectureCount}
                  thumbnailUrl={meta.defaultThumbnail}
                  variant="compact"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 8 Full University Course Playlists */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#a1a1a6] tabular-nums">
              <Layers className="w-3.5 h-3.5 text-[#e5a00d]" strokeWidth={1.5} />
              8 university playlists · {playlists.reduce((acc, p) => acc + p.video_count, 0)} episodes
            </div>
            <h2 className="text-lg font-semibold text-[#ededed] mt-0.5">
              Playlist series
            </h2>
          </div>

          {selectedPlaylistId && (
            <button
              type="button"
              onClick={() => handleSelectPlaylist('')}
              className="px-3.5 py-1.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
            >
              Show all playlists
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {playlists.map((pl) => {
            const isSelected = selectedPlaylistId === pl.playlist_id;
            return (
              <div
                key={pl.playlist_id}
                className={`rounded-xl border overflow-hidden flex flex-col transition-colors ${
                  isSelected
                    ? 'border-[#e5a00d]/60 bg-[#222225]'
                    : 'border-white/[0.08] bg-[#19191b] hover:border-white/[0.16]'
                }`}
              >
                <div
                  onClick={() => pl.first_video_id && navigate(`/app/videos/${pl.first_video_id}`)}
                  className="relative aspect-video bg-[#0f0f10] cursor-pointer overflow-hidden group"
                >
                  <img
                    src={pl.thumbnail_url}
                    alt={pl.title}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] via-[#0f0f10]/25 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#141415]/90 border border-white/[0.10] text-[11px] font-mono text-[#ededed] flex items-center gap-1 tabular-nums">
                    <ListVideo className="w-3 h-3 text-[#85858b]" strokeWidth={1.5} />
                    {pl.video_count} videos
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${difficultyBadge(pl.difficulty)}`}>
                      {pl.difficulty}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#a1a1a6] truncate">{pl.category}</span>
                    <span className="w-7 h-7 rounded-full bg-[#ededed] text-[#141415] flex items-center justify-center">
                      <Play className="w-3 h-3 fill-current ml-0.5" strokeWidth={1.5} />
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-[#ededed] line-clamp-2 leading-snug">
                      {pl.title}
                    </h3>
                    <p className="text-xs text-[#85858b] mt-1 truncate">{pl.channel}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2.5 border-t border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => handleSelectPlaylist(pl.playlist_id)}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#ededed] text-[#141415]'
                          : 'bg-[#222225] hover:bg-[#2a2a2e] text-[#ededed]'
                      }`}
                    >
                      {isSelected ? 'Filtered' : 'Browse episodes'}
                    </button>
                    {pl.first_video_id && (
                      <Link
                        to={`/app/videos/${pl.first_video_id}`}
                        className="py-1.5 px-2.5 rounded-lg bg-[#141415] hover:bg-[#222225] border border-white/[0.08] text-xs font-medium text-[#a1a1a6] hover:text-[#ededed] transition-colors inline-flex items-center gap-1"
                      >
                        Ep 1
                        <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-[#19191b] border border-white/[0.08] p-4 rounded-xl space-y-4">
        {activePlaylist && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#222225] border border-[#e5a00d]/35">
            <div className="text-xs font-medium text-[#ededed] flex items-center gap-2 tabular-nums">
              <CheckCircle2 className="w-4 h-4 text-[#e5a00d]" strokeWidth={1.5} />
              Active playlist: {activePlaylist.title} ({filteredVideos.length} episodes in sequence)
            </div>
            <button
              type="button"
              onClick={() => handleSelectPlaylist('')}
              className="text-xs font-medium text-[#e5a00d] hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#85858b] absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search Python, ML, Deep Learning, Java, C++, Embedded C..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-[#141415] border border-white/[0.08] rounded-lg text-sm text-[#ededed] placeholder:text-[#85858b] focus:outline-none focus:border-[#e5a00d]/60 transition-colors"
            />
          </div>

          <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center gap-1.5 w-full md:w-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-[#85858b] mr-1 hidden sm:block" strokeWidth={1.5} />
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  setDifficulty(diff);
                  setCurrentPage(1);
                }}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  difficulty === diff
                    ? 'bg-[#ededed] text-[#141415]'
                    : 'bg-[#222225] text-[#a1a1a6] hover:text-[#ededed]'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center gap-1.5 pt-2 pb-1 sm:pb-0 border-t border-white/[0.06]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                setCurrentPage(1);
              }}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-[#222225] text-[#e5a00d] border border-[#e5a00d]/35'
                  : 'text-[#85858b] hover:text-[#ededed] hover:bg-[#222225]/60 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#a1a1a6] tabular-nums">
        <span>
          Showing{' '}
          <strong className="font-medium text-[#ededed]">
            {filteredVideos.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filteredVideos.length)}
          </strong>{' '}
          of <strong className="font-medium text-[#ededed]">{filteredVideos.length}</strong> videos
        </span>
        <span className="inline-flex items-center gap-1.5 text-[#4cc38a] font-medium">
          <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
          Opens in dedicated in-platform watch theater
        </span>
      </div>

      {/* Video Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-xl bg-[#19191b] border border-white/[0.08] animate-pulse" />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-16 bg-[#19191b] border border-white/[0.08] rounded-xl">
          <VideoIcon className="w-8 h-8 text-[#85858b] mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="text-[#ededed] font-medium text-base">No matching video lessons found</h3>
          <p className="text-[#85858b] text-sm mt-1">Try resetting your playlist, category, or search term.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => navigate(`/app/videos/${video.id}`)}
                className="group bg-[#19191b] border border-white/[0.08] hover:border-white/[0.16] rounded-xl overflow-hidden flex flex-col cursor-pointer transition-colors"
              >
                {/* Thumbnail with Play Overlay */}
                <div className="relative aspect-video bg-[#0f0f10] overflow-hidden">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] via-transparent to-transparent opacity-80" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-[#ededed]/95 group-hover:bg-[#e5a00d] text-[#141415] flex items-center justify-center transition-colors">
                      <Play className="w-4 h-4 fill-current ml-0.5" strokeWidth={1.5} />
                    </div>
                  </div>

                  {video.episode_order && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#141415]/90 border border-white/[0.10] text-[11px] font-mono text-[#ededed] tabular-nums">
                      Ep #{video.episode_order}
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${difficultyBadge(video.difficulty)}`}>
                      {video.difficulty}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-[#ededed] font-mono tabular-nums">
                    <span className="bg-[#141415]/90 px-2 py-0.5 rounded-md border border-white/[0.08] text-[#a1a1a6] truncate max-w-[180px]">
                      {video.playlist_title || video.category}
                    </span>
                    <span className="flex items-center gap-1 bg-[#141415]/90 px-2 py-0.5 rounded-md border border-white/[0.08]">
                      <Clock className="w-3 h-3 text-[#85858b]" strokeWidth={1.5} />
                      {video.duration_label || `${video.duration_minutes}:00`}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                  <div className="space-y-1.5">
                    <h3 className="font-medium text-[#ededed] group-hover:text-[#e5a00d] transition-colors line-clamp-2 text-sm leading-snug">
                      {video.title}
                    </h3>
                    <p className="text-[#85858b] text-xs line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 text-xs text-[#85858b]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[#a1a1a6] truncate">{video.instructor}</span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[#85858b] shrink-0 tabular-nums font-mono">
                        <Eye className="w-3 h-3" strokeWidth={1.5} /> {video.views_count.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <VideoShareButton
                        title={video.title}
                        sharePath={`/app/videos/${video.id}`}
                        subtitle={video.playlist_title || video.category}
                        variant="compact"
                        align="right"
                      />
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#ededed] text-[#141415] text-xs font-medium">
                        Watch
                        <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
              <span className="text-xs font-mono text-[#85858b] tabular-nums">
                Page {safePage} of {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 360, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] disabled:opacity-40 border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 360, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#ededed] hover:bg-white disabled:opacity-40 text-xs font-medium text-[#141415] transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Bottom IDE Link Hint */}
      <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#a1a1a6]">
        <span className="inline-flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#85858b]" strokeWidth={1.5} />
          Every playlist pairs directly with interactive Python, Java, C++, and ML coding challenges.
        </span>
        <Link
          to="/app/challenges"
          className="inline-flex items-center gap-1 text-[#e5a00d] hover:underline font-medium"
        >
          Open challenge bank
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
};
