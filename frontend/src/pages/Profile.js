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
  UserCheck
} from 'lucide-react';

const UserProfile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    username: "",
    status: "",
    role: "",
    joined: "",
    permissions: []
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
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
        setUser(userData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserData();
  }, []);
  
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Navbar */}
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
              <button onClick={() => navigate('/requests')} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-300">
                <Inbox className="h-5 w-5 mr-2 text-gray-500" />
                My Requests
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

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: Mail, label: "Email", value: user.email },
                  { icon: UserIcon, label: "Role", value: user.role },
                  { icon: Clock, label: "Status", value: user.status?.charAt(0).toUpperCase() + user.status?.slice(1) },
                  { icon: UserCheck, label: "Member Since", value: user.joined }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="group flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 transition-all duration-300 cursor-pointer"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow group-hover:scale-110 transition-all duration-300">
                      <item.icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{item.label}</p>
                      <p className="text-sm text-gray-900 font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Permissions Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-indigo-500 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Permissions</h3>
              </div>
              <div className="mt-6 space-y-3">
                {user.permissions.map((permission, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300 cursor-pointer group"
                  >
                    <span className="text-sm text-gray-700 font-medium">{permission}</span>
                    <div className="p-1 bg-white rounded-lg shadow-sm group-hover:shadow group-hover:scale-110 transition-all duration-300">
                      <ChevronRight className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;