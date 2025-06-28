import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const RentalList = () => {
  const [rentals, setRentals] = useState([]);
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const res = await fetch('/api/rentals', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch rentals');
      const data = await res.json();
      setRentals(data);
      setFilteredRentals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const password = window.prompt("Enter admin password to delete this rental:");
    if (password !== '0000') {
      alert('Incorrect password. Deletion cancelled.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this rental record?')) return;

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`/api/rentals/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete rental');
      fetchRentals();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = rentals.filter(r =>
      r.customerName.toLowerCase().includes(query)
    );
    setFilteredRentals(filtered);
  };

  useEffect(() => {
    fetchRentals();
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
        <p className="text-sm text-red-700">Error loading rentals: {error}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Rental Records
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredRentals.length} {filteredRentals.length === 1 ? 'rental' : 'rentals'} displayed
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by customer name"
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={() => navigate('/rental/add')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Rental
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Financials</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRentals.map((rental) => {
                const grandTotal = rental.grandTotal ?? 0;
                const amountPaid = rental.amountPaid ?? 0;
                const remainingAmount = rental.remainingAmount ?? (grandTotal - amountPaid);
                return (
                  <tr key={rental._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rental.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        <div>{rental.startDate?.split('T')[0]}</div>
                        <div className="text-xs text-gray-500">to</div>
                        <div>{rental.endDate?.split('T')[0]}</div>
                        <div className="text-xs text-gray-500 mt-1">{rental.numberOfDays || '-'} days</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 space-y-1">
                        {rental.items.map((item, i) => (
                          <div key={i} className="flex items-center">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs mr-2">{item.quantity}x</span>
                            <span>{item.itemName}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>Total: Rs. {grandTotal.toFixed(2)}</div>
                      <div>Paid: Rs. {amountPaid.toFixed(2)}</div>
                      <div>Due: Rs. {remainingAmount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        new Date(rental.endDate) > new Date() 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {new Date(rental.endDate) > new Date() ? 'Active' : 'Completed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/rental/edit/${rental._id}`)}
                          className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(rental._id)}
                          className="text-red-600 hover:text-red-800 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRentals.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-400 flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="text-lg font-medium text-gray-500">No rentals found</span>
                      <button
                        onClick={() => navigate('/rental/add')}
                        className="mt-4 text-white bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-lg shadow hover:shadow-md transition-all"
                      >
                        Add First Rental
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

export default RentalList;
