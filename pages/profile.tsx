import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Eye, EyeOff, Save, X, CheckCircle, AlertCircle, Edit3 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiCall } from '@/utils/auth'

interface UserProfile {
  id: number
  username: string
  name?: string
  role: string
  created_at: string
}

interface FormData {
  name: string
  username: string
  password: string
}

interface ToastMessage {
  type: 'success' | 'error'
  message: string
  show: boolean
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    username: '',
    password: ''
  })
  const [originalData, setOriginalData] = useState<FormData>({
    name: '',
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [toast, setToast] = useState<ToastMessage>({ type: 'success', message: '', show: false })
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile()
  }, [])

  // Check for changes
  useEffect(() => {
    const nameChanged = formData.name !== originalData.name
    const usernameChanged = formData.username !== originalData.username
    const passwordChanged = showChangePassword && formData.password.length > 0
    
    setHasChanges(nameChanged || usernameChanged || passwordChanged)
  }, [formData, originalData, showChangePassword])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await apiCall('/user/me')
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      
      const data = await response.json()
      setProfile(data)
      
      const initialData = {
        name: data.name || '',
        username: data.username || '',
        password: ''
      }
      setFormData(initialData)
      setOriginalData(initialData)
      
    } catch (error) {
      console.error('Error fetching profile:', error)
      showToast('error', '❌ Failed to load profile. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message, show: true })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 5000)
  }

  const validateForm = (): boolean => {
    // Basic client-side validation
    if (formData.username.trim().length < 3) {
      showToast('error', '❌ Username must be at least 3 characters long')
      return false
    }

    if (showChangePassword && formData.password.length > 0 && formData.password.length < 6) {
      showToast('error', '❌ Password must be at least 6 characters long')
      return false
    }

    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      const updateData: any = {}
      
      // Only include changed fields
      if (formData.name !== originalData.name) {
        updateData.name = formData.name.trim() || null
      }
      
      if (formData.username !== originalData.username) {
        updateData.username = formData.username.trim()
      }
      
      if (showChangePassword && formData.password) {
        updateData.password = formData.password
      }

      const response = await apiCall('/user/update_profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const result = await response.json()
        showToast('success', `✅ ${result.message}`)
        
        // Update localStorage with new username if changed
        if (updateData.username) {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
          if (currentUser) {
            currentUser.username = updateData.username
            localStorage.setItem('user', JSON.stringify(currentUser))
          }
        }
        
        // Reset form state
        setShowChangePassword(false)
        setFormData(prev => ({ ...prev, password: '' }))
        
        // Refresh profile data
        await fetchUserProfile()
      } else {
        const errorData = await response.json()
        showToast('error', `❌ ${errorData.detail || 'Update failed. Please try again.'}`)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast('error', '❌ Network error. Please check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(originalData)
    setShowChangePassword(false)
    setFormData(prev => ({ ...prev, password: '' }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 right-4 z-50"
            >
              <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${
                toast.type === 'success' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {toast.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{toast.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
              <p className="mt-2 text-gray-600">
                Manage your personal information and account settings
              </p>
            </div>

            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white shadow-lg rounded-xl overflow-hidden"
            >
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-white rounded-full p-2">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4 text-white">
                      <h2 className="text-xl font-bold">
                        {profile?.name || profile?.username || 'User'}
                      </h2>
                      <p className="text-blue-100 capitalize text-sm">
                        {profile?.role} • ID: #{profile?.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-white">
                    <p className="text-sm text-blue-100">Member since</p>
                    <p className="text-sm font-medium">
                      {profile?.created_at ? formatDate(profile.created_at) : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="p-6">
                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      <Edit3 className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your full name (optional)"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your username"
                    />
                  </div>

                  {/* Password Section */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        <Lock className="w-4 h-4 inline mr-2" />
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowChangePassword(!showChangePassword)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center transition-colors"
                      >
                        <Lock className="w-4 h-4 mr-1" />
                        {showChangePassword ? 'Cancel Change' : 'Change Password'}
                      </button>
                    </div>

                    <AnimatePresence>
                      {showChangePassword && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              id="password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="Enter new password (minimum 6 characters)"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: hasChanges && !saving ? 1.02 : 1 }}
                    whileTap={{ scale: hasChanges && !saving ? 0.98 : 1 }}
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      hasChanges && !saving
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: hasChanges && !saving ? 1.02 : 1 }}
                    whileTap={{ scale: hasChanges && !saving ? 0.98 : 1 }}
                    onClick={handleCancel}
                    disabled={saving || !hasChanges}
                    className={`flex-1 sm:flex-none px-6 py-3 border border-gray-300 rounded-lg font-medium transition-all duration-200 ${
                      hasChanges && !saving
                        ? 'text-gray-700 hover:bg-gray-50'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <X className="w-5 h-5 mr-2 inline" />
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default Profile
