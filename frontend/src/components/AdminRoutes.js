import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null); 

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/admin/verifyAdmin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            token: token, 
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      }
    };

    verifyAdmin();
  }, []);

  if (isAdmin === null) {
    return <div>Loading...</div>;
  }

  return isAdmin ? children : <Navigate to="/not-authorized" replace />;
};

export default AdminRoute;