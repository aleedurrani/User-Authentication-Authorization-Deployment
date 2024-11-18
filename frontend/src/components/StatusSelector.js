import React from 'react';

const StatusSelector = ({ selectedStatus, onChange }) => {
  return (
    <select
      value={selectedStatus}
      onChange={onChange}
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="suspended">Suspended</option>
    </select>
  );
};

export default StatusSelector;