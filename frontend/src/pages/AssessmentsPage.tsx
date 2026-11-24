import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Assessment, Challenge } from '../types';
import {
  Award,
  Plus,
  Clock,
  CheckCircle2,
  Users,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  X,
  FileCheck2,
} from 'lucide-react';

export const AssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [passingScore, setPassingScore] = useState(75);
  const [selectedChallengeIds, setSelectedChallengeIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      api.getAssessments().catch(() => []),
      api.getChallenges().catch(() => []),
    ]).then(([aList, cList]) => {
      setAssessments(aList);
      setChallenges(cList);
      if (cList.length >= 2) {
        setSelectedChallengeIds([cList[0].id, cList[1].id]);
      }
      setLoading(false);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const created = await api.createAssessment({
        title,
        description,
        duration_minutes: duration,
        passing_score: passingScore,
        challenge_ids: selectedChallengeIds,
        category: 'Custom Assessment',
      });
      setAssessments([created, ...assessments]);
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      alert(`Error creating assessment: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Technical Assessments
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Standardized coding evaluations for student grading, candidate screening, and hackathon challenges.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create New Assessment
        </button>
      </div>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((a) => (
          <div
            key={a.id}
            className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition duration-200 group shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {a.is_active ? 'Active Screener' : 'Closed'}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {a.duration_minutes} Mins
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                {a.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-6">
                {a.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Passing: <strong className="text-slate-200">{a.passing_score}%</strong></span>
                <span>{a.challenge_ids?.length || 2} Problems</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {a.candidates_count}
                </span>
              </div>

              <button
                onClick={() => alert(`Starting assessment: ${a.title}. You have ${a.duration_minutes} minutes.`)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-indigo-600 transition flex items-center justify-center gap-2"
              >
                Start Assessment
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Assessment Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0A0D17] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                Create New Assessment
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Assessment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Fullstack Screener"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Candidate screening instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Passing Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Assigned Challenges
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-slate-900 rounded-xl border border-slate-800">
                  {challenges.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedChallengeIds.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedChallengeIds([...selectedChallengeIds, c.id]);
                          } else {
                            setSelectedChallengeIds(selectedChallengeIds.filter((id) => id !== c.id));
                          }
                        }}
                        className="rounded border-slate-700 text-indigo-600 bg-slate-950"
                      />
                      <span className="text-slate-300 font-medium truncate">{c.title}</span>
                      <span className="text-[10px] text-slate-500 ml-auto font-mono">{c.difficulty}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
              >
                Create & Publish Screener
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
