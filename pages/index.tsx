import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '@/components/Navbar'
import ProductTable from '@/components/ProductTable'
import SummaryChart from '@/components/SummaryChart'
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

interface SummaryData {
  products: Product[]
}

interface DateRangeSummaryData {
  products: Product[]
  total_added_qty_in_range: number
  total_added_amount_in_range: number
  total_sold_qty_in_range: number
  total_sold_amount_in_range: number
}

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState({
    start: '',
    end: ''
  })
  const [filteredData, setFilteredData] = useState<DateRangeSummaryData | null>(null)
  const [isFiltering, setIsFiltering] = useState(false)

  // Fetch enhanced summary data with financial analytics
  const fetchSummary = async () => {
    try {
      const response = await apiCall('/summary/enhanced')
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error('Failed to fetch enhanced summary:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch date range summary
  const fetchDateRangeSummary = async (start: string, end: string) => {
    setIsFiltering(true)
    try {
      const response = await apiCall(
        `/summary?start=${start}&end=${end}`
      )
      const data = await response.json()
      setFilteredData(data)
    } catch (error) {
      console.error('Failed to fetch date range summary:', error)
      setFilteredData(null)
    } finally {
      setIsFiltering(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDateFilter(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const applyDateFilter = () => {
    if (dateFilter.start && dateFilter.end) {
      fetchDateRangeSummary(dateFilter.start, dateFilter.end)
    }
  }

  const clearDateFilter = () => {
    setDateFilter({ start: '', end: '' })
    setFilteredData(null)
  }

  const refreshData = () => {
    fetchSummary()
    if (dateFilter.start && dateFilter.end) {
      fetchDateRangeSummary(dateFilter.start, dateFilter.end)
    }
  }

  const displayProducts = filteredData ? filteredData.products : products
  const totalAddedQty = displayProducts.reduce((sum, p) => sum + (p.total_added_qty || 0), 0)
  const totalAddedAmount = displayProducts.reduce((sum, p) => sum + (Number(p.total_added_amount) || 0), 0)
  const totalSoldQty = displayProducts.reduce((sum, p) => sum + (p.total_sold_qty || 0), 0)
  const totalSoldAmount = displayProducts.reduce((sum, p) => sum + (Number(p.total_sold_amount) || 0), 0)
  const totalStock = displayProducts.reduce((sum, p) => sum + (p.available_stock || 0), 0)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Refresh
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">P</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                      <dd className="text-lg font-medium text-gray-900">{displayProducts.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">+</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Added Qty {filteredData && '(Range)'}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {filteredData ? filteredData.total_added_qty_in_range : totalAddedQty}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">-</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Sold Qty {filteredData && '(Range)'}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {filteredData ? filteredData.total_sold_qty_in_range : totalSoldQty}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">S</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Available Stock</dt>
                      <dd className="text-lg font-medium text-gray-900">{totalStock}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">৳</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Added Value {filteredData && '(Range)'}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ৳{filteredData ? (Number(filteredData.total_added_amount_in_range) || 0).toFixed(2) : totalAddedAmount.toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">💰</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Revenue {filteredData && '(Range)'}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ৳{filteredData ? (Number(filteredData.total_sold_amount_in_range) || 0).toFixed(2) : totalSoldAmount.toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date Filter */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Date Range Filter</h2>
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start"
                  name="start"
                  value={dateFilter.start}
                  onChange={handleDateFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="end"
                  name="end"
                  value={dateFilter.end}
                  onChange={handleDateFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={applyDateFilter}
                  disabled={!dateFilter.start || !dateFilter.end || isFiltering}
                  className={`px-4 py-2 rounded-md font-medium ${
                    !dateFilter.start || !dateFilter.end || isFiltering
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white transition duration-150 ease-in-out`}
                >
                  {isFiltering ? 'Filtering...' : 'Apply Filter'}
                </button>
                <button
                  onClick={clearDateFilter}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Clear Filter
                </button>
              </div>
            </div>
            {filteredData && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  Showing data from {dateFilter.start} to {dateFilter.end}
                </p>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Charts */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Charts & Analytics</h2>
              <SummaryChart products={displayProducts} />
            </div>

            {/* Product Table */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Enhanced Product Summary {filteredData && '(Filtered)'}
              </h2>
              <ProductTable products={displayProducts} enhanced={true} />
            </div>
          </>
        )}
      </div>
    </div>
    </ProtectedRoute>
  )
}

export default Dashboard
