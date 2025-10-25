import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import SearchableDropdown from '@/components/SearchableDropdown'
import { apiCall } from '@/utils/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'

const AddProduct = () => {
  const [formData, setFormData] = useState({
    product_name: '',
    quantity: '',
    unit_price: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [products, setProducts] = useState<string[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  // Add New Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [newProductName, setNewProductName] = useState('')
  const [addingProduct, setAddingProduct] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Fetch products for dropdown
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true)
      const response = await apiCall('/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddNewProduct = async () => {
    if (!newProductName.trim()) {
      showToast('Please enter a product name', 'error')
      return
    }

    // Check if product already exists
    if (products.includes(newProductName.trim())) {
      showToast('Product already exists', 'error')
      return
    }

    setAddingProduct(true)

    try {
      // Add product with minimal quantity (1) and price (0.01) just to create it
      const response = await apiCall('/add', {
        method: 'POST',
        body: JSON.stringify({
          product_name: newProductName.trim(),
          quantity: 0,
          unit_price: 0,
          date: new Date().toISOString().split('T')[0]
        })
      })

      const data = await response.json()

      if (data.success) {
        showToast('Product added successfully!', 'success')
        setShowAddProductModal(false)
        setNewProductName('')
        // Refresh products list
        await fetchProducts()
        // Set the new product as selected
        setFormData(prev => ({
          ...prev,
          product_name: newProductName.trim()
        }))
      } else {
        showToast(data.message || 'Failed to add product', 'error')
      }
    } catch (error: any) {
      showToast('Failed to add product', 'error')
    } finally {
      setAddingProduct(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.product_name || !formData.quantity || !formData.unit_price || !formData.date) {
      setMessage('Please fill in all fields')
      setMessageType('error')
      return
    }

    if (parseInt(formData.quantity) <= 0) {
      setMessage('Quantity must be greater than 0')
      setMessageType('error')
      return
    }

    if (parseFloat(formData.unit_price) <= 0) {
      setMessage('Unit price must be greater than 0')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await apiCall('/add', {
        method: 'POST',
        body: JSON.stringify({
          product_name: formData.product_name,
          quantity: parseInt(formData.quantity),
          unit_price: parseFloat(formData.unit_price),
          date: formData.date
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`${data.message}. Available stock: ${data.product.available_stock}`)
        setMessageType('success')
        // Reset form except product name
        setFormData(prev => ({
          ...prev,
          quantity: '',
          unit_price: '',
          date: new Date().toISOString().split('T')[0]
        }))
        // Refresh products list
        await fetchProducts()
      } else {
        setMessage(data.message)
        setMessageType('error')
      }
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'An error occurred while adding the product')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'admin', 'editor']}>
      <div className="min-h-screen bg-gray-50">
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

        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Product Stock</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="block text-sm font-medium text-gray-700">
                    Select Product
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(true)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus size={16} />
                    Add New Product
                  </button>
                </div>
                {loadingProducts ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    Loading products...
                  </div>
                ) : products.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    No products available. Click "Add New Product" to create one.
                  </div>
                ) : (
                  <SearchableDropdown
                    options={products.map((product) => ({
                      id: product,
                      name: product
                    }))}
                    value={formData.product_name}
                    onChange={(value) => setFormData(prev => ({ ...prev, product_name: value }))}
                    placeholder="Search and select a product"
                    required
                    disabled={loadingProducts}
                  />
                )}
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter quantity to add"
                  required
                />
              </div>

              <div>
                <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Price ($)
                </label>
                <input
                  type="number"
                  id="unit_price"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleInputChange}
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter price per unit"
                  required
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {message && (
                <div className={`p-4 rounded-md ${messageType === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || products.length === 0}
                className={`w-full py-2 px-4 rounded-md font-medium ${loading || products.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  } text-white transition duration-150 ease-in-out`}
              >
                {loading ? 'Adding Stock...' : 'Add Stock'}
              </button>
            </form>
          </div>
        </div>

        {/* Add New Product Modal */}
        <AnimatePresence>
          {showAddProductModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddProductModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center rounded-t-xl">
                  <h2 className="text-xl font-bold">Add New Product</h2>
                  <button
                    onClick={() => setShowAddProductModal(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddNewProduct()
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product name"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewProduct}
                      disabled={addingProduct}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingProduct ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Adding...
                        </span>
                      ) : (
                        'Add Product'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}

export default AddProduct
