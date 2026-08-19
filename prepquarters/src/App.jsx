import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import MagicLight from "./components/MagicLight";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Features from "./pages/Features";
import LearnMore from "./pages/LearnMore";
import Login from "./Login";
import Dashboard from "./pages/Dashboard";
import InterviewPractice from "./pages/InterviewPractice";
import InterviewSetup from "./pages/InterviewSetup";
import AIInterviewSession from "./pages/AIInterviewSession";
import InterviewReplay from "./pages/InterviewReplay";
import QuestionLibrary from "./pages/QuestionLibrary";
import SkillGapPage from "./pages/SkillGapPage";
import SystemDocs from "./pages/SystemDocs";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import PrivacyPolicy from "./pages/PrivacyPolicy";

function App() {
  return (
    <>
      <MagicLight />
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/docs" element={<SystemDocs />} />
        <Route path="/system-docs" element={<SystemDocs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="/login" element={<Login initialMode={true} />} />
        <Route path="/signup" element={<Login initialMode={false} />} />
        <Route path="/practice/question-library" element={<QuestionLibrary />} />

        {/* Authenticated Candidate Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/ai-interview"
          element={
            <ProtectedRoute>
              <InterviewPractice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/ai-interview/setup"
          element={
            <ProtectedRoute>
              <InterviewSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/ai-interview/session"
          element={
            <ProtectedRoute>
              <AIInterviewSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/replay/:sessionId"
          element={
            <ProtectedRoute>
              <InterviewReplay />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/progress"
          element={
            <ProtectedRoute>
              <SkillGapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/skill-gap"
          element={
            <ProtectedRoute>
              <SkillGapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/feedback"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/personalized"
          element={
            <ProtectedRoute>
              <InterviewSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/difficulty"
          element={
            <ProtectedRoute>
              <InterviewSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/role-based"
          element={
            <ProtectedRoute>
              <InterviewSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/timed"
          element={
            <ProtectedRoute>
              <InterviewSetup />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;