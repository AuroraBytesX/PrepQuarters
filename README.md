# PrepQuarters

> **High-Fidelity AI Interview Cockpit & Technical Career Engineering Platform**  
> Real-time adaptive technical assessments, real-time code execution, conversational LaTeX resume studio, and multi-provider AI evaluation.

---

## 🚀 Overview

**PrepQuarters** is an enterprise-grade AI technical interview simulation and career readiness platform designed to replicate senior engineering hiring bars. Built with **React**, **Node.js/Express**, and **Appwrite Cloud**, PrepQuarters combines deep domain knowledge matrices with real-time neural evaluation to provide authentic hiring committee scorecards, pinpoint competency gaps, and generate compile-ready LaTeX resumes.

---

## ⚡ Core Capabilities

- **Adaptive AI Interview Cockpit**: Full-session mock interviews across Software Engineering, Machine Learning, DevOps/SRE, Frontend, and HR Leadership with adaptive follow-ups and strict technical zero-scoring for non-substantive responses.
- **Dual AI Provider Architecture**: Seamless switching between **Platform Intelligence (Groq / NVIDIA NIM)** and **BYO-Key Mode (OpenAI, Anthropic, xAI)** with client-side zero-leakage security.
- **Candidate Scorecard & Telemetry**: Quantitative and qualitative hiring assessments, competency gap breakdowns, preparation roadmaps, and instant export to `.md` and `.json`.
- **Live Coding Sandbox & Test Runner**: In-browser code execution for JavaScript, Python, C++, Java, and Go with real-time test case verification.
- **Question Intelligence Library**: Comprehensive repository featuring live-sourced **Codeforces** problems and domain-curated scenarios with explicit provenance tracking (target 80% sourced / 20% curated).
- **Conversational LaTeX Resume Studio**: Interactive AI architect that collects real engineering impact metrics, blocks filler text, and compiles clean, compile-ready `.tex` documents without synthetic placeholders.
- **Appwrite Cloud Native Persistence**: Fast and secure cloud document persistence for user accounts and interview session replays (enforcing a clean 2-session replay retention policy).
- **Unified Responsive Theme System**: Light and Dark modes with centralized design tokens, organic network canvas animations, and responsive floating navigation.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6, Lucide Icons, Canvas API |
| **Backend** | Node.js, Express, REST APIs, JSON Schema Validators |
| **Database & Auth** | Appwrite Cloud (`https://sgp.cloud.appwrite.io/v1`) |
| **Platform AI / STT** | Groq (`llama-3.3-70b-versatile`, Whisper STT), NVIDIA NIM (`meta/llama-3.3-70b-instruct`) |
| **BYO AI Providers** | OpenAI (`gpt-4o-mini`), Anthropic (`claude-3-5-haiku`), xAI (`grok-2`) |
| **Code Execution** | Isolated Node.js Sandbox VM & Syntax Evaluator |
| **Email Delivery** | Nodemailer (Google SMTP / Resend API) |

---

## 🚦 Getting Started

### 1. Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher

### 2. Environment Configuration
Create a `.env` file in the `server/` directory:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Appwrite Cloud Configuration
APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=6a848cdb001bfd2d59a9
APPWRITE_DATABASE_ID=6a858e86001a384c7913
APPWRITE_API_KEY=your_appwrite_api_key

# Platform AI & Neural STT
GROQ_API_KEY=your_groq_api_key
NVIDIA_NIM_API_KEY=your_nvidia_api_key

# Contact & Email Delivery
CONTACT_RECEIVER_EMAIL=tapashidhar2004@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_gmail_address
SMTP_PASS=your_16_char_app_password
```

### 3. Installation & Local Development

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../prepquarters
npm install

# Start Backend Server (Port 5000)
cd ../server
node server.js

# Start Frontend Dev Server (Port 5173)
cd ../prepquarters
npm run dev
```

---

## 🔒 Security & Privacy

- **Zero API Key Leakage**: User-supplied BYO API keys are transmitted exclusively over HTTPS headers for the duration of the request and are never stored in databases or server logs.
- **Identity-Aware Rate Limiting**: The platform AI engine enforces a 40 requests/minute ceiling per authenticated user ID / IP to prevent abuse.
- **Strict Answer Relevance Gating**: Entropy and keyword dump validators enforce that answers missing semantic relevance or containing keyboard mash receive a score of 0.

---

## 📄 License & Repository

- **Repository**: [https://github.com/AuroraBytesX/PrepQuarters](https://github.com/AuroraBytesX/PrepQuarters)
- **Maintainer**: Tapas Dhar (`tapashidhar2004@gmail.com`)
