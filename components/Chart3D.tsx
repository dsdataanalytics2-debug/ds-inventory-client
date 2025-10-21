import React, { useRef, useEffect, useState } from 'react'
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

interface Chart3DProps {
  products: Product[]
}

interface BarData {
  label: string
  added: number
  sold: number
  available: number
  addedAmount: number
  soldAmount: number
}

const Chart3D: React.FC<Chart3DProps> = ({ products }) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [animationComplete, setAnimationComplete] = useState(false)

  const barData: BarData[] = products.map(product => ({
    label: product.name,
    added: product.total_added_qty || 0,
    sold: product.total_sold_qty || 0,
    available: product.available_stock || 0,
    addedAmount: Number(product.total_added_amount) || 0,
    soldAmount: Number(product.total_sold_amount) || 0,
  }))

  const maxValue = Math.max(
    ...barData.flatMap(d => [d.added, d.sold, d.available])
  )

  const getBarHeight = (value: number) => (value / maxValue) * 200

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-2xl border border-gray-100">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Inventory Overview</h3>
        <p className="text-gray-600">Added vs Sold vs Available Stock</p>
      </div>

      <div className="relative h-80 flex items-end justify-center space-x-8 overflow-x-auto pb-4">
        {barData.map((data, index) => (
          <motion.div
            key={index}
            className="relative flex flex-col items-center min-w-0"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            onMouseEnter={() => setHoveredBar(index)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            {/* Bar Group Container */}
            <div className="flex items-end space-x-2 mb-4">
              {/* Added Bar */}
              <motion.div
                className="relative group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div
                  className="w-8 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 rounded-t-lg shadow-lg relative overflow-hidden"
                  style={{
                    height: `${getBarHeight(data.added)}px`,
                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {/* 3D Effect Highlight */}
                  <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg" />
                  
                  {/* Animated Height */}
                  <motion.div
                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-lg"
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                
                {/* Floating Label */}
                <AnimatePresence>
                  {hoveredBar === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -10, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-lg z-10"
                    >
                      {data.added}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-blue-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Sold Bar */}
              <motion.div
                className="relative group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div
                  className="w-8 bg-gradient-to-t from-teal-600 via-teal-500 to-teal-400 rounded-t-lg shadow-lg relative overflow-hidden"
                  style={{
                    height: `${getBarHeight(data.sold)}px`,
                    boxShadow: '0 8px 32px rgba(20, 184, 166, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg" />
                  
                  <motion.div
                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-teal-700 to-teal-500 rounded-t-lg"
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                
                <AnimatePresence>
                  {hoveredBar === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -10, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-lg z-10"
                    >
                      {data.sold}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-teal-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Available Bar */}
              <motion.div
                className="relative group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div
                  className="w-8 bg-gradient-to-t from-gray-600 via-gray-500 to-gray-400 rounded-t-lg shadow-lg relative overflow-hidden"
                  style={{
                    height: `${getBarHeight(data.available)}px`,
                    boxShadow: '0 8px 32px rgba(107, 114, 128, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg" />
                  
                  <motion.div
                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-gray-700 to-gray-500 rounded-t-lg"
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                
                <AnimatePresence>
                  {hoveredBar === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -10, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-600 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-lg z-10"
                    >
                      {data.available}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Product Label */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.8 }}
            >
              <p className="text-sm font-medium text-gray-700 truncate max-w-20">
                {data.label}
              </p>
            </motion.div>

            {/* Detailed Tooltip */}
            <AnimatePresence>
              {hoveredBar === index && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-20 min-w-48"
                >
                  <h4 className="font-semibold text-gray-800 mb-2">{data.label}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-600">Added:</span>
                      <span className="font-medium">{data.added} (${data.addedAmount.toFixed(2)})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-teal-600">Sold:</span>
                      <span className="font-medium">{data.sold} (${data.soldAmount.toFixed(2)})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium">{data.available}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <motion.div
        className="flex justify-center space-x-6 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-t from-blue-600 to-blue-400 rounded shadow-sm" />
          <span className="text-sm font-medium text-gray-700">Added</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-t from-teal-600 to-teal-400 rounded shadow-sm" />
          <span className="text-sm font-medium text-gray-700">Sold</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-t from-gray-600 to-gray-400 rounded shadow-sm" />
          <span className="text-sm font-medium text-gray-700">Available</span>
        </div>
      </motion.div>
    </div>
  )
}

export default Chart3D
