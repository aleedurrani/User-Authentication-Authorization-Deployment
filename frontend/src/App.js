import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/Singup";
import LoginPage from "./pages/Login";
import Profile from "./pages/Profile";
import Requests from "./pages/Admin/Requests";
import Roles from "./pages/Admin/Roles";
import Permissions from "./pages/Admin/Permissions";
import ProtectedRoute from "./components/ProtectedRoute";


const App = () => {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<SignupPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        
        <Route
          path="/profile"
          element={<ProtectedRoute element={Profile} />}
        />

        <Route 
        path="/admin/Requests" 
        element={<ProtectedRoute element={Requests} />}
        />

        <Route 
        path="/admin/Roles" 
        element={<ProtectedRoute element={Roles} />}
        />

        <Route 
        path="/admin/Permissions" 
        element={<ProtectedRoute element={Permissions} />}
        />


      </Routes>
    </Router>
  );
};

export default App;
