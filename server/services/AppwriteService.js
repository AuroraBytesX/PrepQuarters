/*
 * Appwrite Backend Service & Cloud Persistence Layer
 * PrepQuarters Engineering Platform
 * Primary Data Store: Appwrite Cloud (https://sgp.cloud.appwrite.io/v1)
 * Project ID: 6a848cdb001bfd2d59a9
 * Database ID: 6a858e86001a384c7913
 */

const { Client, Databases, Storage, Users, ID, Query } = require("node-appwrite");
const crypto = require("crypto");

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || "6a848cdb001bfd2d59a9";
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || "";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "6a858e86001a384c7913";

let client = null;
let databases = null;
let storage = null;
let usersService = null;
let isAppwriteInitialized = false;

// High-speed In-Memory Cache synced directly with Appwrite Cloud
const memoryStore = {
  users: new Map(),
  sessions: new Map(),
  questions: new Map(),
  resumes: new Map(),
  resetTokens: new Map(),
};

function initializeAppwrite() {
  if (isAppwriteInitialized) return;

  try {
    client = new Client();
    client
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);

    if (APPWRITE_API_KEY) {
      client.setKey(APPWRITE_API_KEY);
    }

    databases = new Databases(client);
    storage = new Storage(client);
    usersService = new Users(client);
    isAppwriteInitialized = true;
    console.log(`[APPWRITE] Cloud Database initialized: Project ${APPWRITE_PROJECT_ID}, DB: ${DATABASE_ID}`);
  } catch (err) {
    console.warn(`[APPWRITE_INIT_WARNING] Could not initialize Appwrite SDK: ${err.message}.`);
  }
}

// Auto-initialize
initializeAppwrite();

function isAppwriteConfigured() {
  return Boolean(isAppwriteInitialized && APPWRITE_API_KEY && APPWRITE_API_KEY.trim().length > 0);
}

/* =======================================================================
   USER & AUTHENTICATION MANAGEMENT (APPWRITE CLOUD)
======================================================================= */

