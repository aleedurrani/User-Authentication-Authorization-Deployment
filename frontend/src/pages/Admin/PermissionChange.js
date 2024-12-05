import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Lock,
  ChevronLeft, 
  Shield,
  ArrowRight,
  CheckCircle,
  Plus,
  XCircle,
  ChevronRight,
  MinusCircle,
} from 'lucide-react';

// Utility function to format permission names
const formatPermissionName = (permission) => {
  return permission
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Pagination Component
const PermissionPagination = ({ 
  currentPage, 
  totalPages, 
  onPreviousPage, 
  onNextPage 
}) => (
  <div className="flex justify-center items-center space-x-2 mt-6">
    <button
      onClick={onPreviousPage}
      disabled={currentPage === 1}
      className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
    >
      <ChevronLeft className="w-5 h-5 text-gray-600" />
    </button>
    
    <span className="text-sm text-gray-700 px-4">
      Page {currentPage} of {totalPages}
    </span>
    
    <button
      onClick={onNextPage}
      disabled={currentPage === totalPages}
      className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
    >
      <ChevronRight className="w-5 h-5 text-gray-600" />
    </button>
  </div>
);

// Permission List Component
const PermissionList = ({ 
  permissions, 
  selectedPermissions, 
  onPermissionToggle, 
  emptyMessage,
  emptyIcon: EmptyIcon = XCircle,
  toggleIcon: ToggleIcon = Plus
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const permissionsPerPage = 6;

  // Pagination calculations
  const indexOfLastPermission = currentPage * permissionsPerPage;
  const indexOfFirstPermission = indexOfLastPermission - permissionsPerPage;
  const currentPermissionSet = permissions.slice(
    indexOfFirstPermission, 
    indexOfLastPermission
  );

  const totalPages = Math.ceil(permissions.length / permissionsPerPage);

  return (
    <div className="pl-9">
      {permissions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPermissionSet.map((permission, index) => (
              <div
                key={index}
                onClick={() => onPermissionToggle(permission)}
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
                    <ToggleIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <PermissionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPreviousPage={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            onNextPage={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          />
        </>
      ) : (
        <div className="bg-white pr-16 p-8 text-center">
          <div className="flex justify-center mb-6">
            <EmptyIcon className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {emptyMessage}
          </h3>
        </div>
      )}
    </div>
  );
};

// Main Permission Change Component
const PermissionChangeAdmin = () => {
  const { user_id } = useParams(); 
  const [currentPermissions, setCurrentPermissions] = useState([]);
  const [selectedAddPermissions, setSelectedAddPermissions] = useState([]);
  const [selectedRemovePermissions, setSelectedRemovePermissions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [permissionsToRemove, setPermissionsToRemove] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('add');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // Fetch user profile
        const profileResponse = await fetch(
          "http://localhost:3001/admin/getUserProfile",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
            body: JSON.stringify({ user_id })
          }
        );

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await profileResponse.json();
        setCurrentPermissions(userData.permissions || []);

        // Fetch available permissions dynamically
        const availablePermissionsResponse = await fetch(
          "http://localhost:3001/admin/getAvailablePermissions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
            body: JSON.stringify({ user_id })
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

        const availablePermissionsToRemoveResponse = await fetch(
          "http://localhost:3001/admin/getAvailablePermissionsToRemove",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
            body: JSON.stringify({ user_id })
          }
        );
        
        if (!availablePermissionsToRemoveResponse.ok) {
          throw new Error("Failed to fetch permissions to remove");
        }
        
        const permissionsToRemoveData = await availablePermissionsToRemoveResponse.json();
        
        // Flatten the available role permissions
        const permissionsToRemove = permissionsToRemoveData.availableRemovePermissions.flat();
        
        
        setPermissionsToRemove(permissionsToRemove);

      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchPermissions();
  }, [user_id, currentPermissions]);

  const handleAddPermissionToggle = (permission) => {
    setSelectedAddPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleRemovePermissionToggle = (permission) => {
    setSelectedRemovePermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const requestBody = activeTab === 'add'
        ? { user_id, newPermissions: selectedAddPermissions }
        : { user_id, removePermissions: selectedRemovePermissions };

      const endpoint = activeTab === 'add' 
        ? '/permissionChange' 
        : '/removePermissions';

      const response = await fetch(`http://localhost:3001/admin${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token')
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) { 
        navigate('/adminUserManagement');
      }
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
                onClick={() => navigate('/adminUserManagement')}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                Manage User Permissions
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-full p-1 flex space-x-2 shadow-sm border border-gray-200">
              <button
                onClick={() => setActiveTab('add')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'add' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Add Permissions
              </button>
              <button
                onClick={() => setActiveTab('remove')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'remove' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Remove Permissions
              </button>
            </div>
          </div>

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

          {/* Permissions Selection */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-indigo-600" />
              <h2 className="text-lg font-medium text-gray-900">
                {activeTab === 'add' ? 'Add New Permissions' : 'Remove Existing Permissions'}
              </h2>
            </div>
            
            {activeTab === 'add' ? (
              <PermissionList 
                permissions={availablePermissions}
                selectedPermissions={selectedAddPermissions}
                onPermissionToggle={handleAddPermissionToggle}
                emptyMessage="No New Permissions Available"
                emptyIcon={XCircle}
                toggleIcon={Plus}
              />
            ) : (
              <PermissionList 
                permissions={permissionsToRemove}
                selectedPermissions={selectedRemovePermissions}
                onPermissionToggle={handleRemovePermissionToggle}
                emptyMessage="No Permissions to Remove"
                emptyIcon={MinusCircle}
                toggleIcon={MinusCircle}
              />
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={
                (activeTab === 'add' && selectedAddPermissions.length === 0) ||
                (activeTab === 'remove' && selectedRemovePermissions.length === 0) ||
                isLoading
              }
              className={`flex items-center px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${
                ((activeTab === 'add' && selectedAddPermissions.length > 0) ||
                 (activeTab === 'remove' && selectedRemovePermissions.length > 0)) &&
                !isLoading
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

export default PermissionChangeAdmin;