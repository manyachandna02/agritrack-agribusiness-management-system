// client/src/components/Sidebar.js
//
// Nav visibility is per-role for UX only (see ProtectedRoute.js note).
// Backend RBAC (server/middleware/authorize.js) is what actually
// enforces permissions on every request.

import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const links = [{ to: "/dashboard", label: "Dashboard" }];

  if (user.role === "ADMIN" || user.role === "MANAGER") {
    links.push({ to: "/inventory", label: "Inventory" });
  } else if (user.role === "FARM_STAFF") {
    links.push({ to: "/inventory", label: "Inventory (limited)" });
  }

  links.push({ to: "/crops", label: "Crops" });
  links.push({ to: "/production", label: "Production" });

  // Week 3 — Sales
  links.push({
    to: "/sales",
    label: user.role === "FARM_STAFF" ? "Sales (view)" : "Sales",
  });

  // Week 3 — Reports and What-If Simulator
  if (user.role === "ADMIN" || user.role === "MANAGER") {
    links.push({ to: "/reports", label: "Reports" });
    links.push({ to: "/simulator", label: "What-If Simulator" });
  }

  // Admin only
  if (user.role === "ADMIN") {
    links.push({ to: "/users", label: "Users" });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">AgriTrack</div>

      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          {user.name} <span className="role-badge">{user.role}</span>
        </div>

        <button className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
}