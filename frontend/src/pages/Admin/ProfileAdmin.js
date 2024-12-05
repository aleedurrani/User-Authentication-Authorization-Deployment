import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircle,
  LogOut,
  Inbox,
  Shield,
  ChevronRight,
  Mail,
  User as UserIcon,
  Clock,
  UserCheck,
  ChevronLeft,
  Settings,
  BarChart3,
  Plus

} from 'lucide-react';



const PermissionsCard = ({ user }) => {
  const permissionsPerPage = 5; // Number of permissions to show per page
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(user.permissions.length / permissionsPerPage);

  // Get permissions for the current page
  const currentPermissions = user.permissions.slice(
    (currentPage - 1) * permissionsPerPage,
    currentPage * permissionsPerPage
  );

  // Pagination controls
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  function formatPermission(permission) {
    return permission
      .split('_')                  // Split the string by underscores
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // Capitalize the first letter of each word
      .join(' ');                  // Join the words together with a space
  }


  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-indigo-500 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Shield className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="ml-3 text-lg font-semibold text-gray-900">Permissions</h3>
        </div>
        <div className="mt-6 space-y-3">
          {currentPermissions.map((permission, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300 cursor-pointer group"
            >
              <span className="text-sm text-gray-700 font-medium">{formatPermission(permission)}</span>
              <div className="p-1 bg-white rounded-lg shadow-sm group-hover:shadow group-hover:scale-110 transition-all duration-300">
                <ChevronRight className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-all ${
              currentPage === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            }`}
          >
            <ChevronLeft />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-all ${
              currentPage === totalPages ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            }`}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = () =>{
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="relative group">
                <UserCircle className="h-8 w-8 text-indigo-600 transform group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <span className="ml-3 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <button onClick={() => navigate('/adminRequests')} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-300">
                <Inbox className="h-5 w-5 mr-2 text-gray-500" />
                Requests
              </button>
              <button onClick={() => navigate('/adminUserManagement')} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-300">
                <Settings className="h-5 w-5 mr-2 text-gray-500" />
                Manage
              </button>
              <button onClick={() => navigate('/dashboard')} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-300">
                <BarChart3 className="h-5 w-5 mr-2 text-gray-500" />
                Insights
              </button>
              <button onClick={() => navigate('/createRole')} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-300">
                <Plus className="h-5 w-5 mr-2 text-gray-500" />
                Create
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
  )
}
const AdminProfile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    username: "",
    status: "",
    role: [],
    joined: "",
    permissions: []
  });

  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/admin/getProfile",
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
        
        setUser(userData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserData();
  }, []);

 

  const RoleDisplay = React.memo(({ roles }) => {
    // If roles exist and are not empty
    if (!roles || roles.length === 0) return null;

    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-500">Roles</p>
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
      {/* Navbar remains the same */}
      <Navbar/>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group hover:border-indigo-500 transition-all duration-300">
            <div className="h-32 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 opacity-90" />
            <div className="p-8 -mt-16">
              <div className="flex items-center">
                <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="h-full w-full rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
                    <UserCircle className="h-14 w-14 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold mt-5 text-gray-900">{user.name}</h2>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: Mail, label: "Email", value: user.email },
                  { 
                    icon: UserIcon, 
                    label: "Primary Role", 
                    value: user.role && user.role.length > 0 
                      ? user.role[0] 
                      : "No Role Assigned" 
                  },
                  { 
                    icon: Clock, 
                    label: "Status", 
                    value: user.status?.charAt(0).toUpperCase() + user.status?.slice(1) 
                  },
                  { icon: UserCheck, label: "Member Since", value: user.joined }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="group flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 transition-all duration-300 cursor-pointer"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow group-hover:scale-110 transition-all duration-300">
                      <item.icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-4 overflow-hidden">
                      <p className="text-sm mb-2 font-medium text-gray-500">{item.label}</p>
                      <div className="text-sm text-gray-900 font-medium truncate">
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Role Display Section */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <RoleDisplay roles={user.role} />
              </div>
            </div>
          </div>

          {/* Permissions Card */}
          <PermissionsCard user={user}/>
        </div>
      </main>
    </div>
  );
};

export default AdminProfile;