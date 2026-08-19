# PrepQuarters — Comprehensive Repository Technical Documentation

> **High-Fidelity AI Interview Simulation, Automated Code Evaluation & Career Engineering Platform**  
> An enterprise-grade full-stack platform combining real-time adaptive technical assessments, in-memory isolated code sandboxing, live Codeforces problem ingestion, multi-model AI routing, and compile-ready LaTeX resume synthesis.

---

## 1. Table of Contents

- [1. Table of Contents](#1-table-of-contents)
- [2. Project Identity & Purpose](#2-project-identity--purpose)
- [3. System Architecture](#3-system-architecture)
- [4. Core Subsystems & Components](#4-core-subsystems--components)
- [5. Application & Data Workflows](#5-application--data-workflows)
- [6. AI & LLM Routing Architecture](#6-aillm-routing-architecture)
- [7. Database & Persistence Layer](#7-database--persistence-layer)
- [8. REST API Reference](#8-rest-api-reference)
- [9. Authentication & Security Architecture](#9-authentication--security-architecture)
- [10. Frontend Architecture & Design System](#10-frontend-architecture--design-system)
- [11. External Integrations](#11-external-integrations)
- [12. Configuration & Environment Variables](#12-configuration--environment-variables)
- [13. Installation & Local Development](#13-installation--local-development)
- [14. Testing & Verification Suites](#14-testing--verification-suites)
- [15. Deployment Guide (Vercel & Render)](#15-deployment-guide-vercel--render)
- [16. Project Directory Map](#16-project-directory-map)
- [17. Limitations & Technical Boundaries](#17-limitations--technical-boundaries)

---

## 2. Project Identity & Purpose

**PrepQuarters** is an open-source technical interview simulation and career readiness platform designed to replicate senior engineering hiring bars. It addresses the fundamental flaw of conventional AI mock interview tools—namely, superficial positive reinforcement without semantic relevance verification.

### Key Capabilities Implemented
- **Adaptive AI Interview Cockpit**: Context-aware technical scenarios with live speech-to-text transcription, in-browser code editing, real-time rubric scoring, and adaptive follow-up questions.
- **Two-Tier Answer Validation & Zero-Score Gate**: Rejects keyboard smash, filler words, and audio noise, awarding a strict `Score = 0/10` for non-substantive answers.
- **Dual AI Provider Architecture**: High-speed Platform Intelligence (Groq Llama 3.3 70B & NVIDIA NIM) alongside client-side Bring Your Own Key (BYO API) for OpenAI, Anthropic, and xAI with zero key retention.
- **In-Memory Code Sandbox**: Safe, sub-10ms code execution and automated test case runner for JavaScript, Python, C++, Java, and Go.
- **Live Question Intelligence**: Real-time integration with the Codeforces API combined with curated domain problem banks, enforcing an active 80% sourced / 20% curated ratio.
- **Conversational LaTeX Resume Studio**: Interactive AI architect that collects verified engineering metrics, prompts for pre-generation confirmation, and compiles structured `.tex` documents without synthetic placeholders.
- **Appwrite Cloud Persistence**: Managed document storage for candidate profiles and session telemetry with an automated 2-session replay retention policy.
- **Verified Email & 6-Digit Password Reset**: Secure Gmail SMTP dispatch delivering contact submissions and 6-digit one-time password recovery codes.

---

## 3. System Architecture

```text
                                  +-------------------------------------------------------+
                                  |              PREPQUARTERS FRONTEND                    |
                                  |   React 18 + Vite | Pure CSS Tokens | Canvas Visuals  |
                                  +---------------------------+---------------------------+
                                                              |
                                               HTTPS REST / JSON / JWT Auth
                                                              |
                                                              v
+-------------------------------------------------------------------------------------------------------------------------+
|                                                  NODE.JS & EXPRESS BACKEND                                              |
|                                                                                                                         |
|  +------------------------+  +------------------------+  +------------------------+  +-------------------------------+  |
|  |     /api/auth          |  |     /api/interview     |  |     /api/resume        |  |     /api/questions            |  |
|  | User Auth & 6-Digit    |  | Session Lifecycle &    |  | Quality Gate &         |  | Codeforces Ingestion &        |  |
|  | Password Reset Code    |  | Rubric Evaluation      |  | LaTeX Compiler         |  | 80/20 Provenance Tracker      |  |
|  +-----------+------------+  +-----------+------------+  +-----------+------------+  +---------------+---------------+  |
|              |                           |                           |                               |                  |
+--------------|---------------------------|---------------------------|-------------------------------|------------------+
               |                           |                           |                               |
               v                           v                           v                               v
+-----------------------------+  +-----------------------------+  +--------------------------+  +-------------------------+
|     APPWRITE CLOUD          |  |     MULTI-MODEL AI ROUTER   |  |   ISOLATED CODE SANDBOX  |  |    GMAIL SMTP ENGINE    |
|                             |  |                             |  |                          |  |                         |
| • users collection          |  | • Platform Mode: Groq Llama |  | • In-memory VM Runner    |  | • Nodemailer (Port 465) |
| • sessions collection       |  |   3.3 70B & NVIDIA NIM      |  | • Multi-language syntax  |  | • Contact Form Delivery |
| • 2-session retention limit |  | • BYO Mode: OpenAI, Claude, |  | • Automated test cases   |  | • 6-Digit Password Code |
| • Singapore cluster (sgp)   |  |   xAI (Zero key leakage)    |  | • Sub-10ms latency       |  | • Message ID Tracking   |
+-----------------------------+  +-----------------------------+  +--------------------------+  +-------------------------+
```

---

## 4. Core Subsystems & Components

| Component | Location | Primary Responsibility | Key Dependencies |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `server/server.js` | Express server bootstrap, CORS headers, JSON body parsing, error middleware. | `express`, `cors`, `dotenv` |
| **Appwrite Service** | `server/services/AppwriteService.js` | Appwrite Cloud SDK document storage, user upserts, session telemetry, replay pruning. | `node-appwrite`, `crypto` |
| **AI Provider Router** | `server/services/AiProviderService.js` | Routes prompts between Platform (Groq/NIM) and BYO API (OpenAI, Claude, xAI); enforces 40 req/min rate limit. | `fetch`, `groq-sdk` |
| **Interview Service** | `server/services/InterviewService.js` | Question generation, rubric evaluations, adaptive follow-ups, final scorecard synthesis. | `DomainKnowledge.js`, `AiProviderService.js` |
| **Answer Validator** | `server/services/AnswerValidationService.js` | Entropy analysis, character run checks, surrender detection, zero-score enforcement. | `SanitizationHelper.js` |
| **Resume Service** | `server/services/ResumeService.js` | Multi-layer document validation, qualitative tailoring feedback, conversational LaTeX state machine. | `pdf-parse`, `AiProviderService.js` |
| **Question Bank** | `server/services/QuestionBankService.js` | Codeforces live problem ingestion, 24h caching, deduplication, 80/20 distribution calculation. | `DomainKnowledge.js` |
| **Coding Sandbox** | `server/services/CodingSandboxService.js` | In-memory code execution and test runner for JavaScript, Python, C++, Java, and Go. | Node.js `vm` module |
| **Email Service** | `server/services/EmailService.js` | Outbound email transport via Gmail SMTP (port 465) or Resend API. | `nodemailer` |
| **STT Transcription**| `server/services/TranscriptionService.js` | Cloud Whisper speech-to-text transcription for voice recordings. | `groq-sdk` |

---

## 5. Application & Data Workflows

### A. Live Interview Cockpit Flow
```text
Candidate Clicks "Initialize Cockpit"
    ↓
POST /api/interview/start (Creates session in Appwrite Cloud)
    ↓
Backend Generates Scenario 1 (Domain intelligence / AI reasoning)
    ↓
Candidate Submits Answer (Spoken audio or Typed code)
    ↓
Entropy & Relevance Gate (AnswerValidationService)
    ├── If Gibberish/Noise → Score = 0/10, Re-attempt prompt
    └── If Valid Response → Proceed to Evaluation
         ↓
AI Rubric Evaluation (Evaluates trade-offs, architecture, complexity)
    ↓
Persist Scenario Evaluation in Appwrite Cloud
    ↓
Next Scenario OR Conclude Session
    ↓
Generate Final Scorecard & Skill Gap Matrix
    ↓
Automated Retention Enforcement (Deletes sessions older than latest 2)
```

### B. Secure 6-Digit Password Reset Flow
```text
Candidate Requests Password Reset (POST /api/auth/forgot-password)
    ↓
Backend Generates Cryptographic 6-Digit Code (15-min expiry)
    ↓
Gmail SMTP Dispatches Email to Candidate (Zero Token in JSON response)
    ↓
Candidate Types 6-Digit Code + New Password (POST /api/auth/reset-password)
    ↓
Backend Verifies Code (Max 5 failed attempts allowed)
    ↓
Bcrypt Hashes New Password (12 salt rounds)
    ↓
Updates User Document in Appwrite Cloud & Invalidates Code
```

---

## 6. AI & LLM Routing Architecture

PrepQuarters implements a dual-layer AI routing mechanism in `server/services/AiProviderService.js`:

| Mode | Provider | Model Identifier | Purpose | Rate Limit | Fallback |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Platform Mode** | Groq | `llama-3.3-70b-versatile` | Sub-second scenario generation & evaluation | 40 req/min | NVIDIA NIM `meta/llama-3.3-70b-instruct` |
| **Platform Mode** | Groq | `whisper-large-v3-turbo` | Voice speech-to-text transcription | 40 req/min | In-browser Web Speech API |
| **BYO API Mode** | OpenAI | `gpt-4o-mini` / `gpt-4o` | User-supplied key inference | Custom key quota | None (Reports provider error) |
| **BYO API Mode** | Anthropic | `claude-3-5-haiku-20241022` | User-supplied key inference | Custom key quota | None (Reports provider error) |
| **BYO API Mode** | xAI | `grok-2-latest` | User-supplied key inference | Custom key quota | None (Reports provider error) |

### BYO API Key Security Guarantees
1. **Zero Database Persistence**: Client-supplied keys are never written to Appwrite Cloud or server-side memory stores.
2. **Encrypted Header Transmission**: Keys travel exclusively via encrypted HTTPS request headers (`x-ai-api-key`, `x-ai-provider`, `x-ai-model`).
3. **Zero Log Exposure**: Request interceptors strip authorization headers before logging.

---

## 7. Database & Persistence Layer

- **Provider**: Appwrite Cloud
- **Endpoint**: `https://sgp.cloud.appwrite.io/v1`
- **Project ID**: `6a848cdb001bfd2d59a9`
- **Database ID**: `6a858e86001a384c7913`

### Collections Schema

```text
+------------------------------------------+       +------------------------------------------+
|             users collection             |       |            sessions collection           |
+------------------------------------------+       +------------------------------------------+
| $id          : String (Auto/User ID)     |       | $id          : String (Session ID)       |
| name         : String                    |       | userId       : String (Foreign key)      |
| email        : String (Unique, Indexed)  | <---> | sessionJson  : String (Full telemetry,   |
| role         : String (Target Domain)    |       |                questions, evaluations,   |
| userDataJson : String (Full profile,     |       |                and overall scorecard)    |
|                stats, hashed password)   |       | $createdAt   : DateTime (Indexed Desc)  |
+------------------------------------------+       +------------------------------------------+
```

### Session Retention Policy
To prevent stale telemetry accumulation, `cleanupUserOlderSessions(userId, 2)` automatically prunes completed sessions, retaining only the **latest 2 completed sessions** per candidate in the Appwrite Cloud database.

---

## 8. REST API Reference

### Authentication Endpoints (`server/routes/auth.js`)

#### Register Candidate
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Alex Mercer",
  "email": "alex@example.com",
  "password": "SecurePassword123!",
  "role": "Software Engineer"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6a85a5480007cbaf1ada",
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "role": "Software Engineer"
  }
}
```

#### Request Password Reset (6-Digit Code)
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "alex@example.com"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "A 6-digit password reset verification code has been dispatched to your email address."
}
```

#### Verify Code & Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "alex@example.com",
  "code": "849201",
  "newPassword": "NewSecurePassword456!",
  "confirmNewPassword": "NewSecurePassword456!"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully. You can now log in with your new password."
}
```

---

### Interview Endpoints (`server/routes/interview.js`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/interview/start` | Initializes a new mock session and generates Question 1. | Yes (`Bearer`) |
| `GET` | `/api/interview/:id` | Retrieves active session state and current question. | Yes (`Bearer`) |
| `POST` | `/api/interview/:id/answer` | Submits candidate answer, evaluates rubric, and returns next question. | Yes (`Bearer`) |
| `POST` | `/api/interview/:id/finish` | Concludes interview early, calculates final scorecard, and prunes older replays. | Yes (`Bearer`) |
| `GET` | `/api/interview/user/sessions` | Lists candidate's completed interview sessions (latest 2). | Yes (`Bearer`) |
| `GET` | `/api/interview/:id/replay` | Retrieves full question-by-question transcript for replay explorer. | Yes (`Bearer`) |

---

### Resume Endpoints (`server/routes/resume.js`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/resume/analyze` | Analyzes resume text or PDF against quality gate and returns actionable suggestions. | No |
| `POST` | `/api/resume/builder/message`| Conversational assistant state machine that collects milestones and compiles LaTeX. | No |

---

### Question Bank Endpoints (`server/routes/questions.js`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/questions` | Queries Codeforces and curated questions with search, domain, and difficulty filters. | No |

---

### Contact Form Endpoint (`server/routes/contact.js`)

```http
POST /api/contact
Content-Type: application/json

{
  "name": "Candidate Inquiry",
  "email": "candidate@example.com",
  "message": "Inquiry regarding technical interview practice."
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message delivered successfully to support.",
  "recipient": "tapashidhar2004@gmail.com"
}
```

---

## 9. Authentication & Security Architecture

- **Password Hashing**: Bcrypt with 12 salt rounds before persisting to Appwrite Cloud.
- **JWT Authorization**: Signed using `HS256` with expiration enforced via `server/middleware/auth.js`.
- **Identity-Aware Rate Limiting**: 40 requests/minute per authenticated user ID / client IP on AI routes.
- **6-Digit Password Reset Verification**: 15-minute expiration, 5-attempt brute-force lock, single-use invalidation, zero token leakage in JSON responses.
- **Input Sanitization**: Regular expression stripping of emojis, em dashes, and en dashes across all AI outputs.

---

## 10. Frontend Architecture & Design System

- **Framework**: React 18 with Vite
- **Routing**: React Router 6 (`BrowserRouter`, `ProtectedRoute`)
- **Icons**: Lucide React
- **Design Tokens (`prepquarters/src/index.css`)**:
  - Dark Mode (`:root`): `--bg-canvas: #090d14`, `--bg-card: rgba(17, 24, 39, 0.75)`, `--accent-primary: #10b981`
  - Light Mode (`[data-theme="light"]`): `--bg-canvas: #f8fafc`, `--bg-card: rgba(255, 255, 255, 0.88)`, `--accent-primary: #059669`
- **Hero Canvas**: Pure HTML5 Canvas API rendering mathematical particle networks with high contrast across both Light and Dark themes.

---

## 11. External Integrations

| Integration | Purpose | Configuration Variable | Status |
| :--- | :--- | :--- | :--- |
| **Appwrite Cloud** | User accounts & session telemetry | `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_DATABASE_ID`, `APPWRITE_API_KEY` | Active |
| **Groq Cloud** | Primary LLM inference & Whisper STT | `GROQ_API_KEY` | Active |
| **NVIDIA NIM** | Deep architectural fallback LLM | `NVIDIA_NIM_API_KEY`, `NVIDIA_NIM_BASE_URL` | Active |
| **Gmail SMTP** | Contact form & password reset codes | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Active |
| **Codeforces API** | Competitive programming questions | `https://codeforces.com/api/problemset.problems` | Active |

---

## 12. Configuration & Environment Variables

All backend configuration is stored in `server/.env`:

| Variable | Required | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | Yes | `5000` | Local Express server port |
| `CLIENT_URL` | Yes | `http://localhost:5173` | CORS allowed origin |
| `JWT_SECRET` | Yes | - | Secret key for signing authentication tokens |
| `APPWRITE_ENDPOINT` | Yes | `https://sgp.cloud.appwrite.io/v1` | Appwrite Cloud API endpoint |
| `APPWRITE_PROJECT_ID` | Yes | - | Appwrite project identifier |
| `APPWRITE_DATABASE_ID` | Yes | - | Appwrite database identifier |
| `APPWRITE_API_KEY` | Yes | - | Appwrite Server API key |
| `GROQ_API_KEY` | Yes | - | Groq API key for Llama 3.3 and Whisper STT |
| `NVIDIA_NIM_API_KEY` | Optional | - | NVIDIA NIM API key for architectural fallback |
| `CONTACT_RECEIVER_EMAIL` | Yes | `tapashidhar2004@gmail.com` | Destination inbox for contact form submissions |
| `SMTP_HOST` | Yes | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | Yes | `465` | SMTP port (465 SSL or 587 TLS) |
| `SMTP_SECURE` | Yes | `true` | Enable SSL encryption |
| `SMTP_USER` | Yes | - | Sender Gmail address |
| `SMTP_PASS` | Yes | - | 16-character Google App Password |

---

## 13. Installation & Local Development

### 1. Prerequisites
- Node.js v18.0.0+
- npm v9.0.0+

### 2. Setup & Installation

```bash
# Clone the repository
git clone https://github.com/AuroraBytesX/PrepQuarters.git
cd PrepQuarters

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../prepquarters
npm install
```

### 3. Run Development Servers

```bash
# Start Backend Server (Terminal 1)
cd server
node server.js

# Start Frontend Dev Server (Terminal 2)
cd prepquarters
npm run dev
```

Frontend runs at `http://localhost:5173`; Backend runs at `http://localhost:5000`.

---

## 14. Testing & Verification Suites

Automated verification scripts located in `scratch/`:

```bash
# Run 12-Case Resume Validation Matrix
node scratch/test_resume_validation_matrix.js

# Run Conversational Resume Builder State Machine Test
node scratch/test_conversational_resume_builder.js

# Run Interview Lifecycle & Appwrite Cloud Persistence Test
node scratch/test_interview_start_and_cockpit.js

# Run Secure 6-Digit Password Reset Suite
node scratch/test_password_reset_flow.js

# Run Live Contact Email Dispatch Test
node scratch/test_live_contact_delivery.js

# Build Frontend Production Bundle
cd prepquarters && npm run build
```

---

## 15. Deployment Guide (Vercel & Render)

### Updating Existing Deployments
Because your GitHub repository (`AuroraBytesX/PrepQuarters`) is already connected to Render and Vercel, pushing code to the `main` branch will automatically trigger builds on both platforms without creating new projects:

```bash
git add .
git commit -m "feat: complete unified theme system and secure password reset"
git push origin main
```

### Vercel (Frontend Deployment)
- **Framework Preset**: Vite
- **Root Directory**: `prepquarters`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://your-backend-service.onrender.com`

### Render (Backend Deployment)
- **Environment**: Node
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Environment Variables**: Add all variables from `server/.env`.

---

## 16. Project Directory Map

```text
PROJ1-AI_PREPQUARTER/
├── prepquarters/                    # React 18 Frontend
│   ├── src/
│   │   ├── components/              # UI widgets (Navbar, Canvas, Logo, Modals)
│   │   │   ├── AiProviderModal.jsx  # AI Key Selector Modal
│   │   │   ├── EngineeringHeroCanvas.jsx # Dynamic particle network canvas
│   │   │   ├── EngineeringCanvasVisual.jsx # Waveform visual canvas
│   │   │   ├── FeatureSlider.jsx    # Feature carousel
│   │   │   ├── Logo.jsx             # Vector brand logo
│   │   │   ├── Navbar.jsx           # Top navigation bar & mobile glass menu
│   │   │   └── ProtectedRoute.jsx   # Auth route guard
│   │   ├── pages/                   # Full-screen views
│   │   │   ├── AIInterviewSession.jsx # Live interview cockpit & scorecard
│   │   │   ├── Dashboard.jsx        # Candidate command center
│   │   │   ├── Home.jsx             # Public landing page & contact form
│   │   │   ├── InterviewReplay.jsx  # Transcript explorer
│   │   │   ├── InterviewSetup.jsx   # Practice configuration console
│   │   │   ├── QuestionLibrary.jsx  # Codeforces question bank
│   │   │   ├── ResumeAnalyzer.jsx   # Resume diagnostics & LaTeX studio
│   │   │   ├── SkillGapPage.jsx     # Skill gap matrix
│   │   │   └── SystemDocs.jsx       # Interactive system documentation
│   │   ├── config/api.js            # API URL resolver
│   │   ├── App.jsx                  # Root layout & route switcher
│   │   ├── Login.jsx                # Auth & 6-digit password reset portal
│   │   ├── index.css                # Central design tokens (Light/Dark)
│   │   └── App.css                  # UI styling & glassmorphism
│   ├── vite.config.js               # Vite configuration
│   └── package.json                 # Frontend dependencies
│
├── server/                          # Node.js & Express Backend
│   ├── routes/                      # REST API endpoints
│   │   ├── auth.js                  # Auth & 6-digit password reset routes
│   │   ├── interview.js             # Session start, answer, finish routes
│   │   ├── resume.js                # Resume analysis & builder routes
│   │   ├── questions.js             # Question bank query route
│   │   ├── contact.js               # Contact form email route
│   │   ├── system.js                # BYO key verification route
│   │   └── user.js                  # User profile & stats route
│   ├── services/                    # Core business logic
│   │   ├── AiProviderService.js     # Multi-model AI router & rate limiter
│   │   ├── AnswerValidationService.js # Relevance & zero-score gate
│   │   ├── AppwriteService.js       # Appwrite Cloud database gateway
│   │   ├── CodingSandboxService.js  # In-memory code execution VM
│   │   ├── DomainKnowledge.js       # Technical curriculum dictionary
│   │   ├── EmailService.js          # Gmail SMTP & Resend email engine
│   │   ├── InterviewService.js      # Interview orchestrator & evaluator
│   │   ├── QuestionBankService.js   # Codeforces API ingestion & caching
│   │   ├── ResumeService.js         # Resume quality gate & LaTeX generator
│   │   ├── SanitizationHelper.js    # Character cleaner (removes em dashes/emojis)
│   │   └── TranscriptionService.js  # Groq Whisper speech-to-text
│   ├── middleware/auth.js           # JWT verification middleware
│   ├── server.js                    # Express server entry point
│   ├── .env                         # Server environment variables
│   └── package.json                 # Backend dependencies
│
├── README.md                        # Public GitHub repository overview
├── PROJECT_DOCUMENTATION.md         # Digital twin & interview guide
└── PROJECT_EXTRA_DOCUMENTATION.md   # This comprehensive codebase specification
```

---

## 17. Limitations & Technical Boundaries

1. **In-Memory Code Sandbox Scope**: The sandbox executes pure algorithmic JavaScript and Python within standard memory bounds; network calls (`fetch`, sockets) are blocked inside the sandbox for security.
2. **Replay Retention Ceiling**: The user dashboard displays a maximum of the 2 most recent completed sessions per candidate; older records are automatically pruned from Appwrite Cloud.
3. **Google SMTP App Password Requirement**: Standard Gmail account passwords cannot be used for SMTP authentication; a 16-character Google App Password is required when 2-Factor Authentication is active.
4. **Codeforces API Caching**: Problem sets from Codeforces are cached for 24 hours locally to adhere to public API rate limits.
