import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import SearchableDropdown from '@/components/SearchableDropdown'
import { apiCall } from '@/utils/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, User, Phone, MapPin, DollarSign, X, Plus, Filter, Download } from 'lucide-react'

interface Order {
  id: number
  product_id: number
  product_name: string
  quantity_sold: number
  total_amount: string
  customer_name: string | null
  customer_address: string | null
  customer_phone: string | null
  sale_date: string
  created_by: string
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    product_id: ''
  })

  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    quantity_sold: '',
    unit_price: '',
    customer_name: '',
    customer_address: '',
    customer_phone: ''
  })

  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true)
      let url = '/orders'
      const params = new URLSearchParams()

      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.product_id) params.append('product_id', filters.product_id)

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await apiCall(url)
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error: any) {
      console.error('Failed to fetch orders:', error)
      showToast('Failed to fetch orders', 'error')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
      const response = await apiCall('/products/details')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchProducts()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  const handleDownloadExcel = async () => {
    try {
      const response = await apiCall('/orders/export')
      
      if (!response.ok) {
        throw new Error('Failed to download Excel file')
      }
      
      // Get the blob from response
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `orders_export_${new Date().getTime()}.xlsx`
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      showToast('✅ Order data exported successfully', 'success')
    } catch (error: any) {
      console.error('Error downloading Excel:', error)
      showToast('Failed to export orders', 'error')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target

    // If product is selected, update product_name
    if (name === 'product_id') {
      const selectedProduct = products.find(p => p.id === parseInt(value))
      setFormData(prev => ({
        ...prev,
        product_id: value,
        product_name: selectedProduct?.name || ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.product_id || !formData.quantity_sold || !formData.unit_price) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    if (parseInt(formData.quantity_sold) <= 0) {
      showToast('Quantity must be greater than 0', 'error')
      return
    }

    if (parseFloat(formData.unit_price) <= 0) {
      showToast('Unit price must be greater than 0', 'error')
      return
    }

    // Phone validation if provided
    if (formData.customer_phone && formData.customer_phone.trim()) {
      const phone = formData.customer_phone.replace(/\D/g, '')
      if (phone.length < 10 || phone.length > 15) {
        showToast('Phone number must be between 10 and 15 digits', 'error')
        return
      }
    }

    setFormLoading(true)

    try {
      const response = await apiCall('/orders/create', {
        method: 'POST',
        body: JSON.stringify({
          product_id: parseInt(formData.product_id),
          product_name: formData.product_name,
          quantity_sold: parseInt(formData.quantity_sold),
          unit_price: parseFloat(formData.unit_price),
          customer_name: formData.customer_name || null,
          customer_address: formData.customer_address || null,
          customer_phone: formData.customer_phone || null
        })
      })

      const data = await response.json()

      if (data.success) {
        showToast(data.message, 'success')
        setShowCreateModal(false)
        setFormData({
          product_id: '',
          product_name: '',
          quantity_sold: '',
          unit_price: '',
          customer_name: '',
          customer_address: '',
          customer_phone: ''
        })
        fetchOrders() // Refresh orders list
      } else {
        showToast(data.message || 'Failed to create order', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create order', 'error')
    } finally {
      setFormLoading(false)
    }
  }

  const applyFilters = () => {
    fetchOrders()
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({ start_date: '', end_date: '', product_id: '' })
    setTimeout(() => fetchOrders(), 100)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'admin', 'editor']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 right-4 z-50"
            >
              <div className={`px-6 py-4 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                } text-white`}>
                {toast.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Orders Management</h1>
                <p className="text-gray-600">Track and manage all product sales with customer details</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                  title="Download orders as Excel"
                >
                  <Download size={20} />
                  Download Excel
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-md"
                >
                  <Filter size={20} />
                  Filters
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} />
                  Create Order
                </button>
              </div>
            </div>
          </motion.div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-white rounded-lg shadow-md p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={filters.start_date}
                      onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={filters.end_date}
                      onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                    <select
                      value={filters.product_id}
                      onChange={(e) => setFilters(prev => ({ ...prev, product_id: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Products</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={applyFilters}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Orders Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No orders found</p>
                <p className="text-gray-400 text-sm mt-2">Create your first order to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Order ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Customer Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Address</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Total Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Sale Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Created By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{order.product_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{order.quantity_sold}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {order.customer_name || <span className="text-gray-400 italic">N/A</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {order.customer_phone || <span className="text-gray-400 italic">N/A</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                          {order.customer_address || <span className="text-gray-400 italic">N/A</span>}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">
                          ${parseFloat(order.total_amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{formatDate(order.sale_date)}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{order.created_by}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Summary Stats */}
          {orders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{orders.length}</p>
                  </div>
                  <Package size={40} className="text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Quantity Sold</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">
                      {orders.reduce((sum, order) => sum + order.quantity_sold, 0)}
                    </p>
                  </div>
                  <DollarSign size={40} className="text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                      ${orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign size={40} className="text-green-600" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Create Order Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Create New Order</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Product Selection */}
                  <div>
                    <SearchableDropdown
                      options={products.map((product) => ({
                        id: product.id,
                        name: product.name,
                        extra: `Stock: ${product.available_stock}`
                      }))}
                      value={formData.product_name}
                      onChange={(value, id) => {
                        setFormData(prev => ({
                          ...prev,
                          product_id: String(id || ''),
                          product_name: value
                        }))
                      }}
                      label="Product"
                      placeholder="Search and select a product"
                      required
                    />
                  </div>

                  {/* Quantity and Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                      <input
                        type="number"
                        name="quantity_sold"
                        value={formData.quantity_sold}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter quantity"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <DollarSign size={16} className="inline mr-2" />
                        Unit Price *
                      </label>
                      <input
                        type="number"
                        name="unit_price"
                        value={formData.unit_price}
                        onChange={handleInputChange}
                        required
                        min="0.01"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Details (Optional)</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User size={16} className="inline mr-2" />
                          Customer Name
                        </label>
                        <input
                          type="text"
                          name="customer_name"
                          value={formData.customer_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter customer name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone size={16} className="inline mr-2" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="customer_phone"
                          value={formData.customer_phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="10-15 digits"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin size={16} className="inline mr-2" />
                          Address
                        </label>
                        <textarea
                          name="customer_address"
                          value={formData.customer_address}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter customer address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Total Preview */}
                  {formData.quantity_sold && formData.unit_price && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Total Amount:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ${(parseFloat(formData.quantity_sold) * parseFloat(formData.unit_price)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Creating...
                        </span>
                      ) : (
                        'Create Order'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}

export default Orders
