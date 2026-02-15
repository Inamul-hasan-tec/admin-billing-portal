import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Users, Package, ShoppingCart, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    orders: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [customersRes, productsRes, ordersRes] = await Promise.all([
        axios.get('/customers'),
        axios.get('/products'),
        axios.get('/orders?limit=5'),
      ]);

      setStats({
        customers: customersRes.data.count,
        products: productsRes.data.count,
        orders: ordersRes.data.count,
        recentOrders: ordersRes.data.data,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Customers', value: stats.customers, icon: Users, color: 'blue' },
    { label: 'Total Products', value: stats.products, icon: Package, color: 'green' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'purple' },
  ];

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-full bg-${stat.color}-100`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
        {stats.recentOrders.length === 0 ? (
          <p className="text-gray-500">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.order_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{order.order_id}</td>
                    <td className="py-3 px-4">{order.customer_name}</td>
                    <td className="py-3 px-4">{new Date(order.order_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">₹{parseFloat(order.total_amount || 0).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
