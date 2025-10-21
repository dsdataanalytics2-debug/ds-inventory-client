import React, { useState, useEffect } from 'react';
import { Activity, Clock, User, Target, Shield, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { apiCall, canViewAllActivities, getCurrentUserId, getUser } from '../utils/auth';

interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  target: string;
  details: string | null;
  timestamp: string;
  username: string;
  user_role: string;
}

interface ActivityLogResponse {
  logs: ActivityLog[];
}

const ActivityHistory = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'own' | 'all'>('own');

  const currentUser = getUser();
  const canViewAll = canViewAllActivities();
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    fetchActivityLogs();
  }, [viewMode]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      
      // Build URL based on permissions and view mode
      let url = '/activity-logs';
      
      // If user can't view all activities, or they chose to view only their own
      if (!canViewAll || viewMode === 'own') {
        url += `?user_id=${currentUserId}`;
      }
      
      const response = await apiCall(url);
      const data: ActivityLogResponse = await response.json();
      
      // Additional client-side filtering for security
      let filteredLogs = data.logs || [];
      if (!canViewAll) {
        filteredLogs = filteredLogs.filter(log => log.user_id === currentUserId);
      }
      
      setActivityLogs(filteredLogs);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch activity logs');
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'add product':
        return '📦';
      case 'sell product':
        return '💰';
      case 'create user':
        return '👥';
      case 'delete user':
        return '🗑️';
      case 'delete add history':
      case 'delete sell history':
        return '❌';
      default:
        return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'add product':
        return 'text-green-600 bg-green-50';
      case 'sell product':
        return 'text-blue-600 bg-blue-50';
      case 'create user':
        return 'text-purple-600 bg-purple-50';
      case 'delete user':
      case 'delete add history':
      case 'delete sell history':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-orange-100 text-orange-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Activity className="w-6 h-6 text-blue-600 mr-2" />
                <h1 className="text-2xl font-bold text-gray-800">Activity History</h1>
                <div className="ml-4 flex items-center">
                  <Shield className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-600">
                    {canViewAll ? 'Admin View' : 'Personal View'}
                  </span>
                </div>
              </div>
              
              {/* View Mode Toggle - Only show for admins */}
              {canViewAll && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">View:</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('own')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        viewMode === 'own'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      My Activities
                    </button>
                    <button
                      onClick={() => setViewMode('all')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        viewMode === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Shield className="w-4 h-4 inline mr-1" />
                      All Activities
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading activity logs...</span>
              </div>
            ) : (
              <>
                {activityLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No activity logs found.</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Activity logs will appear here as users perform actions in the system.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="text-2xl">{getActionIcon(log.action)}</div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                                  {log.action}
                                </span>
                                <span className="text-sm text-gray-500">on</span>
                                <span className="text-sm font-medium text-gray-700">{log.target}</span>
                              </div>
                              
                              {log.details && (
                                <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                              )}
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span>{log.username}</span>
                                  <span className={`inline-flex px-1 py-0.5 text-xs font-medium rounded ${getRoleBadgeColor(log.user_role)}`}>
                                    {log.user_role}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDate(log.timestamp)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
};

export default ActivityHistory;
