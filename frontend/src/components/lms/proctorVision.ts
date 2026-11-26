import {
  FaceDetector,
  FilesetResolver,
  ObjectDetector,
} from '@mediapipe/tasks-vision';

export interface ProctorFaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  keypoints: Array<{ x: number; y: number }>;
  gazeDirection: 'center' | 'away';
  yawScore: number;
}

export interface ProctorObjectBox {
  label: string;
  score: number;
  x: number;
  y: number;
  width: number;
  height: number;
  prohibited: boolean;
}

export interface ProctorFrameAnalysis {
  engineMode: 'mediapipe-full' | 'mediapipe-face' | 'browser-face' | 'skin-cv';
  luminance: number;
  stdDev: number;
  skinRatio: number;
  motionScore: number;
  isCovered: boolean;
  isFrozenFrame: boolean;
  faces: ProctorFaceBox[];
  objects: ProctorObjectBox[];
  prohibitedObjects: ProctorObjectBox[];
  gazeAway: boolean;
  personCountFromObjects: number;
}

interface NativeDetectedFace {
  boundingBox: DOMRectReadOnly;
}

interface NativeFaceDetector {
  detect: (image: HTMLVideoElement | HTMLCanvasElement) => Promise<NativeDetectedFace[]>;
}

interface WindowWithNativeFaceDetector extends Window {
  FaceDetector?: new (opts?: { fastMode?: boolean; maxDetectedFaces?: number }) => NativeFaceDetector;
}

const PROHIBITED_LABELS = new Set(['cell phone', 'mobile phone', 'book', 'laptop', 'remote', 'tv']);

let sharedFaceDetector: FaceDetector | null = null;
let sharedObjectDetector: ObjectDetector | null = null;
let sharedNativeFaceDetector: NativeFaceDetector | null = null;
let initPromise: Promise<'mediapipe-full' | 'mediapipe-face' | 'browser-face' | 'skin-cv'> | null = null;
let lastVideoTimestamp = 0;

function getNextTimestamp(): number {
  const now = Math.round(performance.now());
  lastVideoTimestamp = Math.max(lastVideoTimestamp + 1, now);
  return lastVideoTimestamp;
}

/**
 * Loads MediaPipe BlazeFace + COCO EfficientDet-Lite0 from self-hosted `/proctor/` assets
 * (falling back cleanly to native ShapeDetector or YCbCr skin/glare heuristics if WASM is unavailable).
 */
export async function ensureProctorVisionReady(): Promise<
  'mediapipe-full' | 'mediapipe-face' | 'browser-face' | 'skin-cv'
> {
  if (sharedFaceDetector && sharedObjectDetector) return 'mediapipe-full';
  if (sharedFaceDetector) return 'mediapipe-face';
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks('/proctor/wasm');
      const [faceDet, objDet] = await Promise.allSettled([
        FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/proctor/blaze_face_short_range.tflite',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.52,
          minSuppressionThreshold: 0.3,
        }).catch(() =>
          FaceDetector.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: '/proctor/blaze_face_short_range.tflite',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            minDetectionConfidence: 0.52,
            minSuppressionThreshold: 0.3,
          })
        ),
        ObjectDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/proctor/efficientdet_lite0.tflite',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          maxResults: 6,
          scoreThreshold: 0.38,
        }),
      ]);

      if (faceDet.status === 'fulfilled') {
        sharedFaceDetector = faceDet.value;
      }
      if (objDet.status === 'fulfilled') {
        sharedObjectDetector = objDet.value;
      }

      if (sharedFaceDetector && sharedObjectDetector) return 'mediapipe-full';
      if (sharedFaceDetector) return 'mediapipe-face';
    } catch {
      // Fallback below
    }

    const win = window as WindowWithNativeFaceDetector;
    if (win.FaceDetector && !sharedNativeFaceDetector) {
      try {
        sharedNativeFaceDetector = new win.FaceDetector({ fastMode: true, maxDetectedFaces: 4 });
        return 'browser-face';
      } catch {
        // Continue to CV fallback
      }
    }
    return 'skin-cv';
  })();

  return initPromise;
}

