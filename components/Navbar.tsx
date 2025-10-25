import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { LogOut, User, Activity, Users, Package } from 'lucide-react'
import { getUser, logout, canAddEdit, canManageUsers, canCreateUsers, canViewOwnActivities } from '../utils/auth'

const Navbar = () => {
  const router = useRouter()
  const user = getUser()

  const isActive = (pathname: string) => {
    return router.pathname === pathname
  }

  const handleLogout = () => {
    logout()
  }

  const handleActivityClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push('/activity')
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12">
                <Image
                  src="/logo.png"
                  alt="Automation System Logo"
                  fill
                  className="object-contain transition-opacity duration-200 hover:opacity-80"
                  priority
                  onError={(e) => {
                    console.warn('Logo failed to load, falling back to text');
                  }}
                />
              </div>
              <span className="text-xl font-bold hidden sm:block">
                Automation System
              </span>
              <span className="text-sm font-bold sm:hidden ml-2">
                Auto
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') 
                  ? 'bg-blue-700' 
                  : 'hover:bg-blue-500'
              }`}
            >
              Dashboard
            </Link>
            {canAddEdit() && (
              <Link
                href="/add"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/add') 
                    ? 'bg-blue-700' 
                    : 'hover:bg-blue-500'
                }`}
              >
                Add Product
              </Link>
            )}
            {canAddEdit() && (
              <Link
                href="/orders"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/orders') 
                    ? 'bg-blue-700' 
                    : 'hover:bg-blue-500'
                }`}
              >
                <Package className="w-4 h-4 mr-1" />
                Orders
              </Link>
            )}
            <Link
              href="/daily-history"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/daily-history') 
                  ? 'bg-blue-700' 
                  : 'hover:bg-blue-500'
              }`}
            >
              Transactions
            </Link>
            {canViewOwnActivities() && (
              <button
                onClick={handleActivityClick}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/activity') 
                    ? 'bg-blue-700' 
                    : 'hover:bg-blue-500'
                }`}
              >
                <Activity className="w-4 h-4 mr-1" />
                Activity
              </button>
            )}
            {canCreateUsers() && (
              <Link
                href="/users"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/users') 
                    ? 'bg-blue-700' 
                    : 'hover:bg-blue-500'
                }`}
              >
                <Users className="w-4 h-4 mr-1" />
                Users
              </Link>
            )}
            
            {/* User Info and Logout */}
            <div className="flex items-center space-x-2 ml-4 border-l border-blue-500 pl-4">
              <Link
                href="/profile"
                className={`flex items-center text-sm px-3 py-2 rounded-md hover:bg-blue-500 transition-colors ${
                  isActive('/profile') ? 'bg-blue-700' : ''
                }`}
                title="View Profile"
              >
                <User className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{user?.username}</span>
                <span className="ml-2 px-2 py-1 text-xs bg-blue-500 rounded-full">
                  {user?.role}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
