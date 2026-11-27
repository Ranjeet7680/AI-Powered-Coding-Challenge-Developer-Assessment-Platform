"""
Python Data Science & Big Data LMS Course Catalog (14 Video Lectures, Study Notes,
14 Post-Video Comprehension Quizzes, Practice Bank, Capstone Lab & Proctored Exam).
Built from verified playlist PLu0W_9lII9agK8pojo23OHiNz3Jm6VQCH.
"""
from functools import lru_cache
from typing import Any, Dict, List, Optional

from .course_catalog_shared import (
    QuizSpecTuple,
    build_course_catalog,
    filter_quiz_bank_from_catalog,
    find_lesson_in_catalog,
    select_exam_questions_from_catalog,
)


DS_PLAYLIST_ID = "PLu0W_9lII9agK8pojo23OHiNz3Jm6VQCH"
DS_PLAYLIST_URL = f"https://www.youtube.com/playlist?list={DS_PLAYLIST_ID}"
DS_COURSE_ID = "course-ctf-ds-14"
DS_COURSE_TITLE = "Python Data Science & Big Data — 14-Lecture Engineering LMS"
DS_INSTRUCTOR = "CodeWithHarry • Curated Coding Task Factory LMS"
DS_THUMBNAIL_URL = "/thumbnails/ds-ctf-course-thumbnail.svg"

DS_MODULES: List[Dict[str, Any]] = [
    {
        "id": "ds-mod-1",
        "order": 1,
        "title": "Big Data Foundations & Jupyter Environment",
        "description": "Understand Big Data scale characteristics (Volume, Velocity, Variety), analytical value pipelines, and set up interactive Jupyter Notebook workflows.",
        "learning_objectives": [
            "Explain how distributed storage and vectorized Python solve Big Data bottlenecks",
            "Configure isolated Python environments and launch Jupyter Notebook kernels",
            "Use markdown cells, code cells, and magic commands for reproducible exploration",
        ],
        "key_topics": ["Big Data 3Vs", "Data Pipeline Stages", "Jupyter Kernels", "Reproducible Notebooks"],
        "prerequisite_module_ids": [],
        "range": (1, 2),
    },
    {
        "id": "ds-mod-2",
        "order": 2,
        "title": "NumPy Vectorized Computing & Array Operations",
        "description": "Master contiguous typed NumPy ndarrays, element-wise broadcasting, array slicing views, axis reductions (axis=0/1), sorting, argsort, argmin, and argmax.",
        "learning_objectives": [
            "Replace slow Python loops with vectorized C-backed NumPy ndarray operations",
            "Slice multi-dimensional matrices safely while understanding views vs copies",
            "Apply axis-wise aggregations, sorting, and index-returning argsort/argmin/argmax ops",
        ],
        "key_topics": ["ndarray & dtype", "Slicing & Views", "Axis 0 vs Axis 1", "argsort / argmin / argmax"],
        "prerequisite_module_ids": ["ds-mod-1"],
        "range": (3, 6),
    },
    {
        "id": "ds-mod-3",
        "order": 3,
        "title": "Pandas DataFrames, File I/O & Matplotlib Visualization",
        "description": "Build structured Series and DataFrames, slice rows and derive columns cleanly, ingest and export CSV and JSON datasets, merge relational tables, and plot insights with Matplotlib.",
        "learning_objectives": [
            "Construct Pandas DataFrames from dicts, lists, and external CSV/JSON sources",
            "Filter rows and compute derived columns with .loc, .iloc, and vectorized expressions",
            "Join heterogeneous tables via pd.merge and render publication charts in Matplotlib",
        ],
        "key_topics": ["Series & DataFrame", "CSV Read/Write", "Merge & JSON ETL", "Matplotlib Charts"],
        "prerequisite_module_ids": ["ds-mod-2"],
        "range": (7, 14),
    },
]

