import "./App.css";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Features from "./pages/Features";
import LearnMore from "./pages/LearnMore";
import Login from "./Login";
import Dashboard from "./pages/Dashboard";
import InterviewPractice from "./pages/InterviewPractice";
import AIInterviewSession from "./pages/AIInterviewSession";
import InterviewSetup from "./pages/InterviewSetup";


function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/practice/ai-interview" element={<InterviewPractice />} />
        <Route
  path="/practice/ai-interview/session"
  element={<AIInterviewSession />}
/>
        <Route
  path="/practice/ai-interview/setup"
  element={<InterviewSetup />}
/>
      </Routes>
    </>
  );
}

export default App;