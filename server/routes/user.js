const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const User = require("../models/User");
const InterviewSession = require("../models/InterviewSession");

/* =========================================
   GET CURRENT USER PROFILE
========================================= */
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error retrieving user profile:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile.",
    });
  }
});

/* =========================================
   UPDATE USER PREPARATION PREFERENCES
========================================= */
router.put("/preferences", protect, async (req, res) => {
  try {
    const { targetRole, targetDomain, targetDifficulty } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          ...(targetRole && { targetRole }),
          ...(targetDomain && { targetDomain }),
          ...(targetDifficulty && { targetDifficulty }),
        },
      },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Preferences updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating preferences:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update preferences.",
    });
  }
});

module.exports = router;