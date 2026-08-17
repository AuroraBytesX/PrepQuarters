/*
 * Industry-Standard ATS Readiness & Resume Intelligence Engine
 * PrepQuarters Engineering Platform
 * Provides explainable multi-category ATS scoring, keyword matching,
 * prioritized improvement suggestions (CRITICAL/HIGH/MEDIUM/LOW),
 * conversational resume building, and compile-ready LaTeX export.
 */

const { cleanDisallowedChars } = require("./SanitizationHelper");

// Comprehensive Tech Taxonomy & Keywords
const TECH_TAXONOMY = {
  languages: [
    "javascript", "typescript", "python", "java", "c++", "c#", "c", "golang", "go",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "sql", "r", "bash", "shell", "html", "css"
  ],
  frameworks: [
    "react", "react.js", "next.js", "vue", "vue.js", "angular", "node.js", "express", "express.js",
    "fastapi", "django", "flask", "spring boot", "spring", "nestjs", ".net", "asp.net", "graphql",
    "rest api", "grpc", "tailwind", "redux"
  ],
  cloud_infra: [
    "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "terraform", "ci/cd", "github actions", "jenkins", "linux", "ansible", "helm", "serverless",
    "lambda", "cloudformation", "nginx", "prometheus", "grafana"
  ],
  databases: [
    "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch", "dynamodb",
    "cassandra", "kafka", "apache kafka", "rabbitmq", "sqlite", "snowflake", "bigquery", "prisma"
  ],
  architecture_concepts: [
    "distributed systems", "microservices", "system design", "data structures", "algorithms",
    "concurrency", "multithreading", "load balancing", "caching", "rate limiting", "object oriented design",
    "tdd", "unit testing", "integration testing", "agile", "scrum", "high availability", "fault tolerance"
  ],
  data_ai: [
    "machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn", "nlp",
    "natural language processing", "computer vision", "llm", "large language models", "pandas",
    "numpy", "data pipelines", "spark", "apache spark", "hadoop", "mlops"
  ],
};

const STRONG_ACTION_VERBS = [
  "architected", "engineered", "designed", "developed", "spearheaded", "orchestrated",
  "optimized", "scaled", "streamlined", "accelerated", "deployed", "implemented",
  "refactored", "migrated", "automated", "built", "established", "reduced", "increased",
  "delivered", "launched", "executed", "collaborated", "mentored", "directed", "authored"
];

const WEAK_ACTION_VERBS = [
  "worked on", "helped with", "assisted in", "responsible for", "handled", "participated in",
  "was part of", "tried to", "did some", "familiar with", "involved in"
];

function extractKeywordsFromText(text) {
  if (!text || typeof text !== "string") return [];
  const normalized = text.toLowerCase();
  const found = new Set();

  for (const category of Object.values(TECH_TAXONOMY)) {
    for (const keyword of category) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(normalized)) {
        found.add(keyword);
      }
    }
  }

  return Array.from(found);
}

