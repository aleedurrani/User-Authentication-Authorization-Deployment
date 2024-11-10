import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircle, 
  ChevronLeft, 
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const RoleChangeRequest = () => {
  const [currentRole, setCurrentRole] = useState('');
  const [newRole, setNewRole] = useState('');
  const [currentPermissions, setCurrentPermissions] = useState([]);
  const [newPermissions, setNewPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Available roles - in practice, fetch this from your API
  const availableRoles = ['doctor', 'nurse', 'patient', 'receptionist', 'pharmacist', 'labTechnician'];

  useEffect(() => {
    // Simulate fetching current role and permissions
    // Replace with actual API call
    const fetchUserRole = async () => {
        try {
            const response = await fetch(
              "http://localhost:3001/auth/getProfile",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  token: localStorage.getItem("token"),
                },
              }
            );
    
            if (!response.ok) {
              throw new Error("Failed to fetch user data");
            }
    
            const userData = await response.json();
            setCurrentRole(userData.role)
            setCurrentPermissions(userData.permissions)
          } catch (error) {
            console.error(error);
          }
    };

    fetchUserRole();
  }, []);

  // Simulate getting new role permissions
  useEffect(() => {
    if (newRole) {
      // Replace with actual API call
      const permissions = {
        doctor: [
          'View Patient Records',
          'Update Patient Status',
          'Prescribe Medication',
          'Order Tests',
          'Manage Appointments',
          'Access Lab Results'
        ],
        nurse: [
          'View Patient Records',
          'Update Patient Status',
          'Manage Appointments'
        ],
        receptionist: [
          'Manage Appointments',
          'View Basic Patient Info',
          'Update Patient Details'
        ]
      };
      
      setNewPermissions(permissions[newRole] || []);
    }
  }, [newRole]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
        const response = await fetch('http://localhost:3001/auth/roleChange', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                token: localStorage.getItem('token')
            },
            body: JSON.stringify({ newRole: newRole}),
        });

        if (response.ok) { navigate('/requests') }

      
    } catch (error) {
      console.error('Failed to submit request:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/requests')}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                Role Change Request
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Current Role Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <UserCircle className="w-6 h-6 text-indigo-600" />
              <h2 className="text-lg font-medium text-gray-900">Current Role</h2>
            </div>
            <div className="pl-9">
              <div className="text-2xl font-semibold text-gray-900 mb-4">
                {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Current Permissions:</h3>
                <div className="flex flex-wrap gap-2">
                  
                {currentPermissions && currentPermissions.length > 0 ? (
  currentPermissions.map((permission, index) => (
    <span
      key={index}
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
    >
      <CheckCircle className="w-4 h-4 mr-1.5 text-gray-500" />
      {permission}
    </span>
  ))
) : (
  <p className="text-sm text-gray-500">No permissions available.</p>
)}
                </div>
              </div>
            </div>
          </div>

          {/* New Role Selection */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-indigo-600" />
              <h2 className="text-lg font-medium text-gray-900">Request New Role</h2>
            </div>
            <div className="pl-9">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full max-w-xs px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 mb-6"
              >
                <option value="">Select a new role</option>
                {availableRoles
                  .filter(role => role.toLowerCase() !== currentRole.toLowerCase())
                  .map(role => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
              </select>

              {newRole && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">New Role Permissions:</h3>
                  <div className="flex flex-wrap gap-2">
                    {newPermissions.map((permission, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5 text-indigo-600" />
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!newRole || isLoading}
              className={`flex items-center px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${
                newRole && !isLoading
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-sm hover:shadow'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Submit Request
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoleChangeRequest;