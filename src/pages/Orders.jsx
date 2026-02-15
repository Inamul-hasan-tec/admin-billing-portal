import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Search, Download, Eye, Trash2, FileDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, startDate, endDate]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const queryString = params.toString();
      const response = await axios.get(`/orders${queryString ? '?' + queryString : ''}`);
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`/orders/${orderId}`);
      setSelectedOrder(response.data.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Failed to fetch order details');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/orders/${orderId}/status`, { status: newStatus });
      alert('Order status updated successfully');
      fetchOrders();
      if (selectedOrder && selectedOrder.order_id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await axios.delete(`/orders/${orderId}`);
      alert('Order deleted successfully');
      fetchOrders();
      if (selectedOrder && selectedOrder.order_id === orderId) {
        setShowModal(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await axios.get(`/csv/orders?${params.toString()}`, { 
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const dateRange = startDate && endDate ? `_${startDate}_to_${endDate}` : '';
      link.setAttribute('download', `orders${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    }
  };

  const handleExportSingleOrderCSV = async (orderId) => {
    try {
      // Fetch full order details with items
      const response = await axios.get(`/orders/${orderId}`);
      const order = response.data.data;
      
      if (!order || !order.items || order.items.length === 0) {
        alert('No items found in this order');
        return;
      }
      
      // Create CSV content for single order
      const csvContent = [
        ['Order ID', 'Customer ID', 'Customer Name', 'Order Date', 'Status', 'Product ID', 'Product Name', 'HSN Code', 'Quantity', 'Unit', 'Rate', 'Tax Rate', 'Total'],
        ...order.items.map(item => [
          order.order_id,
          order.customer_id,
          order.customer_name,
          format(new Date(order.order_date), 'yyyy-MM-dd'),
          order.status,
          item.product_id,
          item.product_name,
          item.hsn_code || '',
          item.quantity,
          item.unit,
          parseFloat(item.rate).toFixed(2),
          item.tax_rate || '18',
          parseFloat(item.total).toFixed(2)
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `order_${order.order_id}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting order CSV:', error);
      alert('Failed to export order CSV: ' + error.message);
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusOptions = ['NEW', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
  const statusColors = {
    NEW: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg">
          <Calendar className="text-gray-500" size={20} />
          <div className="flex gap-4 flex-1">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="self-end px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Items</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{order.order_id}</td>
                  <td className="py-3 px-4">
                    {format(new Date(order.order_date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_id}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{order.item_count}</td>
                  <td className="py-3 px-4">₹{parseFloat(order.total_amount || 0).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]} border-0`}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchOrderDetails(order.order_id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleExportSingleOrderCSV(order.order_id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Download CSV"
                      >
                        <FileDown size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(order.order_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete Order"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <p className="text-gray-500 mt-1">{selectedOrder.order_id}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customer_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedOrder.order_date), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${statusColors[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-lg">
                    ₹{parseFloat(selectedOrder.total_amount || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-bold mb-3">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Product</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">HSN</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Qty</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Rate</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Tax %</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-3">
                            <div className="font-medium">{item.product_name}</div>
                            <div className="text-sm text-gray-500">{item.product_id}</div>
                          </td>
                          <td className="py-2 px-3">{item.hsn_code}</td>
                          <td className="py-2 px-3 text-right">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-2 px-3 text-right">₹{parseFloat(item.rate).toFixed(2)}</td>
                          <td className="py-2 px-3 text-right">{item.tax_rate}%</td>
                          <td className="py-2 px-3 text-right font-medium">
                            ₹{parseFloat(item.total).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="5" className="py-3 px-3 text-right font-bold">
                          Grand Total:
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-lg">
                          ₹{parseFloat(selectedOrder.total_amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleExportSingleOrderCSV(selectedOrder.order_id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  <FileDown size={18} />
                  Download CSV
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
