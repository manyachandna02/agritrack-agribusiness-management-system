// client/src/components/ProtectedRoute.js
//
// Frontend route guarding is UX only — it just avoids flashing a page
// the user has no business seeing. It is NOT the security boundary;
// the backend's authenticate/authorize middleware is (see
// server/middleware/auth.js and authorize.js), which reject the
// underlying API calls regardless of what this component does.

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div className="page-loading">Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
