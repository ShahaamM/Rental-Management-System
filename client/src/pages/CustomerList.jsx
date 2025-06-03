// src/pages/CustomerList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const res = await fetch('/api/customers', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete customer');
      fetchCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading customers: {error}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Customer Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {customers.length} {customers.length === 1 ? 'customer' : 'customers'} registered
          </p>
        </div>
        <button 
          onClick={() => navigate('/customers/add')} 
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">NIC/License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((cust) => (
                <tr key={cust._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        src={cust.photo ? `https://tnt.carte.one${cust.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(cust.name)}&background=random`}
                        alt={cust.name}
                        className="h-10 w-10 rounded-full object-cover border-2 border-purple-100"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cust.name)}&background=random`;
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{cust.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{cust.mobile}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded">
                      {cust.nicOrLicense}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/customers/edit/${cust._id}`)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cust._id)}
                        className="text-red-600 hover:text-red-800 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-gray-400 flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="text-lg font-medium text-gray-500">No customers found</span>
                      <button
                        onClick={() => navigate('/customers/add')}
                        className="mt-4 text-white bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-lg shadow hover:shadow-md transition-all"
                      >
                        Add First Customer
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;