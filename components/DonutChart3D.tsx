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

interface DonutChart3DProps {
  products: Product[]
}

interface DonutSegment {
  label: string
  value: number
  percentage: number
  color: string
  shadowColor: string
}

const DonutChart3D: React.FC<DonutChart3DProps> = ({ products }) => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null)
  const [animationComplete, setAnimationComplete] = useState(false)

  const totalSales = products.reduce((sum, product) => sum + (Number(product.total_sold_amount) || 0), 0)

  const segments: DonutSegment[] = products
    .map((product, index) => {
      const value = Number(product.total_sold_amount) || 0
      const percentage = totalSales > 0 ? (value / totalSales) * 100 : 0
      
      const colors = [
        { color: '#3B82F6', shadowColor: '#1E40AF' }, // Blue
        { color: '#14B8A6', shadowColor: '#0F766E' }, // Teal
        { color: '#8B5CF6', shadowColor: '#6D28D9' }, // Purple
        { color: '#F59E0B', shadowColor: '#D97706' }, // Amber
        { color: '#EF4444', shadowColor: '#DC2626' }, // Red
        { color: '#10B981', shadowColor: '#047857' }, // Emerald
      ]
      
      return {
        label: product.name,
        value,
        percentage,
        color: colors[index % colors.length].color,
        shadowColor: colors[index % colors.length].shadowColor,
      }
    })
    .filter(segment => segment.value > 0)

  const radius = 80
  const strokeWidth = 25
  const center = 120
  const circumference = 2 * Math.PI * radius

  let cumulativePercentage = 0

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (totalSales === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-2xl border border-gray-100">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No sales data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-2xl border border-gray-100">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Sales Distribution</h3>
        <p className="text-gray-600">Revenue contribution by product</p>
      </div>

      <div className="relative h-80 flex items-center justify-center">
        {/* Main Donut Chart */}
        <div className="relative">
          <svg width="240" height="240" className="transform -rotate-90">
            {/* Shadow/Base Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
              className="drop-shadow-lg"
            />
            
            {/* Animated Segments */}
            {segments.map((segment, index) => {
              const segmentPercentage = segment.percentage
              const strokeDasharray = `${(segmentPercentage / 100) * circumference} ${circumference}`
              const strokeDashoffset = -((cumulativePercentage / 100) * circumference)
              
              const currentCumulative = cumulativePercentage
              cumulativePercentage += segmentPercentage

              return (
                <motion.circle
                  key={index}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={`url(#gradient-${index})`}
                  strokeWidth={hoveredSegment === index ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="cursor-pointer transition-all duration-300 drop-shadow-lg"
                  style={{
                    filter: hoveredSegment === index 
                      ? `drop-shadow(0 8px 25px ${segment.color}40)` 
                      : `drop-shadow(0 4px 15px ${segment.color}20)`
                  }}
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray }}
                  transition={{ 
                    delay: index * 0.2, 
                    duration: 1.2, 
                    ease: "easeOut" 
                  }}
                  onMouseEnter={() => setHoveredSegment(index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              )
            })}

            {/* Gradient Definitions */}
            <defs>
              {segments.map((segment, index) => (
                <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={segment.color} stopOpacity="1" />
                  <stop offset="50%" stopColor={segment.color} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={segment.shadowColor} stopOpacity="1" />
                </linearGradient>
              ))}
            </defs>
          </svg>

          {/* Center Content */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">${totalSales.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Total Sales</p>
            </div>
          </motion.div>
        </div>

        {/* Floating Labels with Lines */}
        {segments.map((segment, index) => {
          let currentCumulative = 0
          for (let i = 0; i < index; i++) {
            currentCumulative += segments[i].percentage
          }
          const segmentMiddle = currentCumulative + segment.percentage / 2
          const angle = (segmentMiddle / 100) * 360 - 90 // -90 to start from top
          const radian = (angle * Math.PI) / 180
          
          const labelRadius = radius + 60
          const lineStartRadius = radius + strokeWidth / 2 + 5
          
          const labelX = center + labelRadius * Math.cos(radian)
          const labelY = center + labelRadius * Math.sin(radian)
          const lineStartX = center + lineStartRadius * Math.cos(radian)
          const lineStartY = center + lineStartRadius * Math.sin(radian)

          return (
            <motion.div
              key={index}
              className="absolute pointer-events-none"
              style={{
                left: labelX - 40,
                top: labelY - 20,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2 + 1.2, duration: 0.5 }}
            >
              {/* Connection Line */}
              <svg
                className="absolute"
                style={{
                  left: -labelRadius + 40,
                  top: -labelRadius + 20,
                  width: labelRadius * 2,
                  height: labelRadius * 2,
                }}
              >
                <line
                  x1={lineStartX - (labelX - labelRadius)}
                  y1={lineStartY - (labelY - labelRadius)}
                  x2={labelX - (labelX - labelRadius)}
                  y2={labelY - (labelY - labelRadius)}
                  stroke={segment.color}
                  strokeWidth="2"
                  strokeDasharray="3,3"
                  className="opacity-60"
                />
              </svg>

              {/* Floating Label */}
              <motion.div
                className="bg-white rounded-lg shadow-xl border border-gray-200 px-3 py-2 text-center min-w-20"
                style={{
                  boxShadow: `0 8px 25px ${segment.color}20, 0 4px 10px rgba(0,0,0,0.1)`
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div 
                  className="w-3 h-3 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: segment.color }}
                />
                <p className="text-xs font-semibold text-gray-800">{segment.percentage.toFixed(1)}%</p>
                <p className="text-xs text-gray-600 truncate">{segment.label}</p>
                <p className="text-xs font-medium text-gray-700">${segment.value.toFixed(0)}</p>
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* Detailed Tooltip */}
      <AnimatePresence>
        {hoveredSegment !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-4"
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: segments[hoveredSegment].color }}
              />
              <div>
                <h4 className="font-semibold text-gray-800">{segments[hoveredSegment].label}</h4>
                <p className="text-sm text-gray-600">
                  ${segments[hoveredSegment].value.toFixed(2)} ({segments[hoveredSegment].percentage.toFixed(1)}% of total sales)
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Stats */}
      <motion.div
        className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <h5 className="font-semibold text-gray-800 mb-1">Top Product</h5>
            <p className="text-2xl font-bold text-blue-600">
              {segments.length > 0 ? segments[0].percentage.toFixed(1) : 0}%
            </p>
            <p className="text-xs text-gray-600">Highest sales share</p>
          </div>
          <div>
            <h5 className="font-semibold text-gray-800 mb-1">Total Revenue</h5>
            <p className="text-2xl font-bold text-green-600">
              ${totalSales.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">All product sales</p>
          </div>
          <div>
            <h5 className="font-semibold text-gray-800 mb-1">Products Sold</h5>
            <p className="text-2xl font-bold text-purple-600">
              {segments.length}
            </p>
            <p className="text-xs text-gray-600">Active products</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DonutChart3D
