interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

export const hasRole = (allowedRoles: string[]): boolean => {
  const user = getUser();
  return user ? allowedRoles.includes(user.role) : false;
};

export const canAddEdit = (): boolean => {
  return hasRole(['superadmin', 'admin', 'editor']);
};

export const canDelete = (): boolean => {
  return hasRole(['superadmin', 'admin']);
};

export const canManageUsers = (): boolean => {
  return hasRole(['superadmin']);
};

// Enhanced permission functions for the new requirements
export const canCreateUsers = (): boolean => {
  return hasRole(['superadmin', 'admin']);
};

export const canViewAllActivities = (): boolean => {
  return hasRole(['superadmin', 'admin']);
};

export const canViewOwnActivities = (): boolean => {
  return hasRole(['superadmin', 'admin', 'editor', 'viewer']);
};

export const canAssignRoles = (): boolean => {
  return hasRole(['superadmin', 'admin']);
};

export const isViewer = (): boolean => {
  const user = getUser();
  return user?.role === 'viewer';
};

export const isEditor = (): boolean => {
  const user = getUser();
  return user?.role === 'editor';
};

export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === 'admin';
};

export const isSuperAdmin = (): boolean => {
  const user = getUser();
  return user?.role === 'superadmin';
};

export const getCurrentUserId = (): number | null => {
  const user = getUser();
  return user?.id || null;
};

export const canAccessUserData = (targetUserId: number): boolean => {
  const currentUser = getUser();
  if (!currentUser) return false;
  
  // Admins and superadmins can access all user data
  if (hasRole(['superadmin', 'admin'])) return true;
  
  // Viewers and editors can only access their own data
  return currentUser.id === targetUserId;
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Get API base URL from environment
const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

export const apiCall = async (url: string, options: RequestInit = {}) => {
  const headers = getAuthHeaders();
  
  // If URL is relative, prepend the base URL
  const fullUrl = url.startsWith('http') ? url : buildApiUrl(url);
  
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });

  if (response.status === 401) {
    logout();
    throw new Error('Authentication required');
  }

  return response;
};
