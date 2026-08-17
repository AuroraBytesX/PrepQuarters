const fs = require("fs");
const path = require("path");

const ROOT_DIRS = [
  path.join(__dirname, "../prepquarters/src"),
  path.join(__dirname, "../server"),
];

const EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".json"];

let violations = [];

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git" && entry.name !== "dist") {
        scanDir(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (EXTENSIONS.includes(ext)) {
        checkFile(fullPath);
      }
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const emDashRegex = /[\u2014\u2015]/g;
  const enDashRegex = /[\u2013]/g;
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu;

  lines.forEach((line, index) => {
    // Skip regex definition lines or comments specifically escaping them
    if (line.includes("replace(/[\u2014\u2015]/g") || line.includes("emDashRegex") || line.includes("emojiRegex")) {
      return;
    }

    if (emDashRegex.test(line)) {
      violations.push({ file: filePath, line: index + 1, type: "Em-dash (\u2014)", text: line.trim() });
    }
    if (enDashRegex.test(line)) {
      violations.push({ file: filePath, line: index + 1, type: "En-dash (\u2013)", text: line.trim() });
    }
    if (emojiRegex.test(line)) {
      violations.push({ file: filePath, line: index + 1, type: "Emoji", text: line.trim() });
    }
  });
}

console.log("Scanning repository for em dashes, en dashes, and emojis...");
for (const d of ROOT_DIRS) {
  scanDir(d);
}

if (violations.length === 0) {
  console.log("[PASS] 0 em dashes, 0 en dashes, and 0 emojis found across the codebase!");
  process.exit(0);
} else {
  console.error(`[FAIL] Found ${violations.length} violation(s):`);
  violations.forEach((v) => {
    console.error(`  - ${v.file}:${v.line} [${v.type}] -> ${v.text}`);
  });
  process.exit(1);
}
