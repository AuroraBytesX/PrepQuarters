const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { findUserById, updateUser } = require("../services/AppwriteService");

/* =========================================
   GET CURRENT USER PROFILE
========================================= */
router.get("/me", protect, async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    const { password, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser,
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

    const updatedUser = await updateUser(req.user.userId, {
      ...(targetRole && { targetRole }),
      ...(targetDomain && { targetDomain }),
      ...(targetDifficulty && { targetDifficulty }),
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const { password, ...safeUser } = updatedUser;

    res.json({
      success: true,
      message: "Preferences updated successfully.",
      user: safeUser,
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