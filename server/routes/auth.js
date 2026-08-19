const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../services/AppwriteService");
const { createRateLimiter, isValidEmail, sanitizeInput } = require("../middleware/securityMiddleware");

const router = express.Router();

// Rate limiter for auth endpoints: max 30 requests per 15 minutes per IP
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many authentication attempts. Please wait a few minutes before trying again.",
});

/* =========================================
   SIGN UP & REGISTER
========================================= */
const signupHandler = async (req, res) => {
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

    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
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

    const existingUser = await findUserByEmail(cleanEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await createUser({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: role === "interviewer" ? "interviewer" : "candidate",
    });

    const token = jwt.sign(
      {
        userId: user._id || user.id,
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
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetRole: user.targetRole,
        targetDomain: user.targetDomain,
        targetDifficulty: user.targetDifficulty,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred during account creation.",
    });
  }
};

router.post("/signup", authLimiter, signupHandler);
router.post("/register", authLimiter, signupHandler);

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

    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const user = await findUserByEmail(cleanEmail);

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
        userId: user._id || user.id,
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
        id: user._id || user.id,
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
      message: "An error occurred during authentication. Please try again.",
    });
  }
});

/* =========================================
   FORGOT PASSWORD & RECOVERY
========================================= */
const { createPasswordResetToken, verifyAndResetPassword } = require("../services/AppwriteService");

router.post("/forgot-password", authLimiter, async (req, res) => {
  try {
    const email = sanitizeInput(req.body.email);
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const result = await createPasswordResetToken(cleanEmail);

    res.json({
      success: true,
      message: result.message || "A 6-digit password reset verification code has been dispatched to your email address.",
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not process password recovery. Please try again.",
    });
  }
});

router.post("/reset-password", authLimiter, async (req, res) => {
  try {
    const { email, code, token, newPassword, confirmNewPassword } = req.body;
    const verificationCode = String(code || token || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!verificationCode || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide the 6-digit verification code and your new password.",
      });
    }

    if (verificationCode.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Verification code must be 6 digits.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const resetResult = await verifyAndResetPassword(verificationCode, hashedPassword, cleanEmail);

    if (!resetResult.success) {
      return res.status(400).json({
        success: false,
        message: resetResult.message || "Could not reset password.",
      });
    }

    res.json({
      success: true,
      message: resetResult.message || "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not reset password. Please try again.",
    });
  }
});

module.exports = router;