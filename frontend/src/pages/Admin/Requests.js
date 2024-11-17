// src/pages/Admin/Requests.js
import React, { useEffect, useState } from 'react';
import AdminRoute from '../../components/AdminRoutes';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchRoles();
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchEmail, searchRole, requests]);

  const fetchRoles = async () => {
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
        setRoles(data);
      } else {
        console.error('Failed to fetch roles.');
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/auth/admin/requests', {
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
        setFilteredRequests(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch requests.');
      }
    } catch (err) {
      setError('An error occurred while fetching requests.');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let tempRequests = [...requests];
    if (searchEmail) {
      tempRequests = tempRequests.filter(request =>
        request.requestData.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }
    if (searchRole) {
      tempRequests = tempRequests.filter(request =>
        request.requestData.role.toLowerCase().includes(searchRole.toLowerCase())
      );
    }
    setFilteredRequests(tempRequests);
  };

  const handleApprove = async (id) => {
    setActionMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/auth/admin/requests/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
      });

      if (response.ok) {
        setActionMessage('Request approved successfully.');
        // Remove the approved request from the list
        setRequests(requests.filter(request => request._id !== id));
      } else {
        const errorData = await response.json();
        setActionMessage(errorData.message || 'Failed to approve request.');
      }
    } catch (err) {
      setActionMessage('An error occurred while approving the request.');
    }
  };

  const handleReject = async (id) => {
    setActionMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/auth/admin/requests/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
      });

      if (response.ok) {
        setActionMessage('Request rejected successfully.');
        // Remove the rejected request from the list
        setRequests(requests.filter(request => request._id !== id));
      } else {
        const errorData = await response.json();
        setActionMessage(errorData.message || 'Failed to reject request.');
      }
    } catch (err) {
      setActionMessage('An error occurred while rejecting the request.');
    }
  };

  const getPermissions = (roleName) => {
    const role = roles.find(r => r.roleName === roleName);
    return role ? role.permissions : ['No permissions found'];
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Signup Requests</h1>

      {/* Search Filters */}
      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search by Email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="px-4 py-2 border rounded-md w-1/3"
        />
        <input
          type="text"
          placeholder="Search by Role"
          value={searchRole}
          onChange={(e) => setSearchRole(e.target.value)}
          className="px-4 py-2 border rounded-md w-1/3"
        />
        <button
          onClick={fetchRequests}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Refresh
        </button>
      </div>

      {/* Action Message */}
      {actionMessage && <p className="mb-4 text-green-500">{actionMessage}</p>}

      {/* Error Message */}
      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Loading State */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Requested Role</th>
                <th className="py-2 px-4 border-b">Permissions</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No pending signup requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(request => (
                  <tr key={request._id}>
                    <td className="py-2 px-4 border-b">{request.requestData.name}</td>
                    <td className="py-2 px-4 border-b">{request.requestData.email}</td>
                    <td className="py-2 px-4 border-b">{request.requestData.role}</td>
                    <td className="py-2 px-4 border-b">
                      <ul className="list-disc list-inside">
                        {getPermissions(request.requestData.role).map((perm, index) => (
                          <li key={index}>{perm}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleApprove(request._id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-md mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Requests;