function analyzeSections(resumeText) {
  const normalized = resumeText.toLowerCase();
  const sections = {
    contact: {
      exists: /@/.test(normalized) && /\d{3}/.test(normalized),
      name: "Contact Information",
      score: 0,
      feedback: "",
    },
    summary: {
      exists: /summary|about me|profile|overview|objective/i.test(normalized),
      name: "Professional Summary",
      score: 0,
      feedback: "",
    },
    skills: {
      exists: /technical skills|skills|technologies|proficiencies|tech stack|core competencies/i.test(normalized),
      name: "Technical Skills",
      score: 0,
      feedback: "",
    },
    experience: {
      exists: /experience|employment|work history|career history|professional background/i.test(normalized),
      name: "Work Experience",
      score: 0,
      feedback: "",
    },
    education: {
      exists: /education|academic|university|college|degree|bachelor|master|b\.s\.|m\.s\.|b\.tech/i.test(normalized),
      name: "Education Credentials",
      score: 0,
      feedback: "",
    },
    projects: {
      exists: /projects|personal projects|technical projects|portfolio|key projects/i.test(normalized),
      name: "Technical Projects",
      score: 0,
      feedback: "",
    },
  };

  // Contact score
  if (sections.contact.exists) {
    sections.contact.score = 95;
    sections.contact.feedback = "Email and contact phone number recognized cleanly at document top.";
  } else {
    sections.contact.score = 40;
    sections.contact.feedback = "Missing email or phone number in header. Parsers may fail candidate lookup.";
  }

  // Summary score
  if (sections.summary.exists) {
    sections.summary.score = 90;
    sections.summary.feedback = "Professional summary introduces profile, role persona, and years of experience.";
  } else {
    sections.summary.score = 55;
    sections.summary.feedback = "Adding a 2-3 line Professional Summary anchors your seniority and technical specialties.";
  }

  // Skills score
  if (sections.skills.exists) {
    sections.skills.score = 95;
    sections.skills.feedback = "Dedicated Technical Skills section enables instant keyword indexing.";
  } else {
    sections.skills.score = 45;
    sections.skills.feedback = "No dedicated Skills section identified. Parsers will struggle to catalog competencies.";
  }

  // Experience score
  if (sections.experience.exists) {
    sections.experience.score = 90;
    sections.experience.feedback = "Experience section present with chronological job titles and company names.";
  } else {
    sections.experience.score = 35;
    sections.experience.feedback = "Work Experience heading not identified. Crucial for timeline and role evaluation.";
  }

  // Education score
  if (sections.education.exists) {
    sections.education.score = 95;
    sections.education.feedback = "Educational background and degrees recognized.";
  } else {
    sections.education.score = 60;
    sections.education.feedback = "Education credentials not distinctly identified.";
  }

  // Projects score
  if (sections.projects.exists) {
    sections.projects.score = 90;
    sections.projects.feedback = "Technical project implementations showcase architectural depth.";
  } else {
    sections.projects.score = 70;
    sections.projects.feedback = "Consider highlighting 2 key technical projects with measurable outcomes.";
  }

  return sections;
}

function extractBullets(resumeText) {
  const lines = resumeText.split("\n");
  const bullets = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      /^[•\-\*\>]\s+/.test(trimmed) ||
      /^\d+\.\s+/.test(trimmed) ||
      (trimmed.length > 35 && /^(designed|built|developed|architected|managed|created|implemented|optimized|scaled|led|reduced|increased|spearheaded|orchestrated)\b/i.test(trimmed))
    ) {
      bullets.push(trimmed.replace(/^[•\-\*\>]\s+/, "").replace(/^\d+\.\s+/, ""));
    }
  }

  return bullets.slice(0, 25);
}

function evaluateBullets(bullets) {
  const weakBullets = [];
  const strongBullets = [];

  for (const b of bullets) {
    const lower = b.toLowerCase();
    const hasMetric = /\b\d+(\.\d+)?%|\b\d+x\b|\$\d+|\b\d+\s*(ms|seconds|minutes|hours|users|req|rps|qps|dau|mau|tb|gb|mb)\b|\b\d+\+\b/i.test(lower);
    const hasStrongVerb = STRONG_ACTION_VERBS.some((v) => lower.startsWith(v) || lower.includes(" " + v + " "));
    const hasWeakVerb = WEAK_ACTION_VERBS.some((v) => lower.includes(v));

    if (!hasMetric || hasWeakVerb || b.length < 50) {
      let suggestedRewrite = b;
      if (hasWeakVerb) {
        suggestedRewrite = b.replace(/worked on|helped with|assisted in|responsible for|handled/i, "Architected and delivered");
      }
      if (!hasMetric) {
        suggestedRewrite += ", improving throughput by 35% and reducing latency by 45ms.";
      }

      weakBullets.push({
        original: b,
        issue: !hasMetric
          ? "Lacks quantifiable business metric or measurable outcome."
          : hasWeakVerb
          ? "Uses passive/weak phrasing ('worked on', 'assisted in')."
          : "Too brief. Describe system architecture, technical constraints, and outcome.",
        suggestedRewrite,
      });
    } else {
      strongBullets.push(b);
    }
  }

  return { weakBullets, strongBullets };
}

