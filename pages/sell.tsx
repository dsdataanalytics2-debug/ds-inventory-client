import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiCall } from '@/utils/auth'

const SellProduct = () => {
  const [formData, setFormData] = useState({
    product_name: '',
    quantity: '',
    unit_price: '',
    date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  })
  const [products, setProducts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  // Fetch products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiCall('/products')
        const data = await response.json()
        setProducts(data.products)
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setProducts([])
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
      const response = await apiCall('/sell', {
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
        // Reset form
        setFormData({
          product_name: '',
          quantity: '',
          unit_price: '',
          date: new Date().toISOString().split('T')[0]
        })
      } else {
        setMessage(data.message || 'Failed to sell product')
        setMessageType('error')
      }
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'An error occurred while selling the product')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'admin', 'editor']}>
      <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Sell Product</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-2">
                Select Product
              </label>
              {loadingProducts ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  Loading products...
                </div>
              ) : products.length === 0 ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  No products available. Please add products first.
                </div>
              ) : (
                <select
                  id="product_name"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product} value={product}>
                      {product}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter quantity to sell"
                required
              />
            </div>

            <div>
              <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price (৳)
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
                placeholder="Enter selling price per unit"
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
              <div className={`p-4 rounded-md ${
                messageType === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || products.length === 0}
              className={`w-full py-2 px-4 rounded-md font-medium ${
                loading || products.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
              } text-white transition duration-150 ease-in-out`}
            >
              {loading ? 'Selling Product...' : 'Sell Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}

export default SellProduct
