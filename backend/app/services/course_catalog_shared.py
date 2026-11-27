"""
Shared parameterized builder helpers for curated LMS video courses.
Provides In-LMS privacy-enhanced embed URLs (`youtube-nocookie.com`),
advanced structured module syllabi, capstone assignment metadata,
and comprehension quiz/exam selectors without duplicating logic.
"""
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


QuizSpecTuple = Tuple[str, List[str], int, str, str, str]


def parse_duration_minutes(dur_str: str) -> int:
    parts = [int(p) for p in dur_str.split(":") if p.isdigit()]
    if len(parts) == 3:
        return max(1, parts[0] * 60 + parts[1] + (1 if parts[2] >= 30 else 0))
    if len(parts) == 2:
        return max(1, parts[0] + (1 if parts[1] >= 30 else 0))
    return 15


def difficulty_for_progress(order: int, total: int) -> str:
    ratio = order / max(total, 1)
    if ratio <= 0.35:
        return "Foundation"
    if ratio <= 0.7:
        return "Intermediate"
    return "Advanced"


def module_for_order(order: int, modules: List[Dict[str, Any]]) -> Dict[str, Any]:
    for m in modules:
        lo, hi = m["range"]
        if lo <= order <= hi:
            return m
    return modules[-1]


def build_locked_lms_embed_url(video_id: str) -> str:
    """
    Privacy-enhanced, minimal-chrome embed so videos play strictly inside the LMS
    with modestbranding, no related off-course suggestions, and no outbound links.
    """
    return (
        f"https://www.youtube-nocookie.com/embed/{video_id}"
        "?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&fs=1"
    )


def build_structured_notes_markdown(
    order: int,
    title: str,
    mod: Dict[str, Any],
    concept: str,
    explanation: str,
    curriculum_label: str,
    concept_heading: str = "Core Concept & Mathematical Formulation",
    takeaway_guidance: Optional[str] = None,
) -> str:
    guidance = takeaway_guidance or (
        "Understand when assumptions hold (scaling, linearity, convex optimization, margin geometry, latent EM bounds, or policy convergence) "
        "before choosing hyperparameters in production."
    )
    return f"""### Lecture {order} Study Notes — {title}

**Module {mod['order']}:** {mod['title']}

#### {concept_heading}
{concept}

#### Key Engineering Takeaways
- {explanation}
- {guidance}
- Pair intuition from the **{curriculum_label}** lecture with empirical validation metrics and reproducibility checks.

#### Practical Checklist Before Moving On
1. Review the formulation above and trace boundary/edge cases carefully.
2. Inspect the reference Python snippet below to verify conventions and API behavior.
3. Complete the **After-Video Comprehension Quiz** below to unlock `+10 XP` and track mastery.
"""


