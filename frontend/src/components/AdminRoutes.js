import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ element: Component, ...rest }) => {
  const [isAdmin, setIsAdmin] = useState(null); 

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/auth/admin/verifyAdmin', {
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

  return isAdmin ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/not-authorized" replace />
  );
};

export default AdminRoute;