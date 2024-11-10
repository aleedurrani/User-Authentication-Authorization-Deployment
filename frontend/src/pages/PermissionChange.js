import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock,
  ChevronLeft, 
  Shield,
  ArrowRight,
  CheckCircle,
  Plus
} from 'lucide-react';

const PermissionChangeRequest = () => {
  const [currentPermissions, setCurrentPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Available permissions - in practice, fetch this from your API
  const availablePermissions = [
    'view_patient_data',
    'update_patient_records',
    'add_patient_records',
    'delete_patient_records',
    'manage_appointments',
    'access_lab_results',
    'prescribe_medication',
    'view_billing_info'
  ];

  useEffect(() => {
    // Simulate fetching current permissions
    // Replace with actual API call
    const fetchUserPermissions = async () => {
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
        setCurrentPermissions(userData.permissions || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserPermissions();
  }, []);

  const handlePermissionToggle = (permission) => {
    setSelectedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePermissions
                  .filter(permission => !currentPermissions.includes(permission))
                  .map((permission, index) => (
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