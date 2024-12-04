import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldPlus,
    ChevronLeft,
    PlusCircle,
    MinusCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';

const PermissionInput = ({ onPermissionAdd }) => {
    const [permission, setPermission] = useState('');
    const [error, setError] = useState('');

    const validatePermission = (value) => {
        const permissionRegex = /^[a-z]+(_[a-z]+)*$/;
        return permissionRegex.test(value);
    };

    const handleAddPermission = () => {
        if (!permission) {
            setError('Permission cannot be empty');
            return;
        }

        if (!validatePermission(permission)) {
            setError('Use lowercase with underscores (e.g., view_patient_data)');
            return;
        }

        onPermissionAdd(permission);
        setPermission('');
        setError('');
    };

    return (
        <div className="space-y-2">
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={permission}
                    onChange={(e) => setPermission(e.target.value.toLowerCase())}
                    placeholder="Enter permission (e.g., view_patient_data)"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    onClick={handleAddPermission}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <PlusCircle className="w-5 h-5" />
                </button>
            </div>
            {error && (
                <p className="text-xs text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" /> {error}
                </p>
            )}
        </div>
    );
};

const CreateRoles = () => {
    const [activeTab, setActiveTab] = useState('primary');
    const [primaryRoles, setPrimaryRoles] = useState([]);
    const [roleName, setRoleName] = useState('');
    const [permissions, setPermissions] = useState([]);
    const [selectedPrimaryRole, setSelectedPrimaryRole] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPrimaryRoles = async () => {
            try {
                const response = await fetch('http://localhost:3001/admin/getAllPrimaryRoles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': localStorage.getItem('token')
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch primary roles');
                }

                const data = await response.json();
                setPrimaryRoles(data);
            } catch (error) {
                setError(error.message);
            }
        };

        if (activeTab === 'sub') {
            fetchPrimaryRoles();
        }
    }, [activeTab]);

    const addPermission = (permission) => {
        if (!permissions.includes(permission)) {
            setPermissions([...permissions, permission]);
        }
    };

    const removePermission = (permissionToRemove) => {
        setPermissions(permissions.filter(p => p !== permissionToRemove));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const endpoint = activeTab === 'primary' 
                ? 'http://localhost:3001/admin/createPrimaryRole'
                : 'http://localhost:3001/admin/createSubRole';

            const payload = activeTab === 'primary'
                ? { roleName, permissions }
                : { roleName, primaryRole: selectedPrimaryRole, permissions };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                navigate('/adminProfile');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Role creation failed');
            }
        } catch (error) {
            setError(error.message);
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
                                onClick={() => navigate('/adminProfile')}
                                className="mr-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                                Create New Roles
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-6 mt-6">
                <div className="bg-white rounded-full p-1 flex space-x-2 shadow-sm border border-gray-200">
                    <button
                        onClick={() => setActiveTab('primary')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'primary'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Create Primary Role
                    </button>
                    <button
                        onClick={() => setActiveTab('sub')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'sub'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Create Sub Role
                    </button>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 pb-12">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center">
                        <XCircle className="w-6 h-6 mr-2" />
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <ShieldPlus className="w-6 h-6 text-indigo-600" />
                        <h2 className="text-lg font-medium text-gray-900">
                            {activeTab === 'primary' ? 'Create Primary Role' : 'Create Sub Role'}
                        </h2>
                    </div>

                    {activeTab === 'sub' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Primary Role
                            </label>
                            <select
                                value={selectedPrimaryRole}
                                onChange={(e) => setSelectedPrimaryRole(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select a primary role</option>
                                {primaryRoles.map(role => (
                                    <option key={role.roleName} value={role.roleName}>
                                        {role.roleName.charAt(0).toUpperCase() + role.roleName.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role Name
                        </label>
                        <input
                            type="text"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            placeholder="Enter role name"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Permissions
                        </label>
                        <PermissionInput onPermissionAdd={addPermission} />

                        <div className="mt-4 flex flex-wrap gap-2">
                            {permissions.map(permission => (
                                <div
                                    key={permission}
                                    className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {permission}
                                    <button
                                        onClick={() => removePermission(permission)}
                                        className="ml-2 text-indigo-500 hover:text-indigo-700"
                                    >
                                        <MinusCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={handleSubmit}
                            disabled={
                                !roleName || 
                                permissions.length === 0 || 
                                (activeTab === 'sub' && !selectedPrimaryRole) || 
                                isLoading
                            }
                            className={`flex items-center px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${
                                roleName && 
                                permissions.length > 0 && 
                                (activeTab !== 'sub' || selectedPrimaryRole) && 
                                !isLoading
                                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-sm hover:shadow'
                                    : 'bg-gray-300 cursor-not-allowed'
                            }`}
                        >
                            Create Role
                            <PlusCircle className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateRoles;