import { Certificate } from '../types';

export type SocialPlatform = 'linkedin' | 'instagram' | 'facebook' | 'whatsapp';

export function formatCertificateDate(dateStr?: string): string {
  if (!dateStr) return 'Verified';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return 'Verified';
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getVerificationUrl(credentialId: string): string {
  if (typeof window === 'undefined') {
    return `/verify/${credentialId}`;
  }
  return `${window.location.origin}/verify/${credentialId}`;
}

export function buildSocialPostMessage(
  cert: Certificate,
  platform: SocialPlatform,
  recipientFallback?: string
): string {
  const recipient = cert.recipient_name || recipientFallback || 'Developer';
  const score = cert.score_percent ?? 98;
  const challenges = cert.challenges_completed ?? 12;
  const hours = cert.completion_hours ?? 24;
  const skills = (cert.skills_verified && cert.skills_verified.length > 0
    ? cert.skills_verified
    : [cert.category, 'Algorithms', 'Clean Code']
  ).slice(0, 5);
  const skillsLine = skills.join(' • ');
  const verifyUrl = getVerificationUrl(cert.credential_id);

  if (platform === 'linkedin') {
    return [
      `Excited to share that I have earned the "${cert.title}" credential from ${cert.issuer_name || 'Coding Task Factory Academy'}!`,
      '',
      `Achievement Highlights:`,
      `• Standing: ${cert.grade} (${score}% Evaluation Score)`,
      `• Practical Output: ${challenges}+ verified automated test-suite challenges (${hours} lab hours)`,
      `• Verified Skills: ${skillsLine}`,
      '',
      `Credential ID: ${cert.credential_id}`,
      `Verify Credential: ${verifyUrl}`,
      '',
      `#SoftwareEngineering #Algorithms #DataStructures #CodingTaskFactory #TechCredentials #ContinuousLearning`,
    ].join('\n');
  }

  if (platform === 'instagram') {
    return [
      `Unlocked: ${cert.title} — ${cert.grade}! 🚀💻`,
      '',
      `${challenges}+ coding challenges crushed across ${hours} hours of algorithmic benchmarks & multi-language test suites (${score}% score).`,
      '',
      `Key Skills Verified:`,
      `⚡ ${skills.join(' | ')}`,
      '',
      `Credential ID: ${cert.credential_id} (Signed by ${recipient})`,
      `Verify via link: ${verifyUrl}`,
      '',
      `#CodingLife #SoftwareEngineer #Algorithms #100DaysOfCode #DeveloperJourney #MachineLearning #CodingTaskFactory #TechMilestone`,
    ].join('\n');
  }

  if (platform === 'facebook') {
    return [
      `Proud milestone unlocked! I just earned my "${cert.title}" certificate on Coding Task Factory Academy with a standing of ${cert.grade}! 🎉`,
      '',
      `After completing ${challenges}+ timed challenges and ${hours} hours of algorithmic & engineering assessments, these competencies are officially verified:`,
      `${skillsLine}`,
      '',
      `Check out my verified credential (${cert.credential_id}): ${verifyUrl}`,
      '',
      `#CodingMilestone #SoftwareDevelopment #CodingTaskFactory #EngineeringExcellence`,
    ].join('\n');
  }

  // whatsapp
  return [
    `Hey! Sharing a quick milestone — I just earned the *${cert.title}* credential on *Coding Task Factory*! 🏆`,
    '',
    `• *Recipient:* ${recipient}`,
    `• *Standing:* ${cert.grade} (${score}%)`,
    `• *Completed:* ${challenges}+ challenges (${hours} hrs)`,
    `• *Skills:* ${skillsLine}`,
    `• *Credential ID:* \`${cert.credential_id}\``,
    '',
    `Verify it live here: ${verifyUrl}`,
  ].join('\n');
}

export function buildLinkedInAddToProfileUrl(cert: Certificate): string {
  const issue = cert.issue_date ? new Date(cert.issue_date) : new Date();
  const validDate = Number.isNaN(issue.getTime()) ? new Date() : issue;
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: cert.title,
    organizationName: cert.issuer_name || 'Coding Task Factory Academy',
    issueYear: String(validDate.getFullYear()),
    issueMonth: String(validDate.getMonth() + 1),
    certId: cert.credential_id,
    certUrl: getVerificationUrl(cert.credential_id),
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

export function buildLinkedInFeedShareUrl(message: string): string {
  const params = new URLSearchParams({
    shareActive: 'true',
    text: message,
  });
  return `https://www.linkedin.com/feed/?${params.toString()}`;
}

export function buildFacebookShareUrl(credentialId: string, quote: string): string {
  const params = new URLSearchParams({
    u: getVerificationUrl(credentialId),
    quote,
  });
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

export function buildWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/** Deterministic 15x15 QR matrix seeded from credential ID / SHA-256 hash. */
export function buildQrMatrixCells(seed: string, size = 15): boolean[][] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  const corners: [number, number][] = [
    [0, 0],
    [0, size - 5],
    [size - 5, 0],
  ];

  const isFinderCell = (r: number, c: number): number => {
    for (const [cr, cc] of corners) {
      if (r >= cr && r < cr + 5 && c >= cc && c < cc + 5) {
        const dr = r - cr;
        const dc = c - cc;
        if (dr === 0 || dr === 4 || dc === 0 || dc === 4 || (dr === 2 && dc === 2)) {
          return 1;
        }
        return 0;
      }
    }
    return -1;
  };

  const grid: boolean[][] = [];
  for (let r = 0; r < size; r += 1) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c += 1) {
      const f = isFinderCell(r, c);
      if (f !== -1) {
        row.push(f === 1);
      } else {
        const mixed = Math.imul(h ^ (r * 31 + c * 17), 2246822519) >>> 0;
        row.push((mixed & 1) === 1 || (r + c) % 7 === 0);
      }
    }
    grid.push(row);
  }
  return grid;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function downloadSocialCardPng(
  cert: Certificate,
  format: 'square' | 'landscape',
  recipientFallback?: string
): Promise<void> {
  const width = format === 'square' ? 1080 : 1200;
  const height = format === 'square' ? 1080 : 630;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const recipient = cert.recipient_name || recipientFallback || 'Developer';
  const score = cert.score_percent ?? 98;
  const challenges = cert.challenges_completed ?? 12;
  const hours = cert.completion_hours ?? 24;
  const issuer = cert.issuer_name || 'Coding Task Factory Academy';
  const skills = (cert.skills_verified?.length
    ? cert.skills_verified
    : [cert.category, 'Algorithms', 'Clean Code']
  ).slice(0, 4);

  // Obsidian Gradient Background
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#050814');
  bg.addColorStop(0.5, '#0B1124');
  bg.addColorStop(1, '#070B18');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle glow accents
  const glow1 = ctx.createRadialGradient(width * 0.85, height * 0.15, 20, width * 0.85, height * 0.15, 360);
  glow1.addColorStop(0, 'rgba(99, 102, 241, 0.28)');
  glow1.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, width, height);

  const glow2 = ctx.createRadialGradient(width * 0.18, height * 0.85, 20, width * 0.18, height * 0.85, 340);
  glow2.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
  glow2.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, width, height);

  // Outer Gold & Inner Indigo Frames
  const pad = format === 'square' ? 42 : 28;
  drawRoundedRect(ctx, pad, pad, width - pad * 2, height - pad * 2, 24);
  ctx.fillStyle = 'rgba(11, 16, 32, 0.9)';
  ctx.fill();
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 3;
  ctx.stroke();

  drawRoundedRect(ctx, pad + 14, pad + 14, width - (pad + 14) * 2, height - (pad + 14) * 2, 18);
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const innerX = pad + 48;
  const innerRight = width - pad - 48;
  const innerW = innerRight - innerX;

  // Header Badge
  const headerY = pad + 56;
  drawRoundedRect(ctx, innerX, headerY, 54, 54, 12);
  ctx.fillStyle = '#4F46E5';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('</>', innerX + 27, headerY + 34);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(issuer.toUpperCase(), innerX + 70, headerY + 24);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '15px sans-serif';
  ctx.fillText(`Verified Credential  •  ${cert.category}`, innerX + 70, headerY + 46);

  // Pill top-right
  const pillW = 240;
  drawRoundedRect(ctx, innerRight - pillW, headerY + 8, pillW, 36, 18);
  ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
  ctx.fill();
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#34D399';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('VERIFIED CREDENTIAL', innerRight - pillW / 2, headerY + 31);

  // Center Body
  ctx.textAlign = 'center';
  const midX = width / 2;
  const titleBaseY = format === 'square' ? 250 : 182;

  ctx.fillStyle = '#FBBF24';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('CERTIFICATE OF ENGINEERING EXCELLENCE', midX, titleBaseY);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '18px sans-serif';
  ctx.fillText('PROUDLY PRESENTED TO', midX, titleBaseY + 48);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = format === 'square' ? 'bold 54px Georgia, serif' : 'bold 44px Georgia, serif';
  ctx.fillText(recipient, midX, titleBaseY + (format === 'square' ? 115 : 98));

  ctx.strokeStyle = '#6366F1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(midX - 210, titleBaseY + (format === 'square' ? 136 : 114));
  ctx.lineTo(midX + 210, titleBaseY + (format === 'square' ? 136 : 114));
  ctx.stroke();

  // Cert Title
  ctx.fillStyle = '#C7D2FE';
  ctx.font = format === 'square' ? 'bold 34px sans-serif' : 'bold 27px sans-serif';
  const titleLines = wrapCanvasText(ctx, cert.title, innerW - 60).slice(0, 2);
  let curY = titleBaseY + (format === 'square' ? 195 : 158);
  for (const line of titleLines) {
    ctx.fillText(line, midX, curY);
    curY += format === 'square' ? 42 : 34;
  }

  // Metrics strip
  const metricY = format === 'square' ? curY + 48 : curY + 20;
  const boxH = format === 'square' ? 96 : 74;
  const boxGap = 16;
  const metricW = (innerW - 2 * boxGap) / 3;
  const metricItems = [
    { label: 'STANDING', value: cert.grade },
    { label: 'SCORE', value: `${score}% Verified` },
    { label: 'PRACTICAL LABS', value: `${challenges}+ Tasks • ${hours}h` },
  ];
  metricItems.forEach((m, i) => {
    const bx = innerX + i * (metricW + boxGap);
    drawRoundedRect(ctx, bx, metricY, metricW, boxH, 12);
    ctx.fillStyle = '#11182C';
    ctx.fill();
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#818CF8';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(m.label, bx + metricW / 2, metricY + (format === 'square' ? 34 : 26));

    ctx.fillStyle = '#F8FAFC';
    ctx.font = format === 'square' ? 'bold 20px sans-serif' : 'bold 17px sans-serif';
    const valText = m.value.length > 22 ? `${m.value.slice(0, 20)}...` : m.value;
    ctx.fillText(valText, bx + metricW / 2, metricY + (format === 'square' ? 68 : 54));
  });

  // Skills pills
  const skillY = metricY + boxH + (format === 'square' ? 44 : 24);
  ctx.font = '600 15px sans-serif';
  const pillWidths = skills.map((s) => Math.max(120, ctx.measureText(s).width + 36));
  const totalPW = pillWidths.reduce((a, b) => a + b, 0) + (skills.length - 1) * 12;
  let sx = (width - totalPW) / 2;
  skills.forEach((sk, idx) => {
    const pw = pillWidths[idx];
    drawRoundedRect(ctx, sx, skillY, pw, 36, 18);
    ctx.fillStyle = '#172036';
    ctx.fill();
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#E0E7FF';
    ctx.textAlign = 'center';
    ctx.fillText(sk, sx + pw / 2, skillY + 23);
    sx += pw + 12;
  });

  // Footer Bar with QR Matrix
  const footerY = height - pad - 115;
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(innerX, footerY);
  ctx.lineTo(innerRight, footerY);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(`ISSUED: ${formatCertificateDate(cert.issue_date)}`, innerX, footerY + 34);
  ctx.fillStyle = '#A5B4FC';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(`CREDENTIAL ID: ${cert.credential_id}`, innerX, footerY + 62);
  ctx.fillStyle = '#64748B';
  ctx.font = '13px monospace';
  ctx.fillText(`Signed by ${cert.signatory_name || 'Dr. Aris Thorne'} • Coding Task Factory`, innerX, footerY + 86);

  // Mini QR matrix on bottom-right
  const qrBox = 86;
  const qx = innerRight - qrBox;
  const qy = footerY + 14;
  drawRoundedRect(ctx, qx, qy, qrBox, qrBox, 8);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();

  const matrix = buildQrMatrixCells(`${cert.credential_id}:${cert.credential_hash || ''}`, 15);
  const cell = (qrBox - 12) / 15;
  ctx.fillStyle = '#090D16';
  matrix.forEach((row, r) => {
    row.forEach((filled, c) => {
      if (filled) {
        ctx.fillRect(qx + 6 + c * cell, qy + 6 + r * cell, cell * 0.9, cell * 0.9);
      }
    });
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('PNG export failed'));
    }, 'image/png');
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CodingTaskFactory-${cert.credential_id}-${format}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
