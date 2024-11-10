import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/Singup";
import LoginPage from "./pages/Login";
import Profile from "./pages/Profile";
import Requests from "./pages/Requests";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleChangeRequest from "./pages/RoleChange";
import PermissionChangeRequest from "./pages/PermissionChange";


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

      </Routes>
    </Router>
  );
};

export default App;
