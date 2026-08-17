/*
 * Sanitization & Zero-Tolerance Disallowed Character Helper
 * Strips em dashes (\u2014, \u2015), en dashes (\u2013), and emoji code points.
 */

function cleanDisallowedChars(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/[\u2014\u2015]/g, "--")
    .replace(/[\u2013]/g, "-")
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, "");
}

module.exports = {
  cleanDisallowedChars,
};
