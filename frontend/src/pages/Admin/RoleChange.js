import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    UserCircle,
    ChevronLeft,
    Shield,
    ArrowRight,
    CheckCircle,
    UserIcon,
    XCircle,
    MinusCircle
} from 'lucide-react';

// Reusable components
const RoleChip = ({ role, index }) => (
    <div
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
);

const PermissionList = ({ permissions, type = 'current' }) => {
    if (!permissions || permissions.length === 0) {
        return <p className="text-sm text-gray-500">No permissions available.</p>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {permissions.map((permission, index) => (
                <span
                    key={index}
                    className={`
            inline-flex 
            items-center 
            px-3 
            py-1 
            rounded-full 
            text-sm 
            font-medium 
            ${type === 'current'
                            ? 'bg-gray-100 text-gray-700'
                            : type === 'new'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-red-50 text-red-700'
                        }
          `}
                >
                    <CheckCircle
                        className={`
              w-4 
              h-4 
              mr-1.5 
              ${type === 'current'
                                ? 'text-gray-500'
                                : type === 'new'
                                    ? 'text-indigo-600'
                                    : 'text-red-600'
                            }
            `}
                    />
                    {permission}
                </span>
            ))}
        </div>
    );
};

// No Roles Available Messages
const NoAddRolesAvailableMessage = () => (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
        <div className="flex justify-center mb-6">
            <XCircle className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
            No New Roles Available
        </h3>
        <p className="text-gray-600 mb-6">
            This user doesn't have any new roles to acquire. Try adding new permissions instead.
        </p>
    </div>
);

const NoRemoveRolesAvailableMessage = () => (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
        <div className="flex justify-center mb-6">
            <MinusCircle className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Roles to Remove
        </h3>
        <p className="text-gray-600 mb-6">
            This user currently has no roles that can be removed. Ensure at least one role remains.
        </p>
    </div>
);

