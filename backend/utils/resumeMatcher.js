/**
 * Free, no-API-key resume-to-job matching.
 *
 * How it works (simple keyword/skill matching, similar to how basic
 * Applicant Tracking Systems - ATS - work):
 *   1. We keep a curated list of common skills/technologies.
 *   2. From the JOB text, we find which of those skills are actually
 *      mentioned -> these become the "required skills" for that job.
 *   3. From the RESUME text, we check which of those required skills
 *      are also present.
 *   4. matchScore = (skills found in resume / skills required by job) * 100
 */

// Curated list of common skills/keywords seen in tech + general job posts.
// Add more here any time — it will automatically be used in matching.
const SKILL_KEYWORDS = [
  // Frontend
  "react", "react.js", "redux", "angular", "vue", "next.js", "html", "css",
  "sass", "tailwind", "bootstrap", "javascript", "typescript", "jquery",
  // Backend
  "node", "node.js", "express", "express.js", "django", "flask", "spring",
  "spring boot", "laravel", "php", "ruby on rails", "asp.net", ".net",
  // Databases
  "mongodb", "mysql", "postgresql", "sql", "nosql", "firebase", "redis",
  "oracle", "sqlite",
  // Languages
  "python", "java", "c++", "c#", "golang", "go", "rust", "kotlin", "swift",
  // Cloud / DevOps
  "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "jenkins",
  "terraform", "linux", "git", "github", "gitlab",
  // Data / AI
  "machine learning", "deep learning", "data science", "pandas", "numpy",
  "tensorflow", "pytorch", "nlp", "computer vision", "sql server",
  // Mobile
  "android", "ios", "flutter", "react native",
  // General / soft & business skills
  "communication", "leadership", "teamwork", "problem solving",
  "project management", "agile", "scrum", "excel", "seo", "marketing",
  "sales", "customer service", "accounting", "content writing",
];

/**
 * Finds which known skills from SKILL_KEYWORDS appear inside a given text.
 * Case-insensitive, matches whole words/phrases.
 */
function extractSkills(text) {
  if (!text) return [];

  const lowerText = text.toLowerCase();
  const found = [];

  for (const skill of SKILL_KEYWORDS) {
    // Escape special regex characters in the skill (e.g. "c++", "node.js")
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");

    if (pattern.test(lowerText)) {
      found.push(skill);
    }
  }

  return found;
}

/**
 * Compares a job's text (title + description) against a resume's text,
 * and returns a match score plus matched/missing skill lists.
 */
function calculateMatch(jobText, resumeText) {
  const requiredSkills = extractSkills(jobText);
  const resumeSkills = extractSkills(resumeText);

  const resumeSkillSet = new Set(resumeSkills);

  const matchedSkills = requiredSkills.filter((skill) => resumeSkillSet.has(skill));
  const missingSkills = requiredSkills.filter((skill) => !resumeSkillSet.has(skill));

  let matchScore;
  if (requiredSkills.length === 0) {
    // Job description didn't mention any known skill keywords —
    // we can't meaningfully score this one.
    matchScore = null;
  } else {
    matchScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  }

  return { matchScore, matchedSkills, missingSkills };
}

module.exports = { calculateMatch, extractSkills, SKILL_KEYWORDS };