async function createUser(userData) {
  const userId = userData.id || userData._id || ID.unique();
  const normalized = {
    _id: userId,
    id: userId,
    name: userData.name,
    email: (userData.email || "").toLowerCase().trim(),
    password: userData.password,
    role: userData.role || "candidate",
    targetRole: userData.targetRole || "Software Engineer",
    targetDomain: userData.targetDomain || "Software Engineering",
    targetDifficulty: userData.targetDifficulty || "Hard",
    preferredLanguage: userData.preferredLanguage || "Python",
    programmingLanguages: userData.programmingLanguages || ["Python", "JavaScript"],
    speechSettings: userData.speechSettings || { enabled: true, autoSpeakQuestions: true },
    stats: userData.stats || {
      totalInterviews: 0,
      completedInterviews: 0,
      averageScore: 0,
      lastPracticedAt: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Cache in-memory
  memoryStore.users.set(normalized.email, normalized);
  memoryStore.users.set(String(userId), normalized);

  // Write directly to Appwrite Cloud
  if (isAppwriteConfigured()) {
    try {
      const doc = await databases.createDocument(DATABASE_ID, "users", String(userId), {
        name: normalized.name,
        email: normalized.email,
        role: normalized.role,
        userDataJson: JSON.stringify(normalized),
      });
      if (doc?.$id) {
        normalized._id = doc.$id;
        normalized.id = doc.$id;
        memoryStore.users.set(normalized.email, normalized);
        memoryStore.users.set(String(doc.$id), normalized);
      }
    } catch (e) {
      console.warn(`[APPWRITE_USER_SAVE_NOTICE] User create: ${e.message}`);
    }
  }

  return normalized;
}

async function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();

  // 1. Check in-memory cache
  const memUser = memoryStore.users.get(cleanEmail);
  if (memUser) return memUser;

  // 2. Query Appwrite Cloud Database
  if (isAppwriteConfigured()) {
    try {
      const response = await databases.listDocuments(DATABASE_ID, "users", [
        Query.equal("email", cleanEmail),
        Query.limit(1),
      ]);
      if (response.documents && response.documents.length > 0) {
        const doc = response.documents[0];
        let parsed = doc;
        if (doc.userDataJson) {
          try {
            parsed = JSON.parse(doc.userDataJson);
          } catch (pe) {
            parsed = doc;
          }
        }
        parsed._id = doc.$id || parsed._id;
        parsed.id = parsed._id;
        memoryStore.users.set(cleanEmail, parsed);
        memoryStore.users.set(String(parsed._id), parsed);
        return parsed;
      }
    } catch (e) {
      console.warn(`[APPWRITE_USER_QUERY_NOTICE] ${e.message}`);
    }
  }

  return null;
}

async function findUserById(userId) {
  if (!userId) return null;
  const strId = String(userId);

  // 1. Check in-memory cache
  const memUser = memoryStore.users.get(strId);
  if (memUser) return memUser;

  // 2. Query Appwrite Cloud Database
  if (isAppwriteConfigured()) {
    try {
      const doc = await databases.getDocument(DATABASE_ID, "users", strId);
      if (doc) {
        let parsed = doc;
        if (doc.userDataJson) {
          try {
            parsed = JSON.parse(doc.userDataJson);
          } catch (pe) {
            parsed = doc;
          }
        }
        parsed._id = doc.$id || parsed._id;
        parsed.id = parsed._id;
        memoryStore.users.set(strId, parsed);
        if (parsed.email) memoryStore.users.set(parsed.email, parsed);
        return parsed;
      }
    } catch (e) {
      console.warn(`[APPWRITE_USER_QUERY_NOTICE] ${e.message}`);
    }
  }

  return null;
}

async function updateUser(userId, updateData) {
  if (!userId) return null;
  const existing = await findUserById(userId);
  if (!existing) return null;

  const merged = {
    ...existing,
    ...updateData,
    stats: { ...(existing.stats || {}), ...(updateData.stats || {}) },
    updatedAt: new Date().toISOString(),
  };

  memoryStore.users.set(String(userId), merged);
  if (merged.email) memoryStore.users.set(merged.email, merged);

  // Update in Appwrite Cloud
  if (isAppwriteConfigured()) {
    try {
      await databases.updateDocument(DATABASE_ID, "users", String(userId), {
        name: merged.name,
        email: merged.email,
        role: merged.role,
        userDataJson: JSON.stringify(merged),
      });
    } catch (e) {
      console.warn(`[APPWRITE_USER_UPDATE_NOTICE] ${e.message}`);
    }
  }

  return merged;
}

/* =======================================================================
   PASSWORD RECOVERY & RESET (6-DIGIT VERIFICATION CODE + EMAIL DISPATCH)
======================================================================= */

const { sendPasswordResetEmail } = require("./EmailService");

async function createPasswordResetToken(email) {
  const cleanEmail = String(email || "").toLowerCase().trim();
  const user = await findUserByEmail(cleanEmail);
  if (!user) {
    // Return friendly message without disclosing user existence
    return {
      success: true,
      email: cleanEmail,
      message: "If an account exists with this email address, a 6-digit verification code has been dispatched.",
    };
  }

  // Generate cryptographically secure 6-digit verification code
  const resetCode = String(crypto.randomInt(100000, 999999));
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  // Store verification record keyed by cleanEmail
  memoryStore.resetTokens.set(cleanEmail, {
    email: cleanEmail,
    code: resetCode,
    userId: user._id || user.id,
    expiresAt,
    attempts: 0,
  });

  // Dispatch email with 6-digit code (Zero Token in JSON response)
  const emailResult = await sendPasswordResetEmail({
    email: cleanEmail,
    name: user.name || "Candidate",
    resetCode,
  });

  console.log(`[PASSWORD_RESET_DISPATCH] 6-Digit code generated for ${cleanEmail}. Email dispatched: ${emailResult.delivered}`);

  return {
    success: true,
    email: cleanEmail,
    message: "A 6-digit password reset verification code has been sent to your email. Please enter it below.",
  };
}

async function verifyAndResetPassword(identifier, newHashedPassword, providedEmail) {
  if (!identifier || !newHashedPassword) {
    return { success: false, message: "Please provide your verification code and new password." };
  }

  const cleanCode = String(identifier).trim();
  const cleanEmail = String(providedEmail || "").toLowerCase().trim();

  // Find record by email or by scanning tokens
  let record = cleanEmail ? memoryStore.resetTokens.get(cleanEmail) : null;
  if (!record) {
    for (const [key, val] of memoryStore.resetTokens.entries()) {
      if (val && val.code === cleanCode) {
        record = val;
        break;
      }
    }
  }

  if (!record) {
    return { success: false, message: "Invalid or expired 6-digit verification code. Please request a new code." };
  }

  // Brute force protection: Max 5 attempts
  record.attempts = (record.attempts || 0) + 1;
  if (record.attempts > 5) {
    memoryStore.resetTokens.delete(record.email);
    return { success: false, message: "Too many failed attempts. Please request a new verification code." };
  }

  if (Date.now() > record.expiresAt) {
    memoryStore.resetTokens.delete(record.email);
    return { success: false, message: "Verification code has expired. Please request a new code." };
  }

  if (record.code !== cleanCode) {
    return { success: false, message: "Incorrect 6-digit verification code. Please check your email and try again." };
  }

  const user = await findUserByEmail(record.email);
  if (!user) {
    return { success: false, message: "User account not found." };
  }

  user.password = newHashedPassword;
  user.updatedAt = new Date().toISOString();

  memoryStore.users.set(record.email, user);
  memoryStore.users.set(String(user._id || user.id), user);
  memoryStore.resetTokens.delete(record.email);

  // Update in Appwrite Cloud
  if (isAppwriteConfigured()) {
    try {
      await databases.updateDocument(DATABASE_ID, "users", String(user._id || user.id), {
        userDataJson: JSON.stringify(user),
      });
      console.log(`[PASSWORD_RESET_SUCCESS] User ${user.email} password updated in Appwrite Cloud.`);
    } catch (e) {
      console.warn(`[APPWRITE_PASSWORD_UPDATE_NOTICE] ${e.message}`);
    }
  }

  return {
    success: true,
    message: "Password updated successfully. You can now log in with your new password.",
  };
}

/* =======================================================================
   INTERVIEW SESSION MANAGEMENT (APPWRITE CLOUD)
======================================================================= */

async function saveInterviewSession(sessionData) {
  const sessionId = sessionData._id || sessionData.id || ID.unique();
  const normalized = {
    ...sessionData,
    _id: sessionId,
    id: sessionId,
    updatedAt: new Date().toISOString(),
  };

  memoryStore.sessions.set(String(sessionId), normalized);

  if (isAppwriteConfigured()) {
    try {
      await databases.createDocument(DATABASE_ID, "sessions", String(sessionId), {
        userId: String(normalized.userId || "anonymous"),
        sessionJson: JSON.stringify(normalized),
      });
    } catch (e) {
      if (e.message && e.message.toLowerCase().includes("already exists")) {
        try {
          await databases.updateDocument(DATABASE_ID, "sessions", String(sessionId), {
            userId: String(normalized.userId || "anonymous"),
            sessionJson: JSON.stringify(normalized),
          });
        } catch (ue) {
          console.warn(`[APPWRITE_SESSION_UPDATE_NOTICE] ${ue.message}`);
        }
      } else {
        console.warn(`[APPWRITE_SESSION_SAVE_NOTICE] ${e.message}`);
      }
    }
  }

  return normalized;
}

async function getInterviewSession(sessionId) {
  if (!sessionId) return null;
  const strId = String(sessionId);
  const memSession = memoryStore.sessions.get(strId);
  if (memSession) return memSession;

  if (isAppwriteConfigured()) {
    try {
      const doc = await databases.getDocument(DATABASE_ID, "sessions", strId);
      if (doc && doc.sessionJson) {
        const parsed = JSON.parse(doc.sessionJson);
        parsed._id = doc.$id || parsed._id;
        parsed.id = parsed._id;
        memoryStore.sessions.set(strId, parsed);
        return parsed;
      }
    } catch (e) {}
  }

  return null;
}

async function listUserInterviewSessions(userId, limit = 50) {
  if (!userId) return [];
  const strUserId = String(userId);

  // 1. Query Appwrite Cloud
  if (isAppwriteConfigured()) {
    try {
      const response = await databases.listDocuments(DATABASE_ID, "sessions", [
        Query.equal("userId", strUserId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ]);
      if (response.documents && response.documents.length > 0) {
        return response.documents.map((doc) => {
          let parsed = doc;
          if (doc.sessionJson) {
            try {
              parsed = JSON.parse(doc.sessionJson);
            } catch (e) {
              parsed = doc;
            }
          }
          parsed._id = doc.$id || parsed._id;
          parsed.id = parsed._id;
          memoryStore.sessions.set(String(parsed._id), parsed);
          return parsed;
        });
      }
    } catch (e) {
      console.warn(`[APPWRITE_LIST_SESSIONS_NOTICE] ${e.message}`);
    }
  }

  // 2. In-memory fallback
  const userSessions = Array.from(memoryStore.sessions.values()).filter(
    (s) => String(s.userId) === strUserId
  );
  userSessions.sort(
    (a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt)
  );
  return userSessions.slice(0, limit);
}

async function getUserRecentSessions(userId, limit = 2) {
  return listUserInterviewSessions(userId, limit);
}

async function deleteInterviewSession(sessionId) {
  if (!sessionId) return false;
  const strId = String(sessionId);
  memoryStore.sessions.delete(strId);

  if (isAppwriteConfigured()) {
    try {
      await databases.deleteDocument(DATABASE_ID, "sessions", strId);
      return true;
    } catch (e) {
      console.warn(`[APPWRITE_DELETE_SESSION_NOTICE] ${e.message}`);
    }
  }
  return true;
}

async function cleanupUserOlderSessions(userId, keepCount = 2) {
  if (!userId) return;
  const allUserSessions = await listUserInterviewSessions(userId, 100);
  const completedSessions = allUserSessions.filter((s) => s.status === "completed");

  if (completedSessions.length > keepCount) {
    const toDelete = completedSessions.slice(keepCount);
    for (const session of toDelete) {
      await deleteInterviewSession(session._id || session.id);
    }
  }
}

module.exports = {
  initializeAppwrite,
  isAppwriteConfigured,
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  createPasswordResetToken,
  verifyAndResetPassword,
  saveInterviewSession,
  getInterviewSession,
  listUserInterviewSessions,
  getUserRecentSessions,
  deleteInterviewSession,
  cleanupUserOlderSessions,
  memoryStore,
};
