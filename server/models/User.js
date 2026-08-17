const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["candidate", "interviewer", "admin"],
      default: "candidate",
    },

    targetRole: {
      type: String,
      default: "Software Engineer",
    },

    targetDomain: {
      type: String,
      default: "Software Engineering",
    },

    targetDifficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

    stats: {
      totalInterviews: {
        type: Number,
        default: 0,
      },
      completedInterviews: {
        type: Number,
        default: 0,
      },
      totalQuestionsAnswered: {
        type: Number,
        default: 0,
      },
      totalPracticeTimeMinutes: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      highestScore: {
        type: Number,
        default: 0,
      },
      lastPracticedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);