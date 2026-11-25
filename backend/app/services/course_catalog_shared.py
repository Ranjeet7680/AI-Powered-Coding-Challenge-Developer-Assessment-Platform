"""
Shared parameterized builder helpers for curated LMS video courses.
Eliminates duplicate lesson/note/quiz assembly logic across LMS tracks.
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


def build_structured_notes_markdown(
    order: int,
    title: str,
    mod: Dict[str, Any],
    concept: str,
    explanation: str,
    curriculum_label: str,
) -> str:
    return f"""### Lecture {order} Study Notes — {title}

**Module {mod['order']}:** {mod['title']}

#### Core Concept & Mathematical Formulation
{concept}

#### Key Engineering Takeaways
- {explanation}
- Understand when assumptions hold (scaling, linearity, convex optimization, margin geometry, latent EM bounds, or policy convergence) before choosing hyperparameters in production.
- Pair intuition from the **{curriculum_label}** lecture with empirical validation metrics (CV error, generalization bounds, reward curves, and held-out test checks).

#### Practical Checklist Before Moving On
1. Review the formula above and trace what happens at boundary cases (small sample size, non-separable data, or unscaled features).
2. Inspect the reference Python snippet below to verify numerical & API conventions.
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
) -> Dict[str, Any]:
    data_path = Path(__file__).resolve().parent / playlist_filename
    with data_path.open("r", encoding="utf-8") as f:
        raw_items: List[Dict[str, Any]] = json.load(f)

    total = len(raw_items)
    lessons: List[Dict[str, Any]] = []
    module_counts: Dict[str, int] = {m["id"]: 0 for m in modules}

    for entry in raw_items:
        order = int(entry["order"])
        vid = entry["video_id"]
        title = entry["title"]
        dur_label = entry.get("duration") or "15:00"
        mod = module_for_order(order, modules)
        module_counts[mod["id"]] += 1

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
                "duration_minutes": parse_duration_minutes(dur_label),
                "video_url": f"https://www.youtube.com/embed/{vid}?rel=0",
                "youtube_watch_url": f"https://www.youtube.com/watch?v={vid}&list={playlist_id}",
                "thumbnail_url": f"https://img.youtube.com/vi/{vid}/hqdefault.jpg",
                "notes_markdown": build_structured_notes_markdown(
                    order, title, mod, concept, explanation, curriculum_label
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
