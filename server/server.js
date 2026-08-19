const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { securityHeaders } = require("./middleware/securityMiddleware");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const interviewRoutes = require("./routes/interview");
const systemRoutes = require("./routes/system");
const resumeRoutes = require("./routes/resume");
const { initializeAppwrite } = require("./services/AppwriteService");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

/* =========================================
   SECURITY & PARSING MIDDLEWARE
========================================= */

app.use(securityHeaders);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins (Vercel deployments, localhost, mobile, server-to-server)
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-byok-key",
      "x-byok-provider",
      "x-byok-model",
      "x-ai-provider",
      "x-ai-model",
      "x-ai-api-key",
      "x-requested-with",
    ],
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

/* =========================================
   HEALTH & PING (ULTRA-LIGHTWEIGHT KEEP-ALIVE)
========================================= */

app.get("/ping", (req, res) => res.status(200).send("OK"));
app.get("/api/ping", (req, res) => res.status(200).send("OK"));
app.get("/", (req, res) => res.status(200).send("OK"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

/* =========================================
   API ROUTES
========================================= */

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/resume", resumeRoutes);

/* =========================================
   CENTRALIZED ERROR HANDLER
========================================= */

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

/* =========================================
   APPWRITE CLOUD PERSISTENCE + STARTUP
========================================= */
initializeAppwrite();

const server = app.listen(PORT, () => {
  console.log(`PrepQuarters backend server running on http://localhost:${PORT}`);
  console.log(`[PERSISTENCE] Appwrite Cloud Active (Project: ${process.env.APPWRITE_PROJECT_ID || "6a848cdb001bfd2d59a9"}, DB: ${process.env.APPWRITE_DATABASE_ID || "6a858e86001a384c7913"})`);
  console.log(`[ENV CHECK] GROQ_API_KEY: ${process.env.GROQ_API_KEY ? "LOADED" : "MISSING"}`);
});

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    process.exit(0);
  });
});

module.exports = app;