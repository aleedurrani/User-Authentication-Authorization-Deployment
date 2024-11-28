import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircle, 
  ChevronLeft, 
  Shield,
  ArrowRight,
  CheckCircle,
  UserIcon,
  XCircle
} from 'lucide-react';

const RoleChangeRequest = () => {
  const [currentRoles, setCurrentRoles] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [currentPermissions, setCurrentPermissions] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [newPermissions, setNewPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noRolesAvailable, setNoRolesAvailable] = useState(false);
  const navigate = useNavigate();

  const CurrentRoleDisplay = React.memo(({ roles }) => {
    if (!roles || roles.length === 0) return null;

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Current Roles:</h3>
        <div className="flex flex-wrap gap-2">
          {roles.map((role, index) => (
            <div 
              key={index} 
              className="
                group 
                relative 
                inline-flex 
                items-center 
                px-3 
                py-1 
                rounded-full 
                bg-gray-100 
                text-gray-700 
                text-xs 
                font-semibold 
                hover:bg-gray-200 
                transition-all 
                duration-300 
                cursor-default
                shadow-sm
                hover:shadow-md
              "
            >
              <UserIcon className="mr-1.5 h-3.5 w-3.5 text-gray-500 group-hover:scale-110 transition-transform" />
              {role.charAt(0).toUpperCase() + role.slice(1)}
              <div 
                className="
                  absolute 
                  -top-1 
                  -right-1 
                  h-4 
                  w-4 
                  bg-gray-500 
                  text-white 
                  rounded-full 
                  flex 
                  items-center 
                  justify-center 
                  text-[0.6rem] 
                  opacity-0 
                  group-hover:opacity-100 
                  transition-opacity 
                  duration-300
                "
              >
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  });

  useEffect(() => {
    // Fetch user profile and available roles
    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await fetch(
          "http://localhost:3001/auth/getProfile",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await profileResponse.json();
        setCurrentRoles(userData.role);
        setCurrentPermissions(userData.permissions);

        // Fetch available roles
        const availableRolesResponse = await fetch(
          "http://localhost:3001/auth/getAvailableRoles",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );

        if (availableRolesResponse.status === 404) {
          setNoRolesAvailable(true);
          return;
        }

        if (!availableRolesResponse.ok) {
          throw new Error("Failed to fetch available roles");
        }

        const rolesData = await availableRolesResponse.json();
        setAvailableRoles(rolesData.availableRoles);

      } catch (error) {
        console.error(error);
        setError(error.message);
      }
    };

    fetchUserData();
  }, []);

  // Update new permissions when a new role is selected
  useEffect(() => {
    if (newRole) {
      const selectedRole = availableRoles.find(role => role.roleName === newRole);
      setNewPermissions(selectedRole ? selectedRole.permissions : []);
    }
  }, [newRole, availableRoles]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/auth/roleChange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token')
        },
        body: JSON.stringify({ newRole: newRole }),
      });

      if (response.ok) { 
        navigate('/requests') 
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit role change request');
      }
    } catch (error) {
      console.error('Failed to submit request:', error);
      setError(error.message);
    }
    setIsLoading(false);
  };

  // No Roles Available Component
  const NoRolesAvailableMessage = () => (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
      <div className="flex justify-center mb-6">
        <XCircle className="w-16 h-16 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        No New Roles Available
      </h3>
      <p className="text-gray-600 mb-6">
        You don't have any new roles to acquire. Try requesting for new permissions instead.
      </p>
    </div>
  );

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
                Acquiring Role Request
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {noRolesAvailable ? (
          <NoRolesAvailableMessage />
        ) : (
          <div className="space-y-8">
            {/* Current Role Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <UserCircle className="w-6 h-6 text-indigo-600" />
                <h2 className="text-lg font-medium text-gray-900">Current Roles</h2>
              </div>
              <div className="pl-9">
                <div className="space-y-4">
                  <CurrentRoleDisplay roles={currentRoles} />
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
                    .filter(role => 
                      !currentRoles.map(r => r.toLowerCase()).includes(role.roleName.toLowerCase())
                    )
                    .map(role => (
                      <option key={role.roleName} value={role.roleName}>
                        {role.roleName.charAt(0).toUpperCase() + role.roleName.slice(1)}
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
        )}
      </main>
    </div>
  );
};

export default RoleChangeRequest;