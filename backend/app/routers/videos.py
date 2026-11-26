import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, Dict, List, Optional
from ..database import get_db
from ..models import VideoLesson
from ..schemas import (
    VideoLessonResponse,
    VideoPlaylistSummaryResponse,
    VideoWatchContextResponse,
)
from ..services.course_catalog_shared import build_locked_lms_embed_url
from ..services.video_library import (
    find_playlist_video,
    get_all_playlist_videos,
    get_playlist_summaries,
)

router = APIRouter(prefix="/api/videos", tags=["Video Lessons"])

_YT_EMBED_RE = re.compile(r"youtube(?:-nocookie)?\.com/embed/([A-Za-z0-9_-]{6,})")

# Heals historical Postgres VideoLesson seed IDs that became unavailable on YouTube
_BROKEN_VIDEO_REPLACEMENTS = {
    "wjZofJX0v4U": "eMlx5fFNoYc",
    "7V35oxV9_j0": "7ABFKPK2hD4",
    "iuqZvajTO4A": "bUHFg8CZFws",
}


def _ensure_locked_embed_url(url: str) -> str:
    if not url:
        return url
    match = _YT_EMBED_RE.search(url)
    if match:
        vid = _BROKEN_VIDEO_REPLACEMENTS.get(match.group(1), match.group(1))
        if "youtube-nocookie.com/embed/" in url and "rel=0" in url and vid == match.group(1):
            return url
        return build_locked_lms_embed_url(vid)
    return url


def _video_model_to_dict(v: VideoLesson) -> Dict[str, Any]:
    return {
        "id": v.id,
        "title": v.title,
        "slug": v.slug,
        "description": v.description,
        "video_url": _ensure_locked_embed_url(v.video_url),
        "thumbnail_url": v.thumbnail_url,
        "duration_minutes": v.duration_minutes,
        "duration_label": f"{v.duration_minutes}:00",
        "category": v.category,
        "difficulty": v.difficulty,
        "instructor": v.instructor,
        "instructor_avatar": v.instructor_avatar,
        "related_challenge_id": v.related_challenge_id,
        "playlist_id": None,
        "playlist_title": None,
        "episode_order": None,
        "chapters": list(v.chapters or []),
        "key_takeaways": list(v.key_takeaways or []),
        "code_snippet": v.code_snippet,
        "views_count": v.views_count,
        "created_at": v.created_at,
    }

