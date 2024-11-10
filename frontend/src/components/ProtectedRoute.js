import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Null initially while verifying

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const userFullName = localStorage.getItem('userFullName');

      if (!token || !userId || !userFullName) {
        console.log(token, userId, userFullName)
        setIsAuthenticated(false);
        return;
      }

      try {
        // Call your backend to verify the token along with userId and userFullName
        const response = await fetch('http://localhost:3001/auth/protectedRoute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
             token: token, // Send token in authorization header
          },
          body: JSON.stringify({ userId, userFullName }), // Send userId and userFullName in the request body
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token'); 
          localStorage.removeItem('userId');
          localStorage.removeItem('userFullName');
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, []);

  if (isAuthenticated === null) {
    // You can add a loading spinner here while verifying token
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
