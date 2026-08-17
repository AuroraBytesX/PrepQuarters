const mongoose = require("mongoose");

const questionEvaluationSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    technicalAccuracy: {
      type: String,
      required: true,
    },
    communicationClarity: {
      type: String,
      required: true,
    },
    strengths: [
      {
        type: String,
      },
    ],
    improvements: [
      {
        type: String,
      },
    ],
    keyMissedPoints: [
      {
        type: String,
      },
    ],
    suggestedModelAnswer: {
      type: String,
    },
    rawLlmFeedback: {
      type: String,
    },
  },
  { _id: false }
);

const sessionQuestionSchema = new mongoose.Schema(
  {
    questionIndex: {
      type: Number,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    subtopic: {
      type: String,
      default: "General",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    questionText: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      default: "Technical",
    },
    starterCode: {
      type: String,
      default: "",
    },
    referenceSolution: {
      type: String,
      default: "",
    },
    hints: [
      {
        type: String,
      },
    ],
    programmingLanguage: {
      type: String,
      default: "javascript",
    },
    testCases: [
      {
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: Boolean,
      },
    ],
    codeExecutionResult: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    aptitudeOptions: [
      {
        type: String,
      },
    ],
    correctOptionIndex: {
      type: Number,
    },
    selectedOptionIndex: {
      type: Number,
    },
    explanation: {
      type: String,
    },
    expectedKeyPoints: [
      {
        type: String,
      },
    ],
    candidateAnswer: {
      type: String,
      default: "",
    },
    answeredAt: {
      type: Date,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    isFollowUp: {
      type: Boolean,
      default: false,
    },
    followUpReason: {
      type: String,
    },
    parentQuestionIndex: {
      type: Number,
    },
    evaluation: questionEvaluationSchema,
  },
  { _id: false }
);

const skillGapItemSchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "Technical",
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    status: {
      type: String,
      enum: ["Strong", "Proficient", "Needs Work", "Critical Gap"],
      default: "Proficient",
    },
    gapDescription: {
      type: String,
    },
    recommendedAction: {
      type: String,
    },
  },
  { _id: false }
);

const overallEvaluationSchema = new mongoose.Schema(
  {
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    hireRecommendation: {
      type: String,
      enum: ["Strong Hire", "Hire", "Leaning Hire", "Leaning No Hire", "No Hire"],
      default: "Leaning Hire",
    },
    summaryText: {
      type: String,
      required: true,
    },
    keyStrengths: [
      {
        type: String,
      },
    ],
    priorityImprovementAreas: [
      {
        type: String,
      },
    ],
    skillGapAnalysis: [skillGapItemSchema],
    personalizedPreparationPlan: [
      {
        step: Number,
        title: String,
        action: String,
      },
    ],
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    domain: {
      type: String,
      required: true,
      default: "Software Engineering",
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

    companyStyle: {
      type: String,
      default: "General Tech",
    },

    interviewType: {
      type: String,
      default: "Mixed",
    },

    programmingLanguage: {
      type: String,
      default: "javascript",
    },

    programmingLanguages: [
      {
        type: String,
      },
    ],

    autoTTS: {
      type: Boolean,
      default: true,
    },

    speechResponseMode: {
      type: String,
      enum: ["autonomous", "explicit_on_demand", "silent"],
      default: "autonomous",
    },

    modalityConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    totalQuestionsPlanned: {
      type: Number,
      default: 5,
    },

    sessionDurationMinutes: {
      type: Number,
      default: 10,
    },

    selectedDuration: {
      type: String,
      default: "10 Minutes",
    },

    sessionStartTime: {
      type: Date,
      default: Date.now,
    },

    sessionEndTime: {
      type: Date,
    },

    elapsedTimeSeconds: {
      type: Number,
      default: 0,
    },

    remainingTimeSeconds: {
      type: Number,
      default: 600,
    },

    isTimeExpired: {
      type: Boolean,
      default: false,
    },

    currentQuestionIndex: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      default: "in_progress",
      index: true,
    },

    questions: [sessionQuestionSchema],

    overallEvaluation: overallEvaluationSchema,

    totalDurationSeconds: {
      type: Number,
      default: 0,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