SEED_VIDEOS = [
    {
        "id": "v-ml-neural-net",
        "title": "Building a Neural Network from Scratch in Python",
        "slug": "building-neural-network-from-scratch",
        "description": "Complete masterclass detailing the mathematics of artificial neural networks. Learn matrix operations, activation functions (ReLU, Sigmoid), forward propagation, computing loss gradients with the chain rule, and updating model weights via backpropagation.",
        "video_url": build_locked_lms_embed_url("aircAruvnKk"),  # 3Blue1Brown Neural Networks masterpiece embed
        "thumbnail_url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80",
        "duration_minutes": 22,
        "category": "Machine Learning",
        "difficulty": "Intermediate",
        "instructor": "Dr. Andrew Karpathy",
        "instructor_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "related_challenge_id": "c-ml-softmax-loss",
        "chapters": [
            {"title": "Biological vs Computational Neurons", "time": "00:00"},
            {"title": "Forward Pass & Dot Products", "time": "04:15"},
            {"title": "Loss Function & Gradient Derivation", "time": "10:30"},
            {"title": "Backpropagation Implementation in Python", "time": "16:45"}
        ],
        "key_takeaways": [
            "Matrix multiplication drives high-performance tensor transformations.",
            "Numerical stability prevents NaN explosion during softmax normalization.",
            "Vectorized gradient descent accelerates training 100x over loops."
        ],
        "code_snippet": """import numpy as np

class DenseLayer:
    def __init__(self, n_inputs, n_neurons):
        self.weights = 0.01 * np.random.randn(n_inputs, n_neurons)
        self.biases = np.zeros((1, n_neurons))

    def forward(self, inputs):
        self.inputs = inputs
        self.output = np.dot(inputs, self.weights) + self.biases
        return self.output
""",
        "views_count": 8940
    },
    {
        "id": "v-ml-transformer-attention",
        "title": "Transformer Self-Attention Mechanism Visualized & Coded",
        "slug": "transformer-self-attention-visualized",
        "description": "Step-by-step breakdown of the core engine behind modern LLMs (GPT, Gemini, Claude). Understand Queries (Q), Keys (K), and Values (V), dot-product similarity, scaling by sqrt(d_k), causal masking, and parallel head computation.",
        "video_url": build_locked_lms_embed_url("eMlx5fFNoYc"),  # 3Blue1Brown Attention in Transformers (embed-verified)
        "thumbnail_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
        "duration_minutes": 18,
        "category": "Machine Learning",
        "difficulty": "Advanced",
        "instructor": "Elena Rostova (AI Lead)",
        "instructor_avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        "related_challenge_id": "c-ml-self-attention",
        "chapters": [
            {"title": "Why Recurrence Failed at Scale", "time": "00:00"},
            {"title": "Query, Key, Value Projections", "time": "03:40"},
            {"title": "Scaled Dot-Product Math", "time": "08:20"},
            {"title": "Vectorized PyTorch Implementation", "time": "13:10"}
        ],
        "key_takeaways": [
            "Attention scores measure token contextual relevance across sequences.",
            "Scaling by sqrt(d_k) prevents softmax vanishing gradients for large dimensions.",
            "Multi-head attention permits focusing on distinct syntactic aspects simultaneously."
        ],
        "code_snippet": """import numpy as np

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.shape[-1]
    scores = np.matmul(Q, K.swapaxes(-1, -2)) / np.sqrt(d_k)
    if mask is not None:
        scores = np.where(mask == 0, -1e9, scores)
    weights = np.exp(scores - np.max(scores, axis=-1, keepdims=True))
    weights /= np.sum(weights, axis=-1, keepdims=True)
    return np.matmul(weights, V), weights
""",
        "views_count": 14280
    },
    {
        "id": "v-algo-lru-cache",
        "title": "LRU Cache Deep Dive: Doubly Linked Lists & Hash Maps",
        "slug": "lru-cache-deep-dive-doubly-linked-list",
        "description": "Comprehensive visual breakdown of the Least Recently Used (LRU) Cache pattern. We analyze naive array solutions, explore why O(1) eviction demands a doubly linked list, and implement a production-ready solution in Python and TypeScript.",
        "video_url": build_locked_lms_embed_url("7ABFKPK2hD4"),  # NeetCode LRU Cache (embed-verified)
        "thumbnail_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
        "duration_minutes": 15,
        "category": "Data Structures",
        "difficulty": "Medium",
        "instructor": "Marcus Vance",
        "instructor_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "related_challenge_id": "c2-lru-cache",
        "chapters": [
            {"title": "Problem Statement & Requirements", "time": "00:00"},
            {"title": "Why Hash Maps Alone Fall Short", "time": "02:50"},
            {"title": "Doubly Linked List Sentinel Nodes", "time": "06:30"},
            {"title": "O(1) Get & Put Implementation", "time": "10:15"}
        ],
        "key_takeaways": [
            "Dummy head and tail sentinels eliminate edge-case pointer null checks.",
            "Hash map gives O(1) lookup to the linked list node.",
            "Removing and appending to head takes strictly constant O(1) time."
        ],
        "code_snippet": """class Node:
    def __init__(self, key, val):
        self.key, self.val = key, val
        self.prev = self.next = None
""",
        "views_count": 21450
    },
    {
        "id": "v-algo-dynamic-programming",
        "title": "Dynamic Programming Masterclass: From Recursion to Memoization & Tabulation",
        "slug": "dynamic-programming-masterclass",
        "description": "Learn the universal framework for solving any dynamic programming problem: identifying optimal substructure, drawing the state space tree, implementing top-down memoization, and transitioning to bottom-up tabular DP.",
        "video_url": build_locked_lms_embed_url("oBt53YbR9Kk"),  # FreeCodeCamp DP course
        "thumbnail_url": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80",
        "duration_minutes": 28,
        "category": "Algorithms",
        "difficulty": "Hard",
        "instructor": "Priya Sharma",
        "instructor_avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        "related_challenge_id": "c3-trapping-rain-water",
        "chapters": [
            {"title": "The DP Paradigm & Overlapping Subproblems", "time": "00:00"},
            {"title": "Top-Down with Memoization Cache", "time": "07:20"},
            {"title": "Bottom-Up Tabulation Space Optimization", "time": "15:40"},
            {"title": "Live Code: Trapping Rain Water Solution", "time": "21:10"}
        ],
        "key_takeaways": [
            "Always write the brute force recursive recurrence relation first.",
            "Cache dimensions match the number of changing state parameters.",
            "Two pointers often reduce O(N) auxiliary space down to O(1)."
        ],
        "code_snippet": """def memoized_solver(state, memo={}):
    if state in memo:
        return memo[state]
    # compute transition
    memo[state] = result
    return result
""",
        "views_count": 17820
    },
    {
        "id": "v-ml-kmeans-clustering",
        "title": "K-Means Clustering Algorithm from Scratch in Python",
        "slug": "kmeans-clustering-from-scratch",
        "description": "Unsupervised machine learning explained visually. Learn how Lloyd's algorithm iteratively partitions unlabeled data points into K clusters, computes Voronoi boundaries, recalculates centroids, and detects convergence with inertia.",
        "video_url": build_locked_lms_embed_url("4b5d3muPQmA"),  # StatQuest K-means
        "thumbnail_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
        "duration_minutes": 16,
        "category": "Machine Learning",
        "difficulty": "Intermediate",
        "instructor": "Dr. Aris Thorne",
        "instructor_avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "related_challenge_id": "c-ml-kmeans",
        "chapters": [
            {"title": "Unsupervised Learning & Cluster Intuition", "time": "00:00"},
            {"title": "Centroid Initialization & Distance Metrics", "time": "04:10"},
            {"title": "The Expectation-Maximization Loop", "time": "08:35"},
            {"title": "Python NumPy Vectorization", "time": "12:15"}
        ],
        "key_takeaways": [
            "K-Means is sensitive to initial random centroid placement (K-Means++ helps).",
            "Broadcasting in NumPy computes all point-to-centroid distances in a single matrix operation.",
            "Convergence is reached when centroid movements fall below threshold epsilon."
        ],
        "code_snippet": """import numpy as np

def assign_clusters(X, centroids):
    distances = np.linalg.norm(X[:, np.newaxis] - centroids, axis=2)
    return np.argmin(distances, axis=1)
""",
        "views_count": 11300
    },
    {
        "id": "v-sys-distributed-cache",
        "title": "System Design: Building a High-Throughput Distributed Cache",
        "slug": "system-design-distributed-cache",
        "description": "Staff engineer breakdown of scaling in-memory cache architecture (Redis, Memcached). Covers consistent hashing, replication, cache-aside vs write-through strategies, handling thundering herds, and cache penetration defenses.",
        "video_url": build_locked_lms_embed_url("bUHFg8CZFws"),  # System Design Caching & Architecture (embed-verified)
        "thumbnail_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
        "duration_minutes": 24,
        "category": "System Design",
        "difficulty": "Advanced",
        "instructor": "David Kim (Staff Architect)",
        "instructor_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "related_challenge_id": "c2-lru-cache",
        "chapters": [
            {"title": "Cache Topologies & Latency Numbers", "time": "00:00"},
            {"title": "Consistent Hashing Ring & Virtual Nodes", "time": "06:15"},
            {"title": "Cache Invalidation Strategies", "time": "13:40"},
            {"title": "Surviving Cache Stampedes & Hot Keys", "time": "18:25"}
        ],
        "key_takeaways": [
            "Consistent hashing minimizes key remapping when nodes join or leave the cluster.",
            "Probabilistic early expiration (XFetch) eliminates cache stampedes completely.",
            "Bloom filters prevent cache penetration from non-existent key requests."
        ],
        "code_snippet": """import hashlib

def hash_key(key: str) -> int:
    return int(hashlib.md5(key.encode()).hexdigest(), 16)
""",
        "views_count": 19640
    }
]