function estimateGazeFromKeypoints(
  keypoints: Array<{ x: number; y: number }>,
  box: { x: number; y: number; width: number; height: number },
  vidWidth: number,
  vidHeight: number
): { gazeDirection: 'center' | 'away'; yawScore: number } {
  // BlazeFace provides 6 keypoints: [rightEye, leftEye, noseTip, mouthCenter, rightEar, leftEar]
  if (keypoints.length < 3 || box.width <= 0 || vidWidth <= 0 || vidHeight <= 0) {
    return { gazeDirection: 'center', yawScore: 0.5 };
  }

  const normRightEyeX = keypoints[0].x;
  const normLeftEyeX = keypoints[1].x;
  const normNoseX = keypoints[2].x;
  const normNoseY = keypoints[2].y;
  const normMouthY = keypoints[3]?.y ?? normNoseY + 0.1;

  const eyeMinX = Math.min(normRightEyeX, normLeftEyeX);
  const eyeMaxX = Math.max(normRightEyeX, normLeftEyeX);
  const eyeSpan = eyeMaxX - eyeMinX;

  let yawScore = 0.5;
  if (eyeSpan > 0.015) {
    yawScore = (normNoseX - eyeMinX) / eyeSpan;
  }

  const faceCenterX = (box.x + box.width / 2) / vidWidth;
  const faceCenterY = (box.y + box.height / 2) / vidHeight;
  const pitchSpan = normMouthY - normNoseY;

  const sharpHeadTurn = yawScore < 0.05 || yawScore > 0.95;
  const nearFrameEdge = faceCenterX < 0.12 || faceCenterX > 0.88 || faceCenterY > 0.88;
  const lookingFarDown = pitchSpan < 0.015 && normNoseY > 0.72;

  return {
    gazeDirection: sharpHeadTurn || nearFrameEdge || lookingFarDown ? 'away' : 'center',
    yawScore,
  };
}

/**
 * Analyzes a single video frame using MediaPipe AI models (plus YCbCr skin/luma/freeze telemetry).
 */
