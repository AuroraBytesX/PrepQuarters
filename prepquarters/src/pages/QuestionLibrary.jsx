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
} from "lucide-react";
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

      const res = await fetch(`https://prepquarters-backend.onrender.com/api/interview/library/questions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.questions)) {
          setQuestions(data.questions);
        }
      }
    } catch (err) {
      console.error("Error loading library questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (item) => {
    const key = (typeof item === "string" ? item : item?.questionText || "").trim();
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
    const token = localStorage.getItem("prepquartersToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const interviewType =
      q.questionType === "Coding"
        ? "Coding Interview"
        : q.questionType === "Aptitude"
        ? "Aptitude & Reasoning"
        : "Technical Interview";

    try {
      const res = await fetch("https://prepquarters-backend.onrender.com/api/interview/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: "Software Engineer",
          domain: q.domain || "Software Engineering",
          difficulty: q.difficulty || "Hard",
          companyStyle: q.companyStyle || "General Tech",
          interviewType,
          programmingLanguage: q.programmingLanguage || "javascript",
          totalQuestionsPlanned: 3,
          initialQuestion: {
            topic: q.topic,
            subtopic: q.subtopic,
            difficulty: q.difficulty,
            questionText: q.questionText,
            expectedKeyPoints: q.expectedKeyPoints,
            questionType: q.questionType || "Technical",
            starterCode: q.starterCode || "",
            programmingLanguage: q.programmingLanguage || "javascript",
            testCases: q.testCases || [],
            aptitudeOptions: q.aptitudeOptions || [],
            correctOptionIndex: q.correctOptionIndex,
            explanation: q.explanation || "",
            companyStyle: q.companyStyle,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.session) {
          navigate("/practice/ai-interview/session", {
            state: { sessionId: data.session._id },
          });
        }
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
    ? questions.filter((q) => bookmarkedKeys.has(q.questionText.trim()))
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
            <span>Curated Enterprise Scenarios // Question Repository</span>
          </div>

          <h1 className="ql-hero-title">
            Industry Question Repository
          </h1>
          <p className="ql-hero-subtitle">
            Explore authentic technical, system design, behavioral, and situational scenarios calibrated for Google, Meta, Amazon, Apple, Netflix, and Stripe.
          </p>
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
                const isBookmarked = bookmarkedKeys.has(q.questionText.trim());
                const diffClass = q.difficulty ? q.difficulty.toLowerCase() : "hard";

                return (
                  <article key={idx} className="ql-question-card">
                    <div>
                      {/* Top Badges */}
                      <div className="ql-card-top-row">
                        <div className="ql-badges-wrap">
                          <span className={`ql-badge-difficulty ${diffClass}`}>
                            {q.difficulty}
                          </span>

                          <span className="ql-badge-type">
                            {q.questionType || "Technical"}
                          </span>

                          <span className="ql-badge-company">
                            {q.companyStyle}
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
                        <span>{q.topic}</span>
                        {q.subtopic && (
                          <>
                            <span className="ql-topic-separator">/</span>
                            <span className="ql-subtopic">{q.subtopic}</span>
                          </>
                        )}
                      </div>

                      {/* Question Text */}
                      <h3 className="ql-question-title">
                        {q.questionText}
                      </h3>

                      {/* Expected Rubric Key Points */}
                      {Array.isArray(q.expectedKeyPoints) && q.expectedKeyPoints.length > 0 && (
                        <div className="ql-rubric-box">
                          <span className="ql-rubric-header">
                            Expected Key Evaluation Points
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

                    {/* Launch Practice Button */}
                    <div className="ql-card-footer">
                      <button
                        type="button"
                        onClick={() => launchPracticeWithQuestion(q)}
                        className="ql-practice-launch-btn"
                      >
                        <span>Practice in AI Cockpit</span>
                        <ArrowRight size={14} />
                      </button>
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
