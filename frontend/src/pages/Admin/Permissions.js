import React, { useState, useEffect } from 'react';
import SearchBar from '../../components/SearchBar';
import UserDetails from '../../components/UserDetails';
import PermissionsList from '../../components/PermissionsList';

const Permissions = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [user, setUser] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/auth/admin/permissions', {
          headers: {
            'Content-Type': 'application/json',
            token: token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAllPermissions(data);
        } else {
          setError('Failed to fetch permissions.');
        }
      } catch (err) {
        setError('An error occurred while fetching permissions.');
      }
    };

    fetchPermissions();
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
      const response = await fetch(`http://localhost:3001/auth/admin/users?email=${searchEmail}`, {
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
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

  const handleAddPermission = (permission) => {
    if (!user.permissions.includes(permission)) {
      setUser({ ...user, permissions: [...user.permissions, permission] });
    }
  };

  const handleRemovePermission = (permission) => {
    setUser({ ...user, permissions: user.permissions.filter(perm => perm !== permission) });
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    setActionMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/auth/admin/users/${user._id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
        body: JSON.stringify({ permissions: user.permissions }),
      });

      if (response.ok) {
        setActionMessage('Permissions updated successfully.');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update permissions.');
      }
    } catch (err) {
      setError('An error occurred while updating permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage User Permissions</h1>

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

      {/* User Details and Permissions */}
      {user && (
        <div className="space-y-6">
          <UserDetails user={user} />

          <PermissionsList
            currentPermissions={user.permissions}
            availablePermissions={allPermissions.filter(perm => !user.permissions.includes(perm))}
            onAdd={handleAddPermission}
            onRemove={handleRemovePermission}
          />

          <button
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default Permissions;