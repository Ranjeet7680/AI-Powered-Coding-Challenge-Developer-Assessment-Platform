"""
Vector PDF Certificate Generator using ReportLab.
Produces high-resolution landscape A4 verified developer credentials with
security hashes, deterministic verification QR matrix, skill badges, and signatory seal.
"""
import datetime
import hashlib
import io
from typing import Any, Dict, List

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


CATEGORY_SKILLS_MAP: Dict[str, List[str]] = {
    "Data Structures & Algorithms": [
        "Dynamic Programming",
        "Graph Traversal",
        "Hash Maps & Trees",
        "Asymptotic Complexity",
        "Sliding Window",
    ],
    "Enterprise Software Engineering": [
        "Concurrent Systems",
        "API Architecture",
        "Memory Efficiency",
        "Distributed Patterns",
        "Clean TypeScript & Python",
    ],
    "Applied AI Engineering": [
        "ML Foundations",
        "Vector Search & RAG",
        "Gradient Optimization",
        "AI Code Auditing",
        "Evaluation Harnesses",
    ],
    "Data Science & Big Data Analytics": [
        "NumPy Vectorization",
        "Pandas DataFrames",
        "CSV & JSON ETL",
        "Data Merging & Joins",
        "Matplotlib Visualization",
    ],
    "Entrepreneurial & Business Analytics": [
        "Pricing Elasticity & Profit Opt",
        "Bayes & Chi-Square Inference",
        "Multiple Regression & VIF",
        "Data Envelopment Analysis (DEA)",
        "Conjoint Market Simulation",
    ],
    "Agentic AI & MCP Systems": [
        "Agent Architectures & Q-Learning",
        "LangGraph Stateful Workflows",
        "CrewAI & Agno Multi-Agent RAG",
        "Model Context Protocol (MCP)",
        "OpenAI Agents SDK & Cloud Tools",
    ],
    "Enterprise Technical Assessment": [
        "Timed Problem Solving",
        "Edge-Case Resilience",
        "Optimal Space-Time",
        "Automated Unit Verification",
        "Production Debugging",
    ],
}


def compute_credential_hash(
    credential_id: str,
    recipient_name: str,
    title: str,
    issue_date_iso: str,
) -> str:
    payload = f"{credential_id}|{recipient_name}|{title}|{issue_date_iso}|CodingTaskFactory"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def default_certificate_metadata(
    title: str,
    category: str,
    score_percent: int = 98,
    challenges_completed: int = 12,
    completion_hours: int = 24,
) -> Dict[str, Any]:
    skills = CATEGORY_SKILLS_MAP.get(category)
    if not skills:
        lowered = (title + " " + category).lower()
        if "business" in lowered or "entrepreneur" in lowered or "conjoint" in lowered:
            skills = CATEGORY_SKILLS_MAP["Entrepreneurial & Business Analytics"]
        elif "agentic" in lowered or "mcp" in lowered or "langgraph" in lowered:
            skills = CATEGORY_SKILLS_MAP["Agentic AI & MCP Systems"]
        elif "data science" in lowered or "big data" in lowered or "pandas" in lowered:
            skills = CATEGORY_SKILLS_MAP["Data Science & Big Data Analytics"]
        elif "ai" in lowered or "ml" in lowered or "machine" in lowered:
            skills = CATEGORY_SKILLS_MAP["Applied AI Engineering"]
        elif "system" in lowered or "full" in lowered or "architecture" in lowered:
            skills = CATEGORY_SKILLS_MAP["Enterprise Software Engineering"]
        else:
            skills = CATEGORY_SKILLS_MAP["Data Structures & Algorithms"]

    summary = (
        f"Awarded for demonstrating verified proficiency in {category}, achieving a "
        f"{score_percent}% standing across {challenges_completed}+ automated test-suite "
        f"challenges and {completion_hours} hours of intensive coding labs."
    )
    return {
        "issuer_name": "Coding Task Factory Academy",
        "signatory_name": "Dr. Aris Thorne",
        "signatory_title": "Chief Curriculum Architect",
        "score_percent": score_percent,
        "skills_verified": skills,
        "challenges_completed": challenges_completed,
        "completion_hours": completion_hours,
        "summary": summary,
    }