def build_course_catalog(
    *,
    course_id: str,
    course_title: str,
    playlist_id: str,
    playlist_url: str,
    instructor: str,
    thumbnail_url: str,
    playlist_filename: str,
    modules: List[Dict[str, Any]],
    quiz_specs: Dict[int, QuizSpecTuple],
    id_prefix: str,
    curriculum_label: str,
    capstone_projects: Optional[List[Dict[str, Any]]] = None,
    concept_heading: str = "Core Concept & Mathematical Formulation",
    takeaway_guidance: Optional[str] = None,
) -> Dict[str, Any]:
    data_path = Path(__file__).resolve().parent / playlist_filename
    with data_path.open("r", encoding="utf-8") as f:
        raw_items: List[Dict[str, Any]] = json.load(f)

    total = len(raw_items)
    lessons: List[Dict[str, Any]] = []
    module_counts: Dict[str, int] = {m["id"]: 0 for m in modules}
    module_minutes: Dict[str, int] = {m["id"]: 0 for m in modules}

    for entry in raw_items:
        order = int(entry["order"])
        vid = entry["video_id"]
        title = entry["title"]
        dur_label = entry.get("duration") or "15:00"
        dur_mins = parse_duration_minutes(dur_label)
        mod = module_for_order(order, modules)
        module_counts[mod["id"]] += 1
        module_minutes[mod["id"]] += dur_mins

        spec = quiz_specs[order]
        q_text, options, correct_idx, concept, explanation, code_snippet = spec

        lesson_id = f"{id_prefix}-{order:03d}"
        lessons.append(
            {
                "id": lesson_id,
                "order": order,
                "video_id": vid,
                "title": title,
                "module_id": mod["id"],
                "module_order": mod["order"],
                "module_title": mod["title"],
                "difficulty": difficulty_for_progress(order, total),
                "duration_label": dur_label,
                "duration_minutes": dur_mins,
                "video_url": build_locked_lms_embed_url(vid),
                "youtube_watch_url": build_locked_lms_embed_url(vid),
                "thumbnail_url": f"https://img.youtube.com/vi/{vid}/hqdefault.jpg",
                "notes_markdown": build_structured_notes_markdown(
                    order,
                    title,
                    mod,
                    concept,
                    explanation,
                    curriculum_label,
                    concept_heading=concept_heading,
                    takeaway_guidance=takeaway_guidance,
                ),
                "key_formula": concept,
                "code_snippet": code_snippet,
                "quiz": {
                    "id": f"{id_prefix}-quiz-{order:03d}" if id_prefix != "ml" else f"quiz-{order:03d}",
                    "lesson_id": lesson_id,
                    "lesson_order": order,
                    "lesson_title": title,
                    "module_id": mod["id"],
                    "module_title": mod["title"],
                    "question": q_text,
                    "options": options,
                    "correct_index": correct_idx,
                    "explanation": explanation,
                },
            }
        )

    modules_out = [
        {
            "id": m["id"],
            "order": m["order"],
            "title": m["title"],
            "description": m.get("description", ""),
            "estimated_hours": max(1, round(module_minutes[m["id"]] / 60, 1)) if module_minutes[m["id"]] >= 30 else 1,
            "learning_objectives": m.get("learning_objectives", []),
            "key_topics": m.get("key_topics", []),
            "prerequisite_module_ids": m.get("prerequisite_module_ids", []),
            "lesson_start": m["range"][0],
            "lesson_end": m["range"][1],
            "lesson_count": module_counts[m["id"]],
        }
        for m in modules
    ]

    return {
        "id": course_id,
        "title": course_title,
        "playlist_id": playlist_id,
        "playlist_url": playlist_url,
        "instructor": instructor,
        "thumbnail_url": thumbnail_url,
        "total_lessons": len(lessons),
        "total_quizzes": len(lessons),
        "modules": modules_out,
        "lessons": lessons,
        "capstone_projects": capstone_projects or [],
        "lms_player_mode": "locked_in_lms",
    }


def find_lesson_in_catalog(catalog: Dict[str, Any], lesson_id: str) -> Optional[Dict[str, Any]]:
    for lesson in catalog["lessons"]:
        if lesson["id"] == lesson_id or str(lesson["order"]) == lesson_id:
            return lesson
    return None


def filter_quiz_bank_from_catalog(
    catalog: Dict[str, Any],
    include_answers: bool = False,
) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    for lesson in catalog["lessons"]:
        q = dict(lesson["quiz"])
        if not include_answers:
            q.pop("correct_index", None)
            q.pop("explanation", None)
        items.append(q)
    return items


def select_exam_questions_from_catalog(
    catalog: Dict[str, Any],
    lesson_orders: List[int],
    include_answers: bool = False,
) -> List[Dict[str, Any]]:
    by_order = {l["order"]: l for l in catalog["lessons"]}
    questions: List[Dict[str, Any]] = []
    for idx, order in enumerate(lesson_orders, start=1):
        lesson = by_order[order]
        q = dict(lesson["quiz"])
        q["exam_number"] = idx
        if not include_answers:
            q.pop("correct_index", None)
            q.pop("explanation", None)
        questions.append(q)
    return questions
