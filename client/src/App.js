// client/src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";

import InventoryList from "./pages/inventory/InventoryList";
import InventoryForm from "./pages/inventory/InventoryForm";

import CropList from "./pages/crops/CropList";
import CropForm from "./pages/crops/CropForm";

import ProductionList from "./pages/production/ProductionList";
import ProductionForm from "./pages/production/ProductionForm";

function AuthedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function LoginRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />

          <Route
            path="/register"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Layout>
                  <Register />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <AuthedLayout>
                <Dashboard />
              </AuthedLayout>
            }
          />

          <Route
            path="/inventory"
            element={
              <AuthedLayout>
                <InventoryList />
              </AuthedLayout>
            }
          />
          <Route
            path="/inventory/add"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                <Layout>
                  <InventoryForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/edit/:id"
            element={
              <AuthedLayout>
                <InventoryForm />
              </AuthedLayout>
            }
          />

          <Route
            path="/crops"
            element={
              <AuthedLayout>
                <CropList />
              </AuthedLayout>
            }
          />
          <Route
            path="/crops/add"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                <Layout>
                  <CropForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/crops/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                <Layout>
                  <CropForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/production"
            element={
              <AuthedLayout>
                <ProductionList />
              </AuthedLayout>
            }
          />
          <Route
            path="/production/add"
            element={
              <AuthedLayout>
                <ProductionForm />
              </AuthedLayout>
            }
          />
          <Route
            path="/production/edit/:id"
            element={
              <AuthedLayout>
                <ProductionForm />
              </AuthedLayout>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
