// frontend/src/context/PermissionContext.jsx
import { createContext, useContext, useMemo } from "react";

// ── Permission matrix (mirrors backend/utils/permissions.js) ─────────────────
const PERMISSIONS = {
  "analytics:view":         ["admin", "manager", "contributor", "viewer", "user"],
  "analytics:download":     ["admin"],

  "skillRelation:view":     ["admin", "manager", "contributor", "viewer", "user"],
  "skillRelation:import":   ["admin"],
  "skillRelation:edit":     ["admin", "manager"],
  "skillRelation:delete":   ["admin"],

  "skill:view":             ["admin", "manager", "contributor", "viewer", "user"],
  "skill:create":           ["admin"],
  "skill:edit":             ["admin"],
  "skill:delete":           ["admin"],

  "jobRole:view":           ["admin", "manager", "contributor", "viewer", "user"],
  "jobRole:create":         ["admin"],
  "jobRole:edit":           ["admin", "manager"],
  "jobRole:delete":         ["admin"],

  "question:view":          ["admin", "manager", "contributor"],
  "question:create":        ["admin", "contributor"],
  "question:edit":          ["admin", "contributor"],
  "question:delete":        ["admin"],

  "user:manage":            ["admin"],
};

// ── Helper: decode JWT payload without verification ──────────────────────────
const decodeJwtPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
};

// ── Determine current user from localStorage ─────────────────────────────────
const resolveCurrentUser = () => {
  // Admin token takes priority
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    const payload = decodeJwtPayload(adminToken);
    if (payload) return { ...payload, _tokenKey: "adminToken" };
  }
  // Fall back to regular user token
  const userToken = localStorage.getItem("token");
  if (userToken) {
    const payload = decodeJwtPayload(userToken);
    if (payload) return { ...payload, _tokenKey: "token" };
  }
  return null;
};

// ── Context ───────────────────────────────────────────────────────────────────
const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
  const currentUser = useMemo(() => resolveCurrentUser(), []);

  /**
   * hasPermission("analytics:view")  → boolean
   * Treats the legacy "user" role as "viewer".
   */
  const hasPermission = (action) => {
    if (!currentUser) return false;
    const role = currentUser.role === "user" ? "viewer" : currentUser.role;
    const allowed = PERMISSIONS[action];
    if (!allowed) return false;
    return allowed.includes(role) || allowed.includes(currentUser.role);
  };

  return (
    <PermissionContext.Provider value={{ currentUser, hasPermission }}>
      {children}
    </PermissionContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const usePermission = () => {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("usePermission must be used inside <PermissionProvider>");
  return ctx;
};

export default PermissionContext;
