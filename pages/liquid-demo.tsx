import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import LiquidFillChart3D from '@/components/LiquidFillChart3D'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiCall } from '@/utils/auth'

interface Product {
  id: number
  name: string
  total_added_qty: number
  total_added_amount: number
  total_sold_qty: number
  total_sold_amount: number
  available_stock: number
  avg_purchase_price?: number
  avg_selling_price?: number
  profit_loss?: number
}

const LiquidDemo = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch enhanced summary data
  const fetchSummary = async () => {
    try {
      const response = await apiCall('/summary/enhanced')
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error('Failed to fetch enhanced summary:', error)
      // Demo data for testing
      setProducts([
        {
          id: 1,
          name: 'Laptop Pro',
          total_added_qty: 100,
          total_added_amount: 50000,
          total_sold_qty: 75,
          total_sold_amount: 45000,
          available_stock: 25,
        },
        {
          id: 2,
          name: 'Wireless Mouse',
          total_added_qty: 200,
          total_added_amount: 6000,
          total_sold_qty: 120,
          total_sold_amount: 4800,
          available_stock: 80,
        },
        {
          id: 3,
          name: 'USB Cable',
          total_added_qty: 500,
          total_added_amount: 2500,
          total_sold_qty: 450,
          total_sold_amount: 2250,
          available_stock: 50,
        },
        {
          id: 4,
          name: 'Keyboard',
          total_added_qty: 80,
          total_added_amount: 8000,
          total_sold_qty: 20,
          total_sold_amount: 2500,
          available_stock: 60,
        },
        {
          id: 5,
          name: 'Monitor',
          total_added_qty: 50,
          total_added_amount: 25000,
          total_sold_qty: 35,
          total_sold_amount: 21000,
          available_stock: 15,
        },
      ] as Product[])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Navbar />
        
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🧪 3D Liquid-Fill Stock Visualization
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Interactive 3D glass containers showing inventory levels with realistic liquid effects. 
                Each bar represents total stock capacity with green liquid indicating available quantities.
              </p>
            </div>

            {/* Feature Highlights */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl mb-3">🌊</div>
                <h3 className="font-semibold text-gray-800 mb-2">Liquid Animation</h3>
                <p className="text-sm text-gray-600">Smooth filling animations with bubble effects and surface shimmer</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="font-semibold text-gray-800 mb-2">Interactive Tooltips</h3>
                <p className="text-sm text-gray-600">Hover for detailed stock information and performance indicators</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-gray-800 mb-2">Real-time Data</h3>
                <p className="text-sm text-gray-600">Live inventory levels with percentage indicators and status alerts</p>
              </div>
            </motion.div>
          </motion.div>

          {loading ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">Loading liquid-fill visualization...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <LiquidFillChart3D products={products} />
            </motion.div>
          )}

          {/* Instructions */}
          <motion.div
            className="mt-12 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-8 border border-blue-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Use</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-medium mb-2">🎯 Visual Indicators:</h4>
                <ul className="space-y-1">
                  <li>• <strong>Green liquid:</strong> Available stock quantity</li>
                  <li>• <strong>Empty space:</strong> Sold/out-of-stock quantity</li>
                  <li>• <strong>Container height:</strong> Total added quantity</li>
                  <li>• <strong>Percentage label:</strong> Stock availability ratio</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🖱️ Interactions:</h4>
                <ul className="space-y-1">
                  <li>• <strong>Hover:</strong> View detailed stock information</li>
                  <li>• <strong>Glow effect:</strong> Indicates interactive elements</li>
                  <li>• <strong>Animations:</strong> Watch liquid fill on page load</li>
                  <li>• <strong>Status colors:</strong> Green (good), Yellow (low), Red (critical)</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default LiquidDemo
