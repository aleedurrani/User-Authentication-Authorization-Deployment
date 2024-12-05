import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/Singup";
import LoginPage from "./pages/Login";
import Profile from "./pages/Profile";
import AdminPage from "./pages/SignupRequestsList";
import ProtectedRouteAdmin from "./components/ProtectedRouteAdmin";
import AdminUserManagement from "./pages/UserManagement";
import AdminRoleChange from "./pages/RoleChange";
import PermissionChangeAdmin from "./pages/PermissionChange";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/profile"
          element={<ProtectedRouteAdmin element={Profile} />}
        />
        {/* <Route path="/admin" element={<ProtectedRoute element={AdminPage} />} /> */}
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="/adminUserManagement"
          element={<ProtectedRouteAdmin element={AdminUserManagement} />}
        />
        <Route
          path="/manageRole/:user_id"
          element={<ProtectedRouteAdmin element={AdminRoleChange} />}
        />
        <Route
          path="/managePermissions/:user_id"
          element={<ProtectedRouteAdmin element={PermissionChangeAdmin} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
