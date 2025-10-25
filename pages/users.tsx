import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, UserPlus } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { apiCall, getUser, canCreateUsers, isSuperAdmin } from '../utils/auth';

interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

interface CreateUserData {
  username: string;
  password: string;
  role: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateUserData>({
    username: '',
    password: '',
    role: 'viewer'
  });
  const [creating, setCreating] = useState(false);

  const currentUser = getUser();
  const canCreate = canCreateUsers();
  const isSuperAdminUser = isSuperAdmin();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/users');
      const data = await response.json();
      setUsers(data.users || []);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      console.log('Creating user with data:', createFormData);
      const response = await apiCall('/register', {
        method: 'POST',
        body: JSON.stringify(createFormData)
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (response.ok && result.success) {
        await fetchUsers(); // Refresh user list
        setShowCreateForm(false);
        setCreateFormData({ username: '', password: '', role: 'viewer' });
        setError('');
        setSuccessMessage(result.message || 'User created successfully!');
        setTimeout(() => setSuccessMessage(''), 5000); // Clear after 5 seconds
      } else {
        // Handle validation errors or API errors
        if (result.detail) {
          // FastAPI validation error format
          if (Array.isArray(result.detail)) {
            const errorMsg = result.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join(', ');
            setError(`Validation error: ${errorMsg}`);
          } else if (typeof result.detail === 'string') {
            setError(result.detail);
          } else {
            setError(JSON.stringify(result.detail));
          }
        } else {
          setError(result.message || 'Failed to create user');
        }
      }
    } catch (err: any) {
      setError(`Error creating user: ${err.message || err}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiCall(`/users/${userId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        await fetchUsers(); // Refresh user list
        setError('');
        setSuccessMessage(result.message);
        setTimeout(() => setSuccessMessage(''), 5000); // Clear after 5 seconds
      } else {
        setError(result.message || 'Failed to delete user');
      }
    } catch (err: any) {
      setError(`Error deleting user: ${err.message || err}`);
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
    <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Users className="w-6 h-6 text-blue-600 mr-2" />
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <div className="ml-4 flex items-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    isSuperAdminUser ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {isSuperAdminUser ? 'Super Admin' : 'Admin'} Access
                  </span>
                </div>
              </div>
              {canCreate && (
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{successMessage}</p>
              </div>
            )}

            {/* Create User Form */}
            {showCreateForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Create New User</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        required
                        value={createFormData.username}
                        onChange={(e) => setCreateFormData({...createFormData, username: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={createFormData.password}
                        onChange={(e) => setCreateFormData({...createFormData, password: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={createFormData.role}
                        onChange={(e) => setCreateFormData({...createFormData, role: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        {isSuperAdminUser && <option value="admin">Admin</option>}
                        {isSuperAdminUser && <option value="superadmin">Super Admin</option>}
                      </select>
                      {!isSuperAdminUser && (
                        <p className="text-xs text-gray-500 mt-1">
                          As an Admin, you can only create Editor or Viewer users
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {creating ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Users Table */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading users...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users && users.length > 0 ? users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                            {user.id === currentUser?.id && (
                              <span className="ml-2 text-xs text-blue-600">(You)</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.id !== currentUser?.id && (
                            <>
                              {/* Super Admin can delete anyone, Admin can only delete Viewer/Editor */}
                              {(isSuperAdminUser || (canCreate && user.role !== 'superadmin' && user.role !== 'admin')) && (
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.username)}
                                  className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-md"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              {/* Show restricted message for users that can't be deleted by Admin */}
                              {!isSuperAdminUser && (user.role === 'superadmin' || user.role === 'admin') && (
                                <span className="text-gray-400 text-xs px-2 py-1 bg-gray-100 rounded">
                                  Protected
                                </span>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
};

export default UserManagement;
