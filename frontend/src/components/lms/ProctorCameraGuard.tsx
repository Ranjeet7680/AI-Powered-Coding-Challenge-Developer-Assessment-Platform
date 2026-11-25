import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Eye,
  Maximize2,
  ShieldAlert,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { MLViolationEvent } from '../../types';

interface DetectedFace {
  boundingBox: DOMRectReadOnly;
}

interface FaceDetectorInstance {
  detect: (image: HTMLVideoElement | HTMLCanvasElement) => Promise<DetectedFace[]>;
}

interface FaceDetectorConstructor {
  new (options?: { fastMode?: boolean; maxDetectedFaces?: number }): FaceDetectorInstance;
}

interface WindowWithFaceDetector extends Window {
  FaceDetector?: FaceDetectorConstructor;
}

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'disconnected';

interface ProctorCameraGuardProps {
  active: boolean;
  maxViolations?: number;
  violationsCount: number;
  violationLog: MLViolationEvent[];
  onCameraReadyChange: (ready: boolean) => void;
  onViolation: (event: MLViolationEvent) => void;
  onMaxViolationsReached: () => void;
}

export const ProctorCameraGuard: React.FC<ProctorCameraGuardProps> = ({
  active,
  maxViolations = 3,
  violationsCount,
  violationLog,
  onCameraReadyChange,
  onViolation,
  onMaxViolationsReached,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceDetectorRef = useRef<FaceDetectorInstance | null>(null);

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [cameraError, setCameraError] = useState<string>('');
  const [luminance, setLuminance] = useState<number>(0);
  const [faceCount, setFaceCount] = useState<number | null>(null);
  const [detectorMode, setDetectorMode] = useState<'face-ai' | 'frame-luma'>('frame-luma');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Refs for fresh state inside interval/event callbacks
  const activeRef = useRef(active);
  const violationsCountRef = useRef(violationsCount);
  const onViolationRef = useRef(onViolation);
  const onMaxViolationsRef = useRef(onMaxViolationsReached);
  const onCameraReadyRef = useRef(onCameraReadyChange);
  const wasFullscreenRef = useRef(false);
  const lastStrikeByCategoryRef = useRef<Record<string, number>>({});
  const darkStreakRef = useRef(0);
  const missingFaceStreakRef = useRef(0);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    violationsCountRef.current = violationsCount;
  }, [violationsCount]);

  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  useEffect(() => {
    onMaxViolationsRef.current = onMaxViolationsReached;
  }, [onMaxViolationsReached]);

  useEffect(() => {
    onCameraReadyRef.current = onCameraReadyChange;
  }, [onCameraReadyChange]);

  const recordStrike = useCallback(
    (type: string, detail: string, dedupeCategory?: string) => {
      if (!activeRef.current) return;
      if (violationsCountRef.current >= maxViolations) return;

      const nowMs = Date.now();
      const key = dedupeCategory || type;
      const lastMs = lastStrikeByCategoryRef.current[key] || 0;
      if (nowMs - lastMs < 2500) {
        return;
      }
      lastStrikeByCategoryRef.current[key] = nowMs;

      const nextCount = violationsCountRef.current + 1;
      const event: MLViolationEvent = {
        timestamp: new Date().toISOString(),
        type,
        detail,
      };
      onViolationRef.current(event);

      if (nextCount >= maxViolations) {
        onMaxViolationsRef.current();
      }
    },
    [maxViolations]
  );

  const stopCameraTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    onCameraReadyRef.current(false);
    setCameraStatus('idle');
    setLuminance(0);
    setFaceCount(null);
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('denied');
      setCameraError(
        'Webcam API (MediaDevices) requires HTTPS or localhost. Allow camera access in a modern browser to start.'
      );
      onCameraReadyRef.current(false);
      return;
    }

    setCameraStatus('requesting');
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 360 },
        },
        audio: false,
      });

      // Clean up any previous stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Initialize optional browser FaceDetector API when available
      const win = window as WindowWithFaceDetector;
      if (win.FaceDetector && !faceDetectorRef.current) {
        try {
          faceDetectorRef.current = new win.FaceDetector({
            fastMode: true,
            maxDetectedFaces: 4,
          });
          setDetectorMode('face-ai');
        } catch {
          setDetectorMode('frame-luma');
        }
      }

      const [videoTrack] = stream.getVideoTracks();
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          setCameraStatus('disconnected');
          onCameraReadyRef.current(false);
          if (activeRef.current) {
            recordStrike(
              'CAMERA_DISCONNECTED',
              'Webcam feed was turned off or unplugged during the proctored exam.',
              'camera'
            );
          }
        });
      }

      darkStreakRef.current = 0;
      missingFaceStreakRef.current = 0;
      setCameraStatus('active');
      onCameraReadyRef.current(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Camera permission denied or no webcam device detected.';
      setCameraStatus('denied');
      setCameraError(msg);
      onCameraReadyRef.current(false);
    }
  }, [recordStrike]);

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        wasFullscreenRef.current = true;
        setIsFullscreen(true);
      }
    } catch {
      // Fullscreen request can fail silently in embedded previews; proctoring continues via focus/visibility guards
    }
  }, []);

  // Ensure hardware tracks stop on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (document.fullscreenElement && wasFullscreenRef.current) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  // Live 2-second frame luminance, obstruction & optional FaceDetector analysis
  useEffect(() => {
    if (cameraStatus !== 'active') return;

    const interval = window.setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) {
        return;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = 160;
      canvas.height = 90;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const sample: number[] = [];
      let sum = 0;
      for (let i = 0; i < frame.length; i += 16) {
        const luma = 0.299 * frame[i] + 0.587 * frame[i + 1] + 0.114 * frame[i + 2];
        sample.push(luma);
        sum += luma;
      }

      const mean = sum / Math.max(1, sample.length);
      let sqDiff = 0;
      for (let i = 0; i < sample.length; i++) {
        const diff = sample[i] - mean;
        sqDiff += diff * diff;
      }
      const stdDev = Math.sqrt(sqDiff / Math.max(1, sample.length));

      const roundedMean = Math.round(mean);
      setLuminance(roundedMean);

      // Obstruction check (covered lens or black frame)
      const isCovered = (roundedMean < 10 && stdDev < 5) || stdDev < 2.2;
      if (isCovered) {
        darkStreakRef.current += 1;
        if (activeRef.current && darkStreakRef.current >= 2) {
          recordStrike(
            'CAMERA_OBSTRUCTED',
            `Camera frame appears covered or blank (luminance=${roundedMean}, detail=${stdDev.toFixed(1)}).`,
            'camera'
          );
          darkStreakRef.current = 0;
        }
      } else {
        darkStreakRef.current = 0;
      }

      // Optional Chromium FaceDetector check
      if (faceDetectorRef.current) {
        try {
          const faces = await faceDetectorRef.current.detect(video);
          setFaceCount(faces.length);
          if (activeRef.current) {
            if (faces.length === 0) {
              missingFaceStreakRef.current += 1;
              if (missingFaceStreakRef.current >= 2) {
                recordStrike(
                  'NO_FACE_DETECTED',
                  'No candidate face detected in front of webcam for consecutive frames.',
                  'face-absence'
                );
                missingFaceStreakRef.current = 0;
              }
            } else if (faces.length > 1) {
              missingFaceStreakRef.current = 0;
              recordStrike(
                'MULTIPLE_FACES',
                `${faces.length} faces detected on camera during single-candidate proctored exam.`,
                'multi-face'
              );
            } else {
              missingFaceStreakRef.current = 0;
            }
          }
        } catch {
          // Graceful fallback if FaceDetector runtime errors on a frame
          setFaceCount(null);
        }
      }
    }, 2000);

    return () => window.clearInterval(interval);
  }, [cameraStatus, recordStrike]);

  // Browser Anti-Cheat Listeners while exam is active
  useEffect(() => {
    if (!active) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordStrike(
          'TAB_SWITCH',
          'Switched away from the exam browser tab or minimized the window.',
          'focus-loss'
        );
      }
    };

    const handleBlur = () => {
      recordStrike(
        'WINDOW_BLUR',
        'Exam window lost focus to another application or external dialog.',
        'focus-loss'
      );
    };

    const handleFullscreenChange = () => {
      const fsActive = Boolean(document.fullscreenElement);
      setIsFullscreen(fsActive);
      if (fsActive) {
        wasFullscreenRef.current = true;
      } else if (wasFullscreenRef.current) {
        recordStrike(
          'FULLSCREEN_EXIT',
          'Exited fullscreen mode during the proctored exam.',
          'fullscreen'
        );
      }
    };

    const handleCopyOrPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordStrike(
        'CLIPBOARD_BLOCKED',
        `Blocked ${e.type} attempt inside the proctored exam.`,
        'clipboard'
      );
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordStrike(
        'CONTEXT_MENU',
        'Blocked right-click context menu during proctored exam.',
        'context'
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isDevTools =
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        ((e.ctrlKey || e.metaKey) && ['u', 'c', 'v', 'x'].includes(key));
      const isPrintScreen = e.key === 'PrintScreen';

      if (isDevTools || isPrintScreen) {
        e.preventDefault();
        recordStrike(
          'PROHIBITED_SHORTCUT',
          `Blocked restricted key combination (${e.key}) during proctored exam.`,
          'shortcut'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopyOrPaste);
    document.addEventListener('cut', handleCopyOrPaste);
    document.addEventListener('paste', handleCopyOrPaste);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopyOrPaste);
      document.removeEventListener('cut', handleCopyOrPaste);
      document.removeEventListener('paste', handleCopyOrPaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, recordStrike]);

  const strikeRatio = Math.min(violationsCount, maxViolations);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
      {/* Header Status */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/60">
        <div className="flex items-center gap-2">
          {cameraStatus === 'active' ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          ) : (
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            AI Camera Proctor Guard
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            strikeRatio === 0
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : strikeRatio < maxViolations
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
          }`}
        >
          Strikes: {strikeRatio}/{maxViolations}
        </span>
      </div>

      {/* Live Video Preview (Always mounted so srcObject binds reliably) */}
      <div className="p-3 space-y-3">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover scale-x-[-1] ${
              cameraStatus === 'active' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
          <canvas ref={canvasRef} className="hidden" />

          {cameraStatus !== 'active' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              {cameraStatus === 'denied' || cameraStatus === 'disconnected' ? (
                <>
                  <CameraOff className="w-8 h-8 text-rose-400 mb-2" />
                  <p className="text-xs font-semibold text-rose-300">
                    {cameraStatus === 'disconnected' ? 'Webcam Disconnected' : 'Camera Access Blocked'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[230px] leading-relaxed">
                    {cameraError || 'Allow browser camera access to unlock the final exam.'}
                  </p>
                </>
              ) : (
                <>
                  <Video className="w-8 h-8 text-indigo-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-200">Webcam Verification Required</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
                    100% local privacy check — no video frames are ever uploaded.
                  </p>
                </>
              )}
            </div>
          )}

          {cameraStatus === 'active' && (
            <>
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5 backdrop-blur">
                <Eye className="w-3 h-3" />
                {active ? 'PROCTORING LIVE' : 'CAM READY'}
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-slate-200 bg-slate-950/75 px-2 py-1 rounded border border-slate-800/80 backdrop-blur">
                <span>
                  {detectorMode === 'face-ai' && faceCount !== null
                    ? faceCount === 1
                      ? 'Face: Verified (1)'
                      : faceCount === 0
                      ? 'Face: Not Detected!'
                      : `Multiple Faces (${faceCount})!`
                    : 'Luma Frame Guard'}
                </span>
                <span>Luma {luminance}</span>
              </div>
            </>
          )}
        </div>

        {/* Camera / Fullscreen Actions */}
        <div className="flex flex-wrap gap-2">
          {cameraStatus !== 'active' ? (
            <button
              type="button"
              onClick={startCamera}
              disabled={cameraStatus === 'requesting'}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20"
            >
              <Camera className="w-3.5 h-3.5" />
              {cameraStatus === 'requesting' ? 'Requesting Camera...' : 'Enable Webcam Guard'}
            </button>
          ) : (
            <>
              {!active && (
                <button
                  type="button"
                  onClick={stopCameraTracks}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
                >
                  Turn Off
                </button>
              )}
              {!isFullscreen && (
                <button
                  type="button"
                  onClick={enterFullscreen}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  Lock Fullscreen
                </button>
              )}
            </>
          )}
        </div>

        {/* Active Cheat Rules Checklist */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3 space-y-1.5 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-200 font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Enforced Anti-Cheat Signals
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            Live camera lens obstruction & presence check
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            Tab switch, window blur & fullscreen exit lock
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            Copy/paste, right-click & DevTools blocking
          </div>
        </div>

        {/* Violation Audit Log */}
        {violationLog.length > 0 && (
          <div className="rounded-xl bg-rose-950/25 border border-rose-500/30 p-3 space-y-1.5 max-h-40 overflow-y-auto">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-300 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              Proctoring Audit Log ({violationLog.length})
            </div>
            {violationLog
              .slice()
              .reverse()
              .map((ev, idx) => (
                <div
                  key={`${ev.timestamp}-${idx}`}
                  className="text-[11px] text-rose-200/90 border-l-2 border-rose-500/60 pl-2 py-0.5"
                >
                  <span className="font-mono font-bold text-rose-300">{ev.type}</span>
                  <span className="text-rose-200/70"> — {ev.detail}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
