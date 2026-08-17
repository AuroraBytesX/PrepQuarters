const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createRateLimiter, isValidEmail, sanitizeInput } = require("../middleware/securityMiddleware");

const router = express.Router();

// Rate limiter for auth endpoints: max 20 requests per 15 minutes per IP
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts. Please wait a few minutes before trying again.",
});

/* =========================================
   SIGN UP
========================================= */
router.post("/signup", authLimiter, async (req, res) => {
  try {
    const name = sanitizeInput(req.body.name);
    const email = sanitizeInput(req.body.email);
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const role = req.body.role || "candidate";

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role === "interviewer" ? "interviewer" : "candidate",
    });

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET || "default_prepquarters_secret",
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetRole: user.targetRole,
        targetDomain: user.targetDomain,
        targetDifficulty: user.targetDifficulty,
      },
    });
  } catch (error) {
    console.error("Signup processing error:", error.message);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while creating your account. Please try again.",
    });
  }
});

/* =========================================
   LOGIN
========================================= */
router.post("/login", authLimiter, async (req, res) => {
  try {
    const email = sanitizeInput(req.body.email);
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET || "default_prepquarters_secret",
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetRole: user.targetRole,
        targetDomain: user.targetDomain,
        targetDifficulty: user.targetDifficulty,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error("Login processing error:", error.message);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred during login. Please try again.",
    });
  }
});

module.exports = router;