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

interface LiquidFillChart3DProps {
  products: Product[]
}

interface LiquidBarData {
  id: number
  label: string
  totalAdded: number
  available: number
  sold: number
  fillPercentage: number
  addedAmount: number
  soldAmount: number
}

const LiquidFillChart3D: React.FC<LiquidFillChart3DProps> = ({ products }) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [animationStarted, setAnimationStarted] = useState(false)

  const liquidBars: LiquidBarData[] = products.map(product => {
    const totalAdded = product.total_added_qty || 0
    const available = product.available_stock || 0
    const sold = product.total_sold_qty || 0
    const fillPercentage = totalAdded > 0 ? (available / totalAdded) * 100 : 0

    return {
      id: product.id,
      label: product.name,
      totalAdded,
      available,
      sold,
      fillPercentage,
      addedAmount: Number(product.total_added_amount) || 0,
      soldAmount: Number(product.total_sold_amount) || 0,
    }
  })

  const maxQuantity = Math.max(...liquidBars.map(bar => bar.totalAdded))
  const getBarHeight = (quantity: number) => Math.max((quantity / maxQuantity) * 200, 20)

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
        <div className="text-6xl mb-4">🧪</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Inventory Data</h3>
        <p className="text-gray-500">Add products to see liquid-fill stock levels</p>
      </motion.div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-2xl border border-gray-100 overflow-visible">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Inventory Stock Levels</h3>
        <p className="text-gray-600">3D liquid-fill visualization of available vs sold quantities</p>
      </div>

      <div className="relative h-80 flex items-end justify-center space-x-6 overflow-visible pb-4 px-4">
        {liquidBars.map((bar, index) => {
          const barHeight = getBarHeight(bar.totalAdded)
          const fillHeight = (bar.fillPercentage / 100) * barHeight

          return (
            <motion.div
              key={bar.id}
              className="relative flex flex-col items-center min-w-0"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Percentage Label */}
              <motion.div
                className="mb-2 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 1.2, duration: 0.5 }}
              >
                <div className="bg-white rounded-lg shadow-md px-3 py-1 border border-gray-200">
                  <span className="text-sm font-semibold text-gray-800">
                    {bar.fillPercentage.toFixed(0)}% Available
                  </span>
                </div>
              </motion.div>

              {/* 3D Liquid Container */}
              <motion.div
                className="relative cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Outer Glass Container */}
                <div
                  className="relative w-16 rounded-lg overflow-hidden"
                  style={{
                    height: `${barHeight}px`,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,240,240,0.7) 50%, rgba(255,255,255,0.9) 100%)',
                    boxShadow: `
                      0 8px 32px rgba(0,0,0,0.1),
                      inset 0 1px 0 rgba(255,255,255,0.8),
                      inset 0 -1px 0 rgba(0,0,0,0.1),
                      inset 1px 0 0 rgba(255,255,255,0.6),
                      inset -1px 0 0 rgba(0,0,0,0.1)
                    `,
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {/* Glass Reflection Effect */}
                  <div 
                    className="absolute top-0 left-0 w-1/3 h-full opacity-30 rounded-l-lg"
                    style={{
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, transparent 100%)'
                    }}
                  />

                  {/* Liquid Fill */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 rounded-b-lg overflow-hidden"
                    style={{
                      background: `linear-gradient(180deg, 
                        #66BB6A 0%, 
                        #4CAF50 30%, 
                        #43A047 70%, 
                        #388E3C 100%
                      )`,
                      boxShadow: `
                        inset 0 2px 4px rgba(255,255,255,0.3),
                        inset 0 -2px 4px rgba(0,0,0,0.2),
                        0 0 20px rgba(76,175,80,0.3)
                      `,
                    }}
                    initial={{ height: 0 }}
                    animate={{ 
                      height: animationStarted ? `${fillHeight}px` : 0 
                    }}
                    transition={{ 
                      delay: index * 0.1 + 0.8, 
                      duration: 1.5, 
                      ease: "easeOut" 
                    }}
                  >
                    {/* Liquid Surface Shimmer */}
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-2"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                      }}
                      animate={{
                        x: [-20, 20, -20],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2
                      }}
                    />

                    {/* Bubble Effects */}
                    {[...Array(3)].map((_, bubbleIndex) => (
                      <motion.div
                        key={bubbleIndex}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                        style={{
                          left: `${20 + bubbleIndex * 20}%`,
                          bottom: `${10 + bubbleIndex * 15}%`,
                        }}
                        animate={{
                          y: [-5, -15, -5],
                          opacity: [0.6, 0.3, 0.6],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2 + bubbleIndex * 0.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.1 + bubbleIndex * 0.3
                        }}
                      />
                    ))}
                  </motion.div>

                  {/* Empty Space Indicator */}
                  <div
                    className="absolute top-0 left-0 right-0"
                    style={{
                      height: `${barHeight - fillHeight}px`,
                      background: 'linear-gradient(180deg, rgba(224,224,224,0.3) 0%, rgba(240,240,240,0.2) 100%)',
                    }}
                  />

                  {/* 3D Edge Highlights */}
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {/* Top edge */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-px"
                      style={{ background: 'rgba(255,255,255,0.8)' }}
                    />
                    {/* Left edge */}
                    <div 
                      className="absolute top-0 left-0 bottom-0 w-px"
                      style={{ background: 'rgba(255,255,255,0.6)' }}
                    />
                    {/* Right edge */}
                    <div 
                      className="absolute top-0 right-0 bottom-0 w-px"
                      style={{ background: 'rgba(0,0,0,0.1)' }}
                    />
                    {/* Bottom edge */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-px"
                      style={{ background: 'rgba(0,0,0,0.2)' }}
                    />
                  </div>
                </div>

                {/* Hover Glow Effect */}
                {hoveredBar === index && (
                  <motion.div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      boxShadow: '0 0 30px rgba(76,175,80,0.4), 0 0 60px rgba(76,175,80,0.2)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.div>

              {/* Product Label */}
              <motion.div
                className="mt-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 1.5 }}
              >
                <p className="text-sm font-medium text-gray-700 truncate max-w-20">
                  {bar.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {bar.totalAdded} Total
                </p>
              </motion.div>

              {/* Detailed Tooltip */}
              <AnimatePresence>
                {hoveredBar === index && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    className="absolute bottom-48 mb-2 left-1 transform -translate-x-1/2 bg-gradient-to-br from-white via-blue-50 to-gray-50 rounded-2xl shadow-2xl border-2 border-blue-300 p-4 w-96 max-w-screen-sm"
                    style={{
                      boxShadow: '0 25px 50px rgba(0,0,0,0.2), 0 0 0 1px rgba(59, 130, 246, 0.15)',
                      zIndex: 9999
                    }}
                  >
                    {/* Header */}
                    <div className="text-center mb-3 pb-2 border-b border-blue-200">
                      <h4 className="font-bold text-gray-800 text-base truncate">{bar.label}</h4>
                    </div>
                    
                    {/* Main Content - Horizontal Layout */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {/* Left Column */}
                      <div className="space-y-2">
                        <div className="bg-blue-100 rounded-lg p-2 border-l-4 border-blue-500">
                          <div className="flex items-center justify-between">
                            <span className="text-blue-700 font-semibold flex items-center">
                              📦 Added:
                            </span>
                            <div className="text-right">
                              <div className="font-bold text-blue-800">{bar.totalAdded}</div>
                              <div className="text-blue-600 text-xs">৳{bar.addedAmount.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-green-100 rounded-lg p-2 border-l-4 border-green-500">
                          <div className="flex items-center justify-between">
                            <span className="text-green-700 font-semibold flex items-center">
                              ✅ Available:
                            </span>
                            <div className="text-right">
                              <div className="font-bold text-green-800">{bar.available}</div>
                              <div className="text-green-600 text-xs">{bar.fillPercentage.toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-2">
                        <div className="bg-red-100 rounded-lg p-2 border-l-4 border-red-500">
                          <div className="flex items-center justify-between">
                            <span className="text-red-700 font-semibold flex items-center">
                              💰 Sold:
                            </span>
                            <div className="text-right">
                              <div className="font-bold text-red-800">{bar.sold}</div>
                              <div className="text-red-600 text-xs">৳{bar.soldAmount.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-100 rounded-lg p-2 border-l-4 border-gray-500">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-semibold flex items-center">
                              📊 Status:
                            </span>
                            <span className={`font-bold px-2 py-1 rounded-full text-xs ${
                              bar.fillPercentage > 50 
                                ? 'bg-green-200 text-green-800' 
                                : bar.fillPercentage > 20 
                                  ? 'bg-yellow-200 text-yellow-800' 
                                  : 'bg-red-200 text-red-800'
                            }`}>
                              {bar.fillPercentage > 50 ? '🟢 Good' : bar.fillPercentage > 20 ? '🟡 Low' : '🔴 Critical'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats Footer */}
                    <div className="mt-3 pt-2 border-t border-blue-200 flex justify-center">
                      <div className="text-xs text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                        <span className="font-medium">Efficiency: </span>
                        <span className="font-bold text-blue-700">
                          {bar.totalAdded > 0 ? ((bar.sold / bar.totalAdded) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>

                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-10 border-r-10 border-t-8 border-l-transparent border-r-transparent border-t-blue-300"></div>
                      <div className="w-0 h-0 border-l-8 border-r-8 border-t-6 border-l-transparent border-r-transparent border-t-white absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-px"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <motion.div
        className="flex justify-center space-x-8 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-6 bg-gradient-to-t from-green-700 to-green-400 rounded shadow-sm border border-green-300" />
          <span className="text-sm font-medium text-gray-700">Available Stock</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-6 bg-gradient-to-t from-gray-300 to-gray-100 rounded shadow-sm border border-gray-200" />
          <span className="text-sm font-medium text-gray-700">Sold/Empty</span>
        </div>
      </motion.div>
    </div>
  )
}

export default LiquidFillChart3D
