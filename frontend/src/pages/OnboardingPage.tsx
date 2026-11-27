import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../context/useContexts';
import { BrandLogo } from '../components/common/BrandLogo';
import { Footer } from '../components/layout/Footer';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Code2,
  BookOpen,
  Briefcase,
  Check,
  Terminal,
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
  const { showToast } = useToast();
  const navigate = useNavigate();

  const totalSteps = 5;

  const roles = [
    { id: 'Student', label: 'Student', desc: 'Enrolled in college or learning independently', icon: GraduationCap },
    { id: 'Developer', label: 'Developer', desc: 'Software engineer building applications and systems', icon: Code2 },
    { id: 'Educator', label: 'Educator', desc: 'Instructor, lecturer, or bootcamp mentor', icon: BookOpen },
    { id: 'Recruiter', label: 'Recruiter', desc: 'Technical hiring manager or interviewer', icon: Briefcase },
  ];

  const experienceLevels = [
    { id: 'Beginner', label: 'Beginner', desc: '< 1 year · data types, loops, and basic syntax' },
    { id: 'Intermediate', label: 'Intermediate', desc: '1–3 years · data structures and OOP' },
    { id: 'Advanced', label: 'Advanced', desc: '3–6 years · algorithmic patterns and performance' },
    { id: 'Expert', label: 'Expert', desc: '6+ years · systems architecture and optimization' },
  ];

  const languagesList = ['Python', 'JavaScript', 'TypeScript', 'C++', 'Java', 'C', 'Go', 'Rust'];

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

      try {
        confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
      } catch {
        // Confetti is optional
      }

      showToast('Workspace preferences saved.', 'success');
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 450);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not save preferences.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141415] flex flex-col justify-between p-6 sm:p-10 text-[#ededed]">
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
        <BrandLogo size="md" />
        <div className="text-xs font-mono text-[#85858b] tabular-nums">
          Step <span className="text-[#ededed]">{currentStep}</span> of {totalSteps}
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full my-8">
        <div className="w-full bg-[#19191b] h-1 rounded-full overflow-hidden mb-8 border border-white/[0.08]">
          <div
            className="h-full bg-[#e5a00d] transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {currentStep === 1 && (
          <div className="p-8 sm:p-10 rounded-2xl bg-[#19191b] border border-white/[0.1] text-center">
            <div className="w-12 h-12 rounded-xl bg-[#222225] border border-white/[0.08] flex items-center justify-center text-[#a1a1a6] mx-auto mb-6">
              <Terminal strokeWidth={1.5} className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#ededed] mb-3">
              Configure your workbench, {user?.full_name || 'Developer'}
            </h1>
            <p className="text-[#85858b] text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Set your role, experience level, default languages, and focus areas to tailor your dashboard recommendations.
            </p>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-5 h-10 rounded-lg text-sm font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors"
            >
              <span>Continue</span>
              <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="p-8 sm:p-10 rounded-2xl bg-[#19191b] border border-white/[0.1]">
            <h2 className="text-xl font-medium text-[#ededed] mb-1.5">Select your primary role</h2>
            <p className="text-xs text-[#85858b] mb-6">
              Tailors challenge and assessment views to your workflow.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-4 rounded-xl text-left border transition-colors flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#222225] border-[#e5a00d]/60'
                        : 'bg-[#141415] border-white/[0.08] hover:border-white/[0.14]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon strokeWidth={1.5} className={`w-4 h-4 ${isSelected ? 'text-[#e5a00d]' : 'text-[#85858b]'}`} />
                      {isSelected && <Check strokeWidth={1.5} className="w-4 h-4 text-[#e5a00d]" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#ededed]">{r.label}</p>
                      <p className="text-xs text-[#85858b] mt-1">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs text-[#85858b] hover:text-[#ededed] flex items-center gap-1.5"
              >
                <ArrowLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 h-9 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white flex items-center gap-2 transition-colors"
              >
                <span>Next</span>
                <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="p-8 sm:p-10 rounded-2xl bg-[#19191b] border border-white/[0.1]">
            <h2 className="text-xl font-medium text-[#ededed] mb-1.5">Experience level</h2>
            <p className="text-xs text-[#85858b] mb-6">
              Calibrates default challenge tiers and starter scaffolding.
            </p>
            <div className="space-y-2.5 mb-8">
              {experienceLevels.map((lvl) => {
                const isSelected = experience === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setExperience(lvl.id)}
                    className={`w-full p-4 rounded-xl text-left border transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#222225] border-[#e5a00d]/60'
                        : 'bg-[#141415] border-white/[0.08] hover:border-white/[0.14]'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-[#ededed]">{lvl.label}</p>
                      <p className="text-xs text-[#85858b] mt-0.5">{lvl.desc}</p>
                    </div>
                    {isSelected && <Check strokeWidth={1.5} className="w-4 h-4 text-[#e5a00d] shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs text-[#85858b] hover:text-[#ededed] flex items-center gap-1.5"
              >
                <ArrowLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-4 h-9 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white flex items-center gap-2 transition-colors"
              >
                <span>Next</span>
                <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="p-8 sm:p-10 rounded-2xl bg-[#19191b] border border-white/[0.1]">
            <h2 className="text-xl font-medium text-[#ededed] mb-1.5">Preferred languages</h2>
            <p className="text-xs text-[#85858b] mb-6">
              Select the languages you write most often.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
              {languagesList.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`p-3 rounded-lg text-center font-mono text-xs border transition-colors ${
                      isSelected
                        ? 'bg-[#222225] border-[#e5a00d]/60 text-[#ededed]'
                        : 'bg-[#141415] border-white/[0.08] text-[#85858b] hover:text-[#ededed]'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="text-xs text-[#85858b] hover:text-[#ededed] flex items-center gap-1.5"
              >
                <ArrowLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-4 h-9 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white flex items-center gap-2 transition-colors"
              >
                <span>Next</span>
                <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="p-8 sm:p-10 rounded-2xl bg-[#19191b] border border-white/[0.1]">
            <h2 className="text-xl font-medium text-[#ededed] mb-1.5">Primary goals</h2>
            <p className="text-xs text-[#85858b] mb-6">
              Choose what you want to prioritize in your workspace.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
              {goalsList.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`p-3.5 rounded-lg text-left border text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#222225] border-[#e5a00d]/60 text-[#ededed]'
                        : 'bg-[#141415] border-white/[0.08] text-[#85858b] hover:text-[#ededed]'
                    }`}
                  >
                    <span>{goal}</span>
                    {isSelected && <Check strokeWidth={1.5} className="w-4 h-4 text-[#e5a00d] shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="text-xs text-[#85858b] hover:text-[#ededed] flex items-center gap-1.5"
              >
                <ArrowLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="px-5 h-9 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-[#141415]/30 border-t-[#141415] rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Open workspace</span>
                    <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-2xl w-full mx-auto space-y-4">
        <div className="text-center text-xs text-[#85858b] font-mono">
          You can adjust these preferences anytime in Settings.
        </div>
        <Footer compact />
      </div>
    </div>
  );
};
