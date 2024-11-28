import React, { useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import {
    UserCircle,
    ChevronDown,
    ChevronUp,
    Plus,
    Home,
    Shield,
    LogOut,
    Inbox,
    CheckCircle,
    XCircle,
    AlertCircle,
    UserIcon
} from 'lucide-react';

const UserRequests = () => {
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('role');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
   
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

   

    const handleCreateRequest = (type) => {
        navigate(`/${type}-Change`)
        setIsDropdownOpen(false);
    };


    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch('http://localhost:3001/auth/getRequests', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        token: localStorage.getItem("token"),
                    },
                });
                const data = await response.json();
                setRequests(data);
            } catch (error) {
                console.error('Failed to fetch requests:', error);
            }
        };

        fetchRequests();
    }, []);

    const toggleRow = (id) => {
        const newExpandedRows = new Set(expandedRows);
        if (expandedRows.has(id)) {
            newExpandedRows.delete(id);
        } else {
            newExpandedRows.add(id);
        }
        setExpandedRows(newExpandedRows);
    };


    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'text-green-600 bg-green-50';
            case 'rejected':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-yellow-600 bg-yellow-50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return <CheckCircle className="w-4 h-4" />;
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const filteredRequests = requests.filter(request =>
        activeTab === 'role'
            ? request.requestType === 'role change'
            : request.requestType === 'permission change'
    );

    
  const RoleDisplay = React.memo(({ roles }) => {
    // If roles exist and are not empty
    if (!roles || roles.length === 0) return null;

    return (
      <div className="space-y-2">
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
                bg-indigo-50 
                text-indigo-700 
                text-xs 
                font-semibold 
                hover:bg-indigo-100 
                transition-all 
                duration-300 
                cursor-default
                shadow-sm
                hover:shadow-md
              "
            >
              <UserIcon className="mr-1.5 h-3.5 w-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
              {role}
              <div 
                className="
                  absolute 
                  -top-1 
                  -right-1 
                  h-4 
                  w-4 
                  bg-indigo-500 
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <div className="relative group">
                                <UserCircle className="h-8 w-8 text-indigo-600 transform group-hover:scale-110 transition-transform duration-300" />
                                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white" />
                            </div>
                            <span className="ml-3 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                                Request Management
                            </span>
                        </div>
                        <div className="flex items-center space-x-6">
                            <button onClick={() => navigate('/profile')} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-300">
                                <Home className="h-5 w-5 mr-2 text-gray-500" />
                                Home
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transform hover:-translate-y-0.5 transition-all duration-300 shadow-sm hover:shadow"
                            >
                                <LogOut className="h-5 w-5 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>


            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Top Section with Create Button and Tabs */}
                <div className="mb-8 flex flex-col space-y-6">
                    {/* Create Button */}
                    <div className="flex justify-end">
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm hover:shadow"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Request
                           </button>
                        {isDropdownOpen && (
                                <div className="absolute right-29 mt-12 w-58 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                                    <button
                                        onClick={() => handleCreateRequest('role')}
                                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors duration-200"
                                    >
                                        <UserCircle className="w-4 h-4 mr-3 text-indigo-600" />
                                        Acquiring Role Request
                                    </button>
                                    <button
                                        onClick={() => handleCreateRequest('permission')}
                                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors duration-200"
                                    >
                                        <Shield className="w-4 h-4 mr-3 text-indigo-600" />
                                        Permission Change Request
                                    </button>
                                </div>
                            )}
                    </div>

                    {/* Enhanced Tabs */}
                    <div className="flex items-center bg-white rounded-lg p-1.5 shadow-sm border border-gray-200 w-fit">
                        <button
                            onClick={() => setActiveTab('role')}
                            className={`flex items-center px-5 py-2.5 rounded-md font-medium text-sm transition-all duration-300 ${activeTab === 'role'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <UserCircle className={`w-4 h-4 mr-2 ${activeTab === 'role' ? 'text-white' : 'text-gray-400'}`} />
                            Acquiring Role
                        </button>
                        <button
                            onClick={() => setActiveTab('permission')}
                            className={`flex items-center px-5 py-2.5 rounded-md font-medium text-sm transition-all duration-300 ${activeTab === 'permission'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Shield className={`w-4 h-4 mr-2 ${activeTab === 'permission' ? 'text-white' : 'text-gray-400'}`} />
                            Permission Changes
                        </button>
                    </div>
                </div>
                {/* Requests Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="overflow-x-auto">
                        {filteredRequests.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Request Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Details
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredRequests.map((request) => (
                                        <React.Fragment key={request._id}>
                                            <tr className="hover:bg-gray-50 transition-colors duration-300">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {request.requestData.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(request.requestTime).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                        {getStatusIcon(request.status)}
                                                        <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => toggleRow(request._id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        {expandedRows.has(request._id) ? (
                                                            <ChevronUp className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedRows.has(request._id) && (
                                                <tr className="bg-gradient-to-r from-gray-50 to-white border-t border-b border-gray-100">
                                                    <td colSpan="4" className="px-6 py-6">
                                                        <div className="text-sm">
                                                            <div className="flex items-center space-x-2 mb-4">
                                                                <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
                                                                <h4 className="font-semibold text-base text-gray-900">Request Details</h4>
                                                            </div>

                                                            {activeTab === 'role' ? (
                                                                <div className="grid grid-cols-2 gap-6">
                                                                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                                                        <div className="flex items-center mb-2">
                                                                            <UserCircle className="w-4 h-4 text-gray-400 mr-2" />
                                                                            <span className="text-gray-600 font-medium">Existing Role (s)</span>
                                                                        </div>
                                                                        <span className="text-indigo-600 font-semibold">
                                                                           <RoleDisplay roles={request.requestData.roles} /> 
                                                                        </span>
                                                                    </div>
                                                                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                                                        <div className="flex items-center mb-2">
                                                                            <UserCircle className="w-4 h-4 text-gray-400 mr-2" />
                                                                            <span className="text-gray-600 font-medium">Requested New Role</span>
                                                                        </div>
                                                                        <span className="text-indigo-600 font-semibold">
                                                                            {request.requestData.newRole.charAt(0).toUpperCase() + request.requestData.newRole.slice(1)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                                                    <div className="flex items-center mb-3">
                                                                        <Shield className="w-4 h-4 text-gray-400 mr-2" />
                                                                        <span className="text-gray-600 font-medium">Requested Permissions</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {request.requestData.permissions.map((permission, index) => (
                                                                            <span
                                                                                key={index}
                                                                                className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-600 rounded-full text-xs font-medium border border-indigo-200 shadow-sm flex items-center"
                                                                            >
                                                                                <CheckCircle className="w-3 h-3 mr-1.5" />
                                                                                {permission}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {request.status !== 'pending' && (
                                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                                                    <div className="flex items-start space-x-3">
                                                                        <div className={`mt-0.5 p-1 rounded-full ${request.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                                                                            }`}>
                                                                            {request.status === 'approved' ? (
                                                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                                            ) : (
                                                                                <XCircle className="w-4 h-4 text-red-600" />
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <h5 className="font-medium text-gray-900 mb-1">
                                                                                Request {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                                            </h5>
                                                                            <p className="text-gray-500 text-sm">
                                                                                {request.status === 'approved'
                                                                                    ? 'Your request has been reviewed and approved by the administrator.'
                                                                                    : 'Your request has been reviewed and rejected by the administrator.'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-4">
                                <div className="relative mb-6">
                                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center">
                                        <Inbox className="w-12 h-12 text-indigo-600" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <Plus className="w-5 h-5 text-indigo-600" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                    No {activeTab === 'role' ? 'Role Change' : 'Permission Change'} Requests
                                </h3>
                                <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
                                    {activeTab === 'role'
                                        ? "There are no role change requests at the moment. Create a new request to get started."
                                        : "There are no permission change requests at the moment. Create a new request to get started."}
                                </p>
                               
                            </div>
                        )}
                    </div>
                </div>
            </main>

        </div>
    );
};

export default UserRequests;