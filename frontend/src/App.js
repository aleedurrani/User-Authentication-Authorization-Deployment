import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/Singup";
import LoginPage from "./pages/Login";


const App = () => {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<SignupPage/>} />
        <Route path="/login" element={<LoginPage/>} />

      </Routes>
    </Router>
  );
};

export default App;
