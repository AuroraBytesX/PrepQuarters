import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Compass,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shield,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import "./QuestionLibrary.css";

const DOMAINS = [
  "All Domains",
  "Software Engineering",
  "Data Science & ML",
  "Product Management",
  "UI/UX Design",
  "DevOps & Cloud",
  "HR & Leadership",
];

const COMPANIES = [
  "All Companies",
  "Google",
  "Amazon",
  "Meta",
  "Microsoft",
  "Apple",
  "Netflix",
  "Uber",
  "Stripe",
  "Airbnb",
  "Figma",
  "Salesforce",
  "HubSpot",
];

const QUESTION_TYPES = [
  "All Types",
  "Technical",
  "Coding",
  "Aptitude",
  "System Design",
  "Behavioral",
  "Situational",
  "Conceptual",
];

const PAGE_SIZE = 8;

function QuestionLibrary() {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState("Software Engineering");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All Companies");
  const [selectedQuestionType, setSelectedQuestionType] = useState("All Types");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [bookmarkedKeys, setBookmarkedKeys] = useState(new Set());
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Load bookmarks on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("prepquartersBookmarks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setBookmarkedKeys(new Set(parsed));
        }
      }
    } catch (e) {}
  }, []);

  // Reset page and refetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchQuestions();
  }, [selectedDomain, selectedDifficulty, selectedCompany, selectedQuestionType, searchQuery]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDomain && selectedDomain !== "All Domains") {
        params.append("domain", selectedDomain);
      } else {
        params.append("domain", "All");
      }

      if (selectedDifficulty && selectedDifficulty !== "All") {
        params.append("difficulty", selectedDifficulty);
      }

      if (selectedCompany && selectedCompany !== "All Companies") {
        params.append("company", selectedCompany);
      }

      if (selectedQuestionType && selectedQuestionType !== "All Types") {
        params.append("questionType", selectedQuestionType);
      }

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const res = await fetch(`${API_BASE_URL}/api/interview/library/questions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.questions)) {
          setQuestions(data.questions);
        }
      }
    } catch (err) {
      console.warn("Could not fetch questions:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (q) => {
    const key = (q.questionText || q.title || "").trim();
    if (!key) return;

    setBookmarkedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      try {
        localStorage.setItem("prepquartersBookmarks", JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  };

  const launchPracticeWithQuestion = async (q) => {
    try {
      const token = localStorage.getItem("prepquartersToken");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let mappedModality = "coding";
      if (q.questionType === "Behavioral" || q.questionType === "Situational") {
        mappedModality = "hr_behavioral";
      } else if (q.questionType === "System Design") {
        mappedModality = "system_design";
      } else if (q.questionType === "Aptitude") {
        mappedModality = "aptitude_reasoning";
      } else if (q.questionType === "Technical" || q.questionType === "Conceptual") {
        mappedModality = "technical_core";
      }

      const res = await fetch(`${API_BASE_URL}/api/interview/start`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          role: q.domain || "Software Engineer",
          difficulty: q.difficulty || "Medium",
          interviewType: mappedModality,
          focusAreas: q.topic ? [q.topic] : ["Algorithms & Data Structures"],
          language: q.language || "Python",
          customInitialQuestion: q.questionText || q.problemStatement || q.title,
          questionSource: q.source || (q.generatedByAI ? "PrepQuarters AI Generated" : "Codeforces"),
          generatedByAI: Boolean(q.generatedByAI),
        }),
      });

      const data = await res.json();
      if (res.ok && data.sessionId) {
        navigate(`/practice/ai-interview/${data.sessionId}`);
      } else {
        navigate("/practice/ai-interview/setup");
      }
    } catch (err) {
      navigate("/practice/ai-interview/setup");
    }
  };

  const handleResetFilters = () => {
    setSelectedDomain("All Domains");
    setSelectedDifficulty("All");
    setSelectedCompany("All Companies");
    setSelectedQuestionType("All Types");
    setSearchQuery("");
    setOnlyBookmarked(false);
    setCurrentPage(1);
  };

  const displayedQuestions = onlyBookmarked
    ? questions.filter((q) => bookmarkedKeys.has((q.questionText || q.title || "").trim()))
    : questions;

  const totalPages = Math.ceil(displayedQuestions.length / PAGE_SIZE) || 1;
  const paginatedQuestions = displayedQuestions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <main className="ql-page-container">
      <div className="ql-content-wrapper">
        {/* Header Hero */}
        <section className="ql-hero-section">
          <div className="ql-hero-pill">
            <Sparkles size={14} aria-hidden="true" />
            <span>Sourced & Curated Problem Repository</span>
          </div>

          <h1 className="ql-hero-title">
            Industry Question Repository
          </h1>
          <p className="ql-hero-subtitle">
            Explore authentic competitive programming problems, system architectures, and behavioral scenarios calibrated across real engineering interviews.
          </p>

          <div
            style={{
              marginTop: "16px",
              padding: "10px 18px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              fontSize: "0.82rem",
              color: "#94a3b8",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              maxWidth: "740px",
              lineHeight: 1.5,
            }}
          >
            <Shield size={16} color="#10b981" style={{ flexShrink: 0 }} />
            <span>
              <strong style={{ color: "#34d399" }}>Source Provenance:</strong> Question sources include official Codeforces problem sets, curated PrepQuarters benchmarks, and domain-calibrated AI scenarios targeting an ~80% sourced / ~20% AI generated balance.
            </span>
          </div>
        </section>

        {/* Filter Navigation Bar */}
        <section className="ql-control-deck">
          {/* Top Search Row */}
          <div className="ql-search-row">
            <div className="ql-search-input-wrap">
              <Search className="ql-search-icon" size={17} />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keywords, algorithms, system scale, company style, or competencies..."
                className="ql-search-input"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setOnlyBookmarked(!onlyBookmarked);
                setCurrentPage(1);
              }}
              className={`ql-bookmark-filter-btn ${onlyBookmarked ? "active" : ""}`}
            >
              {onlyBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              <span>Bookmarked ({bookmarkedKeys.size})</span>
            </button>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="ql-filters-grid">
            {/* Domain Dropdown */}
            <div className="ql-filter-group">
              <label>Domain Area</label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="ql-select"
              >
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Dropdown */}
            <div className="ql-filter-group">
              <label>Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="ql-select"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy (Fundamentals & Core)</option>
                <option value="Medium">Medium (Architecture & Practical)</option>
                <option value="Hard">Hard (High Scale & Complex)</option>
              </select>
            </div>

            {/* Company Dropdown */}
            <div className="ql-filter-group">
              <label>Company Benchmark</label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="ql-select"
              >
                {COMPANIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Type Dropdown */}
            <div className="ql-filter-group">
              <label>Question Type</label>
              <select
                value={selectedQuestionType}
                onChange={(e) => setSelectedQuestionType(e.target.value)}
                className="ql-select"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Results Counter & Reset Action */}
        <div className="ql-status-bar">
          <div className="ql-results-count">
            <span>Showing </span>
            <strong>
              {displayedQuestions.length === 0
                ? 0
                : `${(currentPage - 1) * PAGE_SIZE + 1} - ${Math.min(currentPage * PAGE_SIZE, displayedQuestions.length)}`}
            </strong>
            <span> of </span>
            <strong>{displayedQuestions.length}</strong>
            <span> curated scenarios</span>
          </div>

          {(selectedDomain !== "All Domains" || selectedDifficulty !== "All" || selectedCompany !== "All Companies" || selectedQuestionType !== "All Types" || searchQuery || onlyBookmarked) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="ql-reset-btn"
            >
              <RotateCcw size={13} />
              <span>Reset all filters</span>
            </button>
          )}
        </div>

        {/* Questions Grid */}
        {loading ? (
          <div className="ql-empty-state">
            <p className="ql-empty-title">Loading Question Repository...</p>
          </div>
        ) : displayedQuestions.length === 0 ? (
          <div className="ql-empty-state">
            <Compass className="ql-empty-icon" size={36} />
            <h3 className="ql-empty-title">No matching scenarios found</h3>
            <p className="ql-empty-desc">
              Try adjusting your search terms or resetting the active filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="ql-reset-btn"
              style={{ marginTop: "1rem" }}
            >
              <RotateCcw size={13} />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <>
            <div className="ql-cards-grid">
              {paginatedQuestions.map((q, idx) => {
                const questionKey = (q.questionText || q.title || "").trim();
                const isBookmarked = bookmarkedKeys.has(questionKey);
                const diffClass = q.difficulty ? q.difficulty.toLowerCase() : "medium";
                const displayTitle = q.questionText || q.problemStatement || q.title;

                return (
                  <article key={q.id || idx} className="ql-question-card">
                    <div>
                      {/* Top Badges */}
                      <div className="ql-card-top-row">
                        <div className="ql-badges-wrap">
                          <span className={`ql-badge-difficulty ${diffClass}`}>
                            {q.difficulty || "Medium"}
                          </span>

                          <span className="ql-badge-type">
                            {q.questionType || "Coding"}
                          </span>

                          {q.rating && (
                            <span
                              className="ql-badge-type"
                              style={{
                                background: "rgba(234, 179, 8, 0.12)",
                                border: "1px solid rgba(234, 179, 8, 0.3)",
                                color: "#facc15",
                                fontSize: "0.74rem",
                                fontWeight: 600,
                              }}
                            >
                              Rating: {q.rating}
                            </span>
                          )}

                          <span
                            className="ql-badge-company"
                            style={{
                              background: q.generatedByAI ? "rgba(168, 85, 247, 0.12)" : "rgba(16, 185, 129, 0.12)",
                              border: q.generatedByAI ? "1px solid rgba(168, 85, 247, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
                              color: q.generatedByAI ? "#c084fc" : "#34d399",
                              fontSize: "0.74rem",
                              fontWeight: 600,
                            }}
                          >
                            {q.generatedByAI ? "AI Scenario" : `Source: ${q.source || "Codeforces"}`}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleBookmark(q)}
                          className={`ql-bookmark-action-btn ${isBookmarked ? "bookmarked" : ""}`}
                          title={isBookmarked ? "Remove Bookmark" : "Save Question"}
                        >
                          {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </button>
                      </div>

                      {/* Topic & Subtopic */}
                      <div className="ql-topic-path">
                        <span>{q.topic || "Algorithms"}</span>
                        {q.subtopic && (
                          <>
                            <span className="ql-topic-separator">/</span>
                            <span className="ql-subtopic">{q.subtopic}</span>
                          </>
                        )}
                      </div>

                      {/* Question Tags */}
                      {Array.isArray(q.tags) && q.tags.length > 0 && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "8px 0" }}>
                          {q.tags.slice(0, 3).map((tag, tIdx) => (
                            <span key={tIdx} style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Question Text */}
                      <h3 className="ql-question-title">
                        {displayTitle}
                      </h3>

                      {/* Expected Rubric Key Points */}
                      {Array.isArray(q.expectedKeyPoints) && q.expectedKeyPoints.length > 0 && (
                        <div className="ql-rubric-box">
                          <span className="ql-rubric-header">
                            Key Evaluation Criteria
                          </span>
                          <ul className="ql-rubric-list">
                            {q.expectedKeyPoints.slice(0, 3).map((pt, pIdx) => (
                              <li key={pIdx} className="ql-rubric-item">
                                <CheckCircle2 size={13} className="ql-rubric-icon" />
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Launch Practice Button & External Link */}
                    <div className="ql-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={() => launchPracticeWithQuestion(q)}
                        className="ql-practice-launch-btn"
                        style={{ flex: 1 }}
                      >
                        <span>Practice in AI Cockpit</span>
                        <ArrowRight size={14} />
                      </button>

                      {q.url && (
                        <a
                          href={q.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "0.78rem",
                            color: "#94a3b8",
                            textDecoration: "none",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Source Link
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="ql-pagination-deck">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="ql-page-nav-btn"
                >
                  <ChevronLeft size={15} />
                  <span>Previous</span>
                </button>

                <div className="ql-page-indicator">
                  <span>Page </span>
                  <strong>{currentPage}</strong>
                  <span> of </span>
                  <strong>{totalPages}</strong>
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="ql-page-nav-btn"
                >
                  <span>Next</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default QuestionLibrary;
