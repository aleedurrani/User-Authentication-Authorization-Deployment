import React, { useState, useEffect } from 'react';
import SearchBar from '../../components/SearchBar';
import UserDetails from '../../components/UserDetails';
import RoleSelector from '../../components/RoleSelector';
import StatusSelector from '../../components/StatusSelector';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Roles = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [user, setUser] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const fetchRolesAndPermissions = async () => {
      try {
        const token = localStorage.getItem('token');

        const rolesResponse = await fetch(`${API_BASE_URL}/auth/admin/permissions`, {
          headers: {
            'Content-Type': 'application/json',
            token: token,
          },
        });

        let rolesData = []; 

        if (rolesResponse.ok) {
          rolesData = await rolesResponse.json();
          setAllRoles(rolesData);
        } else {
          setError('Failed to fetch roles.');
        }

        if (rolesResponse.ok && rolesData.length > 0) {
          const allPerms = [];
          rolesData.forEach(role => {
            role.permissions.forEach(perm => allPerms.push(perm));
          });
          setAllPermissions([...new Set(allPerms)]);
        }
      } catch (err) {
        setError('An error occurred while fetching roles and permissions.');
      }
    };

    fetchRolesAndPermissions();
  }, []);

  const handleSearch = async () => {
    if (!searchEmail) {
      setError('Please enter an email to search.');
      return;
    }

    setLoading(true);
    setError('');
    setActionMessage('');
    setUser(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/admin/users?email=${searchEmail}`, {
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setSelectedRole(data.role);
        setSelectedStatus(data.status);
      } else if (response.status === 404) {
        setError('User not found.');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch user.');
      }
    } catch (err) {
      setError('An error occurred while searching for the user.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    if (!selectedRole && !selectedStatus) {
      setError('Please select at least one field to update.');
      return;
    }

    setLoading(true);
    setError('');
    setActionMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/admin/users/${user._id}/role-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
        body: JSON.stringify({
          role: selectedRole || undefined,
          status: selectedStatus || undefined,
        }),
      });

      if (response.ok) {
        setActionMessage('User role and/or status updated successfully.');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update user.');
      }
    } catch (err) {
      setError('An error occurred while updating the user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage User Role and Status</h1>

      {/* Search Bar */}
      <div className="flex mb-6">
        <SearchBar
          placeholder="Search user by email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Action Messages */}
      {actionMessage && <p className="mb-4 text-green-500">{actionMessage}</p>}
      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Loading Indicator */}
      {loading && <p>Loading...</p>}

      {/* User Details and Role/Status Update */}
      {user && (
        <div className="space-y-6">
          <UserDetails user={user} />

          <div className="p-4 bg-white rounded-md shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Update Role and Status</h3>
            
            {/* Role Selection */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Role</label>
              <RoleSelector
                roles={allRoles}
                selectedRole={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              />
            </div>

            {/* Status Selection */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Status</label>
              <StatusSelector
                selectedStatus={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              />
            </div>

            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;