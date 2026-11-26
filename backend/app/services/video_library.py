"""
Full 8-Playlist Engineering Video Library Service (590 real curated videos):
- Programming in Python (IIT Madras BS, 95 videos)
- Machine Learning Foundations (IIT Madras BS, 93 videos)
- Machine Learning Practice Course (IIT Madras BS, 98 videos)
- Deep Learning (IIT Madras BS, 68 videos)
- Special Topics in ML: Reinforcement Learning (IIT Madras BS, 44 videos)
- Programming Concepts using Java (IIT Madras BS, 66 videos)
- NPTEL Programming in Modern C++ (IIT Kharagpur, 77 videos)
- Embedded C Programming (IIT Madras BS Electronic Systems, 49 videos)

All videos stream via privacy-enhanced minimal-chrome embeds (`youtube-nocookie.com`)
strictly inside our platform Watch Video page.
"""
import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

from .course_catalog_shared import build_locked_lms_embed_url, parse_duration_minutes


_PLAYLIST_META: Dict[str, Dict[str, str]] = {
    "PLZ2ps__7DhBb2cXAu5PevO_mzgS3Fj3Fs": {
        "short": "py",
        "category": "Python Programming",
        "difficulty": "Easy",
        "related_challenge_id": "c-py-1",
        "snippet": "def greet_learner(topic: str, modules: int) -> str:\n    return f'Mastering {topic} across {modules} lectures'\n\nprint(greet_learner('Python', 95))",
    },
    "PLZ2ps__7DhBammhVmBE9f5eezTj2kDfTN": {
        "short": "mlf",
        "category": "Machine Learning",
        "difficulty": "Medium",
        "related_challenge_id": "c-ml-1",
        "snippet": "import numpy as np\n\ndef mse_loss(y_true: np.ndarray, y_pred: np.ndarray) -> float:\n    return float(np.mean((y_true - y_pred) ** 2))",
    },
    "PLZ2ps__7DhBb3ovNQam2c_WcGeiW9OhQo": {
        "short": "mlp",
        "category": "Machine Learning",
        "difficulty": "Medium",
        "related_challenge_id": "c-ml-kmeans",
        "snippet": "from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import Ridge\n\npipe = make_pipeline(StandardScaler(), Ridge(alpha=1.0))",
    },
    "PLZ2ps__7DhBZVxMrSkTIcG6zZBDKUXCnM": {
        "short": "dl",
        "category": "Deep Learning",
        "difficulty": "Hard",
        "related_challenge_id": "c-ml-self-attention",
        "snippet": "import torch.nn as nn\n\nmlp = nn.Sequential(\n    nn.Linear(128, 256),\n    nn.ReLU(),\n    nn.Linear(256, 10),\n)",
    },
    "PLZ2ps__7DhBbDiVplM2I9q2XNso1Qfj62": {
        "short": "rl",
        "category": "Reinforcement Learning",
        "difficulty": "Hard",
        "related_challenge_id": "c-ml-1",
        "snippet": "# Bellman optimality update\n# Q[s, a] <- Q[s, a] + alpha * (r + gamma * max(Q[s_next]) - Q[s, a])",
    },
    "PLZ2ps__7DhBaXTORd_OKXZRXCMh3dGnBZ": {
        "short": "java",
        "category": "Java Programming",
        "difficulty": "Medium",
        "related_challenge_id": "c2-lru-cache",
        "snippet": "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Object-Oriented Design in Java\");\n    }\n}",
    },
    "PLqu1LEUz3ju04dXn0JOgKYPHHnV2at-lG": {
        "short": "cpp",
        "category": "Modern C++",
        "difficulty": "Hard",
        "related_challenge_id": "c2-lru-cache",
        "snippet": "#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> nums{1, 2, 3};\n    std::cout << nums.size() << '\\n';\n}",
    },
    "PLUQpHm_JtukII_8U9pucV61MX2YE2CSUt": {
        "short": "embc",
        "category": "Embedded C",
        "difficulty": "Medium",
        "related_challenge_id": "c-py-1",
        "snippet": "#include <stdint.h>\n\nstatic inline void set_bit(volatile uint32_t *reg, uint8_t bit) {\n    *reg |= (1U << bit);\n}",
    },
}


