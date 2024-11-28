import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock,
  ChevronLeft, 
  Shield,
  ArrowRight,
  CheckCircle,
  Plus,
  XCircle,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon
} from 'lucide-react';

const PermissionChangeRequest = () => {
  const [currentPermissions, setCurrentPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const permissionsPerPage = 6;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPermissions = async () => {
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
        setCurrentPermissions(userData.permissions || []);

        // Fetch available permissions dynamically
        const availablePermissionsResponse = await fetch(
          "http://localhost:3001/auth/getAvailablePermissions",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );

        if (!availablePermissionsResponse.ok) {
          throw new Error("Failed to fetch available permissions");
        }

        const permissionsData = await availablePermissionsResponse.json();
        
        // Flatten the available role permissions
        const flattenedPermissions = permissionsData.availableRolePermissions.flat();
        
        // Remove duplicates and permissions already held
        const uniqueAvailablePermissions = [...new Set(flattenedPermissions)]
          .filter(permission => !currentPermissions.includes(permission));

        setAvailablePermissions(uniqueAvailablePermissions);

      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchPermissions();
  }, [currentPermissions]);

  const handlePermissionToggle = (permission) => {
    setSelectedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  // Pagination calculations
  const indexOfLastPermission = currentPage * permissionsPerPage;
  const indexOfFirstPermission = indexOfLastPermission - permissionsPerPage;
  const currentPermissionSet = availablePermissions.slice(
    indexOfFirstPermission, 
    indexOfLastPermission
  );

  const totalPages = Math.ceil(availablePermissions.length / permissionsPerPage);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/auth/permissionChange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token')
        },
        body: JSON.stringify({ newPermissions: selectedPermissions }),
      });

      if (response.ok) { 
        navigate('/requests');
      }
    } catch (error) {
      console.error('Failed to submit request:', error);
    }
    setIsLoading(false);
  };

  const formatPermissionName = (permission) => {
    return permission
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderPagination = () => {
    return (
      <div className="flex justify-center items-center space-x-2 mt-6">
      
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        
        <span className="text-sm text-gray-700 px-4">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
        
      </div>
    );
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
                Permission Change Request
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Current Permissions Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="w-6 h-6 text-indigo-600" />
              <h2 className="text-lg font-medium text-gray-900">Current Permissions</h2>
            </div>
            <div className="pl-9">
              <div className="flex flex-wrap gap-2">
                {currentPermissions.map((permission, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5 text-gray-500" />
                    {formatPermissionName(permission)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* New Permissions Selection */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-indigo-600" />
              <h2 className="text-lg font-medium text-gray-900">Request New Permissions</h2>
            </div>
            <div className="pl-9">
              {availablePermissions.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentPermissionSet.map((permission, index) => (
                      <div
                        key={index}
                        onClick={() => handlePermissionToggle(permission)}
                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedPermissions.includes(permission)
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {formatPermissionName(permission)}
                          </span>
                          {selectedPermissions.includes(permission) ? (
                            <CheckCircle className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <Plus className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination Component */}
                  {renderPagination()}
                </>
              ) : (
                <div className="bg-white pr-16 p-8  text-center">
                <div className="flex justify-center mb-6">
                  <XCircle className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No New Permissions Available
                </h3>
                <p className="text-gray-600 mb-6">
                  You have acquired maximum permissions.
                </p>
              </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={selectedPermissions.length === 0 || isLoading}
              className={`flex items-center px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${
                selectedPermissions.length > 0 && !isLoading
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

export default PermissionChangeRequest;