export async function analyzeProctorFrame(
  video: HTMLVideoElement,
  analysisCanvas: HTMLCanvasElement,
  prevLumaSample: Float32Array | null
): Promise<{ result: ProctorFrameAnalysis; nextLumaSample: Float32Array }> {
  const ctx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  const w = 160;
  const h = 90;
  if (analysisCanvas.width !== w) analysisCanvas.width = w;
  if (analysisCanvas.height !== h) analysisCanvas.height = h;

  let luminance = 0;
  let stdDev = 0;
  let skinRatio = 0;
  let motionScore = 100;
  const nextSample = new Float32Array(w * h);

  if (ctx) {
    ctx.drawImage(video, 0, 0, w, h);
    const frame = ctx.getImageData(0, 0, w, h).data;

    let sum = 0;
    let centerPixels = 0;
    let skinPixels = 0;
    let motionDiffSum = 0;

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const pIdx = py * w + px;
        const dIdx = pIdx * 4;
        const r = frame[dIdx];
        const g = frame[dIdx + 1];
        const b = frame[dIdx + 2];

        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        nextSample[pIdx] = y;
        sum += y;

        if (prevLumaSample && prevLumaSample.length === nextSample.length) {
          motionDiffSum += Math.abs(y - prevLumaSample[pIdx]);
        }

        // Check central candidate region for YCbCr skin-tone presence
        if (px >= w * 0.25 && px <= w * 0.75 && py >= h * 0.12 && py <= h * 0.85) {
          centerPixels++;
          const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
          const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
          if (y > 45 && cb >= 77 && cb <= 127 && cr >= 133 && cr <= 175) {
            skinPixels++;
          }
        }
      }
    }

    const totalPx = w * h;
    luminance = sum / Math.max(1, totalPx);
    let sq = 0;
    for (let i = 0; i < totalPx; i++) {
      const diff = nextSample[i] - luminance;
      sq += diff * diff;
    }
    stdDev = Math.sqrt(sq / Math.max(1, totalPx));
    skinRatio = skinPixels / Math.max(1, centerPixels);
    if (prevLumaSample && prevLumaSample.length === nextSample.length) {
      motionScore = motionDiffSum / Math.max(1, totalPx);
    }
  }

  const roundedLuma = Math.round(luminance);
  const isCovered = (roundedLuma < 12 && stdDev < 6) || stdDev < 2.2;
  const isFrozenFrame = prevLumaSample !== null && stdDev >= 4 && motionScore < 0.04;

  const vw = video.videoWidth || 640;
  const vh = video.videoHeight || 360;
  const faces: ProctorFaceBox[] = [];
  const objects: ProctorObjectBox[] = [];
  let personCountFromObjects = 0;
  let engineMode: ProctorFrameAnalysis['engineMode'] = 'skin-cv';

  if (sharedFaceDetector || sharedObjectDetector) {
    const ts = getNextTimestamp();
    if (sharedFaceDetector) {
      try {
        const res = sharedFaceDetector.detectForVideo(video, ts);
        for (const det of res.detections) {
          const b = det.boundingBox;
          if (!b) continue;
          const pts = (det.keypoints || []).map((kp) => ({ x: kp.x, y: kp.y }));
          const gaze = estimateGazeFromKeypoints(pts, { x: b.originX, y: b.originY, width: b.width, height: b.height }, vw, vh);
          faces.push({
            x: b.originX,
            y: b.originY,
            width: b.width,
            height: b.height,
            confidence: det.categories?.[0]?.score ?? 0.9,
            keypoints: pts,
            gazeDirection: gaze.gazeDirection,
            yawScore: gaze.yawScore,
          });
        }
        engineMode = 'mediapipe-face';
      } catch {
        // Frame decode error ignored
      }
    }

    if (sharedObjectDetector) {
      try {
        const objRes = sharedObjectDetector.detectForVideo(video, ts);
        for (const det of objRes.detections) {
          const b = det.boundingBox;
          const top = det.categories?.[0];
          if (!b || !top) continue;
          const label = (top.categoryName || top.displayName || '').toLowerCase();
          if (label === 'person') {
            personCountFromObjects += 1;
          }
          const prohibited = PROHIBITED_LABELS.has(label);
          objects.push({
            label,
            score: top.score,
            x: b.originX,
            y: b.originY,
            width: b.width,
            height: b.height,
            prohibited,
          });
        }
        if (sharedFaceDetector) engineMode = 'mediapipe-full';
      } catch {
        // Object inference skipped on this frame
      }
    }
  } else if (sharedNativeFaceDetector) {
    engineMode = 'browser-face';
    try {
      const nativeFaces = await sharedNativeFaceDetector.detect(video);
      for (const f of nativeFaces) {
        faces.push({
          x: f.boundingBox.x,
          y: f.boundingBox.y,
          width: f.boundingBox.width,
          height: f.boundingBox.height,
          confidence: 0.9,
          keypoints: [],
          gazeDirection: 'center',
          yawScore: 0.5,
        });
      }
    } catch {
      engineMode = 'skin-cv';
    }
  }

  // Fallback synthetic face detection check if strictly in CV skin mode
  if (engineMode === 'skin-cv' && !isCovered && skinRatio >= 0.08) {
    faces.push({
      x: vw * 0.28,
      y: vh * 0.14,
      width: vw * 0.44,
      height: vh * 0.72,
      confidence: Math.min(0.95, 0.5 + skinRatio),
      keypoints: [],
      gazeDirection: 'center',
      yawScore: 0.5,
    });
  }

  const prohibitedObjects = objects.filter((o) => o.prohibited);
  const gazeAway = faces.length === 1 && faces[0].gazeDirection === 'away';

  return {
    result: {
      engineMode,
      luminance: roundedLuma,
      stdDev,
      skinRatio,
      motionScore,
      isCovered,
      isFrozenFrame,
      faces,
      objects,
      prohibitedObjects,
      gazeAway,
      personCountFromObjects,
    },
    nextLumaSample: nextSample,
  };
}
