import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Cpu,
  Eye,
  Maximize2,
  ShieldAlert,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { MLViolationEvent } from '../../types';
import {
  analyzeProctorFrame,
  ensureProctorVisionReady,
  ProctorFrameAnalysis,
} from './proctorVision';

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'disconnected';

export interface ProctorIntegrityState {
  status: 'ok' | 'warning' | 'critical';
  headline: string;
  reason: string;
  engineMode: ProctorFrameAnalysis['engineMode'] | 'initializing';
  faceCount: number | null;
  detectedObjects: string[];
}

interface ProctorCameraGuardProps {
  active: boolean;
  maxViolations?: number;
  violationsCount: number;
  violationLog: MLViolationEvent[];
  onCameraReadyChange: (ready: boolean) => void;
  onIntegrityStateChange?: (state: ProctorIntegrityState) => void;
  onViolation: (event: MLViolationEvent) => void;
  onMaxViolationsReached: () => void;
}

function playAlertTone(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.19);
    window.setTimeout(() => ctx.close().catch(() => {}), 260);
  } catch {
    // Audio playback optional
  }
}

function drawVisionOverlay(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  analysis: ProctorFrameAnalysis
): void {
  const w = video.videoWidth || 640;
  const h = video.videoHeight || 360;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);

  // Draw face boxes mirrored horizontally to match scale-x-[-1] video element while keeping text readable
  for (const face of analysis.faces) {
    const mirroredX = w - (face.x + face.width);
    const isWarn = analysis.faces.length > 1 || face.gazeDirection === 'away';
    const color = isWarn ? '#fbbf24' : '#34d399';

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(mirroredX, face.y, face.width, face.height);

    const tag =
      analysis.faces.length > 1
        ? 'MULTI-FACE'
        : face.gazeDirection === 'away'
        ? 'GAZE AWAY'
        : `VERIFIED · ${Math.round(face.confidence * 100)}%`;

    ctx.font = 'bold 13px ui-monospace, SFMono-Regular, monospace';
    const padW = ctx.measureText(tag).width + 12;
    ctx.fillStyle = isWarn ? 'rgba(180, 83, 9, 0.88)' : 'rgba(6, 78, 59, 0.88)';
    ctx.fillRect(mirroredX, Math.max(4, face.y - 24), padW, 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(tag, mirroredX + 6, Math.max(18, face.y - 9));

    // Facial keypoints
    ctx.fillStyle = color;
    for (const kp of face.keypoints.slice(0, 4)) {
      const kpx = w - kp.x * w;
      const kpy = kp.y * h;
      ctx.beginPath();
      ctx.arc(kpx, kpy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Highlight any prohibited objects (cell phone, book, laptop)
  for (const obj of analysis.prohibitedObjects) {
    const mirroredX = w - (obj.x + obj.width);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 4;
    ctx.strokeRect(mirroredX, obj.y, obj.width, obj.height);

    const label = `PROHIBITED: ${obj.label.toUpperCase()} (${Math.round(obj.score * 100)}%)`;
    ctx.font = 'bold 13px ui-monospace, SFMono-Regular, monospace';
    const padW = ctx.measureText(label).width + 12;
    ctx.fillStyle = 'rgba(190, 18, 60, 0.92)';
    ctx.fillRect(mirroredX, Math.max(4, obj.y - 24), padW, 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, mirroredX + 6, Math.max(18, obj.y - 9));
  }
}

export const ProctorCameraGuard: React.FC<ProctorCameraGuardProps> = ({
  active,
  maxViolations = 3,
  violationsCount,
  violationLog,
  onCameraReadyChange,
  onIntegrityStateChange,
  onViolation,
  onMaxViolationsReached,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const prevLumaRef = useRef<Float32Array | null>(null);

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [cameraError, setCameraError] = useState<string>('');
  const [luminance, setLuminance] = useState<number>(0);
  const [faceCount, setFaceCount] = useState<number | null>(null);
  const [engineMode, setEngineMode] = useState<ProctorIntegrityState['engineMode']>('initializing');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [liveIntegrity, setLiveIntegrity] = useState<ProctorIntegrityState>({
    status: 'ok',
    headline: 'Awaiting Webcam',
    reason: '',
    engineMode: 'initializing',
    faceCount: null,
    detectedObjects: [],
  });

  // Fresh refs inside intervals/event handlers
  const activeRef = useRef(active);
  const violationsCountRef = useRef(violationsCount);
  const onViolationRef = useRef(onViolation);
  const onMaxViolationsRef = useRef(onMaxViolationsReached);
  const onCameraReadyRef = useRef(onCameraReadyChange);
  const onIntegrityRef = useRef(onIntegrityStateChange);
  const wasFullscreenRef = useRef(false);
  const lastStrikeByCategoryRef = useRef<Record<string, number>>({});

  // Consecutive frame anomaly counters
  const darkStreakRef = useRef(0);
  const missingFaceStreakRef = useRef(0);
  const multiFaceStreakRef = useRef(0);
  const objectStreakRef = useRef(0);
  const gazeAwayStreakRef = useRef(0);
  const frozenStreakRef = useRef(0);

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

  useEffect(() => {
    onIntegrityRef.current = onIntegrityStateChange;
  }, [onIntegrityStateChange]);

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

      playAlertTone();
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
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    onCameraReadyRef.current(false);
    setCameraStatus('idle');
    setLuminance(0);
    setFaceCount(null);
    const resetState: ProctorIntegrityState = {
      status: 'ok',
      headline: 'Camera Off',
      reason: '',
      engineMode: 'initializing',
      faceCount: null,
      detectedObjects: [],
    };
    setLiveIntegrity(resetState);
    onIntegrityRef.current?.(resetState);
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
      const visionPromise = ensureProctorVisionReady();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 360 },
        },
        audio: false,
      });

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      const mode = await visionPromise;
      setEngineMode(mode);

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
      multiFaceStreakRef.current = 0;
      objectStreakRef.current = 0;
      gazeAwayStreakRef.current = 0;
      frozenStreakRef.current = 0;
      prevLumaRef.current = null;
      setCameraStatus('active');
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
      // Fullscreen optional inside constrained embeds
    }
  }, []);

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

  // Fast 700ms MediaPipe BlazeFace + EfficientDet Object + Skin/Luminance loop
  useEffect(() => {
    if (cameraStatus !== 'active') return;
    let cancelled = false;
    let inFlight = false;

    const runCheck = async () => {
      if (cancelled || inFlight) return;
      const video = videoRef.current;
      const canvas = analysisCanvasRef.current;
      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) return;

      inFlight = true;
      try {
        const { result, nextLumaSample } = await analyzeProctorFrame(
          video,
          canvas,
          prevLumaRef.current
        );
        if (cancelled) return;
        prevLumaRef.current = nextLumaSample;

        setEngineMode(result.engineMode);
        setLuminance(result.luminance);
        setFaceCount(result.faces.length);

        if (overlayCanvasRef.current) {
          drawVisionOverlay(overlayCanvasRef.current, video, result);
        }

        const totalPeople = Math.max(result.faces.length, result.personCountFromObjects);
        const objLabels = result.prohibitedObjects.map((o) => o.label);

        let nextIntegrity: ProctorIntegrityState = {
          status: 'ok',
          headline: 'Candidate Face Verified',
          reason: 'Single centered face detected with clear view.',
          engineMode: result.engineMode,
          faceCount: result.faces.length,
          detectedObjects: objLabels,
        };

        // 1. Prohibited objects check (cell phone, book, second laptop)
        if (result.prohibitedObjects.length > 0) {
          objectStreakRef.current += 1;
          const primaryObj = result.prohibitedObjects[0];
          nextIntegrity = {
            status: 'critical',
            headline: `Prohibited Device Detected (${primaryObj.label.toUpperCase()})`,
            reason: `AI Object Guard spotted "${primaryObj.label}" (${Math.round(primaryObj.score * 100)}%) in frame. Remove it immediately.`,
            engineMode: result.engineMode,
            faceCount: result.faces.length,
            detectedObjects: objLabels,
          };
          if (activeRef.current && objectStreakRef.current >= 2) {
            recordStrike(
              'PROHIBITED_OBJECT',
              `AI Object Guard detected prohibited item (${primaryObj.label}) during proctored exam.`,
              'prohibited-object'
            );
            objectStreakRef.current = 0;
          }
        } else {
          objectStreakRef.current = 0;
        }

        // 2. Covered lens / blank frame
        if (result.isCovered) {
          darkStreakRef.current += 1;
          nextIntegrity = {
            status: 'critical',
            headline: 'Camera Lens Covered / Blank',
            reason: `Camera frame obstructed (Luma ${result.luminance}). Uncover your webcam.`,
            engineMode: result.engineMode,
            faceCount: 0,
            detectedObjects: objLabels,
          };
          if (activeRef.current && darkStreakRef.current >= 2) {
            recordStrike(
              'CAMERA_OBSTRUCTED',
              `Camera frame covered or blank (luminance=${result.luminance}, detail=${result.stdDev.toFixed(1)}).`,
              'camera'
            );
            darkStreakRef.current = 0;
          }
        } else {
          darkStreakRef.current = 0;
        }

        // 3. Multiple faces or extra person in frame
        if (totalPeople > 1 && !result.isCovered) {
          multiFaceStreakRef.current += 1;
          nextIntegrity = {
            status: 'critical',
            headline: `Multiple People Detected (${totalPeople})`,
            reason: 'Only the registered exam candidate may be present in view.',
            engineMode: result.engineMode,
            faceCount: result.faces.length,
            detectedObjects: objLabels,
          };
          if (activeRef.current && multiFaceStreakRef.current >= 2) {
            recordStrike(
              'MULTIPLE_FACES',
              `${totalPeople} people/faces detected on camera during single-candidate exam.`,
              'multi-face'
            );
            multiFaceStreakRef.current = 0;
          }
        } else {
          multiFaceStreakRef.current = 0;
        }

        // 4. Face missing / occluded (catches holding phone/paper over face too!)
        if (result.faces.length === 0 && !result.isCovered) {
          missingFaceStreakRef.current += 1;
          if (nextIntegrity.status === 'ok') {
            nextIntegrity = {
              status: 'critical',
              headline: 'Face Not Visible or Occluded',
              reason:
                'Keep your full uncovered face centered in view (phones/hands obscuring face are flagged).',
              engineMode: result.engineMode,
              faceCount: 0,
              detectedObjects: objLabels,
            };
          }
          if (activeRef.current && missingFaceStreakRef.current >= 2) {
            recordStrike(
              'FACE_OCCLUDED_OR_MISSING',
              'Candidate face disappeared or was obscured (e.g. phone/object blocking face).',
              'face-absence'
            );
            missingFaceStreakRef.current = 0;
          }
        } else {
          missingFaceStreakRef.current = 0;
        }

        // 5. Sharp gaze / head turn away from screen
        if (result.gazeAway && nextIntegrity.status === 'ok') {
          gazeAwayStreakRef.current += 1;
          nextIntegrity = {
            status: 'warning',
            headline: 'Looking Away From Screen',
            reason: 'Keep eyes centered on the exam window; sustained sideways/downward gaze triggers a strike.',
            engineMode: result.engineMode,
            faceCount: result.faces.length,
            detectedObjects: objLabels,
          };
          if (activeRef.current && gazeAwayStreakRef.current >= 4) {
            recordStrike(
              'GAZE_LOOKING_AWAY',
              'Sustained head turn / looking away from screen detected by facial keypoint tracking.',
              'gaze'
            );
            gazeAwayStreakRef.current = 0;
          }
        } else if (!result.gazeAway) {
          gazeAwayStreakRef.current = 0;
        }

        // 6. Static frozen photo / spoofing loop check
        if (result.isFrozenFrame && activeRef.current) {
          frozenStreakRef.current += 1;
          if (frozenStreakRef.current >= 8) {
            recordStrike(
              'FROZEN_CAMERA_FEED',
              'Webcam feed appears frozen or displaying a static still photograph.',
              'spoof'
            );
            frozenStreakRef.current = 0;
          }
        } else {
          frozenStreakRef.current = 0;
        }

        setLiveIntegrity(nextIntegrity);
        onIntegrityRef.current?.(nextIntegrity);

        // Pre-flight unlock requires live verified single uncovered face & no prohibited objects
        const readyForExam =
          result.faces.length === 1 &&
          totalPeople <= 1 &&
          result.prohibitedObjects.length === 0 &&
          !result.isCovered;
        onCameraReadyRef.current(activeRef.current ? true : readyForExam);
      } finally {
        inFlight = false;
      }
    };

    const interval = window.setInterval(runCheck, active ? 700 : 850);
    runCheck();
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [cameraStatus, active, recordStrike]);

  // Browser, Split-Screen & DevTools Anti-Cheat Listeners while exam is active
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

    const handleCopyOrPaste = (e: ClipboardEvent | DragEvent) => {
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
      const isProhibited =
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        ((e.ctrlKey || e.metaKey) && ['u', 'c', 'v', 'x', 'p', 's', 'f'].includes(key)) ||
        e.key === 'PrintScreen';

      if (isProhibited) {
        e.preventDefault();
        recordStrike(
          'PROHIBITED_SHORTCUT',
          `Blocked restricted key combination (${e.key}) during proctored exam.`,
          'shortcut'
        );
      }
    };

    const checkWindowGeometry = () => {
      const widthRatio = window.innerWidth / Math.max(window.screen.availWidth, 1);
      if (window.screen.availWidth >= 900 && widthRatio < 0.72) {
        recordStrike(
          'SPLIT_SCREEN_DETECTED',
          `Browser resized to ${Math.round(widthRatio * 100)}% screen width (split-screen prohibited).`,
          'split-screen'
        );
      }
      if (window.outerWidth - window.innerWidth > 220 || window.outerHeight - window.innerHeight > 220) {
        recordStrike(
          'DEVTOOLS_DETECTED',
          'Docked browser developer tools viewport anomaly detected.',
          'devtools'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopyOrPaste);
    document.addEventListener('cut', handleCopyOrPaste);
    document.addEventListener('paste', handleCopyOrPaste);
    document.addEventListener('drop', handleCopyOrPaste);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', checkWindowGeometry);
    const geomInterval = window.setInterval(checkWindowGeometry, 2500);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopyOrPaste);
      document.removeEventListener('cut', handleCopyOrPaste);
      document.removeEventListener('paste', handleCopyOrPaste);
      document.removeEventListener('drop', handleCopyOrPaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', checkWindowGeometry);
      window.clearInterval(geomInterval);
    };
  }, [active, recordStrike]);

  const strikeRatio = Math.min(violationsCount, maxViolations);
  const engineLabel =
    engineMode === 'mediapipe-full'
      ? 'AI Vision · BlazeFace + ObjectGuard'
      : engineMode === 'mediapipe-face'
      ? 'AI Vision · BlazeFace Landmarks'
      : engineMode === 'browser-face'
      ? 'Native Face AI + Skin Guard'
      : 'Vision Skin & Motion Guard';

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#19191b] overflow-hidden">
      {/* Header Status */}
      <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between gap-2 bg-[#141415]">
        <div className="flex items-center gap-2">
          {cameraStatus === 'active' ? (
            <span
              className={`inline-block rounded-full h-2 w-2 ${
                liveIntegrity.status === 'ok' ? 'bg-[#4cc38a]' : 'bg-[#e5484d]'
              }`}
            />
          ) : (
            <ShieldAlert className="w-4 h-4 text-[#e5a00d]" strokeWidth={1.5} />
          )}
          <span className="text-xs font-medium text-[#ededed]">
            Camera proctor guard
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border tabular-nums ${
            strikeRatio === 0
              ? 'bg-[#4cc38a]/10 text-[#4cc38a] border-[#4cc38a]/30'
              : strikeRatio < maxViolations
              ? 'bg-[#e5a00d]/10 text-[#e5a00d] border-[#e5a00d]/30'
              : 'bg-[#e5484d]/10 text-[#e5484d] border-[#e5484d]/30'
          }`}
        >
          Strikes: {strikeRatio}/{maxViolations}
        </span>
      </div>

      {/* Live Video Preview + AI Canvas Overlay */}
      <div className="p-3 space-y-3">
        <div
          className={`relative aspect-video rounded-lg overflow-hidden bg-[#0f0f10] border flex items-center justify-center transition-colors ${
            cameraStatus === 'active' && liveIntegrity.status !== 'ok'
              ? 'border-[#e5484d]'
              : 'border-white/[0.08]'
          }`}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover scale-x-[-1] ${
              cameraStatus === 'active' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
          <canvas
            ref={overlayCanvasRef}
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
              cameraStatus === 'active' ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <canvas ref={analysisCanvasRef} className="hidden" />

          {cameraStatus !== 'active' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              {cameraStatus === 'denied' || cameraStatus === 'disconnected' ? (
                <>
                  <CameraOff className="w-7 h-7 text-[#e5484d] mb-2" strokeWidth={1.5} />
                  <p className="text-xs font-medium text-[#e5484d]">
                    {cameraStatus === 'disconnected' ? 'Webcam disconnected' : 'Camera access blocked'}
                  </p>
                  <p className="text-xs text-[#85858b] mt-1 max-w-[230px] leading-relaxed">
                    {cameraError || 'Allow browser camera access to unlock the final exam.'}
                  </p>
                </>
              ) : (
                <>
                  <Video className="w-7 h-7 text-[#a1a1a6] mb-2" strokeWidth={1.5} />
                  <p className="text-xs font-medium text-[#ededed]">Webcam verification required</p>
                  <p className="text-xs text-[#85858b] mt-1 max-w-[235px]">
                    Real-time BlazeFace and object checks run locally in your browser.
                  </p>
                </>
              )}
            </div>
          )}

          {cameraStatus === 'active' && (
            <>
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#141415]/90 border border-white/[0.12] text-[10px] font-mono text-[#4cc38a] flex items-center gap-1.5">
                <Eye className="w-3 h-3" strokeWidth={1.5} />
                {active ? 'PROCTORING LIVE' : 'CAM READY'}
              </div>
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#141415]/90 border border-white/[0.12] text-[10px] font-mono text-[#a1a1a6] flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5" strokeWidth={1.5} />
                {engineMode === 'mediapipe-full' ? 'FACE+OBJ AI' : engineMode.toUpperCase()}
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-[#ededed] bg-[#141415]/90 px-2 py-1 rounded border border-white/[0.08] tabular-nums">
                <span
                  className={
                    liveIntegrity.status === 'ok'
                      ? 'text-[#4cc38a] font-medium'
                      : liveIntegrity.status === 'warning'
                      ? 'text-[#e5a00d] font-medium'
                      : 'text-[#e5484d] font-medium'
                  }
                >
                  {liveIntegrity.status !== 'ok'
                    ? liveIntegrity.headline
                    : faceCount === 1
                    ? 'Face: Verified (1)'
                    : 'Calibrating...'}
                </span>
                <span className="text-[#85858b]">Luma {luminance}</span>
              </div>
            </>
          )}
        </div>

        {/* Live Warning Callout */}
        {cameraStatus === 'active' && liveIntegrity.status !== 'ok' && (
          <div className="rounded-lg border border-[#e5484d]/40 bg-[#e5484d]/[0.08] px-3 py-2 text-xs text-[#ededed] space-y-0.5">
            <div className="font-medium text-[#e5484d] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
              {liveIntegrity.headline}
            </div>
            <p className="text-[#a1a1a6] leading-snug">{liveIntegrity.reason}</p>
          </div>
        )}

        {/* Camera / Fullscreen Actions */}
        <div className="flex flex-wrap gap-2">
          {cameraStatus !== 'active' ? (
            <button
              type="button"
              onClick={startCamera}
              disabled={cameraStatus === 'requesting'}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#ededed] hover:bg-white disabled:opacity-50 text-[#141415] text-xs font-medium transition-colors"
            >
              <Camera className="w-3.5 h-3.5" strokeWidth={1.5} />
              {cameraStatus === 'requesting' ? 'Loading camera models...' : 'Enable webcam guard'}
            </button>
          ) : (
            <>
              {!active && (
                <button
                  type="button"
                  onClick={stopCameraTracks}
                  className="px-3 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] text-[#ededed] text-xs font-medium transition-colors border border-white/[0.08]"
                >
                  Turn off
                </button>
              )}
              {!isFullscreen && (
                <button
                  type="button"
                  onClick={enterFullscreen}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] text-[#ededed] text-xs font-medium transition-colors border border-white/[0.08]"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
                  Lock fullscreen
                </button>
              )}
            </>
          )}
        </div>

        {/* Active Cheat Rules Checklist */}
        <div className="rounded-lg bg-[#141415] border border-white/[0.08] p-3 space-y-1.5 text-xs text-[#a1a1a6]">
          <div className="flex items-center justify-between gap-1.5 text-[#ededed] font-medium mb-1">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4cc38a]" strokeWidth={1.5} />
              Enforced proctoring signals
            </span>
          </div>
          <div className="text-[11px] font-mono text-[#e5a00d] pb-1.5 border-b border-white/[0.06]">
            Engine: {engineLabel}
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-[#4cc38a] shrink-0" strokeWidth={1.5} />
            Face presence, occlusion &amp; gaze-away detection
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-[#4cc38a] shrink-0" strokeWidth={1.5} />
            Phone, book &amp; extra-person object recognition
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-[#4cc38a] shrink-0" strokeWidth={1.5} />
            Tab switch, resize, DevTools &amp; copy lock
          </div>
        </div>

        {/* Violation Audit Log */}
        {violationLog.length > 0 && (
          <div className="rounded-lg bg-[#e5484d]/[0.06] border border-[#e5484d]/25 p-3 space-y-1.5 max-h-40 overflow-y-auto">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#e5484d]">
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />
              Proctoring audit log ({violationLog.length})
            </div>
            {violationLog
              .slice()
              .reverse()
              .map((ev, idx) => (
                <div
                  key={`${ev.timestamp}-${idx}`}
                  className="text-[11px] text-[#a1a1a6] border-l-2 border-[#e5484d]/60 pl-2 py-0.5"
                >
                  <span className="font-mono font-medium text-[#e5484d]">{ev.type}</span>
                  <span> &mdash; {ev.detail}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
