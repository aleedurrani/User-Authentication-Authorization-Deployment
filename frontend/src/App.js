import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/Signup";
import LoginPage from "./pages/Login";
import Profile from "./pages/Profile";
import Requests from "./pages/Admin/Requests";
import Permissions from "./pages/Admin/Permissions"; 
import Roles from "./pages/Admin/Roles"; 
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoutes";
import NotAuthorized from "./pages/NotAuthorized";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/requests"
          element={
            <AdminRoute>
              <Requests />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/roles"
          element={
            <AdminRoute>
              <Roles />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/permissions"
          element={
            <AdminRoute>
              <Permissions />
            </AdminRoute>
          }
        />

        <Route path="/not-authorized" element={<NotAuthorized />} />
      </Routes>
    </Router>
  );
};

export default App;