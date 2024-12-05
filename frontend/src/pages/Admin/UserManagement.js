import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
    UserCircle,
    LogOut,
    Home,
    Search,
    Filter,
    UserPlus,
    Shield,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('all');
    const [expandedUsers, setExpandedUsers] = useState(new Set());

    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(10);

    const navigate = useNavigate();

    const searchCategories = [
        { value: 'all', label: 'All Fields', icon: <Search className="w-4 h-4" /> },
        { value: 'email', label: 'Email', icon: <UserCircle className="w-4 h-4" /> },
        { value: 'name', label: 'Name', icon: <UserPlus className="w-4 h-4" /> },
        { value: 'role', label: 'Role', icon: <Shield className="w-4 h-4" /> }
    ];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:3001/admin/getAllUsers', {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        token: localStorage.getItem("token"),
                    },
                });
                const data = await response.json();
                setUsers(data);
                setFilteredUsers(data);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleSearch = (term) => {
        setSearchTerm(term);
        
        const filtered = users.filter(user => {
            const searchValue = term.toLowerCase();
            
            if (searchCategory === 'all') {
                return (
                    user.email.toLowerCase().includes(searchValue) ||
                    user.name.toLowerCase().includes(searchValue) ||
                    user.roles.some(role => role.toLowerCase().includes(searchValue))
                );
            }
            
            switch (searchCategory) {
                case 'email':
                    return user.email.toLowerCase().includes(searchValue);
                case 'name':
                    return user.name.toLowerCase().includes(searchValue);
                case 'role':
                    return user.roles.some(role => role.toLowerCase().includes(searchValue));
                default:
                    return true;
            }
        });
        
        setFilteredUsers(filtered);
    };


    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // Calculate total pages
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Pagination handlers
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // Pagination Controls Component
    const PaginationControls = () => {
        // Generate page numbers to display
        const pageNumbers = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-2">
                   

                    {/* Previous Page */}
                    <button 
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="p-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Page Numbers */}
                    {pageNumbers.map(number => (
                        <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-3 py-1 rounded-lg ${
                                currentPage === number 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {number}
                        </button>
                    ))}

                    {/* Next Page */}
                    <button 
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>

                    
                </div>

                {/* Users Per Page Dropdown */}
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Users per page:</span>
                    <select 
                        value={usersPerPage}
                        onChange={(e) => {
                            setUsersPerPage(Number(e.target.value));
                            setCurrentPage(1);  // Reset to first page
                        }}
                        className="px-2 py-1 border rounded-lg text-sm"
                    >
                        {[10, 25, 50, 100].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Total Users Info */}
                <div className="text-sm text-gray-600">
                    Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                </div>
            </div>
        );
    };



    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const toggleUserExpand = (userId) => {
        const newExpandedUsers = new Set(expandedUsers);
        if (expandedUsers.has(userId)) {
            newExpandedUsers.delete(userId);
        } else {
            newExpandedUsers.add(userId);
        }
        setExpandedUsers(newExpandedUsers);
    };

    const RoleDisplay = ({ roles }) => {
        if (!roles || roles.length === 0) return null;

        return (
            <div className="flex flex-wrap gap-2">
                {roles.map((role, index) => (
                    <div
                        key={index}
                        className="group relative inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-all duration-300 cursor-default shadow-sm"
                    >
                        <UserCircle className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
                        {role}
                    </div>
                ))}
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
                            <UserCircle className="h-8 w-8 text-indigo-600" />
                            <span className="ml-3 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                                User Management
                            </span>
                        </div>
                        <div className="flex items-center space-x-6">
                            <button onClick={() => navigate('/adminProfile')} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-300">
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
                {/* Search Section */}
                <div className="mb-8 flex items-center space-x-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-300"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="relative group">
                        <select
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                            className="appearance-none w-full pl-10 pr-8 py-3 rounded-lg border border-gray-200 text-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-300"
                        >
                            {searchCategories.map(category => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                        <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {filteredUsers && filteredUsers.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Roles
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Details
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentUsers.map((user) => (
                                        <React.Fragment key={user._id}>
                                            <tr className="hover:bg-gray-50 transition-colors duration-300">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <RoleDisplay roles={user.roles} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/manageRole/${user._id}`)}
                                                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-full transition-colors"
                                                        title="Manage User Roles"
                                                        aria-label="Manage User Roles"
                                                    >
                                                        <UserCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/managePermissions/${user._id}`)}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-full transition-colors"
                                                        title="Manage User Permissions"
                                                        aria-label="Manage User Permissions"
                                                    >
                                                        <Shield className="w-5 h-5" />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => toggleUserExpand(user._id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        {expandedUsers.has(user._id) ? (
                                                            <ChevronUp className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedUsers.has(user._id) && (
                                                <tr className="bg-gradient-to-r from-gray-50 to-white border-t border-b border-gray-100">
                                                    <td colSpan="5" className="px-6 py-6">
                                                        <div className="text-sm">
                                                            <div className="flex items-center space-x-2 mb-4">
                                                                <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
                                                                <h4 className="font-semibold text-base text-gray-900">User Details</h4>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                                                    <div className="flex items-center mb-2">
                                                                        <UserCircle className="w-4 h-4 text-gray-400 mr-2" />
                                                                        <span className="text-gray-600 font-medium">Full Name</span>
                                                                    </div>
                                                                    <span className="text-indigo-600 font-semibold">
                                                                        {user.name}
                                                                    </span>
                                                                </div>
                                                                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                                                    <div className="flex items-center mb-2">
                                                                        <Shield className="w-4 h-4 text-gray-400 mr-2" />
                                                                        <span className="text-gray-600 font-medium">Current Roles</span>
                                                                    </div>
                                                                    <RoleDisplay roles={user.roles} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4">
                        <PaginationControls />
                    </div>
                    </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                No Users Found
                            </h3>
                            <p className="text-sm text-gray-500 text-center max-w-sm">
                                Your search did not match any users. Please try a different search term.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminUserManagement;