import React from 'react';

interface BootSplashPreloaderProps {
  visible: boolean;
  onComplete: () => void;
}

export const BootSplashPreloader: React.FC<BootSplashPreloaderProps> = ({
  visible,
  onComplete,
}) => {
  if (!visible) return null;
  onComplete();
  return null;
};

export const PageLoader: React.FC = () => (
  <div className="min-h-dvh bg-[#141415] flex items-center justify-center p-6">
    <div className="flex items-center gap-3 text-xs font-mono text-[#a1a1a6]">
      <span className="w-4 h-4 rounded-full border-2 border-[#ededed]/15 border-t-[#ededed] animate-spin" />
      <span>Loading workspace</span>
    </div>
  </div>
);
