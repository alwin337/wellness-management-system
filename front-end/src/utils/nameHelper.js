/**
 * Reusable helper to safely normalize counsellor names on the frontend.
 * Removes duplicate "Dr", "Dr.", "Dr. Dr." prefixes and prepends exactly one "Dr." title.
 * E.g.:
 * - "Anu" -> "Dr. Anu"
 * - "Dr. Anu" -> "Dr. Anu"
 * - "Dr. Dr. Anu" -> "Dr. Anu"
 *
 * @param {string} name - The original name string from backend
 * @returns {string} The normalized name with exactly one "Dr." prefix
 */
export const getCounsellorDisplayName = (name) => {
  if (!name) return "";

  // Trim name
  let cleanName = name.trim();

  // Case-insensitive regex to match and remove any sequence of "Dr", "Dr.", "dr", "dr." at the beginning,
  // potentially repeated and separated by whitespace
  cleanName = cleanName.replace(/^(dr\b\.?\s*)+/gi, "").trim();

  return `Dr. ${cleanName}`;
};

/**
 * Extracts initials from the counsellor name, ignoring the "Dr." prefix.
 * E.g.:
 * - "Dr. Sara Mathew" -> "SM"
 * - "Anu" -> "A"
 * - "Dr. Anu" -> "A"
 *
 * @param {string} name - The counsellor name string
 * @returns {string} Initials character sequence
 */
export const getCounsellorInitials = (name) => {
  if (!name) return "C";

  // Strip "Dr." prefixes
  const cleanName = name.replace(/^(dr\b\.?\s*)+/gi, "").trim();
  if (!cleanName) return "C";

  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "C";
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