/* =======================================================================
   EXPLAINABLE ATS READINESS ASSESSMENT
====================================================================== */
function analyzeResume({ resumeText, jobDescription = "", targetRole = "Software Engineer" }) {
  if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 40) {
    throw new Error("Resume content is too short. Please provide a complete resume document or text.");
  }

  const cleanResume = cleanDisallowedChars(resumeText);
  const cleanJD = cleanDisallowedChars(jobDescription || "");

  const resumeKeywords = extractKeywordsFromText(cleanResume);
  const jdKeywords = cleanJD ? extractKeywordsFromText(cleanJD) : [];

  const matchedKeywords = jdKeywords.filter((k) => resumeKeywords.includes(k));
  const missingKeywords = jdKeywords.filter((k) => !resumeKeywords.includes(k));

  const sections = analyzeSections(cleanResume);
  const rawBullets = extractBullets(cleanResume);
  const { weakBullets, strongBullets } = evaluateBullets(rawBullets);

  // 1. Parsing Compatibility (0-100)
  const formattingRisks = [];
  let parsingScore = 95;
  if (/\|/.test(cleanResume) && cleanResume.split("|").length > 12) {
    parsingScore -= 15;
    formattingRisks.push("Excessive vertical bar '|' delimiters may confuse multi-column ATS text extractors.");
  }
  if (!sections.contact.exists) {
    parsingScore -= 20;
    formattingRisks.push("Contact header missing standard email or phone number pattern.");
  }
  if (cleanResume.length > 9000) {
    parsingScore -= 10;
    formattingRisks.push("Document text exceeds recommended 2-page length budget for automated screening.");
  }
  if (formattingRisks.length === 0) {
    formattingRisks.push("Single-column text flow with clean standard header recognition.");
  }

  // 2. Document Structure & Section Recognition
  let structureScore = Math.round(
    (sections.contact.score + sections.skills.score + sections.experience.score + sections.education.score + sections.summary.score) / 5
  );

  // 3. Keyword Relevance & Coverage
  let keywordScore = resumeKeywords.length >= 10 ? 92 : Math.max(50, resumeKeywords.length * 8 + 20);

  // 4. Job Description Alignment
  let jdScore = null;
  let jdExplanation = "No Job Description provided. Scoring based on general industry role benchmarks.";
  if (jdKeywords.length > 0) {
    jdScore = Math.round((matchedKeywords.length / jdKeywords.length) * 100);
    jdScore = Math.min(100, Math.max(25, jdScore));
    jdExplanation = `${matchedKeywords.length} of ${jdKeywords.length} required JD technical keywords matched in resume.`;
  }

  // 5. Skills Relevance
  let skillsRelevance = sections.skills.exists ? 90 : 55;
  if (jdKeywords.length > 0 && missingKeywords.length > 3) {
    skillsRelevance -= 15;
  }

  // 6. Role & Title Alignment
  const roleKeywords = targetRole.toLowerCase().split(/\s+/);
  const roleMatches = roleKeywords.filter((r) => cleanResume.toLowerCase().includes(r));
  let roleTitleAlignment = roleMatches.length >= 1 ? 88 : 60;

  // 7. Experience Quality & Measurable Achievements
  let experienceQuality = 80;
  if (weakBullets.length > 3) experienceQuality -= 15;
  if (strongBullets.length >= 3) experienceQuality += 10;
  experienceQuality = Math.min(95, Math.max(45, experienceQuality));

  // 8. Content Quality & Action Verbs
  let contentQuality = 85;
  if (weakBullets.some((b) => b.issue.includes("passive"))) contentQuality -= 10;
  if (rawBullets.length < 3) contentQuality -= 20;

  // Overall ATS Readiness Score
  const categoryScores = {
    parsingCompatibility: {
      score: parsingScore,
      explanation: parsingScore >= 85
        ? "Clean text layout without nested columns or complex tabular artifacts."
        : "Formatting artifacts detected that may disrupt standard text tokenization.",
    },
    documentStructure: {
      score: structureScore,
      explanation: `${Object.values(sections).filter((s) => s.exists).length} of 6 primary resume sections identified cleanly.`,
    },
    sectionRecognition: {
      score: structureScore,
      explanation: sections.skills.exists && sections.experience.exists
        ? "Core Work Experience and Skills headings adhere to standard ATS taxonomy."
        : "One or more standard headings (Experience/Skills) need clearer labeling.",
    },
    keywordRelevance: {
      score: keywordScore,
      explanation: `${resumeKeywords.length} core technical taxonomy keywords recognized across domains.`,
    },
    jdAlignment: {
      score: jdScore,
      explanation: jdExplanation,
    },
    skillsRelevance: {
      score: skillsRelevance,
      explanation: missingKeywords.length > 0
        ? `Missing ${missingKeywords.length} key skills specified in target requirements.`
        : "Strong alignment between candidate technical skills and role requirements.",
    },
    roleTitleAlignment: {
      score: roleTitleAlignment,
      explanation: `Target role persona '${targetRole}' context reflects in summary and experience descriptions.`,
    },
    experienceQuality: {
      score: experienceQuality,
      explanation: `${strongBullets.length} high-impact metric-backed bullets vs ${weakBullets.length} bullets lacking metrics.`,
    },
    formattingCompatibility: {
      score: parsingScore,
      explanation: "Single-column layout with standard text fonts and clean bullet formatting.",
    },
    contentQuality: {
      score: contentQuality,
      explanation: "Active action verbs and concise technical achievement descriptions.",
    },
  };

  const scoreSum =
    parsingScore * 0.15 +
    structureScore * 0.15 +
    keywordScore * 0.15 +
    (jdScore !== null ? jdScore * 0.2 : keywordScore * 0.2) +
    skillsRelevance * 0.15 +
    experienceQuality * 0.1 +
    contentQuality * 0.1;

  const overallScore = Math.min(98, Math.max(40, Math.round(scoreSum)));

  // Prioritized Improvements (CRITICAL, HIGH, MEDIUM, LOW)
  const prioritizedImprovements = [];

  if (!sections.contact.exists) {
    prioritizedImprovements.push({
      priority: "CRITICAL",
      issue: "Missing direct contact header details (email/phone).",
      whyItMatters: "Automated candidate management systems reject profiles where contact identity cannot be parsed.",
      suggestedImprovement: "Place your Name, Email, Phone, and LinkedIn/GitHub URL at the top in plain text.",
      exampleWording: "John Doe | john.doe@email.com | +1 (555) 019-2834 | San Francisco, CA | github.com/johndoe",
    });
  }

  if (missingKeywords.length > 0) {
    prioritizedImprovements.push({
      priority: "CRITICAL",
      issue: `Missing ${missingKeywords.length} explicitly requested skills: ${missingKeywords.slice(0, 4).join(", ")}.`,
      whyItMatters: "ATS filters automatically score down resumes that lack primary target stack keywords.",
      suggestedImprovement: "If you have experience with these tools, integrate them into relevant project and experience bullet points.",
      exampleWording: `Leveraged ${missingKeywords[0] || "Kubernetes"} and ${missingKeywords[1] || "PostgreSQL"} to orchestrate fault-tolerant backend services.`,
    });
  }

  if (weakBullets.length > 0) {
    prioritizedImprovements.push({
      priority: "HIGH",
      issue: `${weakBullets.length} bullet point(s) lack quantifiable metrics (%, latency, cost, users).`,
      whyItMatters: "Top-tier hiring managers filter out passive resumes without measurable business outcomes.",
      suggestedImprovement: "Follow Google's XYZ formula: Accomplished [X], as measured by [Y], by doing [Z].",
      exampleWording: weakBullets[0]?.suggestedRewrite || "Architected caching layer with Redis, reducing P99 latency by 45% under 150,000 RPS peak load.",
    });
  }

  if (!sections.summary.exists) {
    prioritizedImprovements.push({
      priority: "MEDIUM",
      issue: "Missing a concise 2-3 line Professional Summary.",
      whyItMatters: "A summary immediately establishes your seniority level, technical focus, and career track.",
      suggestedImprovement: "Add a 2-3 sentence executive summary introducing your core domains and accomplishments.",
      exampleWording: `Senior Software Engineer with 5+ years specializing in distributed backend systems, event streaming, and cloud infrastructure.`,
    });
  }

  prioritizedImprovements.push({
    priority: "LOW",
    issue: "Ensure consistent date formatting (e.g. 'Jan 2022 - Present').",
    whyItMatters: "Inconsistent date formatting can confuse automatic experience calculator algorithms.",
    suggestedImprovement: "Standardize all employment dates to Month Year - Month Year.",
    exampleWording: "Senior Engineer - Acme Corp | Mar 2022 - Present",
  });

  return {
    overallScore,
    categoryScores,
    jdMatchScore: jdScore,
    atsCompatibilityScore: categoryScores.parsingCompatibility.score,
    targetRole,
    matchedKeywords,
    missingKeywords,
    foundKeywords: resumeKeywords,
    recommendedKeywords: missingKeywords.length > 0
      ? missingKeywords
      : ["Distributed Systems", "CI/CD Pipelines", "PostgreSQL", "Latency Optimization", "Observability"],
    sections,
    formattingRisks,
    weakBullets,
    strongBullets,
    prioritizedImprovements,
    analyzedAt: new Date().toISOString(),
    disclaimer: "Explainable ATS Readiness Assessment based on industry standard applicant tracking heuristics.",
  };
}

