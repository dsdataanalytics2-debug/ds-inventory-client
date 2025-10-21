import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

interface ProgressChart3DProps {
  products: Product[]
}

interface PerformanceMetric {
  label: string
  value: number
  percentage: number
  color: string
  icon: string
}

const ProgressChart3D: React.FC<ProgressChart3DProps> = ({ products }) => {
  const [selectedMetric, setSelectedMetric] = useState<number>(0)
  const [animationComplete, setAnimationComplete] = useState(false)

  // Calculate performance metrics
  const totalRevenue = products.reduce((sum, p) => sum + (Number(p.total_sold_amount) || 0), 0)
  const totalCost = products.reduce((sum, p) => sum + (Number(p.total_added_amount) || 0), 0)
  const totalProfit = totalRevenue - totalCost
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
  
  const totalStock = products.reduce((sum, p) => sum + (p.available_stock || 0), 0)
  const totalSold = products.reduce((sum, p) => sum + (p.total_sold_qty || 0), 0)
  const turnoverRate = (totalStock + totalSold) > 0 ? (totalSold / (totalStock + totalSold)) * 100 : 0
  
  const avgProfitPerProduct = products.length > 0 ? totalProfit / products.length : 0
  const profitPerProductPercentage = Math.min(Math.max((avgProfitPerProduct / 1000) * 100, 0), 100)

  const metrics: PerformanceMetric[] = [
    {
      label: 'Profit Margin',
      value: profitMargin,
      percentage: Math.min(Math.max(profitMargin, 0), 100),
      color: '#10B981',
      icon: '💰'
    },
    {
      label: 'Inventory Turnover',
      value: turnoverRate,
      percentage: turnoverRate,
      color: '#3B82F6',
      icon: '🔄'
    },
    {
      label: 'Performance Score',
      value: profitPerProductPercentage,
      percentage: profitPerProductPercentage,
      color: '#8B5CF6',
      icon: '📈'
    }
  ]

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  const currentMetric = metrics[selectedMetric]

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-2xl border border-gray-100">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Performance Analytics</h3>
        <p className="text-gray-600">Key business metrics and profitability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hourglass Progress Indicator */}
        <div className="flex flex-col items-center justify-center">
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Hourglass Container */}
            <div className="relative w-32 h-48">
              {/* Top Chamber */}
              <motion.div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-20 rounded-t-full border-4 border-gray-300 overflow-hidden"
                style={{
                  background: `linear-gradient(to bottom, ${currentMetric.color}40 0%, ${currentMetric.color}20 100%)`,
                  boxShadow: `inset 0 4px 8px ${currentMetric.color}20`
                }}
              >
                {/* Liquid in top chamber */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 rounded-t-full"
                  style={{
                    background: `linear-gradient(to top, ${currentMetric.color}, ${currentMetric.color}80)`,
                    boxShadow: `0 -2px 8px ${currentMetric.color}40`
                  }}
                  initial={{ height: '80%' }}
                  animate={{ height: `${100 - currentMetric.percentage}%` }}
                  transition={{ delay: 0.5, duration: 2, ease: "easeOut" }}
                />
              </motion.div>

              {/* Neck */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-2 h-8 bg-gray-300 rounded-full">
                {/* Falling particles effect */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-full"
                  style={{ background: currentMetric.color }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
                />
              </div>

              {/* Bottom Chamber */}
              <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-20 rounded-b-full border-4 border-gray-300 overflow-hidden"
                style={{
                  background: `linear-gradient(to top, ${currentMetric.color}40 0%, ${currentMetric.color}20 100%)`,
                  boxShadow: `inset 0 -4px 8px ${currentMetric.color}20`
                }}
              >
                {/* Liquid in bottom chamber */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 rounded-b-full"
                  style={{
                    background: `linear-gradient(to bottom, ${currentMetric.color}, ${currentMetric.color}80)`,
                    boxShadow: `0 2px 8px ${currentMetric.color}40`
                  }}
                  initial={{ height: '20%' }}
                  animate={{ height: `${currentMetric.percentage}%` }}
                  transition={{ delay: 0.5, duration: 2, ease: "easeOut" }}
                />
              </motion.div>

              {/* Center Percentage Display */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2"
                style={{ borderColor: currentMetric.color }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
              >
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: currentMetric.color }}>
                    {currentMetric.value.toFixed(0)}%
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating Icon */}
            <motion.div
              className="absolute -top-4 -right-4 text-2xl bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 2, duration: 0.6, type: "spring" }}
            >
              {currentMetric.icon}
            </motion.div>
          </motion.div>

          {/* Current Metric Label */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
          >
            <h4 className="text-lg font-semibold text-gray-800">{currentMetric.label}</h4>
            <p className="text-sm text-gray-600 mt-1">
              {currentMetric.label === 'Profit Margin' && `$${totalProfit.toFixed(2)} profit`}
              {currentMetric.label === 'Inventory Turnover' && `${totalSold} items sold`}
              {currentMetric.label === 'Performance Score' && `$${avgProfitPerProduct.toFixed(2)} avg profit/product`}
            </p>
          </motion.div>
        </div>

        {/* Metrics Selector */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Select Metric</h4>
          
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                selectedMetric === index 
                  ? 'bg-white shadow-lg border-2' 
                  : 'bg-gray-50 hover:bg-white hover:shadow-md border border-gray-200'
              }`}
              style={{
                borderColor: selectedMetric === index ? metric.color : undefined,
                boxShadow: selectedMetric === index ? `0 8px 25px ${metric.color}20` : undefined
              }}
              onClick={() => setSelectedMetric(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{metric.icon}</div>
                  <div>
                    <h5 className="font-medium text-gray-800">{metric.label}</h5>
                    <p className="text-sm text-gray-600">
                      {metric.value.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                {/* Mini Progress Bar */}
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: metric.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.percentage}%` }}
                    transition={{ delay: index * 0.1 + 1, duration: 1 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}

          {/* Summary Stats */}
          <motion.div
            className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <h5 className="font-semibold text-gray-800 mb-2">Quick Stats</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Total Revenue:</span>
                <span className="font-medium text-gray-800 ml-1">${totalRevenue.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Profit:</span>
                <span className="font-medium text-gray-800 ml-1">${totalProfit.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Items Sold:</span>
                <span className="font-medium text-gray-800 ml-1">{totalSold}</span>
              </div>
              <div>
                <span className="text-gray-600">In Stock:</span>
                <span className="font-medium text-gray-800 ml-1">{totalStock}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ProgressChart3D