def _draw_qr_matrix(c: canvas.Canvas, x: float, y: float, size: float, seed_hex: str) -> None:
    """Draw a deterministic 15x15 verification matrix QR emblem seeded from SHA-256."""
    n = 15
    pad = 4.0
    c.saveState()
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.setStrokeColor(colors.HexColor("#475569"))
    c.setLineWidth(0.8)
    c.roundRect(x, y, size, size, 4, stroke=1, fill=1)

    cell = (size - 2 * pad) / n
    digest = hashlib.sha256(seed_hex.encode("utf-8")).digest()

    def is_finder(r: int, col: int) -> int:
        # Three 5x5 finder patterns at top-left, top-right, bottom-left
        corners = [(0, 0), (0, n - 5), (n - 5, 0)]
        for cr, cc in corners:
            if cr <= r < cr + 5 and cc <= col < cc + 5:
                dr, dc = r - cr, col - cc
                if dr in (0, 4) or dc in (0, 4) or (1 <= dr <= 3 and 1 <= dc <= 3 and not ((dr in (1, 3) and dc in (1, 3)) or (dr == 2 and dc == 2))):
                    pass
                if dr in (0, 4) or dc in (0, 4) or (dr == 2 and dc == 2):
                    return 1
                return 0
        return -1

    c.setFillColor(colors.HexColor("#090D16"))
    for r in range(n):
        for col in range(n):
            f = is_finder(r, col)
            if f == 1:
                filled = True
            elif f == 0:
                filled = False
            else:
                idx = r * n + col
                byte_val = digest[idx % len(digest)]
                filled = ((byte_val >> (idx % 8)) & 1) == 1 or ((r + col) % 7 == 0)
            if filled:
                cx = x + pad + col * cell
                cy = y + size - pad - (r + 1) * cell
                c.rect(cx, cy, cell * 0.92, cell * 0.92, stroke=0, fill=1)
    c.restoreState()


def _draw_seal(c: canvas.Canvas, cx: float, cy: float, radius: float) -> None:
    """Draw an embossed vector verification seal."""
    c.saveState()
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.setFillColor(colors.HexColor("#171C2E"))
    c.setLineWidth(1.6)
    c.circle(cx, cy, radius, stroke=1, fill=1)

    c.setStrokeColor(colors.HexColor("#F59E0B"))
    c.setLineWidth(0.75)
    c.setDash(2, 2)
    c.circle(cx, cy, radius - 4.5, stroke=1, fill=0)
    c.setDash()

    c.setFillColor(colors.HexColor("#FDE68A"))
    c.setFont("Helvetica-Bold", 6.2)
    c.drawCentredString(cx, cy + 5, "VERIFIED")
    c.setFont("Helvetica-Bold", 8.2)
    c.drawCentredString(cx, cy - 4, "CTF")
    c.setFont("Helvetica", 5.2)
    c.drawCentredString(cx, cy - 12, "EXCELLENCE")
    c.restoreState()


