import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from './BrandLogo';
import { Code2, Cpu, ShieldCheck, Sparkles } from 'lucide-react';

interface BootSplashPreloaderProps {
  visible: boolean;
  onComplete: () => void;
}

const BOOT_STEPS = [
  'Initializing Code Sandbox Runtime...',
  'Calibrating MediaPipe Anti-Cheat Vision...',
  'Loading 368+ Challenges & 596 Lectures...',
  'Workspace Ready',
];

export const BootSplashPreloader: React.FC<BootSplashPreloaderProps> = ({
  visible,
  onComplete,
}) => {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const t1 = window.setTimeout(() => setStepIdx(1), 220);
    const t2 = window.setTimeout(() => setStepIdx(2), 450);
    const t3 = window.setTimeout(() => setStepIdx(3), 680);
    const done = window.setTimeout(() => onComplete(), 880);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(done);
    };
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="ctf-boot-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] bg-[#05070E] flex flex-col items-center justify-center p-6 overflow-hidden select-none"
        >
          {/* Animated Ambient Cyber Grid & Auroras */}
          <div className="absolute inset-0 bg-grid-pattern opacity-35 pointer-events-none" />
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[380px] h-[380px] sm:w-[540px] sm:h-[540px] rounded-full bg-gradient-to-tr from-indigo-600/25 via-violet-500/20 to-cyan-500/20 blur-[110px] pointer-events-none"
          />

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 w-full max-w-sm flex flex-col items-center text-center space-y-6"
          >
            {/* Pulsing Orbital Emblem + Logo */}
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute w-24 h-24 rounded-full border border-dashed border-indigo-500/40"
              />
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="p-4 rounded-3xl bg-[#0A0F1D]/90 border border-indigo-500/40 shadow-2xl shadow-indigo-500/25"
              >
                <BrandLogo iconOnly size="lg" />
              </motion.div>
            </div>

            <div className="space-y-1.5">
              <div className="text-lg sm:text-xl font-black tracking-tight text-white">
                Coding Task Factory
              </div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-300 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                AI Engineering &amp; LMS Studio
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full space-y-2.5">
              <div className="h-1.5 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: '8%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-violet-400 to-cyan-400 rounded-full"
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-300 min-h-[20px]">
                {stepIdx === 0 && <Code2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />}
                {stepIdx === 1 && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
                {stepIdx >= 2 && <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
                <span>{BOOT_STEPS[stepIdx]}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onComplete}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition pt-1"
            >
              Skip intro →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const PageLoader: React.FC = () => (
  <div className="min-h-dvh bg-[#05070E] flex items-center justify-center p-6">
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center gap-4 text-center"
    >
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
        <Sparkles className="w-4 h-4 text-cyan-300 absolute animate-pulse" />
      </div>
      <div className="space-y-1">
        <span className="text-xs font-mono text-slate-300 block">Loading Studio Workspace...</span>
        <span className="text-[10px] font-mono text-slate-500 block">Preparing interactive view</span>
      </div>
    </motion.div>
  </div>
);
