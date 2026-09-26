// client/src/context/AuthContext.js
//
// Holds the current user + token in memory (backed by localStorage so
// a page refresh doesn't log the user out) and exposes login/logout.
// On mount, if a token exists, it's validated against GET /api/auth/me
// so a stale/expired token doesn't silently look "logged in".

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("agritrack_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("agritrack_token");
        localStorage.removeItem("agritrack_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user: loggedInUser } = res.data;
    localStorage.setItem("agritrack_token", token);
    localStorage.setItem("agritrack_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("agritrack_token");
    localStorage.removeItem("agritrack_user");
    setUser(null);
  }, []);

  const value = { user, loading, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
