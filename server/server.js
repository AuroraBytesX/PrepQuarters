const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const { securityHeaders } = require("./middleware/securityMiddleware");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const interviewRoutes = require("./routes/interview");
const systemRoutes = require("./routes/system");
const resumeRoutes = require("./routes/resume");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

/* =========================================
   SECURITY & PARSING MIDDLEWARE
========================================= */

app.use(securityHeaders);

app.use(
  cors({
    origin: [CLIENT_URL, "http://localhost:5173",  "https://prep-quarters.vercel.app", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

/* =========================================
   HEALTH CHECK (SAFE STATUS ONLY)
========================================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    message: "PrepQuarters backend is active and ready.",
    timestamp: new Date().toISOString(),
    nimConfigured: Boolean(process.env.NVIDIA_NIM_API_KEY && process.env.NVIDIA_NIM_API_KEY.trim()),
    groqSttConfigured: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()),
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
   DATABASE + SERVER STARTUP
========================================= */

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("ERROR: MONGO_URI is not defined in environment variables.");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB connection established successfully.");

    const server = app.listen(PORT, () => {
      console.log(`PrepQuarters backend server running on http://localhost:${PORT}`);
    });

    // Graceful shutdown handling
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        mongoose.connection.close(false, () => {
          process.exit(0);
        });
      });
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });