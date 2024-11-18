import React from 'react';

const RoleSelector = ({ roles, selectedRole, onChange }) => {
  return (
    <select
      value={selectedRole}
      onChange={onChange}
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select Role</option>
      {roles.map((role, index) => (
        <option key={index} value={role.roleName}>
          {role.roleName}
        </option>
      ))}
    </select>
  );
};

export default RoleSelector;