import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { VideoLesson } from '../types';
import { useToast } from '../context/useContexts';
import {
  Play,
  Search,
  Sparkles,
  Clock,
  Eye,
  CheckCircle2,
  Code2,
  BookOpen,
  ArrowRight,
  X,
  Copy,
  Check,
  BrainCircuit,
} from 'lucide-react';

export const VideosPage: React.FC = () => {
  const { videoId } = useParams<{ videoId?: string }>();
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'chapters' | 'takeaways' | 'code'>('chapters');

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;
    api.getVideos({
      search: search || undefined,
      category: categoryFilter,
      difficulty: difficultyFilter,
    })
      .then((list) => {
        if (!active) return;
        setVideos(list);
        if (videoId) {
          const match = list.find((v) => v.id === videoId || v.slug === videoId);
          if (match) setSelectedVideo(match);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, categoryFilter, difficultyFilter, videoId]);

  useEffect(() => {
    if (!selectedVideo) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedVideo(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [selectedVideo]);

  const categories = ['All', 'Machine Learning', 'Algorithms', 'Data Structures', 'System Design'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard', 'Advanced'];

  const handleCopyCode = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast('Reference snippet copied.', 'info');
  };

  const featuredVideo = videos.find((v) => v.id === 'v-ml-transformer-attention') || videos[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Coding Masterclasses &amp; Visual Explanations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Video Learning &amp; Solution Walkthroughs
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Watch mathematical intuition, ML architectures, and algorithm breakdowns, then jump directly into the IDE to code the solution.
          </p>
        </div>

        <button
          onClick={() => navigate('/app/generator')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-600/20 transition shrink-0"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>Generate Custom Challenge</span>
        </button>
      </div>

      {featuredVideo && (
        <div className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-950/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-purple-950/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Featured Masterclass
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {featuredVideo.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {featuredVideo.difficulty}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                {featuredVideo.title}
              </h2>

              <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                {featuredVideo.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-2.5">
                  <img
                    src={featuredVideo.instructor_avatar}
                    alt={featuredVideo.instructor}
                    className="w-8 h-8 rounded-full border border-purple-500/40 object-cover"
                  />
                  <div>
                    <span className="text-white font-medium block">{featuredVideo.instructor}</span>
                    <span className="text-slate-400 text-[11px]">Instructor</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>{featuredVideo.duration_minutes} Minutes</span>
                </div>

                <div className="flex items-center gap-1.5 font-mono">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>{featuredVideo.views_count.toLocaleString()} Views</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => setSelectedVideo(featuredVideo)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Watch Masterclass</span>
                </button>

                {featuredVideo.related_challenge_id && (
                  <button
                    onClick={() => navigate(`/app/workspace/${featuredVideo.related_challenge_id}`)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 font-semibold text-xs sm:text-sm flex items-center gap-2 transition"
                  >
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span>Solve in Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div
              onClick={() => setSelectedVideo(featuredVideo)}
              className="lg:col-span-5 relative group cursor-pointer rounded-2xl overflow-hidden border border-purple-500/40 shadow-xl shadow-purple-950/40 aspect-video"
            >
              <img
                src={featuredVideo.thumbnail_url}
                alt={featuredVideo.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-purple-500 transition border border-white/20">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[11px] backdrop-blur-md">
                {featuredVideo.duration_minutes}:00
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full 106-Video Machine Learning LMS Banner */}
      <div className="rounded-2xl border border-indigo-500/35 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-emerald-950/40 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
            NEW · COMPLETE LMS TRACK
          </div>
          <h2 className="text-lg font-extrabold text-white">
            Machine Learning Mastery — 106-Video Course, Notes, 100+ Quizzes &amp; Proctored Final Exam
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Study the full 106-lecture playlist across 7 structured modules with personal cloud notes, per-video comprehension quizzes, and webcam anti-cheat final certification.
          </p>
        </div>
        <a
          href="/app/ml-course"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold whitespace-nowrap transition shadow-lg shadow-indigo-500/25"
        >
          <Play className="w-4 h-4 fill-white" />
          Launch 106-Video LMS
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0A0D17] border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tutorials, machine learning topics, algorithms..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff === 'All' ? 'All Difficulties' : diff}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
          <span className="text-xs text-slate-400 font-medium mr-1">Categories:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                categoryFilter === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-800 bg-[#0A0D17] h-80 animate-pulse p-4 space-y-3">
              <div className="w-full h-44 rounded-xl bg-slate-800" />
              <div className="h-4 w-3/4 bg-slate-800 rounded" />
              <div className="h-3 w-1/2 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0A0D17] border border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No video lessons found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group flex flex-col rounded-2xl border border-slate-800/80 bg-[#0A0D17] hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-950/20 transition duration-300 overflow-hidden"
            >
              <div
                onClick={() => setSelectedVideo(video)}
                className="relative aspect-video w-full overflow-hidden cursor-pointer"
              >
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition" />
                <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition duration-300">
                  <div className="w-11 h-11 rounded-full bg-purple-600/90 group-hover:bg-purple-500 text-white flex items-center justify-center shadow-lg border border-white/20">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 font-mono text-[11px] text-white backdrop-blur-md">
                  {video.duration_minutes}:00
                </div>
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                      video.category === 'Machine Learning' ? 'bg-purple-600/80 text-white' : 'bg-indigo-600/80 text-white'
                    }`}
                  >
                    {video.category}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold ${
                        video.difficulty === 'Easy'
                          ? 'text-emerald-400'
                          : video.difficulty === 'Medium'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {video.difficulty}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      <Eye className="w-3 h-3 text-slate-500" />
                      {video.views_count.toLocaleString()}
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedVideo(video)}
                    className="text-sm font-bold text-white group-hover:text-purple-300 transition line-clamp-2 cursor-pointer"
                  >
                    {video.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{video.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {video.instructor_avatar && (
                      <img
                        src={video.instructor_avatar}
                        alt={video.instructor}
                        className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-700"
                      />
                    )}
                    <span className="text-xs text-slate-300 truncate font-medium">{video.instructor}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedVideo(video)}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold transition"
                    >
                      Watch
                    </button>

                    {video.related_challenge_id && (
                      <button
                        onClick={() => navigate(`/app/workspace/${video.related_challenge_id}`)}
                        className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
                        title="Code related challenge"
                      >
                        <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#090C16] border border-purple-500/40 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {selectedVideo.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">{selectedVideo.title}</h3>
              </div>

              <button
                onClick={() => setSelectedVideo(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
                <iframe
                  src={`${selectedVideo.video_url}?autoplay=1&rel=0`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  {selectedVideo.instructor_avatar && (
                    <img
                      src={selectedVideo.instructor_avatar}
                      alt={selectedVideo.instructor}
                      className="w-10 h-10 rounded-full object-cover border border-purple-500/40"
                    />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedVideo.instructor}</h4>
                    <p className="text-xs text-slate-400">
                      {selectedVideo.duration_minutes} minutes • {selectedVideo.views_count.toLocaleString()} views
                    </p>
                  </div>
                </div>

                {selectedVideo.related_challenge_id && (
                  <button
                    onClick={() => {
                      const targetId = selectedVideo.related_challenge_id;
                      setSelectedVideo(null);
                      navigate(`/app/workspace/${targetId}`);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 transition"
                  >
                    <Code2 className="w-4 h-4 text-cyan-300" />
                    <span>Code Solution in Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center border-b border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveModalTab('chapters')}
                    className={`py-2 px-4 font-semibold border-b-2 transition ${
                      activeModalTab === 'chapters'
                        ? 'border-purple-500 text-purple-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Video Chapters ({selectedVideo.chapters?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveModalTab('takeaways')}
                    className={`py-2 px-4 font-semibold border-b-2 transition ${
                      activeModalTab === 'takeaways'
                        ? 'border-purple-500 text-purple-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Key Takeaways ({selectedVideo.key_takeaways?.length || 0})
                  </button>
                  {selectedVideo.code_snippet && (
                    <button
                      onClick={() => setActiveModalTab('code')}
                      className={`py-2 px-4 font-semibold border-b-2 transition ${
                        activeModalTab === 'code'
                          ? 'border-purple-500 text-purple-300'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Python Implementation
                    </button>
                  )}
                </div>

                {activeModalTab === 'chapters' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedVideo.chapters?.map((chap, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-slate-200">{chap.title}</span>
                        <span className="font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {chap.time}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeModalTab === 'takeaways' && (
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
                    {selectedVideo.key_takeaways?.map((point, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeModalTab === 'code' && selectedVideo.code_snippet && (
                  <div className="relative rounded-2xl bg-[#05070E] border border-slate-800 p-4 font-mono text-xs overflow-x-auto">
                    <button
                      onClick={() => handleCopyCode(selectedVideo.code_snippet)}
                      className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] flex items-center gap-1.5 transition"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                    <pre className="text-slate-300 leading-relaxed custom-scrollbar">{selectedVideo.code_snippet}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