def seed_videos(db: Session):
    for v_data in SEED_VIDEOS:
        existing = db.query(VideoLesson).filter(VideoLesson.id == v_data["id"]).first()
        if not existing:
            v = VideoLesson(
                id=v_data["id"],
                title=v_data["title"],
                slug=v_data["slug"],
                description=v_data["description"],
                video_url=v_data["video_url"],
                thumbnail_url=v_data["thumbnail_url"],
                duration_minutes=v_data["duration_minutes"],
                category=v_data["category"],
                difficulty=v_data["difficulty"],
                instructor=v_data["instructor"],
                instructor_avatar=v_data.get("instructor_avatar"),
                related_challenge_id=v_data.get("related_challenge_id"),
                chapters=v_data.get("chapters", []),
                key_takeaways=v_data.get("key_takeaways", []),
                code_snippet=v_data.get("code_snippet"),
                views_count=v_data.get("views_count", 1200)
            )
            db.add(v)
    db.commit()

@router.get("/playlists", response_model=List[VideoPlaylistSummaryResponse])
def get_video_playlists():
    return get_playlist_summaries()


@router.get("", response_model=List[VideoLessonResponse])
def get_videos(
    search: Optional[str] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    playlist_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    combined: List[Dict[str, Any]] = []
    if not playlist_id:
        if db.query(VideoLesson.id).first() is None:
            seed_videos(db)
        db_videos = db.query(VideoLesson).order_by(VideoLesson.views_count.desc()).all()
        combined.extend(_video_model_to_dict(v) for v in db_videos)

    playlist_videos = get_all_playlist_videos()
    if playlist_id:
        playlist_videos = [v for v in playlist_videos if v.get("playlist_id") == playlist_id]
    combined.extend(playlist_videos)

    search_lower = search.strip().lower() if search else ""
    out: List[Dict[str, Any]] = []
    for item in combined:
        if category and category != "All" and item.get("category") != category:
            continue
        if difficulty and difficulty != "All" and item.get("difficulty") != difficulty:
            continue
        if search_lower:
            hay = " ".join(
                [
                    str(item.get("title") or ""),
                    str(item.get("description") or ""),
                    str(item.get("playlist_title") or ""),
                    str(item.get("instructor") or ""),
                    str(item.get("category") or ""),
                ]
            ).lower()
            if search_lower not in hay:
                continue
        out.append(item)

    if playlist_id:
        out.sort(key=lambda item: int(item.get("episode_order") or 0))
    return out


def _resolve_video_and_db_list(video_id: str, db: Session):
    pl_video = find_playlist_video(video_id)
    if pl_video:
        return pl_video, None

    if db.query(VideoLesson.id).first() is None:
        seed_videos(db)
    db_video = (
        db.query(VideoLesson)
        .filter((VideoLesson.id == video_id) | (VideoLesson.slug == video_id))
        .first()
    )
    if not db_video:
        return None, None
    all_db = [
        _video_model_to_dict(v)
        for v in db.query(VideoLesson).order_by(VideoLesson.views_count.desc()).all()
    ]
    return _video_model_to_dict(db_video), all_db


@router.get("/{video_id}/watch-context", response_model=VideoWatchContextResponse)
def get_video_watch_context(video_id: str, db: Session = Depends(get_db)):
    video, all_db = _resolve_video_and_db_list(video_id, db)
    if not video:
        raise HTTPException(status_code=404, detail="Video lesson not found")

    pid = video.get("playlist_id")
    series = None
    if pid:
        series = next((p for p in get_playlist_summaries() if p["playlist_id"] == pid), None)
        series_videos = sorted(
            [v for v in get_all_playlist_videos() if v.get("playlist_id") == pid],
            key=lambda item: int(item.get("episode_order") or 0),
        )
    else:
        series_videos = all_db or []

    idx = next((i for i, item in enumerate(series_videos) if item["id"] == video["id"]), -1)
    prev_video = series_videos[idx - 1] if idx > 0 else None
    next_video = series_videos[idx + 1] if 0 <= idx < len(series_videos) - 1 else None

    return {
        "video": video,
        "series": series,
        "series_videos": series_videos,
        "prev_video": prev_video,
        "next_video": next_video,
        "platform_share_path": f"/app/videos/{video['id']}",
    }


@router.get("/{video_id}", response_model=VideoLessonResponse)
def get_video(video_id: str, db: Session = Depends(get_db)):
    video, _ = _resolve_video_and_db_list(video_id, db)
    if not video:
        raise HTTPException(status_code=404, detail="Video lesson not found")
    return video
