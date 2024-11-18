import React from 'react';

const PermissionsList = ({ currentPermissions, availablePermissions, onAdd, onRemove }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Current Permissions */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-2">Current Permissions</h3>
        <ul className="list-disc list-inside">
          {currentPermissions.map((perm, index) => (
            <li key={index} className="flex justify-between items-center">
              {perm}
              <button
                onClick={() => onRemove(perm)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Available Permissions */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-2">Available Permissions</h3>
        <ul className="list-disc list-inside">
          {availablePermissions.map((perm, index) => (
            <li key={index} className="flex justify-between items-center">
              {perm}
              <button
                onClick={() => onAdd(perm)}
                className="text-green-500 hover:text-green-700"
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PermissionsList;