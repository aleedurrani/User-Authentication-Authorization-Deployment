import React, { useState, useEffect } from "react";
import axios from "axios";
import SignupRequestItem from "../components/SignupRequestItem";

function SignupRequestsList() {
  const [requests, setRequests] = useState([]);
  const [emailFilter, setEmailFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const baseUrl = "http://localhost:3001";

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/signup-requests`, {
        params: {
          email: emailFilter,
          role: roleFilter,
        },
      });
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching signup requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.post(`${baseUrl}/api/signup-requests/${id}/approve`);
      fetchRequests();
    } catch (error) {
      console.error("Error approving signup request:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`${baseUrl}/api/signup-requests/${id}/reject`);
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting signup request:", error);
    }
  };

  const handleSearch = () => {
    fetchRequests();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Admin Dashboard - Signup Requests
      </h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Filter Signup Requests</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Filter by Email"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          />
          <input
            type="text"
            placeholder="Filter by Requested Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Pending Signup Requests</h2>
        <table className="min-w-full bg-white">
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
            {requests.length > 0 ? (
              requests.map((request) => (
                <SignupRequestItem
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No pending signup requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SignupRequestsList;