DS_CAPSTONE_PROJECTS: List[Dict[str, Any]] = [
    {
        "id": "ds-cap-1",
        "module_id": "ds-mod-2",
        "title": "Capstone 1: Vectorized NumPy Sensor Telemetry & Ranking Analyzer",
        "difficulty": "Intermediate",
        "estimated_hours": 4,
        "summary": "Build a loop-free NumPy analytics kernel that standardizes 2D telemetry readings along axis=0, flags anomalous sensors with argmax, and ranks stations via argsort.",
        "deliverables": [
            "Typed float64 ndarray ingestion with z-score column normalization (axis=0)",
            "Fast top-k index extraction using np.argsort without full Python sorting",
            "Peak-spike and trough sensor attribution via np.argmax and np.argmin",
        ],
        "starter_template": "import numpy as np\n\ndef rank_sensors(matrix: np.ndarray, top_k: int = 3) -> np.ndarray:\n    means = matrix.mean(axis=0, keepdims=True)\n    stds = np.where(matrix.std(axis=0, keepdims=True) == 0, 1.0, matrix.std(axis=0, keepdims=True))\n    z_scores = (matrix - means) / stds\n    station_scores = z_scores.mean(axis=0)\n    return np.argsort(station_scores)[::-1][:top_k]\n",
        "rubric": [
            {"criterion": "Vectorized NumPy Axis Reductions", "max_points": 30},
            {"criterion": "Correct argsort / argmax Ranking", "max_points": 30},
            {"criterion": "Edge-Case Handling (Zero Variance)", "max_points": 20},
            {"criterion": "Clean Modular Python Structure", "max_points": 20},
        ],
    },
    {
        "id": "ds-cap-2",
        "module_id": "ds-mod-3",
        "title": "Capstone 2: Multi-Source CSV & JSON ETL Pipeline with Pandas Merge",
        "difficulty": "Intermediate",
        "estimated_hours": 5,
        "summary": "Ingest raw CSV transaction logs and JSON customer metadata, validate schemas, execute relational left/inner merges in Pandas, and export index-clean CSV summary artifacts.",
        "deliverables": [
            "Typed CSV ingestion handling custom missing markers (na_values) and dtype coercion",
            "JSON payload flattening and schema normalization into tabular columns",
            "Integrity-checked pd.merge pipeline outputting index=False CSV reports",
        ],
        "starter_template": "import json\nimport pandas as pd\n\ndef run_etl(orders_df: pd.DataFrame, users_json: str) -> pd.DataFrame:\n    users = pd.json_normalize(json.loads(users_json))\n    merged = pd.merge(orders_df, users, on='user_id', how='left', validate='many_to_one')\n    return merged.dropna(subset=['amount'])\n",
        "rubric": [
            {"criterion": "CSV & JSON Ingestion Hygiene", "max_points": 30},
            {"criterion": "Relational Merge Key & Join Correctness", "max_points": 30},
            {"criterion": "Clean Export (index=False & Null Strategy)", "max_points": 20},
            {"criterion": "Readable Production Pipeline Code", "max_points": 20},
        ],
    },
    {
        "id": "ds-cap-3",
        "module_id": "ds-mod-3",
        "title": "Capstone 3: End-to-End Exploratory Analysis & Matplotlib Reporting Suite",
        "difficulty": "Advanced",
        "estimated_hours": 6,
        "summary": "Combine NumPy statistics, Pandas groupby aggregations, and a multi-panel Matplotlib figure comparing time-series revenue trends alongside distribution histograms.",
        "deliverables": [
            "Pandas DataFrame aggregation table computing count, mean, and p95 latency per cohort",
            "Two-panel Matplotlib Figure with labeled axes, legends, gridlines, and tight_layout()",
            "Deterministic summary statistics dictionary verified against unit assertions",
        ],
        "starter_template": "import numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\ndef build_report(df: pd.DataFrame):\n    summary = df.groupby('segment')['revenue'].agg(['count', 'mean', 'sum'])\n    fig, axes = plt.subplots(1, 2, figsize=(10, 4))\n    axes[0].bar(summary.index, summary['sum'])\n    axes[1].hist(df['revenue'].to_numpy(), bins=15)\n    fig.tight_layout()\n    return summary, fig\n",
        "rubric": [
            {"criterion": "Exploratory Aggregation & Metric Accuracy", "max_points": 30},
            {"criterion": "Matplotlib Figure & Axis Clarity", "max_points": 30},
            {"criterion": "Pandas-to-NumPy Interoperability", "max_points": 20},
            {"criterion": "Analytical Findings & Documentation", "max_points": 20},
        ],
    },
]

