import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Code2,
  BookOpen,
  Briefcase,
  Check,
  Rocket,
  CheckCircle2,
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState('Developer');
  const [experience, setExperience] = useState('Intermediate');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Python', 'TypeScript']);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Improve problem-solving',
    'Prepare for interviews',
  ]);
  const [loading, setLoading] = useState(false);

  const { updateOnboarding, user } = useAuth();
  const navigate = useNavigate();

  const totalSteps = 5;

  const roles = [
    { id: 'Student', label: 'Student', desc: 'Enrolled in school, college, or self-teaching', icon: GraduationCap },
    { id: 'Developer', label: 'Developer', desc: 'Software engineer building web, mobile, or backend apps', icon: Code2 },
    { id: 'Educator', label: 'Educator', desc: 'Teacher, professor, or bootcamp instructor', icon: BookOpen },
    { id: 'Recruiter', label: 'Recruiter', desc: 'Technical recruiter or hiring manager screening talent', icon: Briefcase },
  ];

  const experienceLevels = [
    { id: 'Beginner', label: 'Beginner', desc: '< 1 year. Learning basic data types, loops, and syntax.' },
    { id: 'Intermediate', label: 'Intermediate', desc: '1–3 years. Comfortable with data structures and OOP.' },
    { id: 'Advanced', label: 'Advanced', desc: '3–6 years. Experienced with algorithmic patterns and performance.' },
    { id: 'Expert', label: 'Expert', desc: '6+ years. Staff/Principal level system design and optimization.' },
  ];

  const languagesList = [
    'Python',
    'JavaScript',
    'TypeScript',
    'C++',
    'Java',
    'C',
    'Go',
    'Rust',
  ];

  const goalsList = [
    'Improve problem-solving',
    'Prepare for interviews',
    'Practice algorithms',
    'Evaluate candidates',
    'Teach programming',
    'Earn skill certificates',
  ];

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== goal));
      }
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await updateOnboarding({
        role,
        experience,
        preferred_languages: selectedLanguages,
        goals: selectedGoals,
      });

      // Launch celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      setTimeout(() => {
        navigate('/app/dashboard');
      }, 700);
    } catch (err) {
      navigate('/app/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/10 blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
        <BrandLogo size="md" />
        <div className="text-xs font-mono text-slate-400">
          Step <span className="text-indigo-400 font-bold">{currentStep}</span> of {totalSteps}
        </div>
      </div>

      {/* Main card */}
      <div className="max-w-2xl mx-auto w-full my-8">
        {/* Progress bar */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-8 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Screen 1: Welcome */}
        {currentStep === 1 && (
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-cyan-300 mx-auto mb-6 shadow-lg shadow-indigo-600/10">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
              Welcome to Coding Task Factory, {user?.full_name || 'Developer'}!
            </h2>
            <p className="text-slate-300 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              We personalize your challenges, algorithmic roadmaps, and IDE defaults based on your background and coding aspirations.
            </p>
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              Let's Personalize Your Workspace
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Screen 2: Role */}
        {currentStep === 2 && (
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Select Your Primary Role</h2>
            <p className="text-xs text-slate-400 mb-6">
              This helps us optimize dashboard metrics and assessment features for your day-to-day workflow.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`p-4 rounded-2xl text-left border transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-950/50'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{r.label}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 3: Experience */}
        {currentStep === 3 && (
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Select Your Programming Experience</h2>
            <p className="text-xs text-slate-400 mb-6">
              We'll calibrate AI problem complexity and starter code hints to match your level.
            </p>
            <div className="space-y-3 mb-8">
              {experienceLevels.map((lvl) => {
                const isSelected = experience === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setExperience(lvl.id)}
                    className={`w-full p-4 rounded-2xl text-left border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-950/50'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{lvl.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{lvl.desc}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(2)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 4: Languages */}
        {currentStep === 4 && (
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Choose Programming Languages</h2>
            <p className="text-xs text-slate-400 mb-6">
              Select one or more languages you want to code in (you can change this at any time).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {languagesList.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`p-3.5 rounded-xl text-center font-mono font-medium text-xs border transition ${
                      isSelected
                        ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(3)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 5: Goals */}
        {currentStep === 5 && (
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">What Are Your Core Goals?</h2>
            <p className="text-xs text-slate-400 mb-6">
              Pick the key objectives you want to achieve with Coding Task Factory.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {goalsList.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-3.5 rounded-xl text-left border text-xs font-medium transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{goal}</span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(4)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Rocket className="w-4 h-4 text-cyan-300" />
                    Launch My Workspace
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-500 font-mono">
        You can always reconfigure your preferences inside Platform Settings.
      </div>
    </div>
  );
};
