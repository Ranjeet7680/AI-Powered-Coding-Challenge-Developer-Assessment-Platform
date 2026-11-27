"""
Agentic AI Engineering LMS Course Catalog (23 Video Lectures, Study Notes,
23 Post-Video Comprehension Quizzes, Practice Bank, Capstone Lab & Proctored Exam).
Built from verified playlist PLlSLJhV9FomIU8A1bkP4If5Xuea2oJcqE.
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


AGENTIC_PLAYLIST_ID = "PLlSLJhV9FomIU8A1bkP4If5Xuea2oJcqE"
AGENTIC_PLAYLIST_URL = f"https://www.youtube.com/playlist?list={AGENTIC_PLAYLIST_ID}"
AGENTIC_COURSE_ID = "course-ctf-agentic-23"
AGENTIC_COURSE_TITLE = "Agentic AI Engineering — 23-Lecture Autonomous Agents & MCP LMS"
AGENTIC_INSTRUCTOR = "Code With Aarohi • Curated Coding Task Factory LMS"
AGENTIC_THUMBNAIL_URL = "/thumbnails/agentic-ctf-course-thumbnail.svg"

AGENTIC_MODULES: List[Dict[str, Any]] = [
    {
        "id": "ag-mod-1",
        "order": 1,
        "title": "Agentic vs Generative Foundations & Classical Agents",
        "description": "Distinguish passive Generative AI from autonomous goal-directed AI Agents, study the 5 classical agent architectures, and implement Simple Reflex & Goal-Based agents in Python and LangChain.",
        "learning_objectives": [
            "Contrast single-turn Generative AI generation against closed-loop Agentic perception, planning, and tool execution",
            "Classify Simple Reflex, Model-Based, Goal-Based, Utility-Based, and Learning Agents",
            "Build Python reflex loops and LangChain + Streamlit goal-directed workflows",
        ],
        "key_topics": ["GenAI vs Agentic AI", "5 Agent Types", "Reflex Agents in Python", "LangChain Goal Agents"],
        "prerequisite_module_ids": [],
        "range": (1, 7),
    },
    {
        "id": "ag-mod-2",
        "order": 2,
        "title": "Learning Agents & Reinforcement Learning Control",
        "description": "Equip adaptive agents to improve from environment feedback using Reinforcement Learning, state-value functions V(s), the Bellman optimality equation, and temporal-difference Q-learning.",
        "learning_objectives": [
            "Design Critic, Learning Element, Performance Element, and Problem Generator loops",
            "Apply Bellman backup equations for discounted cumulative return V(s)",
            "Update action-value Q(s, a) tables via epsilon-greedy temporal-difference exploration",
        ],
        "key_topics": ["Learning Agents", "Reinforcement Learning", "Bellman V(s)", "Q-Learning"],
        "prerequisite_module_ids": ["ag-mod-1"],
        "range": (8, 11),
    },
    {
        "id": "ag-mod-3",
        "order": 3,
        "title": "Stateful Orchestration: LangGraph, CrewAI & Agno RAG",
        "description": "Architect cyclic stateful agent graphs in LangGraph, role-based multi-agent crews in CrewAI, multimodal memory-backed Agno agents, and retrieval-augmented Agentic RAG systems.",
        "learning_objectives": [
            "Model shared TypedDict state, tool nodes, conditional edges, and checkpoint loops in LangGraph",
            "Coordinate specialized agent roles, tasks, and delegation hierarchies with CrewAI",
            "Combine Agno tools, persistent session memory, and vector retrieval for Agentic RAG",
        ],
        "key_topics": ["LangGraph State Machines", "CrewAI Multi-Agent", "Agno Tools & Memory", "Agentic RAG"],
        "prerequisite_module_ids": ["ag-mod-2"],
        "range": (12, 16),
    },
    {
        "id": "ag-mod-4",
        "order": 4,
        "title": "Model Context Protocol (MCP) & OpenAI Agents SDK",
        "description": "Standardize external tool and data connectivity using Model Context Protocol (MCP), build custom MCP servers, deploy them to the cloud, and integrate them with LangGraph, Agno, and OpenAI Agents SDK.",
        "learning_objectives": [
            "Explain MCP Host, Client, Server, Tools, Resources, and JSON-RPC transports",
            "Author custom Python MCP servers and integrate ready-made MCP servers into LangGraph & Agno",
            "Deploy cloud-hosted MCP endpoints and orchestrate OpenAI Agents SDK handoffs with MCP tools",
        ],
        "key_topics": ["MCP Architecture", "Custom MCP Servers", "Cloud MCP Hosting", "OpenAI Agents SDK + MCP"],
        "prerequisite_module_ids": ["ag-mod-3"],
        "range": (17, 23),
    },
]

AGENTIC_CAPSTONE_PROJECTS: List[Dict[str, Any]] = [
    {
        "id": "ag-cap-1",
        "module_id": "ag-mod-2",
        "title": "Capstone 1: Adaptive Learning Agent with Bellman Q-Learning Loop",
        "difficulty": "Intermediate",
        "estimated_hours": 5,
        "summary": "Implement a tabular Q-learning agent with epsilon-greedy exploration decay, TD-error Bellman updates, and episodic reward tracking across a grid environment.",
        "deliverables": [
            "Modular QAgent class maintaining Q(s, a) lookup table and greedy policy extraction",
            "Temporal-difference update step Q(s, a) <- Q(s, a) + alpha * (r + gamma * max Q(s', a') - Q(s, a))",
            "Training summary asserting average reward improvement over random baseline",
        ],
        "starter_template": "import numpy as np\n\ndef td_update(Q, state, action, reward, next_state, alpha=0.1, gamma=0.95):\n    td_target = reward + gamma * np.max(Q[next_state])\n    Q[state, action] += alpha * (td_target - Q[state, action])\n    return Q[state, action]\n",
        "rubric": [
            {"criterion": "Bellman TD Update & Discounting Accuracy", "max_points": 30},
            {"criterion": "Exploration-Exploitation Policy Schedule", "max_points": 30},
            {"criterion": "State Space Convergence Diagnostics", "max_points": 20},
            {"criterion": "Clean Modular Python Structure", "max_points": 20},
        ],
    },
    {
        "id": "ag-cap-2",
        "module_id": "ag-mod-3",
        "title": "Capstone 2: Stateful LangGraph Router & Agentic RAG Verification Pipeline",
        "difficulty": "Intermediate",
        "estimated_hours": 6,
        "summary": "Build a typed state graph coordinating query planning, local vector retrieval, relevance grading, fallback web lookup, and bounded retry edges to prevent infinite agent loops.",
        "deliverables": [
            "TypedDict AgentState schema tracking messages, retrieved chunks, relevance flag, and step count",
            "Conditional router transitioning between retrieve, rewrite_query, synthesize, and END",
            "Max-iteration termination safeguard guaranteeing bounded execution cost",
        ],
        "starter_template": "from typing import TypedDict, List\n\nclass AgentState(TypedDict):\n    query: str\n    docs: List[str]\n    relevant: bool\n    steps: int\n\ndef route_after_grade(state: AgentState) -> str:\n    if state['relevant'] or state['steps'] >= 3:\n        return 'synthesize'\n    return 'rewrite_query'\n",
        "rubric": [
            {"criterion": "Stateful Graph Schema & Conditional Routing", "max_points": 30},
            {"criterion": "Agentic RAG Retrieval & Relevance Grading", "max_points": 30},
            {"criterion": "Cycle Guard & Max-Step Safety Controls", "max_points": 20},
            {"criterion": "Production Readability & Tests", "max_points": 20},
        ],
    },
    {
        "id": "ag-cap-3",
        "module_id": "ag-mod-4",
        "title": "Capstone 3: Custom Model Context Protocol (MCP) Server & Agent Client Integration",
        "difficulty": "Advanced",
        "estimated_hours": 7,
        "summary": "Design a schema-validated custom MCP tool server exposing typed tools over stdio/SSE transport, complete with argument validation, structured error handling, and client invocation hooks.",
        "deliverables": [
            "Typed MCP tool definitions with strict JSON Schema input contracts",
            "JSON-RPC initialize / tools/list / tools/call dispatcher returning standardized payloads",
            "Client adapter compatible with LangGraph / OpenAI Agents SDK multi-step workflows",
        ],
        "starter_template": "from dataclasses import dataclass\nfrom typing import Callable, Dict, Any\n\n@dataclass\nclass MCPTool:\n    name: str\n    description: str\n    handler: Callable[..., Any]\n",
        "rubric": [
            {"criterion": "MCP Protocol & Tool Schema Contract", "max_points": 35},
            {"criterion": "Input Validation & Error Resilience", "max_points": 25},
            {"criterion": "Multi-Agent SDK Interoperability", "max_points": 25},
            {"criterion": "Deployment & Architecture Write-up", "max_points": 15},
        ],
    },
]

AGENTIC_LESSON_QUIZ_SPECS: Dict[int, QuizSpecTuple] = {
    1: (
        "What primarily defines an Agentic AI system compared to a standard single-prompt chatbot?",
        [
            "It can autonomously plan multi-step actions, invoke external tools, observe feedback, and iterate until a goal is achieved",
            "It only outputs static pre-written FAQ strings without context",
            "It avoids calling any external APIs or functions at runtime",
            "It requires manual user approval between every token generated",
        ],
        0,
        "Agentic Autonomy Loop: $\\text{Perceive} \\rightarrow \\text{Plan} \\rightarrow \\text{Act (Tools)} \\rightarrow \\text{Observe Feedback}$",
        "Agentic AI pairs reasoning models with memory and tool execution in an iterative loop so goals finish end-to-end.",
        "def run_agent_step(state, tool_fn):\n    plan = decide_next_action(state)\n    return tool_fn(plan)",
    ),
    2: (
        "What is the defining capability of Generative AI models such as LLMs, diffusion models, and audio synthesizers?",
        [
            "Learning underlying data distributions to synthesize original text, code, images, or audio matching a conditioning prompt",
            "Executing deterministic SQL joins without neural weights",
            "Managing hardware interrupts inside operating system kernels",
            "Guaranteeing external database writes on every forward pass",
        ],
        0,
        "Generative Objective: Model $P_\\theta(x \\mid \\text{prompt})$ to sample coherent synthetic artifacts",
        "Generative AI excels at content synthesis—while Agentic systems supply the reasoning loop, state, and environment actuation around it.",
        "# Generative step produces candidate content from a prompt\nresponse = llm.generate('Draft an architecture summary')",
    ),
    3: (
        "How do Generative AI and Agentic AI complement each other in real-world autonomous workflows?",
        [
            "Generative AI serves as the reasoning and language synthesis engine inside an Agentic orchestrator that invokes tools, manages memory, and verifies goal completion",
            "Agentic AI replaces transformers entirely with hard-coded if/else HTML tables",
            "Generative AI blocks agents from reading retrieved context",
            "They cannot share the same Python runtime environment",
        ],
        0,
        "Synergy Stack: $\\text{Agentic Orchestrator (Tools + State + Verification)} \\circ \\text{GenAI Reasoning Engine}$",
        "GenAI provides semantic planning and tool-call argument synthesis, whereas the agent framework controls execution loops and environment state.",
        "# LLM proposes tool call -> agent runtime executes & appends observation\ntool_call = {'name': 'search_docs', 'args': {'q': 'MCP transport'}}",
    ),
    4: (
        "Which architectural sequence best describes the fundamental perception-to-action cycle of an AI agent?",
        [
            "Sensors perceive environment state -> reasoning policy evaluates options -> actuators execute an action affecting the environment",
            "Actuators overwrite training weights before reading any observations",
            "Environment state is ignored while outputs repeat identically forever",
            "Only post-training logs are saved without interacting with state",
        ],
        0,
        "PEAS Agent Cycle: $\\text{Percept } p_t \\rightarrow \\text{Policy } \\pi(\\cdot \\mid h_t) \\rightarrow \\text{Action } a_t$",
        "Every software or robotic agent maps environment percepts to actions aimed at satisfying its performance measure.",
        "def agent_cycle(percept, policy_fn, actuator_fn):\n    action = policy_fn(percept)\n    return actuator_fn(action)",
    ),
    5: (
        "Which progression lists the 5 classical AI agent types in increasing order of internal sophistication?",
        [
            "Simple Reflex -> Model-Based Reflex -> Goal-Based -> Utility-Based -> Learning Agent",
            "Learning Agent -> Simple Reflex -> Utility-Based -> Goal-Based -> Compiler",
            "SQL Database -> Simple Reflex -> Diffuser -> Cache -> Goal-Based",
            "Only Supervised Regression and K-Means Clustering",
        ],
        0,
        "5 Classical Agent Hierarchy: Reflex < Model-Based < Goal-Based < Utility-Based < Learning",
        "Each tier adds capability: world-state memory (Model), lookahead targets (Goal), trade-off scoring (Utility), and self-improvement (Learning).",
        "AGENT_TIERS = ['simple_reflex', 'model_based', 'goal_based', 'utility_based', 'learning']",
    ),
    6: (
        "How does a Simple Reflex Agent implemented in Python choose its action?",
        [
            "Using pure condition-action rules (`if condition: return action`) based solely on the current percept without memory of past states",
            "Solving a multi-horizon Bellman dynamic program across 1,000 trajectories",
            "Training a transformer on every sensory observation at inference time",
            "Querying a distributed SQL warehouse for future states",
        ],
        0,
        "Condition-Action Mapping: $a_t = f(p_t)$ (stateless mapping from current observation $p_t$)",
        "Simple Reflex Agents are fast and deterministic for fully observable environments, though they fail when hidden state history matters.",
        "def vacuum_reflex_agent(location: str, status: str) -> str:\n    if status == 'dirty':\n        return 'clean'\n    return 'move_right' if location == 'A' else 'move_left'",
    ),
    7: (
        "Why do Goal-Based AI agents (such as a LangChain ReAct/tool agent behind a Streamlit UI) outperform pure reflex rules on multi-step user requests?",
        [
            "They evaluate explicit target criteria and choose tool sequences whose predicted outcomes advance progress toward the user's goal",
            "They disable all external tools so execution stays stateless",
            "They bypass user prompts completely in favor of random actions",
            "They store weights only inside browser CSS variables",
        ],
        0,
        "Goal-Directed Search / Planning: Select action sequence $a_{1..T}$ achieving $s_T \\in \\mathcal{G}$",
        "Combining LLM reasoning in LangChain with goal-state checks lets the agent chain search, summarization, and response generation coherently.",
        "# Goal-check guard inside a LangChain-style agent loop\nwhile not goal_satisfied(state) and steps < max_steps:\n    state = execute_tool_and_update(state)",
    ),
    8: (
        "In Stuart Russell & Peter Norvig's Learning Agent blueprint, what role does the Critic play alongside the Learning Element?",
        [
            "The Critic evaluates actions against an external performance standard and feeds rewards/penalties so the Learning Element updates behavior",
            "The Critic deletes all historical experience buffers before any action runs",
            "The Learning Element bypasses feedback and freezes policies permanently",
            "The Critic acts as a CSS linter for frontend dashboards",
        ],
        0,
        "4 Learning Agent Modules: Critic + Learning Element + Performance Element + Problem Generator",
        "Feedback from the Critic tells the Learning Element how well the Performance Element scored, driving continuous improvement.",
        "def learning_step(score, baseline, policy):\n    advantage = score - baseline\n    policy.update(advantage)",
    ),
    9: (
        "In Reinforcement Learning, what trade-off must an adaptive agent continuously balance during interaction?",
        [
            "Exploration (trying untried actions to discover higher rewards) vs Exploitation (choosing currently best-known actions)",
            "Compiler optimization vs JSON parsing speed",
            "Row-wise normalization vs HTTP port allocation",
            "Static training datasets vs Markdown table borders",
        ],
        0,
        "Bandit / RL Dilemma: Balance $\\epsilon$-exploration discovery against greedy reward exploitation",
        "Too little exploration strands agents in suboptimal local habits; endless random exploration wastes earned reward.",
        "import random\ndef select_action(q_row, eps=0.1):\n    return random.randrange(len(q_row)) if random.random() < eps else q_row.index(max(q_row))",
    ),
    10: (
        "In the Bellman expectation/optimality equation $V(s) = R(s) + \\gamma \\sum P(s' \\mid s, a) V(s')$, what does discount factor $\\gamma \\in [0, 1)$ control?",
        [
            "How strongly future rewards are weighted relative to immediate rewards while ensuring bounded discounted sums",
            "The exact batch size used by CSV file readers",
            "The TLS certificate expiration duration on cloud APIs",
            "The maximum length of Markdown study notes",
        ],
        0,
        "Discounted Return: $G_t = \\sum_{k=0}^{\\infty} \\gamma^k R_{t+k+1}, \\quad 0 \\le \\gamma < 1$",
        "Values of $\\gamma$ near 0 make agents myopic; values near 1 incentivize long-horizon planning toward delayed cumulative returns.",
        "def bellman_backup(reward, next_vals, probs, gamma=0.95):\n    return reward + gamma * sum(p * v for p, v in zip(probs, next_vals))",
    ),
    11: (
        "What makes Q-Learning an off-policy model-free Reinforcement Learning algorithm?",
        [
            "It learns optimal action-values $Q(s, a)$ directly using $\\max_{a'} Q(s', a')$ regardless of the exploratory behavior policy choosing actions",
            "It requires complete prior knowledge of exact transition matrices $P(s' \\mid s, a)$ before starting",
            "It only updates state values without tracking action choices",
            "It requires labeled supervised classification datasets for every move",
        ],
        0,
        "Q-Learning Update: $Q(s,a) \\leftarrow Q(s,a) + \\alpha [r + \\gamma \\max_{a'} Q(s',a') - Q(s,a)]$",
        "Because Q-learning bootstraps from the greedy `max Q(s', a')`, it converges toward the optimal policy even under epsilon-greedy exploration.",
        "# Core tabular Q-learning TD error update\ntd_err = reward + gamma * Q[next_s].max() - Q[s, a]\nQ[s, a] += alpha * td_err",
    ),
    12: (
        "Why is LangGraph often preferred over linear DAG chains when engineering production AI agents?",
        [
            "LangGraph treats workflows as cyclic stateful graphs with shared state, conditional branching, human-in-the-loop interrupts, and persistence checkpoints",
            "LangGraph forbids conditional routing and cycles between agent steps",
            "LangGraph removes Python type safety and state schemas entirely",
            "LangGraph works solely for image generation with no tool calls",
        ],
        0,
        "Stateful Agent Graph: $G = (\\text{Nodes}, \\text{Conditional Edges}, \\text{Checkpointed State})$",
        "Real agents retry failed tool calls, loop back for reflection, and route dynamically—making explicit state graphs and cycles essential.",
        "from typing import TypedDict\nclass GraphState(TypedDict):\n    messages: list[str]\n    retries: int",
    ),
    13: (
        "What core abstraction distinguishes CrewAI when building collaborative multi-agent applications?",
        [
            "Organizing specialized `Agent` personas (role, goal, backstory, tools) into coordinated `Task` sequences orchestrated by a `Crew` process",
            "Compiling neural weights directly into WebAssembly shaders",
            "Serving static HTML pages without any task delegation",
            "Replacing vector embeddings with bubble sort",
        ],
        0,
        "CrewAI Composition: `Crew(agents=[Researcher, Writer], tasks=[...], process=Process.sequential)`",
        "Separating domain expertise into focused roles prevents bloated monolith prompts and enables clean multi-agent delegation.",
        "crew_spec = {'agents': ['researcher', 'reviewer'], 'process': 'sequential', 'verbose': True}",
    ),
    14: (
        "What strengths motivate the Agno AI framework for lightweight multimodal and high-throughput agents?",
        [
            "Fast model-agnostic Python instantiation with native multimodal inputs (text, image, audio, video), structured outputs, and minimal runtime abstraction overhead",
            "Mandatory multi-hour JVM compilation before running any prompt",
            "Strict restriction to text-only inputs with no structured JSON outputs",
            "Disabling all third-party LLM API keys",
        ],
        0,
        "Agno Design: Low-latency Python-native agents supporting multimodal & structured Pydantic responses",
        "Agno focuses on minimal instantiation overhead, clean Pythonic ergonomics, and multimodal tool-enabled execution.",
        "# Conceptual Pydantic response contract for structured multimodal extraction\nschema = {'summary': str, 'confidence': float}",
    ),
    15: (
        "When scaling an Agno agent from a single demo call to multi-turn user conversations, what do Tools, Agentic Teams, and Persistent Memory enable?",
        [
            "Tools ground live external actions, Teams divide specialized subtasks cleanly, and Memory recalls prior facts/preferences across sessions",
            "Memory deletes user history after every single token",
            "Tools block the model from reading structured parameters",
            "All three features require retraining weights after every chat message",
        ],
        0,
        "Stateful Agent Triad: $\\text{Tools (Action)} + \\text{Memory (Continuity)} + \\text{Routing (Teamwork)}$",
        "Persisting episodic and semantic session storage eliminates repetitive context re-explanation while tools keep answers grounded in live state.",
        "# Tool binding + persistent session_id memory pattern\nsession_ctx = {'user_id': 'u-42', 'session_id': 'sess-9', 'memory_enabled': True}",
    ),
    16: (
        "How does Agentic RAG differ from naive static retrieve-then-generate pipelines?",
        [
            "An Agentic RAG agent treats retrieval as a dynamic decision—choosing when to search, evaluating chunk relevance, rewriting queries, or querying multiple stores",
            "Agentic RAG embeds the entire internet inside system prompt strings",
            "Naive RAG always loops indefinitely while Agentic RAG never uses vector DBs",
            "Agentic RAG discards retrieved evidence before answering",
        ],
        0,
        "Agentic RAG Control: Decide Need Retrieval $\\rightarrow$ Search $\\rightarrow$ Grade Context $\\rightarrow$ Rewrite or Answer",
        "Self-reflective grading and query reformulation cut hallucinations dramatically on complex or multi-hop knowledge queries.",
        "def should_retrieve(confidence: float, threshold: float = 0.75) -> bool:\n    return confidence < threshold",
    ),
    17: (
        "What universal integration problem does the Model Context Protocol (MCP) solve for AI agent stacks?",
        [
            "It provides an open JSON-RPC client-server protocol so any LLM host/agent discovers and invokes standardized Tools, Resources, and Prompts across any backend once",
            "It replaces HTTPS completely inside web browsers",
            "It forces every tool vendor to write proprietary SDKs per model provider",
            "It compresses Python source files into MP4 video streams",
        ],
        0,
        "MCP Standard: $M \\text{ Hosts} \\leftrightarrow N \\text{ MCP Servers}$ via unified JSON-RPC schema",
        "Instead of writing N*M custom connectors for every framework and service, MCP decouples tool servers from agent clients cleanly.",
        "mcp_manifest = {'jsonrpc': '2.0', 'method': 'tools/list', 'params': {}}",
    ),
    18: (
        "When wiring pre-built ready-made MCP servers (such as filesystem, GitHub, or web-fetch servers) into LangGraph, what pattern enables seamless tool calling?",
        [
            "Connecting via an MCP client adapter that discovers tool JSON schemas dynamically at startup and binds them onto the LangGraph tool execution node",
            "Hardcoding raw shell pipes inside React CSS stylesheets",
            "Rewriting the external service from scratch inside every graph prompt",
            "Disabling schema validation on all tool inputs",
        ],
        0,
        "LangGraph + MCP Bridge: `MCP Client -> load_mcp_tools() -> ToolNode(tools) -> StateGraph`",
        "Dynamic tool discovery lets LangGraph workflows swap or upgrade external MCP servers via config without rewriting orchestration code.",
        "# Dynamic schema conversion from MCP manifest to graph tools\ntool_names = [t['name'] for t in [{'name': 'read_file'}, {'name': 'search_repo'}]]",
    ),
    19: (
        "When authoring a custom Python MCP server exposed to LangGraph and Streamlit clients, what must every registered `@mcp.tool` define?",
        [
            "A clear tool name, typed function parameters (yielding JSON Schema constraints), docstring description, and deterministic return structure",
            "Random undocumented `*args, **kwargs` without type annotations or docstrings",
            "Direct GUI pixel coordinates for Streamlit buttons",
            "Inline SQLite database binary dumps inside error traces",
        ],
        0,
        "MCP Tool Contract: Typed Signature + Clear Docstring $\\rightarrow$ Auto-generated LLM Tool Schema",
        "The model relies directly on parameter types and clear descriptions to decide when and how to invoke your custom server reliably.",
        "def get_order_status(order_id: str) -> dict:\n    \"\"\"Return structured fulfillment status for a given order identifier.\"\"\"\n    return {'order_id': order_id, 'status': 'shipped'}",
    ),
    20: (
        "What transport change typically occurs when moving a custom MCP server from local laptop development to shared cloud hosting?",
        [
            "Migrating from local process stdio transport to network-accessible HTTP/SSE (or Streamable HTTP) endpoints secured with auth tokens and HTTPS",
            "Replacing JSON payloads with local printer drivers",
            "Removing network ports so remote agents cannot reach the service",
            "Running interactive desktop stdin prompts inside stateless cloud containers",
        ],
        0,
        "MCP Transport Modes: Local `stdio` subprocess $\\longrightarrow$ Cloud HTTPS + SSE / Streamable HTTP",
        "Remote multi-user deployments require stateless-friendly HTTP/SSE endpoints, health checks, secret env injection, and bearer auth.",
        "# Cloud deployment exposes /sse or /mcp endpoint over HTTPS with auth headers\nmcp_remote = {'url': 'https://mcp.example.com/mcp', 'transport': 'streamable_http'}",
    ),
    21: (
        "How do Agno agents connect identically to both local development MCP servers and cloud-hosted MCP endpoints?",
        [
            "Via Agno's pluggable MCP toolkit client initialized with either local command (`stdio`) parameters or a remote `url`, exposing the same tool interface",
            "By copying private server database credentials into browser localStorage",
            "Only through manual copy-paste into Streamlit textareas",
            "Agno agents can only call local SQLite files and never remote HTTP tools",
        ],
        0,
        "Transport-Agnostic MCP Toolkit: Switch `stdio` <-> `streamable-http` config without rewriting agent logic",
        "Abstracting transport connection parameters lets engineers iterate fast locally and promote the exact same agent logic to production cloud MCP servers.",
        "config = {'env': 'prod', 'transport': 'sse', 'endpoint': 'https://api.ctf.dev/mcp'}",
    ),
    22: (
        "In the OpenAI Agents SDK, what core primitives organize multi-step production workflows cleanly?",
        [
            "`Agent` (instructions + tools), `Runner` (execution loop & tracing), `Handoffs` (delegating to peer specialist agents), and `Guardrails`",
            "Raw CSS grid containers and Redux actions only",
            "Manual TCP packet assembly in C",
            "Single-turn static templates with no delegation or handoffs",
        ],
        0,
        "OpenAI Agents SDK Primitives: `Agent` + `Tools` + `Handoffs` + `Guardrails` + `Runner`",
        "First-class handoffs and input/output guardrails keep multi-agent routing observable, testable, and safe in production.",
        "# Handoff routing concept between triage and billing specialist agents\ntriage_spec = {'agent': 'Triage', 'handoffs': ['TechnicalSupport', 'Billing']}",
    ),
    23: (
        "When connecting MCP servers inside the OpenAI Agents SDK, why manage the MCP server with an `async with` context manager before running `Runner.run()`?",
        [
            "To cleanly establish the MCP session, fetch remote tool definitions safely, execute agent turns, and close transport streams cleanly on exit",
            "To disable asynchronous I/O across the entire Python process",
            "To force the SDK to skip fetching the server's tool list",
            "To bypass guardrail validation during agent runs",
        ],
        0,
        "Lifecycle Discipline: `async with mcp_server: agent = Agent(..., mcp_servers=[mcp_server]); await Runner.run(...)`",
        "Explicit async context management prevents dangling sockets/subprocesses and ensures fresh tool discovery prior to model invocation.",
        "# Clean lifecycle ensures MCP transport connects and tears down deterministically\nserver_cfg = {'url': 'https://mcp.ctf.dev/sse', 'timeout_sec': 30}",
    ),
}

AGENTIC_FINAL_EXAM_ORDERS: List[int] = [
    1, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17, 18, 19, 20, 22,
]


@lru_cache(maxsize=1)
def get_agentic_course_catalog() -> Dict[str, Any]:
    return build_course_catalog(
        course_id=AGENTIC_COURSE_ID,
        course_title=AGENTIC_COURSE_TITLE,
        playlist_id=AGENTIC_PLAYLIST_ID,
        playlist_url=AGENTIC_PLAYLIST_URL,
        instructor=AGENTIC_INSTRUCTOR,
        thumbnail_url=AGENTIC_THUMBNAIL_URL,
        playlist_filename="agentic_playlist_data.json",
        modules=AGENTIC_MODULES,
        quiz_specs=AGENTIC_LESSON_QUIZ_SPECS,
        id_prefix="agentic",
        curriculum_label="Agentic AI & MCP Engineering Academy",
        capstone_projects=AGENTIC_CAPSTONE_PROJECTS,
        concept_heading="Agent Architecture & Execution Principle",
        takeaway_guidance="Validate tool schemas, cycle termination bounds, memory scopes, and MCP transport contracts before deploying agents.",
    )


def get_agentic_lesson_by_id(lesson_id: str) -> Optional[Dict[str, Any]]:
    return find_lesson_in_catalog(get_agentic_course_catalog(), lesson_id)


def get_agentic_quiz_bank(include_answers: bool = False) -> List[Dict[str, Any]]:
    return filter_quiz_bank_from_catalog(get_agentic_course_catalog(), include_answers=include_answers)


def get_agentic_final_exam_questions(include_answers: bool = False) -> List[Dict[str, Any]]:
    return select_exam_questions_from_catalog(
        get_agentic_course_catalog(),
        AGENTIC_FINAL_EXAM_ORDERS,
        include_answers=include_answers,
    )