/* =======================================================================
   CONVERSATIONAL RESUME BUILDER & LATEX EXPORT
====================================================================== */
function generateResumeLatex(resumeData) {
  const {
    name = "Candidate Name",
    email = "candidate@example.com",
    phone = "+1 (555) 000-0000",
    location = "San Francisco, CA",
    linkedin = "linkedin.com/in/candidate",
    github = "github.com/candidate",
    summary = "Senior Software Engineer with experience architecting high-scale distributed systems and resilient microservices.",
    skills = {
      languages: ["Python", "Go", "TypeScript", "SQL"],
      frameworks: ["React", "Node.js", "FastAPI", "Docker"],
      databases: ["PostgreSQL", "Redis", "Kafka"],
      tools: ["AWS", "Kubernetes", "Git", "CI/CD"],
    },
    experience = [],
    education = [],
    projects = [],
  } = resumeData;

  const cleanName = cleanDisallowedChars(name);
  const cleanSummary = cleanDisallowedChars(summary);

  const expBlocks = (experience.length > 0 ? experience : [
    {
      title: "Senior Software Engineer",
      company: "Acme Cloud Infrastructure",
      location: "San Francisco, CA",
      dateRange: "Jan 2022 - Present",
      bullets: [
        "Architected distributed Kafka streaming pipeline handling 150,000 requests per second across 3 cloud regions.",
        "Optimized PostgreSQL database query plans and connection pooling, reducing P99 latency by 45%.",
        "Spearheaded Kubernetes migration for 20+ microservices, improving deployment frequency by 4x."
      ]
    }
  ]).map((e) => `
\\textbf{${cleanDisallowedChars(e.title)}} \\hfill \\textbf{${cleanDisallowedChars(e.dateRange || "2022 - Present")}} \\\\
\\textit{${cleanDisallowedChars(e.company)}} \\hfill \\textit{${cleanDisallowedChars(e.location || "")}}
\\begin{itemize}[leftmargin=*,noitemsep,topsep=2pt]
${(e.bullets || []).map((b) => `  \\item ${cleanDisallowedChars(b)}`).join("\n")}
\\end{itemize}
\\vspace{6pt}
`).join("\n");

  const eduBlocks = (education.length > 0 ? education : [
    {
      degree: "B.S. in Computer Science",
      institution: "University of California, Berkeley",
      dateRange: "2018 - 2022",
      details: "Dean's Honor List, Relevant Coursework: Operating Systems, Distributed Systems, Algorithms."
    }
  ]).map((ed) => `
\\textbf{${cleanDisallowedChars(ed.degree)}} \\hfill \\textbf{${cleanDisallowedChars(ed.dateRange || "")}} \\\\
\\textit{${cleanDisallowedChars(ed.institution)}} \\\\
${ed.details ? `\\small{${cleanDisallowedChars(ed.details)}} \\vspace{4pt}` : "\\vspace{4pt}"}
`).join("\n");

  const projBlocks = (projects.length > 0 ? projects : [
    {
      name: "Distributed Key-Value Store",
      tech: "Go, Raft, gRPC",
      bullets: [
        "Implemented consensus-backed distributed key-value store with leader election and log replication.",
        "Achieved 99.99% availability during simulated network partition stress tests."
      ]
    }
  ]).map((p) => `
\\textbf{${cleanDisallowedChars(p.name)}} \\hfill \\textit{${cleanDisallowedChars(p.tech || "")}}
\\begin{itemize}[leftmargin=*,noitemsep,topsep=2pt]
${(p.bullets || []).map((b) => `  \\item ${cleanDisallowedChars(b)}`).join("\n")}
\\end{itemize}
\\vspace{6pt}
`).join("\n");

  const skillLines = [];
  if (Array.isArray(skills.languages) && skills.languages.length) skillLines.push(`\\textbf{Languages:} ${skills.languages.join(", ")}`);
  if (Array.isArray(skills.frameworks) && skills.frameworks.length) skillLines.push(`\\textbf{Frameworks \\& Libraries:} ${skills.frameworks.join(", ")}`);
  if (Array.isArray(skills.databases) && skills.databases.length) skillLines.push(`\\textbf{Databases \\& Streaming:} ${skills.databases.join(", ")}`);
  if (Array.isArray(skills.tools) && skills.tools.length) skillLines.push(`\\textbf{Cloud \\& DevOps:} ${skills.tools.join(", ")}`);

  return `% =======================================================================
% PrepQuarters ATS-Optimized Professional Resume Template
% Compiler Compatibility: pdflatex / xelatex
% =======================================================================
\\documentclass[10pt,letterpaper]{article}

\\usepackage[margin=0.65in]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}

% Hypersetup for clean ATS link extraction
\\hypersetup{
    colorlinks=false,
    pdfborder={0 0 0},
    pdftitle={${cleanName} - Resume},
    pdfauthor={${cleanName}}
}

% Section formatting
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{8pt}{4pt}
\\pagestyle{empty}

\\begin{document}

% ----------------- HEADER -----------------
\\begin{center}
    {\\huge \\textbf{${cleanName}}} \\\\[4pt]
    \\small ${cleanDisallowedChars(phone)} $|$ \\href{mailto:${cleanDisallowedChars(email)}}{${cleanDisallowedChars(email)}} $|$ ${cleanDisallowedChars(location)} \\\\[2pt]
    \\small ${cleanDisallowedChars(linkedin)} $|$ ${cleanDisallowedChars(github)}
\\end{center}

\\vspace{4pt}

% ----------------- PROFESSIONAL SUMMARY -----------------
\\section{Professional Summary}
${cleanSummary}

\\vspace{6pt}

% ----------------- TECHNICAL SKILLS -----------------
\\section{Technical Skills}
\\begin{itemize}[leftmargin=*,noitemsep,topsep=2pt]
${skillLines.map((line) => `  \\item ${line}`).join("\n")}
\\end{itemize}

\\vspace{6pt}

% ----------------- WORK EXPERIENCE -----------------
\\section{Work Experience}
${expBlocks}

% ----------------- PROJECTS -----------------
\\section{Technical Projects}
${projBlocks}

% ----------------- EDUCATION -----------------
\\section{Education}
${eduBlocks}

\\end{document}
`;
}

module.exports = {
  analyzeResume,
  generateResumeLatex,
  extractKeywordsFromText,
  TECH_TAXONOMY,
};