// Main Component
const AdminRoleChange = () => {
    const { user_id } = useParams();
    const [currentRoles, setCurrentRoles] = useState([]);
    const [currentPermissions, setCurrentPermissions] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [newRole, setNewRole] = useState('');
    const [roleToRemove, setRoleToRemove] = useState('');
    const [newPermissions, setNewPermissions] = useState([]);
    const [permissionsToRemove, setPermissionsToRemove] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [noRolesAvailable, setNoRolesAvailable] = useState(false);
    const [activeTab, setActiveTab] = useState('add'); // 'add' or 'remove'
    const navigate = useNavigate();

    // Fetch user data and available roles
    useEffect(() => {
        const fetchUserData = async () => {
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
                setCurrentRoles(userData.role);
                setCurrentPermissions(userData.permissions);

                // Fetch available roles
                const availableRolesResponse = await fetch(
                    "http://localhost:3001/admin/getAvailableRoles",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            token: localStorage.getItem("token"),
                        },
                        body: JSON.stringify({ user_id })
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
    }, [user_id]);

    // Update new permissions when a new role is selected
    useEffect(() => {
        if (newRole) {
            const selectedRole = availableRoles.find(role => role.roleName === newRole);
            setNewPermissions(selectedRole ? selectedRole.permissions : []);
        }
    }, [newRole, availableRoles]);

    // Update permissions to remove when a role is selected for removal
    useEffect(() => {
        if (roleToRemove) {
            const selectedRole = currentRoles.find(role => role === roleToRemove);
            const fetchPermissionsToRemove = async () => {
                try {
                    const response = await fetch('http://localhost:3001/admin/getRolePermissions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            token: localStorage.getItem('token')
                        },
                        body: JSON.stringify({
                            selectedRole,

                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch permissions to remove');
                    }

                    const data = await response.json();
                    setPermissionsToRemove(data.permissions);
                } catch (error) {
                    console.error('Error fetching permissions to remove:', error);
                    setError(error.message);
                }
            };

            fetchPermissionsToRemove();
        } else {
            setPermissionsToRemove([]);
        }
    }, [roleToRemove, currentRoles, availableRoles]);

    // Handle role addition submit
    const handleAddRoleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3001/admin/roleChange', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({
                    newRole: newRole,
                    user_id: user_id
                }),
            });

            if (response.ok) {
                navigate('/adminUserManagement')
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit role change request');
            }
        } catch (error) {
            setError(error.message);
        }
        setIsLoading(false);
    };

    // Handle role removal submit
    const handleRemoveRoleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3001/admin/removeRole', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({
                    roleToRemove: roleToRemove,
                    user_id: user_id
                }),
            });

            if (response.ok) {
                navigate('/adminUserManagement')
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit role removal request');
            }
        } catch (error) {
            setError(error.message);
        }
        setIsLoading(false);
    };

    // Compute roles that can be added or removed
    const availableAddRoles = useMemo(() =>
        availableRoles
            .filter(role =>
                !currentRoles.map(r => r.toLowerCase()).includes(role.roleName.toLowerCase())
            ),
        [availableRoles, currentRoles]
    );

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
                                Manage User Role
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-6 mt-6">
            <div className="bg-white rounded-full p-1 flex space-x-2 shadow-sm border border-gray-200">
                <button
                    onClick={() => setActiveTab('add')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'add'
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Add Role
                </button>
                <button
                    onClick={() => setActiveTab('remove')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'remove'
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Remove Role
                </button>
            </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 pb-12">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {activeTab === 'add' ? (
                    noRolesAvailable ? (
                        <NoAddRolesAvailableMessage />
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
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Current Roles:</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {currentRoles.map((role, index) => (
                                                    <RoleChip key={index} role={role} index={index} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Current Permissions:</h3>
                                            <PermissionList permissions={currentPermissions} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* New Role Selection */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center space-x-3 mb-6">
                                    <Shield className="w-6 h-6 text-indigo-600" />
                                    <h2 className="text-lg font-medium text-gray-900">Add New Role</h2>
                                </div>
                                <div className="pl-9">
                                    <select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        className="w-full max-w-xs px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 mb-6"
                                    >
                                        <option value="">Select a new role</option>
                                        {availableAddRoles.map(role => (
                                            <option key={role.roleName} value={role.roleName}>
                                                {role.roleName.charAt(0).toUpperCase() + role.roleName.slice(1)}
                                            </option>
                                        ))}
                                    </select>

                                    {newRole && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">New Role Permissions:</h3>
                                            <PermissionList permissions={newPermissions} type="new" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button for Add Role */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleAddRoleSubmit}
                                    disabled={!newRole || isLoading}
                                    className={`flex items-center px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${newRole && !isLoading
                                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-sm hover:shadow'
                                        : 'bg-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    Submit Role Addition
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </button>
                            </div>
                        </div>
                    )
                ) : (
                    // Remove Role Tab
                    currentRoles.length === 1 ? (
                        <NoRemoveRolesAvailableMessage />
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
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Current Roles:</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {currentRoles.map((role, index) => (
                                                    <RoleChip key={index} role={role} index={index} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Current Permissions:</h3>
                                            <PermissionList permissions={currentPermissions} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Role Removal Selection */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center space-x-3 mb-6">
                                    <MinusCircle className="w-6 h-6 text-red-600" />
                                    <h2 className="text-lg font-medium text-gray-900">Remove Role</h2>
                                </div>
                                <div className="pl-9">
                                    <select
                                        value={roleToRemove}
                                        onChange={(e) => setRoleToRemove(e.target.value)}
                                        className="w-full max-w-xs px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 mb-6"
                                    >
                                        <option value="">Select a role to remove</option>
                                        {currentRoles
                                            .slice(1) // Skip the first role
                                            .map(role => (
                                                <option key={role} value={role}>
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </option>
                                            ))}
                                    </select>

                                    {roleToRemove && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Permissions to be Removed:</h3>
                                            <PermissionList
                                                permissions={permissionsToRemove}
                                                type="remove"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button for Remove Role */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleRemoveRoleSubmit}
                                    disabled={!roleToRemove || isLoading}
                                    className={`flex items-center px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${roleToRemove && !isLoading
                                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm hover:shadow'
                                        : 'bg-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    Submit Role Removal
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </button>
                            </div>
                        </div>
                    )
                )}
            </main>
        </div>
    );
};

export default AdminRoleChange;
