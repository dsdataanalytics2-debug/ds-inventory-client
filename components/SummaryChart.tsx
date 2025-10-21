import { motion } from 'framer-motion'
import TotalStatsChart3D from './TotalStatsChart3D'
import DonutChart3D from './DonutChart3D'
import ProgressChart3D from './ProgressChart3D'
import LiquidFillChart3D from './LiquidFillChart3D'

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

interface SummaryChartProps {
  products: Product[]
}

const SummaryChart = ({ products }: SummaryChartProps) => {
  if (products.length === 0) {
    return (
      <motion.div 
        className="text-center p-12 text-gray-500 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h3>
        <p className="text-gray-500">Add some products to see beautiful 3D charts</p>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Top Row - Total Statistics and Donut Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <TotalStatsChart3D products={products} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <DonutChart3D products={products} />
        </motion.div>
      </div>

      {/* Middle Row - Liquid Fill Chart */}
      <motion.div
        className="overflow-visible"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <LiquidFillChart3D products={products} />
      </motion.div>

      {/* Bottom Row - Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <ProgressChart3D products={products} />
      </motion.div>
    </motion.div>
  )
}

export default SummaryChart
