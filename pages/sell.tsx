/**
 * SELL PRODUCT PAGE - REDIRECTS TO ORDERS
 * 
 * This feature has been removed from the project.
 * Users are automatically redirected to the Orders module.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/router'

const SellProduct = () => {
  const router = useRouter()

  useEffect(() => {
    // Immediately redirect to orders page
    router.push('/orders')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to Orders...</p>
      </div>
    </div>
  )
}

export default SellProduct
