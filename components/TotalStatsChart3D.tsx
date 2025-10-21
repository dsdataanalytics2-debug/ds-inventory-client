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

interface TotalStatsChart3DProps {
  products: Product[]
}

interface StatBar {
  label: string
  value: number
  color: string
  shadowColor: string
  icon: string
}

const TotalStatsChart3D: React.FC<TotalStatsChart3DProps> = ({ products }) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [animationStarted, setAnimationStarted] = useState(false)

  // Calculate totals
  const totalAdded = products.reduce((sum, product) => sum + (product.total_added_qty || 0), 0)
  const totalSold = products.reduce((sum, product) => sum + (product.total_sold_qty || 0), 0)
  
  const maxValue = Math.max(totalAdded, totalSold)
  const getBarHeight = (value: number) => maxValue > 0 ? (value / maxValue) * 200 : 0

  const statBars: StatBar[] = [
    {
      label: 'Total Products Added',
      value: totalAdded,
      color: '#4CAF50',
      shadowColor: '#388E3C',
      icon: '📦'
    },
    {
      label: 'Total Products Sold',
      value: totalSold,
      color: '#F44336',
      shadowColor: '#D32F2F',
      icon: '💰'
    }
  ]

  useEffect(() => {
    const timer = setTimeout(() => setAnimationStarted(true), 500)
    return () => clearTimeout(timer)
  }, [])

  if (products.length === 0) {
    return (
      <motion.div 
        className="text-center p-12 text-gray-500 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Statistics Available</h3>
        <p className="text-gray-500">Add products to see total statistics</p>
      </motion.div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-2xl border border-gray-100">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Inventory Overview</h3>
        <p className="text-gray-600">3D comparison of total added vs sold products</p>
      </div>

      <div className="relative h-80 flex items-end justify-center space-x-16 pb-8">
        {statBars.map((bar, index) => {
          const barHeight = getBarHeight(bar.value)

          return (
            <motion.div
              key={index}
              className="relative flex flex-col items-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Value Label on Top */}
              <motion.div
                className="mb-4 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 + 1.5, duration: 0.5 }}
              >
                <div 
                  className="bg-white rounded-xl shadow-lg px-4 py-2 border-2"
                  style={{ borderColor: bar.color }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{bar.icon}</span>
                    <span className="text-2xl font-bold" style={{ color: bar.color }}>
                      {bar.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* 3D Glass Bar */}
              <motion.div
                className="relative cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Main Bar Container */}
                <div
                  className="relative w-20 rounded-lg overflow-hidden"
                  style={{
                    height: `${Math.max(barHeight, 20)}px`,
                    background: `linear-gradient(135deg, 
                      rgba(255,255,255,0.9) 0%, 
                      rgba(240,240,240,0.7) 50%, 
                      rgba(255,255,255,0.9) 100%
                    )`,
                    boxShadow: `
                      0 12px 40px rgba(0,0,0,0.15),
                      inset 0 2px 0 rgba(255,255,255,0.8),
                      inset 0 -2px 0 rgba(0,0,0,0.1),
                      inset 2px 0 0 rgba(255,255,255,0.6),
                      inset -2px 0 0 rgba(0,0,0,0.1)
                    `,
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {/* Glass Reflection */}
                  <div 
                    className="absolute top-0 left-0 w-1/2 h-full opacity-40 rounded-l-lg"
                    style={{
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, transparent 100%)'
                    }}
                  />

                  {/* Animated Color Fill */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 rounded-b-lg overflow-hidden"
                    style={{
                      background: `linear-gradient(180deg, 
                        ${bar.color}CC 0%, 
                        ${bar.color} 30%, 
                        ${bar.shadowColor} 70%, 
                        ${bar.shadowColor}DD 100%
                      )`,
                      boxShadow: `
                        inset 0 3px 6px rgba(255,255,255,0.4),
                        inset 0 -3px 6px rgba(0,0,0,0.3),
                        0 0 25px ${bar.color}40
                      `,
                    }}
                    initial={{ height: 0 }}
                    animate={{ 
                      height: animationStarted ? `${Math.max(barHeight, 20)}px` : 0 
                    }}
                    transition={{ 
                      delay: index * 0.2 + 0.8, 
                      duration: 1.8, 
                      ease: "easeOut" 
                    }}
                  >
                    {/* Surface Shine Effect */}
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-3"
                      style={{
                        background: `linear-gradient(90deg, 
                          transparent 0%, 
                          rgba(255,255,255,0.7) 50%, 
                          transparent 100%
                        )`,
                      }}
                      animate={{
                        x: [-30, 30, -30],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.5
                      }}
                    />

                    {/* Particle Effects */}
                    {[...Array(4)].map((_, particleIndex) => (
                      <motion.div
                        key={particleIndex}
                        className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-50"
                        style={{
                          left: `${15 + particleIndex * 18}%`,
                          bottom: `${20 + particleIndex * 20}%`,
                        }}
                        animate={{
                          y: [-8, -20, -8],
                          opacity: [0.5, 0.8, 0.5],
                          scale: [1, 1.3, 1],
                        }}
                        transition={{
                          duration: 2.5 + particleIndex * 0.3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.2 + particleIndex * 0.4
                        }}
                      />
                    ))}
                  </motion.div>

                  {/* 3D Edge Highlights */}
                  <div className="absolute inset-0 pointer-events-none rounded-lg">
                    {/* Top highlight */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-0.5 rounded-t-lg"
                      style={{ background: 'rgba(255,255,255,0.9)' }}
                    />
                    {/* Left highlight */}
                    <div 
                      className="absolute top-0 left-0 bottom-0 w-0.5 rounded-l-lg"
                      style={{ background: 'rgba(255,255,255,0.7)' }}
                    />
                    {/* Right shadow */}
                    <div 
                      className="absolute top-0 right-0 bottom-0 w-0.5 rounded-r-lg"
                      style={{ background: 'rgba(0,0,0,0.2)' }}
                    />
                    {/* Bottom shadow */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg"
                      style={{ background: 'rgba(0,0,0,0.3)' }}
                    />
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <AnimatePresence>
                  {hoveredBar === index && (
                    <motion.div
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{
                        boxShadow: `0 0 40px ${bar.color}60, 0 0 80px ${bar.color}30`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>

                {/* Base Shadow */}
                <div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-4 rounded-full opacity-30"
                  style={{
                    background: `radial-gradient(ellipse, ${bar.shadowColor}60 0%, transparent 70%)`,
                    filter: 'blur(4px)'
                  }}
                />
              </motion.div>

              {/* Bar Label */}
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.2 + 2 }}
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-1">
                  {bar.label}
                </h4>
                <p className="text-sm text-gray-600">
                  {bar.value.toLocaleString()} units
                </p>
              </motion.div>

              {/* Detailed Tooltip */}
              <AnimatePresence>
                {hoveredBar === index && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    className="absolute top-full mt-8 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-20 min-w-64"
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <span className="text-2xl">{bar.icon}</span>
                        <h4 className="font-semibold text-gray-800">{bar.label}</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Added:</span>
                          <span className="font-medium text-green-600">{totalAdded.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Sold:</span>
                          <span className="font-medium text-red-600">{totalSold.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between items-center font-semibold">
                            <span className="text-gray-700">Difference:</span>
                            <span className={`${totalAdded > totalSold ? 'text-green-600' : 'text-red-600'}`}>
                              {Math.abs(totalAdded - totalSold).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <motion.div
        className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <h5 className="font-semibold text-gray-800 mb-1">Stock Efficiency</h5>
            <p className="text-2xl font-bold text-blue-600">
              {totalAdded > 0 ? ((totalSold / totalAdded) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-gray-600">Products sold vs added</p>
          </div>
          <div>
            <h5 className="font-semibold text-gray-800 mb-1">Remaining Stock</h5>
            <p className="text-2xl font-bold text-green-600">
              {(totalAdded - totalSold).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">Available inventory</p>
          </div>
          <div>
            <h5 className="font-semibold text-gray-800 mb-1">Total Products</h5>
            <p className="text-2xl font-bold text-purple-600">
              {products.length}
            </p>
            <p className="text-xs text-gray-600">Unique product types</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default TotalStatsChart3D
