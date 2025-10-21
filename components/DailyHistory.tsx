import React, { useState, useEffect } from 'react';
import { Calendar, Download, Trash2, AlertCircle, Plus, Minus } from 'lucide-react';
import { apiCall, canDelete } from '../utils/auth';

interface TransactionHistoryItem {
  id: number;
  date: string;
  product_name: string;
  transaction_type: string; // "add" or "sell"
  quantity: number;
  unit_price: number | string;
  total_amount: number | string;
}

interface TransactionHistoryResponse {
  transactions: TransactionHistoryItem[];
}

const DailyHistory = () => {
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    transactionId: number;
    transactionType: string;
    productName: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTransactionHistory = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      let url = '/daily-history';
      
      const params = new URLSearchParams();
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await apiCall(url);
      if (!response.ok) throw new Error('Failed to fetch transaction history');
      
      const data: TransactionHistoryResponse = await response.json();
      const normalizedTransactions = data.transactions.map((item) => ({
        id: item.id,
        date: item.date,
        product_name: item.product_name,
        transaction_type: item.transaction_type,
        quantity: item.quantity,
        unit_price: typeof item.unit_price === 'number'
          ? item.unit_price
          : parseFloat(item.unit_price ?? '0'),
        total_amount: typeof item.total_amount === 'number'
          ? item.total_amount
          : parseFloat(item.total_amount ?? '0'),
      }));

      setTransactions(normalizedTransactions);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error fetching transaction history');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  const handleFilter = () => {
    if (startDate && endDate) {
      fetchTransactionHistory(startDate, endDate);
    } else if (!startDate && !endDate) {
      fetchTransactionHistory();
    }
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    fetchTransactionHistory();
  };

  const formatAmount = (amount: number) => {
    const numericAmount = Number.isFinite(amount) ? amount : 0;
    return numericAmount.toFixed(2);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const getTotalAdded = () => {
    return transactions
      .filter(t => t.transaction_type === 'add')
      .reduce((sum: number, item: TransactionHistoryItem) => sum + item.quantity, 0);
  };

  const getTotalSold = () => {
    return transactions
      .filter(t => t.transaction_type === 'sell')
      .reduce((sum: number, item: TransactionHistoryItem) => sum + item.quantity, 0);
  };

  const getTotalAddedAmount = () => {
    return transactions
      .filter(t => t.transaction_type === 'add')
      .reduce((sum: number, item: TransactionHistoryItem) => sum + (typeof item.total_amount === 'number' ? item.total_amount : parseFloat(item.total_amount || '0')), 0);
  };

  const getTotalSoldAmount = () => {
    return transactions
      .filter(t => t.transaction_type === 'sell')
      .reduce((sum: number, item: TransactionHistoryItem) => sum + (typeof item.total_amount === 'number' ? item.total_amount : parseFloat(item.total_amount || '0')), 0);
  };

  const getTransactionIcon = (type: string) => {
    return type === 'add' ? 
      <Plus className="w-4 h-4 text-green-600" /> : 
      <Minus className="w-4 h-4 text-red-600" />;
  };

  const getTransactionStyle = (type: string) => {
    return type === 'add' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  const handleDeleteClick = (transaction: TransactionHistoryItem) => {
    setDeleteConfirmation({
      show: true,
      transactionId: transaction.id,
      transactionType: transaction.transaction_type,
      productName: transaction.product_name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation) return;

    try {
      setDeleting(true);
      const endpoint = deleteConfirmation.transactionType === 'add' 
        ? `/history/add/${deleteConfirmation.transactionId}`
        : `/history/sell/${deleteConfirmation.transactionId}`;

      const response = await apiCall(endpoint, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh the transaction history
        await fetchTransactionHistory(startDate || undefined, endDate || undefined);
        setError('');
      } else {
        setError(result.message || 'Failed to delete transaction');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting transaction');
    } finally {
      setDeleting(false);
      setDeleteConfirmation(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Calendar className="w-6 h-6 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
            </div>
          </div>

          {/* Date Filter Controls */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleFilter}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Apply Filter
                </button>
                <button
                  onClick={clearFilter}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm font-medium"
                >
                  Clear Filter
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {transactions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-sm font-medium text-green-800 mb-1">Total Added Qty</h3>
                <p className="text-2xl font-bold text-green-900">{getTotalAdded().toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-sm font-medium text-green-800 mb-1">Total Added Amount</h3>
                <p className="text-2xl font-bold text-green-900">৳{formatAmount(getTotalAddedAmount())}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="text-sm font-medium text-red-800 mb-1">Total Sold Qty</h3>
                <p className="text-2xl font-bold text-red-900">{getTotalSold().toLocaleString()}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="text-sm font-medium text-red-800 mb-1">Total Sold Amount</h3>
                <p className="text-2xl font-bold text-red-900">৳{formatAmount(getTotalSoldAmount())}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading transaction history...</span>
            </div>
          ) : (
            <>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No transaction history found.</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Add some products or make sales to see transaction history data.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price ($)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Amount ($)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction: TransactionHistoryItem, index: number) => {
                        return (
                          <tr key={`${transaction.date}-${transaction.product_name}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {transaction.product_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTransactionStyle(transaction.transaction_type)}`}>
                                {getTransactionIcon(transaction.transaction_type)}
                                <span className="ml-1 capitalize">{transaction.transaction_type}</span>
                              </div>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              transaction.transaction_type === 'add' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.quantity.toLocaleString()}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              transaction.transaction_type === 'add' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ৳{formatAmount(typeof transaction.unit_price === 'number' ? transaction.unit_price : parseFloat(transaction.unit_price || '0'))}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              transaction.transaction_type === 'add' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ৳{formatAmount(typeof transaction.total_amount === 'number' ? transaction.total_amount : parseFloat(transaction.total_amount || '0'))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {canDelete() && (
                                <button
                                  onClick={() => handleDeleteClick(transaction)}
                                  className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-md transition-colors duration-200"
                                  title={`Delete ${transaction.transaction_type} transaction`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Confirm Delete</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this {deleteConfirmation.transactionType} transaction for "{deleteConfirmation.productName}"? This action cannot be undone and will update the product totals accordingly.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyHistory;
