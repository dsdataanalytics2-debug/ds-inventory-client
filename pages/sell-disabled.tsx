/**
 * SELL PRODUCT PAGE - DISABLED
 * 
 * This feature has been removed from the project.
 * Please use the Orders module instead for recording sales with customer details.
 * 
 * This file is kept for reference only and should not be used.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'

const SellProductDisabled = () => {
  const router = useRouter()

  useEffect(() => {
    // Redirect to orders page after 3 seconds
    const timer = setTimeout(() => {
      router.push('/orders')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">
                Feature Removed
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  The "Sell Product" feature has been removed from this project.
                </p>
                <p className="mt-2">
                  Please use the <strong>Orders</strong> module instead to record sales with customer details.
                </p>
                <p className="mt-4 text-xs">
                  Redirecting to Orders page in 3 seconds...
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => router.push('/orders')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Go to Orders Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellProductDisabled
