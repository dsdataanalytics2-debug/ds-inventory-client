import React from 'react';
import { hasRole, getUser } from '../utils/auth';

interface PermissionGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermission?: () => boolean;
  fallback?: React.ReactNode;
  userId?: number; // For user-specific content
}

/**
 * PermissionGuard component for fine-grained permission control
 * 
 * Usage examples:
 * 1. Role-based: <PermissionGuard allowedRoles={['admin', 'superadmin']}>...</PermissionGuard>
 * 2. Function-based: <PermissionGuard requiredPermission={canCreateUsers}>...</PermissionGuard>
 * 3. User-specific: <PermissionGuard userId={targetUserId}>...</PermissionGuard>
 * 4. With fallback: <PermissionGuard allowedRoles={['admin']} fallback={<div>Access Denied</div>}>...</PermissionGuard>
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  fallback = null,
  userId
}) => {
  const currentUser = getUser();

  // Check if user is authenticated
  if (!currentUser) {
    return <>{fallback}</>;
  }

  // Check role-based permissions
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  // Check function-based permissions
  if (requiredPermission && !requiredPermission()) {
    return <>{fallback}</>;
  }

  // Check user-specific permissions
  if (userId !== undefined) {
    // Admins and superadmins can access all user data
    if (hasRole(['superadmin', 'admin'])) {
      return <>{children}</>;
    }
    
    // Viewers and editors can only access their own data
    if (currentUser.id !== userId) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

export default PermissionGuard;
