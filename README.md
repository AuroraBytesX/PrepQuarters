# PrepQuarters

Autonomous AI Interview Cockpit & Career Intelligence Engine

PrepQuarters is an autonomous mock interview and career intelligence platform designed for technical candidates and engineering leaders. Built with a deterministic finite state machine and powered by server-side NVIDIA NIM reasoning models, PrepQuarters delivers sequential multi-turn mock interviews across 10 distinct modalities, evidence-based code execution, speech-to-text processing, diagnostic skill-gap analytics, an explainable ATS resume readiness analyzer, and a compile-ready LaTeX resume builder.

```
+----------------------------------------------------------------------------------------------------+
|                                    PREPQUARTERS ARCHITECTURE                                       |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  CLIENT (React 19 + Vite 8 + CSS Design Tokens)                                                    |
|    |                                                                                               |
|    |-- HTTP JSON (CORS, JWT Bearer)                                                                |
|    v                                                                                               |
|  EXPRESS 5 BACKEND (Node.js 18+)                                                                   |
|    |-- Security Middleware (Security Headers, IP Rate Limiter, Sanitization)                       |
|    |-- Auth Controller (/api/auth)                                                                 |
|    |-- Interview Cockpit Controller (/api/interview)                                               |
|    |-- ATS Resume Controller (/api/resume)                                                         |
|    |-- System Documentation Controller (/api/system)                                               |
|    |                                                                                               |
|    +-- SERVICES & ENGINES                                                                          |
|    |     |-- InterviewService (State Machine, Multi-Turn Loop, NIM Integration)                    |
|    |     |-- AnswerValidationService (Deterministic Quality Grading & Nonsense Penalties)          |
|    |     |-- DomainKnowledge (Taxonomies, Coding Problems, Aptitude MCQs, Language Questions)      |
|    |     |-- TranscriptionService (Groq Whisper STT Cloud API)                                     |
|    |     |-- ResumeService (Explainable 10-Category ATS Engine & LaTeX Compiler)                    |
|    |     |-- SanitizationHelper (Zero-Tolerance Disallowed Character Stripper)                     |
|    |                                                                                               |
|    +-- PERSISTENCE & CLOUD                                                                         |
|          |-- MongoDB (Users, InterviewSessions, Questions)                                         |
|          |-- NVIDIA NIM API (meta/llama-3.3-70b-instruct) [Optional / Deterministic Fallback]       |
|          |-- Groq Cloud API (whisper-large-v3) [Optional / Web Speech Fallback]                     |
+----------------------------------------------------------------------------------------------------+
```

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Interview Modalities](#3-interview-modalities)
4. [Architecture & Technology Stack](#4-architecture--technology-stack)
5. [Application & Data Flow](#5-application--data-flow)
6. [Core Components](#6-core-components)
7. [Installation & Setup](#7-installation--setup)
8. [Quick Start](#8-quick-start)
9. [Configuration & Environment Variables](#9-configuration--environment-variables)
10. [API Documentation](#10-api-documentation)
11. [AI & LLM Architecture](#11-aillm-architecture)
12. [Speech & Transcription Pipeline](#12-speech--transcription-pipeline)
13. [ATS Resume Analyzer & LaTeX Studio](#13-ats-resume-analyzer--latex-studio)
14. [Database & Data Models](#14-database--data-models)
15. [Authentication & Security](#15-authentication--security)
16. [Frontend Documentation](#16-frontend-documentation)
17. [Testing Infrastructure](#17-testing-infrastructure)
18. [Deployment & Production Build](#18-deployment--production-build)
19. [Project Structure](#19-project-structure)
20. [Limitations](#20-limitations)
21. [Development & Contribution Guide](#21-development--contribution-guide)
22. [Troubleshooting](#22-troubleshooting)
23. [License](#23-license)

---

## 1. Project Overview

PrepQuarters addresses the lack of technical rigor and structured feedback in conventional mock interview tools. Rather than presenting generic chatbots that output superficial compliments, PrepQuarters enforces:

- **Sequential Multi-Turn State Machine**: Questions are asked one at a time. The engine evaluates candidate answers against domain-specific rubrics and dynamically decides whether to issue an intelligent follow-up probe or advance.
- **Time-Based Sessions**: Sessions run on configurable time budgets (2, 5, 10, 15, 20, or 30 minutes) instead of rigid artificial question counts.
- **Evidence-Based Code Grading**: Code submissions are evaluated against unit test assertions, runtime analysis, and Big-O efficiency metrics rather than assumed correct.
- **Explainable ATS Resume Readiness**: Provides transparent scoring across 10 measurable categories with prioritized improvement targets.
- **Non-Hallucinatory LaTeX Resume Builder**: A guided conversational builder that compiles clean `.tex` resumes using verified user input only.

---

## 2. Key Features

| Feature | Description | Implementation Status |
| :--- | :--- | :--- |
| **Global Interview Context** | Top-level card for Target Domain, Role Persona, and Cognitive Challenge Level (*Easy*, *Medium*, *Hard*) across all modalities. | Implemented |
| **Semantic Domain/Role Validation** | Rejects incompatible role/domain combinations (e.g. "Plumber" for "Software Engineering") with recommendations. | Implemented |
| **Relevance-Aware Runtime Context** | Supports single-language, multi-language comparison, or language-agnostic mode for technical rounds. | Implemented |
| **10 Distinct Interview Modalities** | Voice, Technical, Coding, AI Coding, System Design, HR STAR, Aptitude, Language-Specific, Company Benchmark, and Mixed. | Implemented |
| **DSA Challenge Engine** | Timed LeetCode-style coding challenges across 14 DSA topics with test runner and runtime recording. | Implemented |
| **Controlled Reference Benchmark** | Progressive hints and reference solutions strictly hidden until explicitly requested. | Implemented |
| **Bi-Directional Voice Pipeline** | Audio spectrum visualizer, Groq Whisper STT transcription, and configurable auto-speak or on-demand playback. | Implemented |
| **Explainable ATS Resume Analyzer** | Multi-category readiness scoring, keyword extraction, and prioritized improvement targets. | Implemented |
| **AI Resume Builder & LaTeX Studio** | Conversational builder generating compile-ready `.tex` LaTeX resumes with iterative ATS audit loops. | Implemented |
| **Ambient Cursor Magic Light** | Hardware-accelerated radial cursor glow with `requestAnimationFrame` lerp interpolation. | Implemented |
| **Diagnostic Skill Radar** | Longitudinal mistake registries, competency radars, and downloadable Markdown reports. | Implemented |

---

## 3. Interview Modalities

PrepQuarters provides 10 distinct interview engines:

```
+---------------------------------------------------------------------------------------------------+
| Modality                        | Core Focus                          | Key Inputs / Controls     |
+---------------------------------+-------------------------------------+---------------------------+
| 1. AI Voice Interview           | Spoken technical conversation       | AutoTTS toggle, Duration  |
| 2. Technical Interview          | Computer science & system internals | Discipline, Role, Level   |
| 3. Coding Interview             | Algorithmic problem solving         | Monaco IDE, Tests, Lang   |
| 4. AI Coding Interview          | AI pair-programming interaction     | Assistant Chat, Hints     |
| 5. System Design Interview      | Distributed scale architectures     | Scale Bounds, Scratchpad  |
| 6. HR / Behavioral Interview    | STAR leadership methodology         | 9 Granular Focus Areas    |
| 7. Aptitude Interview           | Quantitative & logical reasoning    | 7 Cognitive Disciplines   |
| 8. Language-Specific Technical  | Runtime internals (V8, GIL, JVM)    | Runtime, Optional DSA     |
| 9. Company-Specific Benchmark   | Calibrated rubrics (Google, Meta)   | Company Profile, Rubrics  |
| 10. Mixed Interview             | Multi-stage complete interview loop | Universal Multi-Stage     |
+---------------------------------------------------------------------------------------------------+
```

### Modality Focus Configurations
- **HR / Behavioral Focus Areas**: Behavioral, STAR-based, Situational, Leadership, Communication, Conflict Resolution, Teamwork, Culture/Values, Career/Motivation.
- **Aptitude Disciplines**: Quantitative Aptitude, Logical Reasoning, Probability, Data Interpretation, Numerical Reasoning, Verbal Reasoning, Analytical Reasoning.
- **DSA Topics Matrix**: Arrays, Strings, Linked Lists, Stacks/Queues, Trees, Graphs, Recursion, Dynamic Programming, Greedy, Searching, Sorting, Hashing, Heaps, Backtracking.

---

## 4. Architecture & Technology Stack

### Frontend Technology Stack
- **Framework**: React 19 (`react` 19.2.8, `react-dom` 19.2.8)
- **Routing**: React Router 7 (`react-router-dom` 7.18.2)
- **Build Tool**: Vite 8 (`vite` 8.2.0, `@vitejs/plugin-react` 6.0.4)
- **Icons**: Lucide React (`lucide-react` 1.31.0)
- **Styling**: Vanilla CSS Design Tokens (HSL palettes, dark theme surfaces, responsive grid layouts)

### Backend Technology Stack
- **Runtime**: Node.js (v18.0.0 or higher)
- **Web Framework**: Express 5 (`express` 5.2.1)
- **Database & ODM**: MongoDB with Mongoose (`mongoose` 9.9.2)
- **Authentication**: JSON Web Tokens (`jsonwebtoken` 9.0.3) & Bcrypt (`bcryptjs` 3.0.3)
- **File Uploads**: Multer (`multer` 2.2.0)
- **CORS & Environment**: `cors` 2.8.6, `dotenv` 17.4.2

---

## 5. Application & Data Flow

### 1. Interview Session Lifecycle Flow

```
[Candidate Configuration]
         |
         v
[POST /api/interview/start] ---> [validateDomainAndRole()]
         |                              |
         | (Initialize Session)         +---> (400 if incompatible)
         v
[InterviewSession Created in MongoDB]
         |
         v
[generateInitialQuestion()] ---> [NVIDIA NIM AI OR Curated Knowledge Base]
         |
         v
[Candidate Submits Answer: POST /:id/answer]
         |
         v
[AnswerValidationService] -----> [Check Empty / Short / Gibberish]
         |                              |
         |                              +---> (Flag Invalid / Penalize Score)
         v
[evaluateAnswerAndGenerateNext()]
         |
         |---> [Score Calculation & Key Points Matched]
         |---> [Decision: Follow-up Probe OR Next Question]
         |---> [Check Time Budget (sessionDurationMinutes)]
         v
[Session Finalized: POST /:id/finish] ---> [generateOverallEvaluation() Scorecard]
```

### 2. Explainable ATS Resume & LaTeX Flow

```
[Resume Upload / Text / LaTeX] + [Optional Job Description]
         |
         v
[POST /api/resume/analyze]
         |
         +---> [extractKeywordsFromText() against TECH_TAXONOMY]
         +---> [analyzeSections(): Contact, Summary, Skills, Experience, Education, Projects]
         +---> [evaluateBullets(): Metrics check, Active vs Weak Verbs]
         +---> [Calculate 10 Category Scores & Explainable Readiness Index]
         +---> [Generate Prioritized Targets: CRITICAL, HIGH, MEDIUM, LOW]
         v
[ATS Scorecard & Downloadable Report (.md / .txt)]
         |
         | (Optional Iteration Loop)
         v
[Conversational Builder: POST /api/resume/build/chat-assist]
         |
         v
[Compile-Ready LaTeX Export: POST /api/resume/build/generate-latex (.tex)]
```

---

## 6. Core Components

| Component / Module | File Location | Responsibility |
| :--- | :--- | :--- |
| **App Router** | `prepquarters/src/App.jsx` | Declares all public and protected candidate routes. |
| **Navbar & Mobile Drawer** | `prepquarters/src/components/Navbar.jsx` | Responsive navigation with React Portal slide-out drawer. |
| **Magic Light** | `prepquarters/src/components/MagicLight.jsx` | Hardware-accelerated cursor ambient light effect. |
| **Interview Setup** | `prepquarters/src/pages/InterviewSetup.jsx` | Modular cockpit calibration, focus cards, and Telemetry HUD. |
| **Interview Cockpit** | `prepquarters/src/pages/AIInterviewSession.jsx` | Multi-modal interview execution workspace. |
| **ATS Resume Suite** | `prepquarters/src/pages/ResumeAnalyzer.jsx` | Explainable ATS scanner and conversational LaTeX builder. |
| **Express Entry** | `server/server.js` | Server initialization, middleware, and route mounting. |
| **Interview Engine** | `server/services/InterviewService.js` | Multi-turn state machine and NVIDIA NIM caller. |
| **Validation Layer** | `server/services/AnswerValidationService.js` | Deterministic answer quality checks and nonsense penalties. |
| **Domain Ontologies** | `server/services/DomainKnowledge.js` | Role validation, coding problems, aptitude MCQs, and rubrics. |
| **ATS Intelligence** | `server/services/ResumeService.js` | 10-category ATS scoring, keyword extraction, and LaTeX compilation. |
| **Voice Pipeline** | `server/services/TranscriptionService.js` | Groq Whisper Cloud API integration. |
| **Sanitizer** | `server/services/SanitizationHelper.js` | Strips em dashes, en dashes, and emojis across all text. |

---

## 7. Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or newer
- **npm**: v9.0.0 or newer
- **MongoDB**: Local MongoDB server or MongoDB Atlas URI

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/prepquarters
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173

# Optional AI Integrations (Falls back gracefully to curated knowledge bases if omitted)
NVIDIA_NIM_API_KEY=your_nvidia_nim_api_key_here
NVIDIA_NIM_MODEL=meta/llama-3.3-70b-instruct
GROQ_API_KEY=your_groq_api_key_here
```

### 2. Frontend Setup

```bash
cd ../prepquarters
npm install
```

---

## 8. Quick Start

Run the backend and frontend development servers concurrently:

### Terminal 1: Start Backend Server
```bash
cd server
npm run dev
# Server listening on http://localhost:5000
```

### Terminal 2: Start Frontend Application
```bash
cd prepquarters
npm run dev
# Application accessible at http://localhost:5173
```

---

## 9. Configuration & Environment Variables

| Variable | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | No | `5000` | Port for Express backend server. |
| `MONGO_URI` | Yes | `mongodb://localhost:27017/prepquarters` | MongoDB connection string. |
| `JWT_SECRET` | Yes | `your_jwt_secret_key` | Secret key used to sign and verify candidate JWT tokens. |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed origin for CORS middleware. |
| `NVIDIA_NIM_API_KEY` | No | `""` | NVIDIA NIM API key for server-side LLM inference. |
| `NVIDIA_NIM_MODEL` | No | `meta/llama-3.3-70b-instruct` | LLM model identifier on NVIDIA NIM. |
| `GROQ_API_KEY` | No | `""` | Groq Cloud API key for Whisper STT transcription. |

---

## 10. API Documentation

### 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register new candidate account | No |
| `POST` | `/api/auth/login` | Authenticate candidate & issue JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated profile data | Yes (`Bearer <token>`) |

#### Signup Example
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

```json
{
  "success": true,
  "message": "User registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66c0e81f...",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

---

### 2. Interview Cockpit Endpoints (`/api/interview`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/interview/start` | Initialize interview session | Yes |
| `POST` | `/api/interview/:id/answer` | Submit answer, evaluate, generate follow-up | Yes |
| `POST` | `/api/interview/:id/run-code` | Execute code against test assertions | Yes |
| `POST` | `/api/interview/:id/finish` | Finalize session & generate scorecard | Yes |
| `POST` | `/api/interview/transcribe-audio` | Transcribe voice blob with Groq Whisper | Yes |
| `GET` | `/api/interview/library/questions` | Search and filter question bank | No |
| `GET` | `/api/interview/stats/summary` | Retrieve candidate skill radar stats | Yes |
| `GET` | `/api/interview/history/all` | Fetch session history and transcripts | Yes |

#### Start Session Example
```http
POST /api/interview/start
Content-Type: application/json
Authorization: Bearer <token>

{
  "domain": "Software Engineering",
  "role": "Backend Developer",
  "difficulty": "Hard",
  "interviewType": "Technical Interview",
  "sessionDuration": "10 Minutes (Standard)",
  "programmingLanguage": "python"
}
```

```json
{
  "success": true,
  "session": {
    "_id": "66c0e9a4...",
    "role": "Backend Developer",
    "domain": "Software Engineering",
    "difficulty": "Hard",
    "interviewType": "Technical Interview",
    "currentQuestion": {
      "topic": "Concurrency & Data Structures",
      "questionType": "Technical",
      "questionText": "How does Python handle concurrency under the Global Interpreter Lock (GIL)?",
      "expectedKeyPoints": ["GIL prevents multi-core bytecode execution", "asyncio for I/O bounds", "multiprocessing for CPU bounds"]
    }
  }
}
```

---

### 3. Resume Intelligence Endpoints (`/api/resume`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/resume/analyze` | Multi-category ATS readiness scoring | No |
| `POST` | `/api/resume/improve-bullet` | STAR / XYZ formula bullet rewriter | No |
| `POST` | `/api/resume/build/chat-assist` | Conversational resume builder guide | No |
| `POST` | `/api/resume/build/generate-latex`| Compile-ready `.tex` LaTeX export | No |

---

### 4. System Specifications (`/api/system`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/system/docs` | Returns platform system specs and API directory | No |

---

## 11. AI & LLM Architecture

```
+----------------------------------------------------------------------------------------------+
|                                    NVIDIA NIM ORCHESTRATION                                  |
+----------------------------------------------------------------------------------------------+
| Candidate Context (Role, Domain, Difficulty, Company Style, Previously Asked Question Texts) |
|                                              |                                               |
|                                              v                                               |
|                      Server-Side Prompt Construction with Structured JSON Schema             |
|                                              |                                               |
|                                              v                                               |
|                       NVIDIA NIM API (meta/llama-3.3-70b-instruct)                           |
|                                              |                                               |
|                     +------------------------+------------------------+                      |
|                     | (API Key Present / 200 OK)                      | (Error / No Key)     |
|                     v                                                 v                      |
|         Parse Structured Response                           Curated Fallback Engine          |
|      (Score, Key Points, Follow-up)                   (DomainKnowledge.js Taxonomies)        |
+----------------------------------------------------------------------------------------------+
```

### Deterministic Fallback Guarantee
If `NVIDIA_NIM_API_KEY` is not provided or the cloud endpoint times out, PrepQuarters automatically falls back to its curated deterministic knowledge repositories in [`DomainKnowledge.js`](file:///c:/Myproject/PROJ1-AI_PREPQUARTER/server/services/DomainKnowledge.js). Candidates experience full multi-turn interview flows with 0 disruption.

---

## 12. Speech & Transcription Pipeline

- **Audio Capture**: Browser `MediaRecorder` captures candidate microphone input as WebM audio blobs with live Web Audio API spectrum visualization.
- **Server-Side Transcription**: `POST /api/interview/transcribe-audio` sends the blob buffer directly to Groq Cloud Whisper API (`whisper-large-v3`).
- **Zero Client Credential Exposure**: Groq API keys remain strictly on the backend.
- **Autonomous Speech Modes**:
  - `Auto-Speak ON`: AI interviewer vocalizes questions automatically using Web Speech Synthesis.
  - `Explicit On-Demand`: AI remains silent until the candidate clicks the Play button.

---

## 13. ATS Resume Analyzer & LaTeX Studio

### 10 Measurable ATS Scoring Categories
1. **Parsing Compatibility**: Multi-column text flow, table hazards, and delimiter checks.
2. **Document Structure**: Recognition of 6 core sections (Contact, Summary, Skills, Experience, Education, Projects).
3. **Section Recognition**: Standardized taxonomy compliance.
4. **Keyword Relevance**: Keyword density matched against industry ontologies.
5. **Job Description Alignment**: Semantic overlap and skill requirements match.
6. **Skills Relevance**: Presence of core target stack technologies.
7. **Role & Title Alignment**: Title parity and seniority consistency.
8. **Experience Quality**: High-impact metric-backed accomplishments.
9. **Formatting Compatibility**: Font, delimiter, and layout safety.
10. **Content Quality & Action Verbs**: STAR / Google XYZ impact phrasing.

### Compile-Ready LaTeX Export
The AI Resume Builder compiles clean `.tex` source code compatible with standard `pdflatex` / `xelatex` compilers using `geometry`, `hyperref`, `enumitem`, and `titlesec`.

---

## 14. Database & Data Models

PrepQuarters uses MongoDB with 3 primary Mongoose schemas:

```
+-------------------+           +-------------------------------------+
|      User         |           |          InterviewSession           |
+-------------------+           +-------------------------------------+
| _id: ObjectId     | 1       * | _id: ObjectId                       |
| name: String      |---------->| userId: ObjectId (ref User)         |
| email: String     |           | role: String                        |
| password: String  |           | domain: String                      |
| targetRole: String|           | difficulty: String                  |
| createdAt: Date   |           | interviewType: String               |
+-------------------+           | programmingLanguages: [String]      |
                                | autoTTS: Boolean                    |
                                | speechResponseMode: String          |
                                | sessionDurationMinutes: Number      |
                                | questions: [QuestionSubdocument]    |
                                | overallEvaluation: Object           |
                                | status: String                      |
                                +-------------------------------------+
```

---

## 15. Authentication & Security

- **Password Encryption**: Bcrypt hashing with 12 salt rounds before persisting to MongoDB.
- **Stateless Tokens**: Signed JSON Web Tokens (JWT) with 7-day expiration.
- **Security Headers**: Custom middleware setting `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- **IP Rate Limiting**: In-memory sliding window rate limiter restricting sensitive authentication endpoints to 20 requests per 15-minute window.
- **Disallowed Character Stripper**: Sanitization helper removing em dashes (`\u2014`, `\u2015`), en dashes (`\u2013`), and emoji code points from all inputs and outputs.
- **Strict Data Tenancy**: Candidates only query and mutate their own session documents.

---

## 16. Frontend Documentation

- **Page Architecture**:
  - `Home.jsx`: Landing cockpit with interactive terminal showcase and feature matrix.
  - `Features.jsx`: Full 12-capability platform directory.
  - `InterviewSetup.jsx`: Modality calibration cockpit with live Telemetry HUD.
  - `AIInterviewSession.jsx`: Multi-modal execution cockpit (Code editor, speech visualizer, scratchpad, MCQ deck).
  - `ResumeAnalyzer.jsx`: Dual-mode ATS scanner and conversational LaTeX builder.
  - `QuestionLibrary.jsx`: Question bank repository with one-click practice launchers.
  - `SkillGapPage.jsx`: Diagnostic competency radar charts and downloadable scorecards.
  - `SystemDocs.jsx`: Developer documentation and live API specifications.

---

## 17. Testing Infrastructure

The repository includes automated test suites located in `scratch/`:

```bash
# 1. Run Complete Architecture Suite (18 Integration Flows)
node scratch/test_complete_architecture_suite.js

# 2. Run ATS Readiness, LaTeX Builder & Nonsense Penalty Suite
node scratch/test_industry_ats_and_builder.js

# 3. Run End-to-End API Feature Suite
node scratch/test_comprehensive_features_and_resume.js

# 4. Run Zero Dash and Emoji Compliance Verification
node scratch/verify_emojis_and_dashes.js
```

---

## 18. Deployment & Production Build

### 1. Build Client Bundle
```bash
cd prepquarters
npm run build
# Compiles production assets into prepquarters/dist/
```

### 2. Run Backend in Production Mode
```bash
cd server
NODE_ENV=production node server.js
```

---

## 19. Project Structure

```
PROJ1-AI_PREPQUARTER/
├── README.md                           # Comprehensive documentation
├── PROJECT_STRUCTURE.md                # Detailed codebase map
├── walkthrough.md                      # Verification walkthrough
├── scratch/                            # Automated test suites
│   ├── test_complete_architecture_suite.js
│   ├── test_comprehensive_features_and_resume.js
│   ├── test_industry_ats_and_builder.js
│   └── verify_emojis_and_dashes.js
├── prepquarters/                       # React 19 + Vite frontend
│   ├── src/
│   │   ├── components/                 # Navbar, MagicLight, ProtectedRoute
│   │   ├── pages/                      # Home, Dashboard, Setup, Cockpit, Resume, Docs
│   │   ├── App.jsx                     # Route declarations
│   │   └── index.css                   # Design tokens & CSS variables
│   └── package.json
└── server/                             # Express 5 backend
    ├── middleware/                     # Auth & security middleware
    ├── models/                         # Mongoose schemas (User, Session, Question)
    ├── routes/                         # API route controllers
    ├── services/                       # NIM, Whisper, ATS, Sanitization engines
    ├── server.js                       # Entry point
    └── package.json
```

---

## 20. Limitations

- **Client Code Execution Sandbox**: In-browser JavaScript evaluation is supported via browser runtimes; non-JavaScript languages evaluate syntax patterns, structures, and algorithmic bounds rather than spawning sandboxed Linux worker microVMs.
- **Audio Recording in Insecure Contexts**: Web Audio and MediaRecorder APIs require `localhost` or HTTPS context to access candidate microphones.
- **External AI Rate Limits**: If external NVIDIA NIM or Groq rate limits are exceeded, the engine gracefully reverts to deterministic knowledge bases.

---

## 21. Development & Contribution Guide

1. **Format & Style Rules**:
   - Maintain 0 em dashes (`\u2014`, `\u2015`), 0 en dashes (`\u2013`), and 0 emojis across all files.
   - Use standard markdown links (`[link](url)`).
2. **Adding a New Interview Question**:
   - Update `CODING_PROBLEMS`, `APTITUDE_QUESTIONS`, or `LANGUAGE_QUESTIONS` in `server/services/DomainKnowledge.js`.
3. **Running the Full Validation Pass**:
   ```bash
   node scratch/verify_emojis_and_dashes.js
   node scratch/test_complete_architecture_suite.js
   cd prepquarters && npm run build
   ```

---

## 22. Troubleshooting

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| `MongooseServerSelectionError` | MongoDB daemon is not running. | Start local MongoDB via `mongod` or configure Atlas URI in `server/.env`. |
| `Cannot find module` | Dependencies missing. | Run `npm install` inside both `server/` and `prepquarters/`. |
| `Microphone access denied` | Browser blocked mic permission. | Grant microphone permissions in browser settings for `http://localhost:5173`. |
| `Port 5000 in use` | Another server instance is active. | Terminate existing node processes on port 5000. |

---

## 23. License

ISC License (as specified in package manifests).
