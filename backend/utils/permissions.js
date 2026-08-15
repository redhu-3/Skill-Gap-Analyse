// backend/utils/permissions.js
// Central permission matrix for the Skill Intelligence Engine.
// "user" is treated as a legacy alias for "viewer".

const PERMISSIONS = {
  // ── Analytics ───────────────────────────────────────────────────
  "analytics:view":         ["admin", "manager", "contributor", "viewer", "user"],
  "analytics:download":     ["admin"],

  // ── Skill Relations ─────────────────────────────────────────────
  "skillRelation:view":     ["admin", "manager", "contributor", "viewer", "user"],
  "skillRelation:import":   ["admin"],
  "skillRelation:edit":     ["admin", "manager"],
  "skillRelation:delete":   ["admin"],

  // ── Skills ──────────────────────────────────────────────────────
  "skill:view":             ["admin", "manager", "contributor", "viewer", "user"],
  "skill:create":           ["admin"],
  "skill:edit":             ["admin"],
  "skill:delete":           ["admin"],

  // ── Job Roles ───────────────────────────────────────────────────
  "jobRole:view":           ["admin", "manager", "contributor", "viewer", "user"],
  "jobRole:create":         ["admin"],
  "jobRole:edit":           ["admin", "manager"],
  "jobRole:delete":         ["admin"],

  // ── Questions ───────────────────────────────────────────────────
  "question:view":          ["admin", "manager", "contributor"],
  "question:create":        ["admin", "contributor"],
  "question:edit":          ["admin", "contributor"],
  "question:delete":        ["admin"],

  // ── Users / Admin ───────────────────────────────────────────────────────
  "user:manage":            ["admin"],

  // ── AI Recommendations (Phase 3) ────────────────────────────────────────
  "ai:generate":            ["admin"],
  "ai:review":              ["admin"],
  "ai:approve":             ["admin"],
  "ai:reject":              ["admin"],
  "ai:publish":             ["admin"],
  "ai:queue:view":          ["admin", "manager"],
};

/**
 * isAuthorized – checks whether a given role has permission to perform an action.
 * @param {string} role   – the user's role
 * @param {string} action – e.g. "analytics:view"
 * @returns {boolean}
 */
const isAuthorized = (role, action) => {
  const allowed = PERMISSIONS[action];
  if (!allowed) return false;
  // normalise legacy "user" → "viewer"
  const effective = role === "user" ? "viewer" : role;
  return allowed.includes(effective) || allowed.includes(role);
};

module.exports = { PERMISSIONS, isAuthorized };
