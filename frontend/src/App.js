import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/Signup";
import LoginPage from "./pages/Login";
import Profile from "./pages/Profile";
import Requests from "./pages/Admin/Requests.js";
import Roles from "./pages/Admin/Roles.js";
import Permissions from "./pages/Admin/Permissions.js";
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
          element={<ProtectedRoute element={Profile} />}
        />

        <Route
          path="/admin/requests"
          element={<AdminRoute element={Requests} />}
        />

        <Route
          path="/admin/roles"
          element={<AdminRoute element={Roles} />}
        />

        <Route
          path="/admin/permissions"
          element={<AdminRoute element={Permissions} />}
        />

        <Route path="/not-authorized" element={<NotAuthorized />} />
      </Routes>
    </Router>
  );
};

export default App;