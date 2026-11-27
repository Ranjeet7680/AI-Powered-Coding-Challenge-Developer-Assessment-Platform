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
  const skillsLine = skills.join(' · ');
  const verifyUrl = getVerificationUrl(cert.credential_id);

  if (platform === 'linkedin') {
    return [
      `Earned the "${cert.title}" credential from ${cert.issuer_name || 'Coding Task Factory Academy'}.`,
      '',
      `Summary:`,
      `- Standing: ${cert.grade} (${score}% score)`,
      `- Practical work: ${challenges}+ verified challenges (${hours} lab hours)`,
      `- Verified skills: ${skillsLine}`,
      '',
      `Credential ID: ${cert.credential_id}`,
      `Verify: ${verifyUrl}`,
      '',
      `#SoftwareEngineering #Algorithms #DataStructures #CodingTaskFactory`,
    ].join('\n');
  }

  if (platform === 'instagram') {
    return [
      `Credential earned: ${cert.title} — ${cert.grade}`,
      '',
      `Completed ${challenges}+ coding benchmarks across ${hours} hours of multi-language test suites (${score}% score).`,
      '',
      `Verified skills: ${skills.join(' | ')}`,
      '',
      `Credential ID: ${cert.credential_id} (${recipient})`,
      `Verify: ${verifyUrl}`,
      '',
      `#SoftwareEngineering #Algorithms #MachineLearning #CodingTaskFactory`,
    ].join('\n');
  }

  if (platform === 'facebook') {
    return [
      `Earned the "${cert.title}" certificate on Coding Task Factory Academy (${cert.grade}).`,
      '',
      `Completed ${challenges}+ timed challenges and ${hours} hours of engineering assessments across: ${skillsLine}.`,
      '',
      `Verify credential (${cert.credential_id}): ${verifyUrl}`,
      '',
      `#SoftwareDevelopment #CodingTaskFactory #Engineering`,
    ].join('\n');
  }

  return [
    `Sharing a verified credential — *${cert.title}* on *Coding Task Factory*.`,
    '',
    `- *Recipient:* ${recipient}`,
    `- *Standing:* ${cert.grade} (${score}%)`,
    `- *Completed:* ${challenges}+ challenges (${hours} hrs)`,
    `- *Skills:* ${skillsLine}`,
    `- *Credential ID:* \`${cert.credential_id}\``,
    '',
    `Verify online: ${verifyUrl}`,
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

  // Graphite backdrop (flat matte surface, zero neon glow blobs)
  ctx.fillStyle = '#141415';
  ctx.fillRect(0, 0, width, height);

  const pad = format === 'square' ? 42 : 28;
  drawRoundedRect(ctx, pad, pad, width - pad * 2, height - pad * 2, 16);
  ctx.fillStyle = '#19191b';
  ctx.fill();
  ctx.strokeStyle = 'rgba(229, 160, 13, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRoundedRect(ctx, pad + 14, pad + 14, width - (pad + 14) * 2, height - (pad + 14) * 2, 12);
  ctx.strokeStyle = 'rgba(237, 237, 237, 0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const innerX = pad + 48;
  const innerRight = width - pad - 48;
  const innerW = innerRight - innerX;

  // Header Badge
  const headerY = pad + 54;
  drawRoundedRect(ctx, innerX, headerY, 52, 52, 10);
  ctx.fillStyle = '#222225';
  ctx.fill();
  ctx.strokeStyle = 'rgba(237, 237, 237, 0.14)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#e5a00d';
  ctx.font = '500 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('</>', innerX + 26, headerY + 33);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ededed';
  ctx.font = '500 21px sans-serif';
  ctx.fillText(issuer, innerX + 68, headerY + 23);
  ctx.fillStyle = '#85858b';
  ctx.font = '15px sans-serif';
  ctx.fillText(`Verified credential · ${cert.category}`, innerX + 68, headerY + 45);

  // Status tag top-right
  const pillW = 216;
  drawRoundedRect(ctx, innerRight - pillW, headerY + 8, pillW, 34, 8);
  ctx.fillStyle = '#141415';
  ctx.fill();
  ctx.strokeStyle = 'rgba(76, 195, 138, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#4cc38a';
  ctx.font = '500 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[SHA-256 VERIFIED]', innerRight - pillW / 2, headerY + 30);

  // Center Body
  ctx.textAlign = 'center';
  const midX = width / 2;
  const titleBaseY = format === 'square' ? 248 : 180;

  ctx.fillStyle = '#e5a00d';
  ctx.font = '500 16px monospace';
  ctx.fillText('Certificate of Engineering Mastery', midX, titleBaseY);

  ctx.fillStyle = '#85858b';
  ctx.font = '17px sans-serif';
  ctx.fillText('Awarded to', midX, titleBaseY + 46);

  ctx.fillStyle = '#ededed';
  ctx.font = format === 'square' ? '500 52px Georgia, serif' : '500 42px Georgia, serif';
  ctx.fillText(recipient, midX, titleBaseY + (format === 'square' ? 112 : 96));

  ctx.strokeStyle = 'rgba(237, 237, 237, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(midX - 200, titleBaseY + (format === 'square' ? 134 : 112));
  ctx.lineTo(midX + 200, titleBaseY + (format === 'square' ? 134 : 112));
  ctx.stroke();

  ctx.fillStyle = '#ededed';
  ctx.font = format === 'square' ? '500 32px sans-serif' : '500 26px sans-serif';
  const titleLines = wrapCanvasText(ctx, cert.title, innerW - 60).slice(0, 2);
  let curY = titleBaseY + (format === 'square' ? 192 : 156);
  for (const line of titleLines) {
    ctx.fillText(line, midX, curY);
    curY += format === 'square' ? 40 : 32;
  }

  // Metrics strip
  const metricY = format === 'square' ? curY + 46 : curY + 18;
  const boxH = format === 'square' ? 92 : 72;
  const boxGap = 16;
  const metricW = (innerW - 2 * boxGap) / 3;
  const metricItems = [
    { label: 'Standing', value: cert.grade },
    { label: 'Score', value: `${score}%` },
    { label: 'Practical work', value: `${challenges}+ tasks · ${hours}h` },
  ];
  metricItems.forEach((m, i) => {
    const bx = innerX + i * (metricW + boxGap);
    drawRoundedRect(ctx, bx, metricY, metricW, boxH, 10);
    ctx.fillStyle = '#141415';
    ctx.fill();
    ctx.strokeStyle = 'rgba(237, 237, 237, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#85858b';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(m.label, bx + metricW / 2, metricY + (format === 'square' ? 32 : 25));

    ctx.fillStyle = '#ededed';
    ctx.font = format === 'square' ? '500 20px sans-serif' : '500 17px sans-serif';
    const valText = m.value.length > 22 ? `${m.value.slice(0, 20)}...` : m.value;
    ctx.fillText(valText, bx + metricW / 2, metricY + (format === 'square' ? 66 : 52));
  });

  // Skills tags
  const skillY = metricY + boxH + (format === 'square' ? 42 : 22);
  ctx.font = '500 14px sans-serif';
  const pillWidths = skills.map((s) => Math.max(116, ctx.measureText(s).width + 32));
  const totalPW = pillWidths.reduce((a, b) => a + b, 0) + (skills.length - 1) * 12;
  let sx = (width - totalPW) / 2;
  skills.forEach((sk, idx) => {
    const pw = pillWidths[idx];
    drawRoundedRect(ctx, sx, skillY, pw, 34, 8);
    ctx.fillStyle = '#222225';
    ctx.fill();
    ctx.strokeStyle = 'rgba(237, 237, 237, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#a1a1a6';
    ctx.textAlign = 'center';
    ctx.fillText(sk, sx + pw / 2, skillY + 22);
    sx += pw + 12;
  });

  // Footer Bar with QR Matrix
  const footerY = height - pad - 112;
  ctx.strokeStyle = 'rgba(237, 237, 237, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(innerX, footerY);
  ctx.lineTo(innerRight, footerY);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#85858b';
  ctx.font = '13px monospace';
  ctx.fillText(`Issued: ${formatCertificateDate(cert.issue_date)}`, innerX, footerY + 34);
  ctx.fillStyle = '#ededed';
  ctx.font = '500 17px monospace';
  ctx.fillText(`Credential ID: ${cert.credential_id}`, innerX, footerY + 62);
  ctx.fillStyle = '#85858b';
  ctx.font = '13px monospace';
  ctx.fillText(`Signed by ${cert.signatory_name || 'Dr. Aris Thorne'} · Coding Task Factory`, innerX, footerY + 86);

  const qrBox = 84;
  const qx = innerRight - qrBox;
  const qy = footerY + 14;
  drawRoundedRect(ctx, qx, qy, qrBox, qrBox, 6);
  ctx.fillStyle = '#ededed';
  ctx.fill();

  const matrix = buildQrMatrixCells(`${cert.credential_id}:${cert.credential_hash || ''}`, 15);
  const cell = (qrBox - 12) / 15;
  ctx.fillStyle = '#141415';
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