DS_LESSON_QUIZ_SPECS: Dict[int, QuizSpecTuple] = {
    1: (
        "Which core dimensions (the 3Vs) typically define Big Data workloads requiring scalable analytics tooling?",
        [
            "Volume (scale), Velocity (ingestion speed), and Variety (structured, semi-structured, and unstructured formats)",
            "Voltage, Viscosity, and Verticality across network cables",
            "Variables, Vectors, and Views inside a single CSV under 1 MB",
            "Versioning, Validation, and Virtualization only",
        ],
        0,
        "Big Data Core Pillars: $\\text{Big Data} = (\\text{Volume},\\ \\text{Velocity},\\ \\text{Variety})$",
        "Big Data systems are designed to ingest high-velocity streams, huge data volumes, and diverse formats like CSV, JSON, logs, and media.",
        "# Quick throughput sanity check for batch ingestion rates\nrecords_per_sec = 50_000\ndaily_records = records_per_sec * 86_400\nprint(f'Daily volume: {daily_records:,} events')",
    ),
    2: (
        "In Jupyter Notebook, what is the practical difference between pressing Shift+Enter on a Markdown cell versus a Code cell?",
        [
            "Code cells execute Python statements in the active IPython kernel, whereas Markdown cells render formatted prose, equations, and documentation",
            "Markdown cells execute C++ binaries while Code cells save PNG screenshots",
            "Markdown cells bypass the notebook JSON file and edit disk kernels directly",
            "Both cell types always run inside the browser CSS engine without a kernel",
        ],
        0,
        "Jupyter Dual-Cell Execution: Code $\\rightarrow$ IPython Kernel; Markdown $\\rightarrow$ Rendered Documentation",
        "Jupyter Notebooks pair live executable Python cells with Markdown narrative blocks so data analysis, charts, and reasoning live together.",
        "# Typical Jupyter Notebook exploratory cell\nimport sys\nprint('Kernel Python:', sys.version.split()[0])",
    ),
    3: (
        "Why are homogeneous NumPy ndarrays significantly faster and more memory-efficient for numerical math than standard Python lists?",
        [
            "NumPy stores elements of a fixed dtype in a contiguous block of C memory enabling vectorized SIMD operations without per-element Python object boxing",
            "Python lists cannot store floating-point numbers accurately",
            "NumPy compiles every script directly into HTML templates automatically",
            "Python lists allocate memory strictly on remote cloud servers",
        ],
        0,
        "Memory Layout: Contiguous typed buffer (`ndarray`) vs heap-scattered `PyObject*` pointer list",
        "Eliminating per-item type checking and pointer indirection lets NumPy execute C-level loops across contiguous buffers at orders-of-magnitude higher throughput.",
        "import numpy as np\narr = np.array([10, 20, 30, 40], dtype=np.int64)\nprint(arr.dtype, arr.nbytes, arr * 2)",
    ),
    4: (
        "What happens when you slice a NumPy array with `sub = arr[1:4]` and modify `sub[0] = 999`?",
        [
            "`arr[1]` also changes to `999` because basic NumPy slices return zero-copy views sharing the underlying data buffer",
            "`arr` remains untouched because slicing always deep-copies the array",
            "NumPy raises an immutability TypeError on basic slices",
            "The array shape automatically resizes to 1D scalar output",
        ],
        0,
        "NumPy Views vs Copies: `sub = arr[1:4]` shares memory; `arr[1:4].copy()` allocates independent storage",
        "Basic slicing returns a view for speed and zero memory overhead; call `.copy()` explicitly whenever downstream mutation must stay isolated.",
        "import numpy as np\narr = np.array([1, 2, 3, 4, 5])\nview = arr[1:4]\nsafe = arr[1:4].copy()\nprint(np.shares_memory(arr, view), np.shares_memory(arr, safe))",
    ),
    5: (
        "Given a 2D NumPy matrix `M` with 4 rows and 3 columns, what does `M.sum(axis=0)` compute?",
        [
            "The column-wise sum across rows, returning a 1D array of length 3",
            "The row-wise sum across columns, returning a 1D array of length 4",
            "A scalar sum of only diagonal entries",
            "An element-wise sort of every row in descending order",
        ],
        0,
        "Axis Convention in 2D arrays `(rows, cols)`: `axis=0` collapses rows; `axis=1` collapses columns",
        "`axis=0` reduces along the vertical row dimension so one summary value is returned per column; `axis=1` reduces horizontally across columns.",
        "import numpy as np\nM = np.array([[1, 2, 3], [4, 5, 6]])\nprint('col sums (axis=0):', M.sum(axis=0))\nprint('row sums (axis=1):', M.sum(axis=1))",
    ),
    6: (
        "What does `np.argsort(scores)` return compared to `np.sort(scores)`?",
        [
            "An integer array of indices that would reorder `scores` into ascending order, rather than the sorted values themselves",
            "Only the single maximum value inside `scores`",
            "A boolean mask flagging negative elements",
            "The unsorted array reversed in place",
        ],
        0,
        "Index Queries: `idx = np.argsort(a)` $\\implies$ `a[idx]` is sorted; `argmin`/`argmax` give extreme positions",
        "`argsort` returns positional indices so you can align parallel columns (such as sorting feature names or sample IDs by score).",
        "import numpy as np\nscores = np.array([72, 95, 84])\nidx = np.argsort(scores)\nprint('sorted indices:', idx, 'max pos:', np.argmax(scores))",
    ),
    7: (
        "Which two core labeled data structures form the foundation of the Python Pandas library?",
        [
            "1D labeled `Series` (with index) and 2D tabular `DataFrame` (labeled rows + heterogeneous columns)",
            "LinkedList and HashTable objects from stdlib collections",
            "Fixed-size C structs and OpenGL textures",
            "Immutable tuples and sets without column names",
        ],
        0,
        "Pandas Core Types: `Series` (1D labeled vector) $\\subset$ `DataFrame` (2D column-aligned table)",
        "Every column in a Pandas `DataFrame` is a labeled `Series` sharing an aligned row index, giving SQL-like tabular semantics in Python.",
        "import pandas as pd\ns = pd.Series([100, 250, 400], index=['a', 'b', 'c'], name='revenue')\nprint(s.loc['b'])",
    ),
    8: (
        "What happens when you initialize `pd.DataFrame({'name': ['Asha', 'Rohan'], 'score': [91, 88]})` from a Python dictionary?",
        [
            "Dictionary keys become column headers (`name`, `score`) and equal-length sequences populate the corresponding rows",
            "Dictionary keys become nested JSON files on disk automatically",
            "Only numeric columns are kept while string columns are discarded",
            "Rows and columns transpose unless `orient='list'` is passed",
        ],
        0,
        "Dict-to-DataFrame Mapping: `{col_name: sequence}` builds aligned columns cleanly",
        "Passing a column-oriented dict maps each key cleanly to a column header with matching row length validation.",
        "import pandas as pd\ndf = pd.DataFrame({'name': ['Asha', 'Rohan'], 'score': [91, 88]})\nprint(df.shape, list(df.columns))",
    ),
    9: (
        "What distinguishes label-based indexing `.loc[...]` from integer-position indexing `.iloc[...]` in Pandas?",
        [
            "`.loc` selects by explicit row/column labels (inclusive endpoints), whereas `.iloc` selects by zero-based integer positions (exclusive end)",
            "`.iloc` works exclusively on string column names",
            "`.loc` drops rows silently whenever float values appear",
            "Both behave identically even when a DataFrame has custom string row labels",
        ],
        0,
        "Pandas Indexing Discipline: `.loc[row_label, col_label]` vs `.iloc[row_pos, col_pos]`",
        "Using `.loc` vs `.iloc` explicitly prevents chained-indexing `SettingWithCopyWarning` bugs when slicing or adding derived columns.",
        "import pandas as pd\ndf = pd.DataFrame({'x': [10, 20, 30]}, index=['r1', 'r2', 'r3'])\ndf['x_double'] = df['x'] * 2\nprint(df.loc['r1':'r2', 'x_double'].tolist())",
    ),
    10: (
        "Which parameters in `pd.read_csv()` help safely ingest large or imperfectly formatted CSV datasets?",
        [
            "`na_values` to standardize custom missing tokens, `dtype` for memory-safe column types, and `chunksize` to stream huge files incrementally",
            "`to_excel=True` to bypass text parsing",
            "`disable_headers=True` so Pandas concatenates all rows into one string",
            "`sort_index=True` which converts integers into images",
        ],
        0,
        "Robust CSV Ingestion: `pd.read_csv(path, dtype=..., na_values=..., usecols=..., chunksize=...)`",
        "Specifying column types, custom NA tokens, and `usecols` or `chunksize` avoids silent object-dtype bloat and out-of-memory failures.",
        "import io, pandas as pd\nraw = 'id,amount\\n1,120.5\\n2,N/A\\n'\ndf = pd.read_csv(io.StringIO(raw), na_values=['N/A'], dtype={'id': 'int32', 'amount': 'float64'})\nprint(df.isna().sum().to_dict())",
    ),
    11: (
        "Why is `df.to_csv('clean_output.csv', index=False)` commonly preferred when exporting cleaned Pandas DataFrames?",
        [
            "It omits the unnamed auto-generated integer row index column so downstream pipelines do not accumulate extra `Unnamed: 0` columns",
            "It removes all column headers from the CSV output",
            "It compresses CSV text into binary Parquet automatically",
            "It prevents NaN values from ever appearing in memory",
        ],
        0,
        "Clean CSV Serialization: `index=False` avoids redundant `Unnamed: 0` schema drift",
        "Unless the index holds meaningful semantic identifiers (like timestamps or IDs), writing `index=False` preserves exact schema parity on round-trip reads.",
        "import pandas as pd\ndf = pd.DataFrame({'city': ['Pune', 'Delhi'], 'temp': [29, 34]})\ncsv_text = df.to_csv(index=False)\nprint(csv_text.strip())",
    ),
    12: (
        "In `pd.merge(orders, users, on='user_id', how='left')`, how are rows from `orders` without a match in `users` handled?",
        [
            "Every row from `orders` is preserved in the result, with `NaN` filling unmatched columns originating from `users`",
            "Unmatched rows in `orders` are dropped just like an inner join",
            "`pd.merge` raises an exception unless both tables have identical row counts",
            "Unmatched rows overwrite the first row of `users`",
        ],
        0,
        "Relational Merge Semantics: `how='left'` preserves left keys; `validate='many_to_one'` guards key duplicates",
        "Left joins retain every record in the primary fact table while attaching enrichment attributes where keys match and `NaN` otherwise.",
        "import pandas as pd\norders = pd.DataFrame({'user_id': [1, 2], 'amt': [50, 80]})\nusers = pd.DataFrame({'user_id': [1], 'tier': ['pro']})\nprint(pd.merge(orders, users, on='user_id', how='left'))",
    ),
    13: (
        "Which stdlib functions convert between JSON strings and native Python dicts/lists, and how do Pandas users flatten nested JSON APIs?",
        [
            "`json.loads` / `json.dumps` parse and serialize JSON strings, while `pd.json_normalize` flattens nested objects into DataFrame columns",
            "`json.merge` converts SQL tables directly into PNG files",
            "`pickle.loads` is the standard safe parser for untrusted web JSON payloads",
            "JSON objects only support integer keys in Python",
        ],
        0,
        "JSON ETL Flow: JSON string $\\xrightarrow{\\text{json.loads}}$ dict/list $\\xrightarrow{\\text{pd.json\\_normalize}}$ DataFrame",
        "Knowing both Python's standard `json` module and Pandas flattening utilities lets pipelines bridge REST APIs directly into tabular analysis.",
        "import json, pandas as pd\npayload = '[{\"id\": 1, \"meta\": {\"city\": \"BLR\"}}]'\nflat = pd.json_normalize(json.loads(payload))\nprint(flat.columns.tolist())",
    ),
    14: (
        "Using Matplotlib's explicit object-oriented API (`fig, ax = plt.subplots()`), why is working on `ax` preferred for multi-chart analytical figures?",
        [
            "Explicit `Figure` and `Axes` handles give isolated control over labels, legends, ticks, and subplots without global pyplot state collisions",
            "`plt.subplots()` only renders scatter plots and disables bar charts",
            "`ax` bypasses data validation and generates fake sample points",
            "Global `plt.plot()` is the only way to save PNG or SVG files",
        ],
        0,
        "OO Matplotlib API: `fig, ax = plt.subplots()` $\\rightarrow$ `ax.plot(...)`, `ax.set_title(...)`, `fig.tight_layout()`",
        "The explicit `Figure`/`Axes` pattern scales cleanly from single charts to multi-panel diagnostic dashboards and automated reporting scripts.",
        "import matplotlib.pyplot as plt\nfig, ax = plt.subplots(figsize=(6, 3))\nax.plot([1, 2, 3], [12, 19, 27], marker='o', label='Throughput')\nax.set_title('Weekly Growth'); ax.legend()",
    ),
}

