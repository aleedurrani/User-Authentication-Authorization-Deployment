import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/Singup";
import LoginPage from "./pages/Login";
import Profile from "./pages/Profile";
import Requests from "./pages/Requests";
import RequestsAdmin from "./pages/Admin/RequestsAdmin";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleChangeRequest from "./pages/RoleChange";
import PermissionChangeRequest from "./pages/PermissionChange";
import ProtectedRouteAdmin from "./components/ProtectedRouteAdmin";
import ProfileAdmin from "./pages/Admin/ProfileAdmin";
import AdminUserManagement from "./pages/Admin/UserManagement";
import AdminRoleChange from "./pages/Admin/RoleChange";
import PermissionChangeAdmin from "./pages/Admin/PermissionChange";
import Dashboard from "./pages/Admin/Dashboard";
import CreateRoles from "./pages/Admin/CreateRole";

const App = () => {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<SignupPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/reset-password" element={<ResetPassword/>} />

        <Route path="/role-Change" element={<ProtectedRoute element={RoleChangeRequest} />} />
        <Route path="/permission-Change" element={<ProtectedRoute element={PermissionChangeRequest} />} />
        <Route path="/requests" element={<ProtectedRoute element={Requests} />}/>
        <Route path="/profile" element={<ProtectedRoute element={Profile} />}/>

        <Route path="/adminProfile" element={<ProtectedRouteAdmin element={ProfileAdmin} />}/>
        <Route path="/dashboard" element={<ProtectedRouteAdmin element={Dashboard} />}/>
        <Route path="/adminRequests" element={<ProtectedRouteAdmin element={RequestsAdmin} />}/>
        <Route path="/adminUserManagement" element={<ProtectedRouteAdmin element={AdminUserManagement} />}/>
        <Route path="/createRole" element={<ProtectedRouteAdmin element={CreateRoles} />}/>
        <Route path="/manageRole/:user_id" element={<ProtectedRouteAdmin element={AdminRoleChange} />}/>
        <Route path="/managePermissions/:user_id" element={<ProtectedRouteAdmin element={PermissionChangeAdmin} />}/>
      </Routes>
    </Router>
  );
};

export default App;
