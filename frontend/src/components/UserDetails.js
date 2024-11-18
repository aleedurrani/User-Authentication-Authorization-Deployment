import React from 'react';

const UserDetails = ({ user }) => {
  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-2">User Details</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Status:</strong> {user.status}</p>
    </div>
  );
};

export default UserDetails;