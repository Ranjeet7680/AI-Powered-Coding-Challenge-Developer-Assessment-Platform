import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Award,
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
  Sparkles,
  Terminal,
  Video as VideoIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { VideoLesson, VideoPlaylistSummary } from '../types';
import { VideoShareButton } from '../components/videos/VideoShareButton';

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
  const [pageState, setPageState] = useState<{ key: string; page: number }>({ key: filterKey, page: 1 });
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
    if (diff === 'Hard' || diff === 'Advanced') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (diff === 'Medium' || diff === 'Intermediate') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-2">
            <VideoIcon className="w-3.5 h-3.5" /> Engineering Theater · {videos.length || 596} In-Platform Lectures
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineering Video Library &amp; 8 Full Playlists
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Stream every lecture inside Coding Task Factory&apos;s locked Watch Theater — share direct platform links with zero YouTube redirects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-300">
            <Lock className="w-3.5 h-3.5" />
            Platform-Only Stream &amp; Share
          </div>
        </div>
      </div>

      {/* Featured LMS Flagship Tracks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="rounded-3xl border border-indigo-500/35 bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-cyan-950/40 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 shadow-2xl">
          <Link
            to="/app/lms/ml"
            className="w-full sm:w-52 aspect-video shrink-0 rounded-2xl overflow-hidden border border-indigo-500/40 shadow-lg hover:scale-[1.02] transition"
          >
            <img
              src="/thumbnails/ml-ctf-course-thumbnail.svg"
              alt="Coding Task Factory Complete Machine Learning LMS"
              className="w-full h-full object-cover"
            />
          </Link>
          <div className="space-y-2.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[11px] font-bold text-indigo-300">
              <GraduationCap className="w-3.5 h-3.5" />
              106 Lectures · 100+ Quizzes · Proctored Exam
            </div>
            <h2 className="text-lg font-extrabold text-white">Complete Machine Learning LMS</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Full StatQuest 106-video sequence with page-by-page study notes, capstones &amp; verified certificate.
            </p>
            <Link
              to="/app/lms/ml"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20"
            >
              Open ML Course
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-rose-500/40 bg-gradient-to-br from-rose-950/55 via-slate-900/95 to-indigo-950/45 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 shadow-2xl">
          <Link
            to="/app/lms/dl"
            className="w-full sm:w-52 aspect-video shrink-0 rounded-2xl overflow-hidden border border-rose-500/40 shadow-lg hover:scale-[1.02] transition"
          >
            <img
              src="/thumbnails/stanford-ctf-dl-thumbnail.svg"
              alt="Stanford X Coding Task Factory Academy Deep Learning Course"
              className="w-full h-full object-cover"
            />
          </Link>
          <div className="space-y-2.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[11px] font-bold text-rose-300">
              <Award className="w-3.5 h-3.5" />
              Stanford CS230 X CTF · 21 Lectures + 20 Quizzes
            </div>
            <h2 className="text-lg font-extrabold text-white">
              [Stanford X Coding Task Factory] Deep Learning
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              CNNs, Transformers, Sequence Models, Camera-Proctored Final Exam &amp; Verified Certificate.
            </p>
            <Link
              to="/app/lms/dl"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-500/20"
            >
              Open Stanford DL
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 8 Full University Course Playlists */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">
              <Layers className="w-3.5 h-3.5" />
              8 Curated University Playlists · {playlists.reduce((acc, p) => acc + p.video_count, 0)} Episodes
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
              Select a Playlist Series or Watch Episode 1 Inside Platform Theater
            </h2>
          </div>

          {selectedPlaylistId && (
            <button
              type="button"
              onClick={() => handleSelectPlaylist('')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
            >
              Show All 8 Playlists &amp; Masterclasses
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {playlists.map((pl) => {
            const isSelected = selectedPlaylistId === pl.playlist_id;
            return (
              <div
                key={pl.playlist_id}
                className={`rounded-2xl border overflow-hidden flex flex-col transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/35 shadow-xl shadow-indigo-500/15'
                    : 'border-slate-800 bg-slate-900/75 hover:border-indigo-500/40'
                }`}
              >
                <div
                  onClick={() => pl.first_video_id && navigate(`/app/videos/${pl.first_video_id}`)}
                  className="relative aspect-video bg-slate-950 cursor-pointer overflow-hidden group"
                >
                  <img
                    src={pl.thumbnail_url}
                    alt={pl.title}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-slate-950/90 border border-indigo-500/40 text-[10px] font-mono font-bold text-indigo-300 flex items-center gap-1">
                    <ListVideo className="w-3 h-3" />
                    {pl.video_count} Videos
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border backdrop-blur-md ${difficultyBadge(pl.difficulty)}`}>
                      {pl.difficulty}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-cyan-300 truncate">{pl.category}</span>
                    <span className="w-8 h-8 rounded-full bg-indigo-600/90 flex items-center justify-center shadow-lg">
                      <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white line-clamp-2 leading-snug">
                      {pl.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">{pl.channel}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleSelectPlaylist(pl.playlist_id)}
                      className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isSelected ? 'Filtered ✓' : 'Browse Episodes'}
                    </button>
                    {pl.first_video_id && (
                      <Link
                        to={`/app/videos/${pl.first_video_id}`}
                        className="py-1.5 px-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/35 text-[11px] font-bold text-indigo-200 hover:text-white transition"
                      >
                        Watch Ep 1 →
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
      <div className="bg-slate-900/60 border border-slate-800/90 p-4 rounded-2xl space-y-4">
        {activePlaylist && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
            <div className="text-xs font-bold text-indigo-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              Active Playlist Filter: {activePlaylist.title} ({filteredVideos.length} episodes shown in sequential order)
            </div>
            <button
              type="button"
              onClick={() => handleSelectPlaylist('')}
              className="text-xs font-bold text-cyan-300 hover:text-white"
            >
              Clear Filter
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Python, ML, Deep Learning, Java, C++, Embedded C..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/60 transition"
            />
          </div>

          <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center gap-2 w-full md:w-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-slate-500 mr-1 hidden sm:block" />
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  setDifficulty(diff);
                  setCurrentPage(1);
                }}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  difficulty === diff
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center gap-2 pt-1 pb-1 sm:pb-0 border-t border-slate-800/80">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                setCurrentPage(1);
              }}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>
          Showing{' '}
          <strong className="text-white">
            {filteredVideos.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filteredVideos.length)}
          </strong>{' '}
          of <strong className="text-indigo-300">{filteredVideos.length}</strong> videos
        </span>
        <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          Click any lecture to open our Dedicated Watch Page (no YouTube.com share links)
        </span>
      </div>

      {/* Video Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <VideoIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-slate-300 font-medium text-lg">No matching video lessons found</h3>
          <p className="text-slate-500 text-sm mt-1">Try resetting your playlist, category, or search term.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => navigate(`/app/videos/${video.id}`)}
                className="group bg-slate-900/75 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-500/10"
              >
                {/* Thumbnail with Play Overlay */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-600/90 flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>

                  {video.episode_order && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-slate-950/90 border border-indigo-500/40 text-[10px] font-mono font-bold text-indigo-200">
                      Ep #{video.episode_order}
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border backdrop-blur-md ${difficultyBadge(video.difficulty)}`}>
                      {video.difficulty}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span className="bg-black/70 px-2 py-0.5 rounded-md backdrop-blur-md text-[10px] font-semibold text-cyan-300 truncate max-w-[180px]">
                      {video.playlist_title || video.category}
                    </span>
                    <span className="flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded-md backdrop-blur-md">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      {video.duration_label || `${video.duration_minutes}:00`}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 text-base leading-snug">
                      {video.title}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-300 font-medium truncate">{video.instructor}</span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-slate-500 shrink-0">
                        <Eye className="w-3 h-3" /> {video.views_count.toLocaleString()}
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/35 text-indigo-300 text-[11px] font-bold">
                        Watch <Sparkles className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
              <span className="text-xs font-mono text-slate-400">
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
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-xs font-bold text-slate-200 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 360, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold text-white transition"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Bottom IDE Link Hint */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Every playlist pairs directly with interactive Python, Java, C++, and ML coding challenges.
        </span>
        <Link to="/app/challenges" className="text-indigo-400 hover:text-indigo-300 font-bold">
          Open 368+ Challenge Bank →
        </Link>
      </div>
    </div>
  );
};
