import { Navigate } from "react-router-dom";

/**
 * Guards a route behind login, and optionally behind a specific role.
 *
 * Usage:
 *   <ProtectedRoute>...</ProtectedRoute>                     -> just requires login
 *   <ProtectedRoute allowedRole="recruiter">...</ProtectedRoute> -> requires login AND role === "recruiter"
 */
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in at all -> go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but this page is restricted to a specific role
  if (allowedRole && role !== allowedRole) {
    const fallback = role === "recruiter" ? "/dashboard" : "/jobs";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

export default ProtectedRoute;