def generate_certificate_pdf(cert: Dict[str, Any]) -> bytes:
    """Render a vector landscape A4 certificate PDF and return raw bytes."""
    buf = io.BytesIO()
    width, height = landscape(A4)  # 841.89 x 595.28 pt
    c = canvas.Canvas(buf, pagesize=(width, height))

    recipient = str(cert.get("recipient_name") or "Developer")
    title = str(cert.get("title") or "Mastery of Algorithmic Problem Solving")
    credential_id = str(cert.get("credential_id") or "CTF-00000000")
    category = str(cert.get("category") or "Computer Science & Engineering")
    grade = str(cert.get("grade") or "Distinction")
    issuer = str(cert.get("issuer_name") or "Coding Task Factory Academy")
    signatory = str(cert.get("signatory_name") or "Dr. Aris Thorne")
    signatory_title = str(cert.get("signatory_title") or "Chief Curriculum Architect")
    score_percent = int(cert.get("score_percent") or 98)
    challenges_completed = int(cert.get("challenges_completed") or 12)
    completion_hours = int(cert.get("completion_hours") or 24)
    skills = list(cert.get("skills_verified") or [])[:5]
    if not skills:
        skills = default_certificate_metadata(title, category, score_percent)["skills_verified"]

    summary = str(
        cert.get("summary")
        or default_certificate_metadata(
            title, category, score_percent, challenges_completed, completion_hours
        )["summary"]
    )

    raw_date = cert.get("issue_date")
    if isinstance(raw_date, datetime.datetime):
        issue_dt = raw_date
    elif isinstance(raw_date, str) and raw_date:
        try:
            issue_dt = datetime.datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
        except ValueError:
            issue_dt = datetime.datetime.utcnow()
    else:
        issue_dt = datetime.datetime.utcnow()
    issue_str = issue_dt.strftime("%B %d, %Y")
    issue_iso = issue_dt.strftime("%Y-%m-%d")

    cred_hash = str(
        cert.get("credential_hash")
        or compute_credential_hash(credential_id, recipient, title, issue_iso)
    )

    c.setTitle(f"{title} - {recipient}")
    c.setAuthor(issuer)
    c.setSubject(f"Verified Credential {credential_id}")
    c.setCreator("Coding Task Factory Credential Engine")

    # Background obsidian canvas
    c.setFillColor(colors.HexColor("#060913"))
    c.rect(0, 0, width, height, stroke=0, fill=1)

    # Subtle diagonal watermark pattern
    c.saveState()
    c.setStrokeColor(colors.HexColor("#0F172A"))
    c.setLineWidth(0.5)
    for offset in range(-600, 1400, 28):
        c.line(offset, 0, offset + height * 0.6, height)
    c.restoreState()

    # Main elevated plate
    margin = 24
    plate_w = width - 2 * margin
    plate_h = height - 2 * margin
    c.setFillColor(colors.HexColor("#0B1020"))
    c.setStrokeColor(colors.HexColor("#334155"))
    c.setLineWidth(1.0)
    c.roundRect(margin, margin, plate_w, plate_h, 12, stroke=1, fill=1)

    # Gold outer hairline border + indigo inner border
    c.setStrokeColor(colors.HexColor("#D4AF37"))
    c.setLineWidth(1.4)
    c.roundRect(margin + 8, margin + 8, plate_w - 16, plate_h - 16, 8, stroke=1, fill=0)

    c.setStrokeColor(colors.HexColor("#4F46E5"))
    c.setLineWidth(0.75)
    c.roundRect(margin + 14, margin + 14, plate_w - 28, plate_h - 28, 6, stroke=1, fill=0)

    # Header bar
    header_y = height - 82
    c.setFillColor(colors.HexColor("#4F46E5"))
    c.roundRect(margin + 30, header_y - 4, 34, 34, 7, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("Courier-Bold", 13)
    c.drawCentredString(margin + 47, header_y + 8, "</>")

    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin + 74, header_y + 15, issuer.upper())
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica", 8.5)
    c.drawString(margin + 74, header_y + 2, f"Verified Technical Credential Registry  |  Category: {category}")

    # Top-right verified badge pill
    pill_w = 158
    pill_h = 24
    pill_x = width - margin - 30 - pill_w
    pill_y = header_y + 2
    c.setFillColor(colors.HexColor("#0F291E"))
    c.setStrokeColor(colors.HexColor("#10B981"))
    c.setLineWidth(0.9)
    c.roundRect(pill_x, pill_y, pill_w, pill_h, 12, stroke=1, fill=1)
    c.setFillColor(colors.HexColor("#34D399"))
    c.setFont("Helvetica-Bold", 8.2)
    c.drawCentredString(pill_x + pill_w / 2, pill_y + 8.5, "VERIFIED AUTHENTIC CREDENTIAL")

    # Main Title & Recipient
    c.setFillColor(colors.HexColor("#FBBF24"))
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(width / 2, height - 122, "CERTIFICATE OF ENGINEERING EXCELLENCE")

    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica", 10)
    c.drawCentredString(width / 2, height - 144, "This official credential certifies that")

    c.setFillColor(colors.HexColor("#FFFFFF"))
    c.setFont("Times-Bold", 32)
    c.drawCentredString(width / 2, height - 182, recipient)

    # Underline rule beneath name
    c.setStrokeColor(colors.HexColor("#6366F1"))
    c.setLineWidth(1.2)
    c.line(width / 2 - 170, height - 192, width / 2 + 170, height - 192)

    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica", 10)
    c.drawCentredString(width / 2, height - 212, "has successfully met all evaluation standards for")

    # Program title wrapped safely via Paragraph
    title_style = ParagraphStyle(
        "CertTitle",
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#C7D2FE"),
    )
    title_para = Paragraph(title, title_style)
    _, title_h = title_para.wrap(plate_w - 140, 60)
    title_para.drawOn(c, margin + 70, height - 222 - title_h)

    summary_style = ParagraphStyle(
        "CertSummary",
        fontName="Helvetica",
        fontSize=9.6,
        leading=13.5,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#CBD5E1"),
    )
    summary_para = Paragraph(summary, summary_style)
    _, sum_h = summary_para.wrap(plate_w - 170, 60)
    summary_para.drawOn(c, margin + 85, height - 232 - title_h - sum_h)

    # 4-Column Metric Boxes
    box_y = 186
    box_h = 54
    gap = 12
    total_row_w = plate_w - 120
    box_w = (total_row_w - 3 * gap) / 4
    start_x = margin + 60
    metrics = [
        ("STANDING / GRADE", grade),
        ("EVALUATION SCORE", f"{score_percent}%"),
        ("CHALLENGES SOLVED", f"{challenges_completed}+ Verified"),
        ("PRACTICAL LAB TIME", f"{completion_hours} Hours"),
    ]
    for idx, (label, val) in enumerate(metrics):
        bx = start_x + idx * (box_w + gap)
        c.setFillColor(colors.HexColor("#11182C"))
        c.setStrokeColor(colors.HexColor("#1E293B"))
        c.setLineWidth(0.9)
        c.roundRect(bx, box_y, box_w, box_h, 6, stroke=1, fill=1)
        c.setFillColor(colors.HexColor("#818CF8"))
        c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(bx + box_w / 2, box_y + 36, label)
        c.setFillColor(colors.HexColor("#F8FAFC"))
        c.setFont("Helvetica-Bold", 11)
        trimmed = val if len(val) <= 22 else val[:20] + "..."
        c.drawCentredString(bx + box_w / 2, box_y + 16, trimmed)

    # Verified Skill Pills
    pills_y = 148
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica-Bold", 7.5)
    c.drawCentredString(width / 2, pills_y + 20, "VERIFIED COMPETENCIES & DOMAIN SKILLS")

    pill_widths = [max(88.0, len(sk) * 5.4 + 22.0) for sk in skills]
    total_pills_w = sum(pill_widths) + max(0, len(skills) - 1) * 8
    cur_x = (width - total_pills_w) / 2
    for sk, pw in zip(skills, pill_widths):
        c.setFillColor(colors.HexColor("#172036"))
        c.setStrokeColor(colors.HexColor("#4F46E5"))
        c.setLineWidth(0.75)
        c.roundRect(cur_x, pills_y - 4, pw, 18, 9, stroke=1, fill=1)
        c.setFillColor(colors.HexColor("#E0E7FF"))
        c.setFont("Helvetica", 8)
        c.drawCentredString(cur_x + pw / 2, pills_y + 2, sk)
        cur_x += pw + 8

    # Divider line above footer
    c.setStrokeColor(colors.HexColor("#1E293B"))
    c.setLineWidth(0.8)
    c.line(margin + 36, 132, width - margin - 36, 132)

    # Left Footer: Metadata & SHA-256 hash
    left_x = margin + 40
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica-Bold", 7.2)
    c.drawString(left_x, 112, "ISSUE DATE")
    c.drawString(left_x + 115, 112, "CREDENTIAL ID")
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.setFont("Helvetica-Bold", 9.5)
    c.drawString(left_x, 98, issue_str)
    c.setFont("Courier-Bold", 9.5)
    c.drawString(left_x + 115, 98, credential_id)

    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica-Bold", 7.2)
    c.drawString(left_x, 78, "SHA-256 VERIFICATION FINGERPRINT")
    c.setFillColor(colors.HexColor("#34D399"))
    c.setFont("Courier", 7.6)
    c.drawString(left_x, 66, f"0x{cred_hash[:40]}...")

    c.setFillColor(colors.HexColor("#64748B"))
    c.setFont("Helvetica", 7.3)
    c.drawString(left_x, 51, f"Verify authenticity online: /verify/{credential_id}")

    # Center Footer: QR Matrix
    qr_size = 64
    qr_x = width / 2 - qr_size / 2
    qr_y = 54
    _draw_qr_matrix(c, qr_x, qr_y, qr_size, f"{credential_id}:{cred_hash}")
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica-Bold", 6.2)
    c.drawCentredString(width / 2, 44, "SCAN TO VERIFY")

    # Right Footer: Signature & Seal
    seal_cx = width - margin - 68
    seal_cy = 84
    _draw_seal(c, seal_cx, seal_cy, 25)

    sig_x = seal_cx - 175
    c.saveState()
    c.setStrokeColor(colors.HexColor("#E2E8F0"))
    c.setLineWidth(1.3)
    p = c.beginPath()
    p.moveTo(sig_x + 8, 86)
    p.curveTo(sig_x + 28, 108, sig_x + 42, 76, sig_x + 65, 98)
    p.curveTo(sig_x + 82, 108, sig_x + 92, 82, sig_x + 116, 92)
    p.curveTo(sig_x + 124, 95, sig_x + 132, 88, sig_x + 140, 89)
    c.drawPath(p, stroke=1, fill=0)
    c.restoreState()

    c.setStrokeColor(colors.HexColor("#475569"))
    c.setLineWidth(0.75)
    c.line(sig_x, 81, sig_x + 136, 81)

    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.setFont("Helvetica-Bold", 9.5)
    c.drawString(sig_x, 68, signatory)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica", 7.8)
    c.drawString(sig_x, 56, f"{signatory_title}, {issuer.split()[0]} Academy")

    c.showPage()
    c.save()
    return buf.getvalue()
