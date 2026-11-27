import { COURSE_TRACK_META, CourseTrack } from '../constants/courseTracks';

export function getCourseShareUrl(track: CourseTrack): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://coding-task-factory.vercel.app';
  return `${origin}/share/course/${track}`;
}

export function getCourseSyllabusUrl(track: CourseTrack): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://coding-task-factory.vercel.app';
  return `${origin}${COURSE_TRACK_META[track].lmsDetailPath}`;
}

export function resolveAbsoluteThumbnailUrl(thumbnailPath: string): string {
  if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
    return thumbnailPath;
  }
  const normalized = thumbnailPath.startsWith('/') ? thumbnailPath : `/${thumbnailPath}`;
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://coding-task-factory.vercel.app';
  return `${origin}${normalized}`;
}

export interface CourseSharePayload {
  track: CourseTrack;
  title: string;
  instructor?: string;
  lectureCount?: number;
  moduleCount?: number;
  thumbnailUrl?: string;
}

export function buildCourseInviteCopy(payload: CourseSharePayload): string {
  const meta = COURSE_TRACK_META[payload.track];
  const lectures = payload.lectureCount ?? meta.lectureCount;
  const shareUrl = getCourseShareUrl(payload.track);
  const instructorLine = payload.instructor ? `Instructor: ${payload.instructor}` : meta.eyebrowLabel;
  const modLine = payload.moduleCount ? `${payload.moduleCount} structured modules · ` : '';

  return [
    `Explore "${payload.title}" on Coding Task Factory Academy.`,
    ``,
    `${instructorLine}`,
    `${modLine}${lectures} in-LMS video lectures · Study notes & Python code · Quizzes · Graded capstones · Camera-proctored SHA-256 certificate`,
    ``,
    `Course link & thumbnail preview: ${shareUrl}`,
  ].join('\n');
}

export async function renderCourseThumbnailPngBlob(thumbnailPath: string): Promise<Blob> {
  const srcUrl = resolveAbsoluteThumbnailUrl(thumbnailPath);
  const resp = await fetch(srcUrl);
  if (!resp.ok) {
    throw new Error('Could not load course thumbnail artwork.');
  }
  const svgText = await resp.text();
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const objectUrl = URL.createObjectURL(svgBlob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Failed to decode course thumbnail SVG.'));
      el.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context unavailable.');
    }
    ctx.fillStyle = '#141415';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const pngBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    );
    if (!pngBlob) {
      throw new Error('Failed to export course thumbnail PNG.');
    }
    return pngBlob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function downloadCourseThumbnailPng(
  thumbnailPath: string,
  track: CourseTrack
): Promise<void> {
  const blob = await renderCourseThumbnailPngBlob(thumbnailPath);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ctf-${track}-course-thumbnail.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyCourseThumbnailPngToClipboard(thumbnailPath: string): Promise<void> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.clipboard ||
    typeof ClipboardItem === 'undefined'
  ) {
    throw new Error('Clipboard image copy is not supported in this browser.');
  }
  const blob = await renderCourseThumbnailPngBlob(thumbnailPath);
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

function setMetaAttr(selector: string, content: string): void {
  if (typeof document === 'undefined') return;
  const el = document.querySelector<HTMLMetaElement>(selector);
  if (el) el.setAttribute('content', content);
}

export function syncCourseOpenGraphMeta(payload: CourseSharePayload): void {
  if (typeof document === 'undefined') return;
  const meta = COURSE_TRACK_META[payload.track];
  const lectures = payload.lectureCount ?? meta.lectureCount;
  const thumbAbs = resolveAbsoluteThumbnailUrl(payload.thumbnailUrl || meta.defaultThumbnail);
  const desc = `${lectures} lectures, study notes, quizzes, capstones, and camera-proctored certification on Coding Task Factory Academy.`;
  const pageTitle = `${payload.title} — Coding Task Factory`;

  document.title = pageTitle;
  setMetaAttr('meta[name="description"]', desc);
  setMetaAttr('meta[property="og:title"]', payload.title);
  setMetaAttr('meta[property="og:description"]', desc);
  setMetaAttr('meta[property="og:image"]', thumbAbs);
  setMetaAttr('meta[name="twitter:title"]', payload.title);
  setMetaAttr('meta[name="twitter:description"]', desc);
  setMetaAttr('meta[name="twitter:image"]', thumbAbs);
}
