import React, { useState } from 'react';
import { BookOpen, BrainCircuit, Camera, Layers } from 'lucide-react';

type MLDiagramView = 'all' | 'journey' | 'proctor' | 'curriculum';

export const MLWikiBigDiagrams: React.FC = () => {
  const [view, setView] = useState<MLDiagramView>('all');

  const showJourney = view === 'all' || view === 'journey';
  const showProctor = view === 'all' || view === 'proctor';
  const showCurriculum = view === 'all' || view === 'curriculum';

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/[0.08] bg-[#141415] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#e5a00d] font-medium">
            <BrainCircuit className="w-3.5 h-3.5" strokeWidth={1.5} />
            ML &amp; DL Academy — 3 architecture diagrams
          </div>
          <p className="text-xs text-[#85858b]">
            View all 3 large-format ML LMS, MediaPipe AI Proctor, and Curriculum Telemetry diagrams together or focus individually.
          </p>
        </div>

        <div className="flex overflow-x-auto no-scrollbar items-center gap-1.5 bg-[#19191b] p-1 rounded-lg border border-white/[0.08] w-full sm:w-auto">
          {[
            { id: 'all' as const, label: 'Show All 3', icon: Layers },
            { id: 'journey' as const, label: '1. 9-Stage LMS', icon: BookOpen },
            { id: 'proctor' as const, label: '2. Camera Proctor', icon: Camera },
            { id: 'curriculum' as const, label: '3. Curriculum & API', icon: BrainCircuit },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setView(tab.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  active ? 'bg-[#ededed] text-[#141415]' : 'text-[#85858b] hover:text-[#ededed]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* BIG DIAGRAM 1 */}
      {showJourney && (
        <div className="rounded-xl border border-white/[0.08] bg-[#141415] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#0f0f10] flex items-center justify-between gap-2">
            <span className="text-xs font-mono font-medium text-[#ededed]">
              Diagram 1 · End-to-End 9-Stage ML &amp; Stanford DL LMS Learning Pipeline
            </span>
            <span className="text-[11px] font-mono text-[#e5a00d]">LMSHub &rarr; Done</span>
          </div>
          <div className="p-4 sm:p-5 overflow-x-auto custom-scrollbar">
            <svg viewBox="0 0 1120 340" className="w-full min-w-[760px] h-auto" role="img" aria-label="End-to-End 9-Stage ML and DL LMS Learning Journey">
              <defs>
                <marker id="mlj-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                </marker>
                <marker id="mlj-arr-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
                </marker>
              </defs>

              {[
                { x: 18, num: '01 · HUB', title: 'LMS Hub', sub: '/app/lms', stroke: '#6366f1', bg: '#131b36' },
                { x: 138, num: '02 · COURSE', title: 'Course Detail', sub: 'Syllabus & Reviews', stroke: '#6366f1', bg: '#131b36' },
                { x: 258, num: '03 · WATCH', title: 'Lecture Page', sub: 'In-LMS Video + Notes', stroke: '#06b6d4', bg: '#0c2238' },
                { x: 378, num: '04 · PRACTICE', title: 'Quiz Bank', sub: '100+ ML MCQs', stroke: '#8b5cf6', bg: '#181432' },
                { x: 498, num: '05 · BUILD', title: 'Capstone (3)', sub: 'Code & Test Suite', stroke: '#10b981', bg: '#08241c' },
                { x: 618, num: '06 · EXAM', title: 'Proctored Exam', sub: '35 Qs · Camera AI', stroke: '#f43f5e', bg: '#2b1019' },
                { x: 738, num: '07 · SURVEY', title: 'Feedback', sub: '5-Star Review', stroke: '#f59e0b', bg: '#211809' },
                { x: 858, num: '08 · CERT', title: 'PDF Certificate', sub: 'SHA-256 + Social', stroke: '#f59e0b', bg: '#211809' },
                { x: 978, num: '09 · REWARD', title: 'Goodies & Done', sub: 'Claim Form', stroke: '#34d399', bg: '#052e16' },
              ].map((s, idx) => (
                <g key={s.num}>
                  <rect x={s.x} y="30" width="110" height="106" rx="12" fill={s.bg} stroke={s.stroke} strokeWidth="1.6" />
                  <text x={s.x + 10} y="53" fill="#a5b4fc" fontSize="9.5" fontWeight="700" fontFamily="monospace">{s.num}</text>
                  <text x={s.x + 10} y="82" fill="#ffffff" fontSize="12.5" fontWeight="800">{s.title}</text>
                  <text x={s.x + 10} y="106" fill="#cbd5e1" fontSize="10">{s.sub}</text>
                  {idx < 8 && (
                    <line x1={s.x + 110} y1="83" x2={s.x + 118} y2="83" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#mlj-arr)" />
                  )}
                </g>
              ))}

              {/* Page-by-page Lecture Subflow Strip */}
              <rect x="18" y="166" width="1070" height="150" rx="14" fill="#0b1124" stroke="#1e293b" strokeWidth="1.4" />
              <text x="36" y="192" fill="#22d3ee" fontSize="11" fontWeight="700" fontFamily="monospace">
                GOOGLE CLOUD SKILLS STYLE · GUIDED PAGE-BY-PAGE LECTURE PROGRESSION
              </text>

              <rect x="36" y="210" width="290" height="84" rx="10" fill="#131b36" stroke="#6366f1" strokeWidth="1.2" />
              <text x="52" y="234" fill="#ffffff" fontSize="13" fontWeight="700">Step 1 · Watch In-LMS Video</text>
              <text x="52" y="255" fill="#cbd5e1" fontSize="11">InLMSVideoPlayer + Share Platform Link</text>
              <text x="52" y="274" fill="#34d399" fontSize="11" fontWeight="700">Mark Watched (+15 XP) →</text>

              <line x1="326" y1="252" x2="380" y2="252" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#mlj-arr)" />

              <rect x="386" y="210" width="310" height="84" rx="10" fill="#0c2238" stroke="#06b6d4" strokeWidth="1.2" />
              <text x="402" y="234" fill="#ffffff" fontSize="13" fontWeight="700">Step 2 · Study Notes &amp; Code Lab</text>
              <text x="402" y="255" fill="#cbd5e1" fontSize="11">Math derivations, formulas &amp; Python examples</text>
              <text x="402" y="274" fill="#67e8f9" fontSize="11" fontWeight="700">Next: Solve Lecture Quiz →</text>

              <line x1="696" y1="252" x2="750" y2="252" stroke="#34d399" strokeWidth="2" markerEnd="url(#mlj-arr-g)" />

              <rect x="756" y="210" width="314" height="84" rx="10" fill="#06281c" stroke="#10b981" strokeWidth="1.2" />
              <text x="772" y="234" fill="#ffffff" fontSize="13" fontWeight="700">Step 3 · Solve Quiz &amp; Advance</text>
              <text x="772" y="255" fill="#d1fae5" fontSize="11">Per-lecture verification &amp; instant feedback</text>
              <text x="772" y="274" fill="#34d399" fontSize="11" fontWeight="600">Auto-Unlock Lecture #N+1</text>
            </svg>
          </div>
        </div>
      )}

      {/* BIG DIAGRAM 2 */}
      {showProctor && (
        <div className="rounded-xl border border-white/[0.08] bg-[#141415] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#0f0f10] flex items-center justify-between gap-2">
            <span className="text-xs font-mono font-medium text-[#ededed]">
              Diagram 2 · MediaPipe AI Camera Proctor &amp; 4-Tier Vision Architecture
            </span>
            <span className="text-[11px] font-mono text-[#e5a00d]">ProctorCameraGuard + proctorVision.ts</span>
          </div>
          <div className="p-4 sm:p-5 overflow-x-auto custom-scrollbar">
            <svg viewBox="0 0 1120 390" className="w-full min-w-[760px] h-auto" role="img" aria-label="MediaPipe AI Camera Proctor and 4-Tier Anti-Cheat Pipeline">
              <defs>
                <marker id="proc-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
                </marker>
                <marker id="proc-arr-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                </marker>
              </defs>

              <rect x="20" y="34" width="235" height="320" rx="14" fill="#180d17" stroke="#f43f5e" strokeWidth="1.6" />
              <text x="36" y="60" fill="#fda4af" fontSize="10.5" fontWeight="700" fontFamily="monospace">1 · INPUT TELEMETRY</text>
              <rect x="36" y="78" width="203" height="118" rx="10" fill="#251220" stroke="#fb7185" strokeWidth="1" />
              <text x="50" y="102" fill="#ffffff" fontSize="13" fontWeight="700">Live Webcam Stream</text>
              <text x="50" y="124" fill="#cbd5e1" fontSize="11">• 640×360 canvas sampler</text>
              <text x="50" y="144" fill="#cbd5e1" fontSize="11">• Luminance &amp; stdDev</text>
              <text x="50" y="164" fill="#cbd5e1" fontSize="11">• YCbCr skin ratio</text>
              <text x="50" y="184" fill="#cbd5e1" fontSize="11">• Inter-frame motion Δ</text>

              <rect x="36" y="212" width="203" height="122" rx="10" fill="#171e30" stroke="#818cf8" strokeWidth="1" />
              <text x="50" y="236" fill="#ffffff" fontSize="13" fontWeight="700">Browser Guard Hooks</text>
              <text x="50" y="258" fill="#cbd5e1" fontSize="11">• Tab visibility / Blur</text>
              <text x="50" y="278" fill="#cbd5e1" fontSize="11">• Fullscreen exit lock</text>
              <text x="50" y="298" fill="#cbd5e1" fontSize="11">• Copy/Paste &amp; Right-Click</text>
              <text x="50" y="318" fill="#cbd5e1" fontSize="11">• DevTools open guard</text>

              <path d="M 255 150 L 296 150" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#proc-arr-c)" />

              <rect x="302" y="34" width="380" height="320" rx="14" fill="#091624" stroke="#06b6d4" strokeWidth="1.6" />
              <text x="320" y="60" fill="#67e8f9" fontSize="10.5" fontWeight="700" fontFamily="monospace">2 · 4-TIER VISION ENGINE CASCADE (proctorVision.ts)</text>

              <rect x="320" y="78" width="344" height="60" rx="10" fill="#06281c" stroke="#10b981" strokeWidth="1.2" />
              <text x="336" y="100" fill="#6ee7b7" fontSize="12.5" fontWeight="700">Tier 1 · mediapipe-full (/proctor/ self-hosted WASM)</text>
              <text x="336" y="121" fill="#d1fae5" fontSize="11">BlazeFace FaceDetector + COCO EfficientDet-Lite0</text>

              <rect x="320" y="148" width="344" height="58" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="336" y="170" fill="#ffffff" fontSize="12.5" fontWeight="700">Tier 2 · mediapipe-face</text>
              <text x="336" y="190" fill="#cbd5e1" fontSize="11">Face boxes, confidence scores &amp; yaw-gaze keypoints</text>

              <rect x="320" y="216" width="344" height="58" rx="10" fill="#0f172a" stroke="#6366f1" strokeWidth="1" />
              <text x="336" y="238" fill="#ffffff" fontSize="12.5" fontWeight="700">Tier 3 · browser-face</text>
              <text x="336" y="258" fill="#cbd5e1" fontSize="11">Native window.FaceDetector Shape Detection API</text>

              <rect x="320" y="284" width="344" height="54" rx="10" fill="#171726" stroke="#64748b" strokeWidth="1" />
              <text x="336" y="305" fill="#cbd5e1" fontSize="12" fontWeight="700">Tier 4 · skin-cv Fallback</text>
              <text x="336" y="324" fill="#94a3b8" fontSize="10.5">YCbCr lens cover (isCovered) &amp; frozen-frame heuristic</text>

              <path d="M 682 195 L 722 195" stroke="#f43f5e" strokeWidth="2" markerEnd="url(#proc-arr)" />

              <rect x="728" y="34" width="372" height="320" rx="14" fill="#230e15" stroke="#f43f5e" strokeWidth="1.6" />
              <text x="746" y="60" fill="#fda4af" fontSize="10.5" fontWeight="700" fontFamily="monospace">3 · VIOLATION SIGNALS &amp; 3-STRIKE LOCK</text>
              <rect x="746" y="78" width="336" height="122" rx="10" fill="#180a10" stroke="#fb7185" strokeWidth="1" />
              <text x="762" y="102" fill="#ffffff" fontSize="12.5" fontWeight="700">Detected Violation Conditions</text>
              <text x="762" y="124" fill="#fda4af" fontSize="11">• Prohibited Object: cell phone, book, laptop, tv</text>
              <text x="762" y="144" fill="#cbd5e1" fontSize="11">• Missing face / Multiple faces (&gt;1 person)</text>
              <text x="762" y="164" fill="#cbd5e1" fontSize="11">• Gaze yaw away / Lens covered / Frozen video</text>
              <text x="762" y="184" fill="#fde68a" fontSize="11">• Tab switch / Window blur / Fullscreen exit</text>

              <rect x="746" y="214" width="336" height="122" rx="10" fill="#06281c" stroke="#10b981" strokeWidth="1.2" />
              <text x="762" y="238" fill="#6ee7b7" fontSize="12.5" fontWeight="700">Enforcement &amp; Audit Evidence</text>
              <text x="762" y="260" fill="#d1fae5" fontSize="11">• Live bounding-box HUD + WebAudio warning beep</text>
              <text x="762" y="280" fill="#d1fae5" fontSize="11">• Strike counter: 0/3 → 1/3 → 2/3 → 3/3</text>
              <text x="762" y="300" fill="#fde68a" fontSize="11">• Persists MLViolationEvent[] audit log to backend</text>
              <text x="762" y="320" fill="#34d399" fontSize="11" fontWeight="700">• 3/3 Strikes → onMaxViolationsReached() Lock</text>
            </svg>
          </div>
        </div>
      )}

      {/* BIG DIAGRAM 3 */}
      {showCurriculum && (
        <div className="rounded-xl border border-white/[0.08] bg-[#141415] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#0f0f10] flex items-center justify-between gap-2">
            <span className="text-xs font-mono font-medium text-[#ededed]">
              Diagram 3 · Applied ML (106) + Stanford DL (21) Curriculum &amp; Telemetry API Architecture
            </span>
            <span className="text-[11px] font-mono text-[#4cc38a]">api.courseLms(&apos;ml&apos; | &apos;dl&apos;)</span>
          </div>
          <div className="p-4 sm:p-5 overflow-x-auto custom-scrollbar">
            <svg viewBox="0 0 1120 380" className="w-full min-w-[760px] h-auto" role="img" aria-label="ML and DL Curriculum and Backend Telemetry Architecture">
              <defs>
                <marker id="cur-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
                </marker>
              </defs>

              <rect x="20" y="24" width="380" height="332" rx="14" fill="#0d162e" stroke="#6366f1" strokeWidth="1.6" />
              <text x="38" y="50" fill="#a5b4fc" fontSize="11" fontWeight="700" fontFamily="monospace">APPLIED ML COURSE LMS (106 LECTURES · 7 MODULES)</text>
              {[
                'M1 · ML Fundamentals & Evaluation Metrics (1–8)',
                'M2 · Linear Regression & Logistic Classification (9–29)',
                'M3 · Dimensionality Reduction, PCA & Clustering (30–43)',
                'M4 · Naive Bayes, SVMs & Decision Trees (44–54)',
                'M5 · Gradient Optimization, XGBoost & Ensembles (55–75)',
                'M6 · Neural Networks, Backprop & CNNs (76–90)',
                'M7 · Transformers, PyTorch & Reinforcement Learning (91–106)',
              ].map((m, i) => (
                <g key={m}>
                  <rect x="38" y={68 + i * 39} width="344" height="31" rx="7" fill="#141f3d" stroke="#4f46e5" strokeWidth="1" />
                  <text x="50" y={88 + i * 39} fill="#e2e8f0" fontSize="11" fontWeight="600">{m}</text>
                </g>
              ))}

              <rect x="424" y="24" width="320" height="332" rx="14" fill="#17122b" stroke="#a855f7" strokeWidth="1.6" />
              <text x="442" y="50" fill="#d8b4fe" fontSize="11" fontWeight="700" fontFamily="monospace">STANFORD × CTF DL (21) &amp; VIDEO HUB</text>
              <rect x="442" y="68" width="284" height="128" rx="10" fill="#21173b" stroke="#8b5cf6" strokeWidth="1" />
              <text x="456" y="90" fill="#ffffff" fontSize="12.5" fontWeight="700">Stanford CS229 Deep Learning</text>
              <text x="456" y="112" fill="#cbd5e1" fontSize="11">• Module 1: Regression, GDA &amp; Naive Bayes</text>
              <text x="456" y="132" fill="#cbd5e1" fontSize="11">• Module 2: Margins, Kernels &amp; Theory</text>
              <text x="456" y="152" fill="#cbd5e1" fontSize="11">• Module 3: Deep Neural Nets &amp; Backprop</text>
              <text x="456" y="172" fill="#cbd5e1" fontSize="11">• Module 4: Reinforcement Learning &amp; MDPs</text>

              <rect x="442" y="212" width="284" height="124" rx="10" fill="#0d1e2e" stroke="#06b6d4" strokeWidth="1" />
              <text x="456" y="236" fill="#67e8f9" fontSize="12.5" fontWeight="700">Video Masterclasses (/app/videos)</text>
              <text x="456" y="258" fill="#cbd5e1" fontSize="11">• 8 Curated Engineering Playlists</text>
              <text x="456" y="278" fill="#cbd5e1" fontSize="11">• InLMSVideoPlayer Theater Mode</text>
              <text x="456" y="298" fill="#cbd5e1" fontSize="11">• Native Platform Share Links</text>
              <text x="456" y="318" fill="#34d399" fontSize="11">• Linked directly to IDE Challenges</text>

              <path d="M 400 190 L 766 190" stroke="#34d399" strokeWidth="2" markerEnd="url(#cur-arr)" />
              <path d="M 744 190 L 766 190" stroke="#34d399" strokeWidth="2" markerEnd="url(#cur-arr)" />

              <rect x="772" y="24" width="328" height="332" rx="14" fill="#071d18" stroke="#10b981" strokeWidth="1.6" />
              <text x="790" y="50" fill="#6ee7b7" fontSize="11" fontWeight="700" fontFamily="monospace">FASTAPI LMS &amp; CREDENTIAL ENGINE</text>
              <rect x="790" y="68" width="292" height="128" rx="10" fill="#052e16" stroke="#34d399" strokeWidth="1" />
              <text x="804" y="92" fill="#ffffff" fontSize="12.5" fontWeight="700">api.courseLms(&apos;ml&apos; | &apos;dl&apos;)</text>
              <text x="804" y="114" fill="#d1fae5" fontSize="11">• /api/ml-course/* &amp; /api/dl-course/*</text>
              <text x="804" y="134" fill="#d1fae5" fontSize="11">• Persist watched lectures &amp; +15 XP</text>
              <text x="804" y="154" fill="#d1fae5" fontSize="11">• Grade quizzes &amp; capstone labs</text>
              <text x="804" y="174" fill="#d1fae5" fontSize="11">• Store exam scores &amp; proctor strikes</text>

              <rect x="790" y="212" width="292" height="124" rx="10" fill="#1b1509" stroke="#f59e0b" strokeWidth="1.1" />
              <text x="804" y="236" fill="#fcd34d" fontSize="12.5" fontWeight="700">Outputs &amp; Swag Fulfillment</text>
              <text x="804" y="258" fill="#fef3c7" fontSize="11">• Landscape A4 ReportLab Vector PDF</text>
              <text x="804" y="278" fill="#fef3c7" fontSize="11">• Public /verify/:id SHA-256 Registry</text>
              <text x="804" y="298" fill="#fef3c7" fontSize="11">• 1080×1080 &amp; 1200×630 Social Cards</text>
              <text x="804" y="318" fill="#4cc38a" fontSize="11" fontWeight="600">• Graduate Goodies Form Submission</text>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
