import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Lock,
  MessageCircle,
  Share2,
  X,
} from 'lucide-react';
import { COURSE_TRACK_META, CourseTrack } from '../../constants/courseTracks';
import { useToast } from '../../context/useContexts';
import {
  buildCourseInviteCopy,
  copyCourseThumbnailPngToClipboard,
  downloadCourseThumbnailPng,
  getCourseShareUrl,
  getCourseSyllabusUrl,
  renderCourseThumbnailPngBlob,
} from '../../utils/courseShare';

interface CourseShareButtonProps {
  track: CourseTrack;
  title: string;
  instructor?: string;
  lectureCount?: number;
  moduleCount?: number;
  thumbnailUrl?: string;
  variant?: 'button' | 'compact';
  className?: string;
}

export const CourseShareButton: React.FC<CourseShareButtonProps> = ({
  track,
  title,
  instructor,
  lectureCount,
  moduleCount,
  thumbnailUrl,
  variant = 'button',
  className = '',
}) => {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPost, setCopiedPost] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);

  const meta = COURSE_TRACK_META[track];
  const resolvedThumb = thumbnailUrl || meta.defaultThumbnail;
  const resolvedLectures = lectureCount ?? meta.lectureCount;
  const shareUrl = getCourseShareUrl(track);
  const syllabusUrl = getCourseSyllabusUrl(track);
  const inviteText = buildCourseInviteCopy({
    track,
    title,
    instructor,
    lectureCount: resolvedLectures,
    moduleCount,
    thumbnailUrl: resolvedThumb,
  });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      showToast('Course share link copied (includes OG thumbnail preview).', 'success');
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      showToast('Copy failed — please copy the course link manually.', 'error');
    }
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteText);
      setCopiedPost(true);
      showToast('Course invite copy with link copied to clipboard.', 'success');
      window.setTimeout(() => setCopiedPost(false), 2000);
    } catch {
      showToast('Copy failed — please try copying manually.', 'error');
    }
  };

  const handleDownloadThumbnail = async () => {
    setIsExportingPng(true);
    try {
      await downloadCourseThumbnailPng(resolvedThumb, track);
      showToast('Downloaded course thumbnail card (1280×720 PNG).', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Thumbnail export failed.';
      showToast(msg, 'error');
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleCopyThumbnailImage = async () => {
    setIsCopyingImage(true);
    try {
      await copyCourseThumbnailPngToClipboard(resolvedThumb);
      showToast('Course thumbnail copied as PNG — paste directly into any chat or post.', 'success');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Browser blocked clipboard images — use Download PNG instead.';
      showToast(msg, 'error');
    } finally {
      setIsCopyingImage(false);
    }
  };

  const handleDeviceShare = async () => {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return;
    try {
      const pngBlob = await renderCourseThumbnailPngBlob(resolvedThumb);
      const file = new File([pngBlob], `ctf-${track}-course-thumbnail.png`, {
        type: 'image/png',
      });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text: inviteText,
          url: shareUrl,
          files: [file],
        });
        return;
      }
    } catch {
      // Fall back cleanly to URL + text share when file sharing is unsupported
    }

    try {
      await navigator.share({
        title,
        text: inviteText,
        url: shareUrl,
      });
    } catch {
      // User cancelled share sheet
    }
  };

  const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(inviteText)}`;
  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(inviteText)}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${title} (${resolvedLectures} lectures + proctored certificate) on Coding Task Factory Academy`
  )}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        title="Share course with thumbnail"
        aria-label={`Share ${title} with thumbnail`}
        className={
          variant === 'compact'
            ? `inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] text-[#ededed] border border-white/[0.08] text-xs font-medium transition-colors ${className}`
            : `inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] text-[#ededed] border border-white/[0.08] text-xs font-medium transition-colors ${className}`
        }
      >
        <Share2 className="w-3.5 h-3.5 text-[#e5a00d]" strokeWidth={1.5} />
        <span>{variant === 'compact' ? 'Share' : 'Share course'}</span>
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="course-share-dialog-title"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl border border-white/[0.12] bg-[#19191b] shadow-2xl overflow-hidden animate-fadeIn max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="px-4 py-3 border-b border-white/[0.08] bg-[#141415] flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#e5a00d]">
                    <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Share course with thumbnail</span>
                  </div>
                  <h2
                    id="course-share-dialog-title"
                    className="text-sm font-medium text-[#ededed] leading-snug line-clamp-2"
                  >
                    {title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close share dialog"
                  className="p-1.5 rounded-lg bg-[#222225] text-[#a1a1a6] hover:text-[#ededed] transition-colors shrink-0"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* Live Social Card Preview with Thumbnail */}
                <div className="rounded-xl border border-white/[0.08] bg-[#141415] overflow-hidden">
                  <img
                    src={resolvedThumb}
                    alt={`${title} thumbnail preview`}
                    className="w-full max-h-52 sm:max-h-56 object-contain bg-[#0f0f10] mx-auto"
                  />
                  <div className="px-3.5 py-2.5 border-t border-white/[0.08] space-y-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                      <span className="text-[#e5a00d]">{meta.eyebrowLabel}</span>
                      <span className="inline-flex items-center gap-1 text-[#4cc38a]">
                        <Lock className="w-3 h-3" strokeWidth={1.5} />
                        {resolvedLectures} lectures{moduleCount ? ` · ${moduleCount} modules` : ''}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-[#ededed] leading-snug">{title}</p>
                    <p className="text-[11px] text-[#85858b] truncate">
                      {instructor || meta.eyebrowLabel} · {syllabusUrl.replace(/^https?:\/\//, '')}
                    </p>
                  </div>
                </div>

                {/* Thumbnail Image Export & Clipboard Copy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadThumbnail}
                    disabled={isExportingPng}
                    className="inline-flex items-center justify-center gap-2 px-3.5 h-9 rounded-lg bg-[#ededed] hover:bg-white disabled:opacity-50 text-[#141415] text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{isExportingPng ? 'Rendering PNG...' : 'Download thumbnail (.png)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyThumbnailImage}
                    disabled={isCopyingImage}
                    className="inline-flex items-center justify-center gap-2 px-3.5 h-9 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] disabled:opacity-50 border border-white/[0.08] text-[#ededed] text-xs font-medium transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#e5a00d]" strokeWidth={1.5} />
                    <span>{isCopyingImage ? 'Copying PNG...' : 'Copy thumbnail image'}</span>
                  </button>
                </div>

                {/* Share Link Input (Open Graph enabled) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#85858b]">
                    <span>Preview share URL (carries thumbnail metadata)</span>
                    <button
                      type="button"
                      onClick={handleCopyInvite}
                      className="font-mono text-[#e5a00d] hover:underline"
                    >
                      {copiedPost ? 'Invite post copied' : 'Copy full invite text'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-[#141415] border border-white/[0.08] p-1.5">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      onFocus={(e) => e.target.select()}
                      aria-label="Course share link with thumbnail metadata"
                      className="w-full bg-transparent text-xs font-mono text-[#ededed] px-2 py-1 focus:outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-[#ededed] text-xs font-medium transition-colors"
                    >
                      {copiedLink ? (
                        <Check className="w-3.5 h-3.5 text-[#4cc38a]" strokeWidth={1.75} />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#a1a1a6]" strokeWidth={1.5} />
                      )}
                      <span>{copiedLink ? 'Copied' : 'Copy link'}</span>
                    </button>
                  </div>
                </div>

                {/* Direct Social Destinations */}
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#a1a1a6]" strokeWidth={1.5} />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#4cc38a]" strokeWidth={1.5} />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={xShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#a1a1a6]" strokeWidth={1.5} />
                    <span>Share on X</span>
                  </a>
                </div>

                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                  <button
                    type="button"
                    onClick={handleDeviceShare}
                    className="w-full py-2 rounded-lg bg-[#141415] hover:bg-[#222225] border border-white/[0.08] text-xs font-medium text-[#a1a1a6] hover:text-[#ededed] transition-colors"
                  >
                    Share link &amp; thumbnail file via device share sheet
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