@lru_cache(maxsize=1)
def _load_playlists_json() -> List[Dict[str, Any]]:
    path = Path(__file__).resolve().parent / "video_playlists_data.json"
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def get_playlist_catalog_data() -> Dict[str, Any]:
    raw_playlists = _load_playlists_json()
    series_list: List[Dict[str, Any]] = []
    videos_out: List[Dict[str, Any]] = []

    for pl in raw_playlists:
        pid = pl["playlist_id"]
        pl_title = pl.get("title") or pid
        channel = pl.get("channel") or "Engineering Faculty"
        raw_videos = pl.get("videos", [])
        meta = _PLAYLIST_META.get(
            pid,
            {
                "short": pid[-6:].lower(),
                "category": "Engineering",
                "difficulty": "Medium",
                "related_challenge_id": "c2-lru-cache",
                "snippet": "# Interactive lesson code workspace",
            },
        )
        short = meta["short"]
        pl_lessons: List[Dict[str, Any]] = []

        for entry in raw_videos:
            order = int(entry.get("order") or len(pl_lessons) + 1)
            vid = entry["video_id"]
            title = entry["title"]
            dur_str = entry.get("duration") or "15:00"
            dur_mins = parse_duration_minutes(dur_str)
            item_id = f"pl-{short}-{order:03d}"

            lesson = {
                "id": item_id,
                "title": title,
                "slug": item_id,
                "description": f"{pl_title} — Episode {order} by {channel}. Stream directly inside Coding Task Factory Watch Theater.",
                "video_url": build_locked_lms_embed_url(vid),
                "thumbnail_url": f"https://img.youtube.com/vi/{vid}/hqdefault.jpg",
                "duration_minutes": dur_mins,
                "duration_label": dur_str,
                "category": meta["category"],
                "difficulty": meta["difficulty"],
                "instructor": channel,
                "instructor_avatar": "",
                "related_challenge_id": meta["related_challenge_id"],
                "playlist_id": pid,
                "playlist_title": pl_title,
                "episode_order": order,
                "chapters": [
                    {"title": f"Part 1: Foundations — {title[:45]}", "time": "00:00"},
                    {"title": "Part 2: Worked Examples & Walkthrough", "time": f"{max(1, dur_mins // 2):02d}:00"},
                ],
                "key_takeaways": [
                    f"Core concepts from Episode #{order} of {pl_title}.",
                    f"Course track taught by {channel} with in-platform distraction-free playback.",
                    "Practice the accompanying implementation snippet inside Coding Workspace IDE.",
                ],
                "code_snippet": meta["snippet"],
                "views_count": 1200 + order * 37,
            }
            pl_lessons.append(lesson)
            videos_out.append(lesson)

        if pl_lessons:
            series_list.append(
                {
                    "playlist_id": pid,
                    "title": pl_title,
                    "channel": channel,
                    "category": meta["category"],
                    "difficulty": meta["difficulty"],
                    "video_count": len(pl_lessons),
                    "first_video_id": pl_lessons[0]["id"],
                    "thumbnail_url": pl_lessons[0]["thumbnail_url"],
                }
            )

    return {
        "playlists": series_list,
        "videos": videos_out,
    }


def get_playlist_summaries() -> List[Dict[str, Any]]:
    return list(get_playlist_catalog_data()["playlists"])


def get_all_playlist_videos() -> List[Dict[str, Any]]:
    return list(get_playlist_catalog_data()["videos"])


def find_playlist_video(video_id: str) -> Optional[Dict[str, Any]]:
    for v in get_playlist_catalog_data()["videos"]:
        if v["id"] == video_id or v["slug"] == video_id:
            return v
    return None
