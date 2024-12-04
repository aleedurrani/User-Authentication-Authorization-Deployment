import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"
import { User, ChevronLeft, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const InsightsDashboard = () => {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('http://localhost:3001/dashboard/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            token: localStorage.getItem("token"),
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch insights');
        }

        const data = await response.json();
        setInsights(data);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const processRoleHierarchyData = () => {
    const roleData = insights.roleInsights.primaryRoles;

    return Object.entries(roleData)
      .sort(([, detailsA], [, detailsB]) => {
        return (detailsB.subroles.length - detailsA.subroles.length);
      })
      .map(([primaryRole, details]) => ({
        primaryRole,
        userCount: details.userCount || 0,
        subroles: details.subroles
      }));
  };

  const processRequestInsights = () => {
    const requestTypeCounts = insights.requestInsights.requestTypeCounts;
    const requestStatusCounts = insights.requestInsights.requestStatusCounts;

    // Group by request type and status
    const requestInsightsSummary = {
      signup: { total: 0, approved: 0, rejected: 0 },
      'role change': { total: 0, approved: 0, rejected: 0 },
      'permission change': { total: 0, approved: 0, rejected: 0 }
    };

    requestTypeCounts.forEach(item => {
      requestInsightsSummary[item.requestType.toLowerCase()].total = item.count;
    });

    requestStatusCounts.forEach(item => {
      if (item.status === 'approved') {
        requestInsightsSummary[item.requestType.toLowerCase()].approved = item.count;
      } else if (item.status === 'rejected') {
        requestInsightsSummary[item.requestType.toLowerCase()].rejected = item.count;
      }else if (item.status === 'pending') {
        requestInsightsSummary[item.requestType.toLowerCase()].pending = item.count;
      }
    });

    return requestInsightsSummary;
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-pulse text-gray-400 font-light">
        Loading Insights...
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-screen text-red-400">
      {error}
    </div>
  );

  const requestInsights = processRequestInsights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
                Insights
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Requests Insights Section */}
        <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-800 mb-8 flex items-center bg-white p-3 rounded-lg w-fit border border-gray-200">
            <FileText className="mr-3 w-5 h-5 text-indigo-600" /> Requests Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
            {Object.entries(requestInsights).map(([requestType, data]) => (
              <div 
                key={requestType} 
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all "
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-800 capitalize">
                    {requestType} 
                  </h3>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="text-lg text-indigo-500 font-semibold">
                      {data.total}
                    </span>
                  </div>
                </div>
                <div className="space-y-4 border-t border-gray-200 pt-2 gap-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center text-yellow-600 ">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <span className="font-semibold text-yellow-500">{data.pending || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Approved</span>
                    </div>
                    <span className="font-semibold text-green-600">{data.approved}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-600">
                      <XCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Rejected</span>
                    </div>
                    <span className="font-semibold text-gray-600">{data.rejected}</span>
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Roles Insights Section */}
        <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-8 flex items-center bg-white p-3 rounded-lg w-fit border border-gray-200">
            <User className="mr-3 w-5 h-5 text-indigo-600" /> Roles Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
            {processRoleHierarchyData().map((role, index) => (
              <div
                key={role.primaryRole}
                className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-800">
                    {role.primaryRole}
                  </h3>
                  <User className="h-5 ml-auto w-5 mr-2 text-gray-500" />
                  <span className="text-lg mr-2 text-indigo-500 font-semibold">
                    {role.userCount} 
                  </span>
                </div>
                {role.subroles.length > 0 ? (
                  <div className="space-y-1">
                    <div className="border-t border-gray-200 pt-2">
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        Subroles:
                      </p>
                      {role.subroles.map((subrole, index) => (
                        <div 
                          key={index} 
                          className="
                            group 
                            relative 
                            inline-flex 
                            items-center 
                            px-3
                            m-1
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
                          {subrole}
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
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    No subroles available
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default InsightsDashboard;