# All 14 curated curriculum questions for the camera-proctored final exam
DS_FINAL_EXAM_ORDERS: List[int] = list(range(1, 15))


@lru_cache(maxsize=1)
def get_ds_course_catalog() -> Dict[str, Any]:
    return build_course_catalog(
        course_id=DS_COURSE_ID,
        course_title=DS_COURSE_TITLE,
        playlist_id=DS_PLAYLIST_ID,
        playlist_url=DS_PLAYLIST_URL,
        instructor=DS_INSTRUCTOR,
        thumbnail_url=DS_THUMBNAIL_URL,
        playlist_filename="ds_playlist_data.json",
        modules=DS_MODULES,
        quiz_specs=DS_LESSON_QUIZ_SPECS,
        id_prefix="ds",
        curriculum_label="Python Data Science & Big Data Academy",
        capstone_projects=DS_CAPSTONE_PROJECTS,
    )


def get_ds_lesson_by_id(lesson_id: str) -> Optional[Dict[str, Any]]:
    return find_lesson_in_catalog(get_ds_course_catalog(), lesson_id)


def get_ds_quiz_bank(include_answers: bool = False) -> List[Dict[str, Any]]:
    return filter_quiz_bank_from_catalog(get_ds_course_catalog(), include_answers=include_answers)


def get_ds_final_exam_questions(include_answers: bool = False) -> List[Dict[str, Any]]:
    return select_exam_questions_from_catalog(
        get_ds_course_catalog(),
        DS_FINAL_EXAM_ORDERS,
        include_answers=include_answers,
    )
