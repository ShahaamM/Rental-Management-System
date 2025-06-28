import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const res = await fetch('/api/customers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    const adminCode = prompt('Enter admin code to delete (Hint: 0000)');
    if (adminCode !== '0000') {
      toast.error('Incorrect code. Deletion cancelled.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete customer');

      toast.success('Customer deleted successfully!');
      fetchCustomers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((cust) => {
    const term = searchTerm.toLowerCase();
    return (
      cust.name.toLowerCase().includes(term) ||
      cust.mobile.toLowerCase().includes(term) ||
      cust.nicOrLicense.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
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

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, mobile, or NIC/License"
          className="w-full sm:w-96 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </div>

      {/* Table */}
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
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={
                          cust.photo
                            ? `https://tnt.carte.one${cust.photo}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(cust.name)}&background=random`
                        }
                        alt={cust.name}
                        className="h-10 w-10 rounded-full object-cover border-2 border-purple-100 cursor-pointer hover:scale-110 transition-transform"
                        onClick={() =>
                          setSelectedImage(
                            cust.photo
                              ? `https://tnt.carte.one${cust.photo}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(cust.name)}&background=random`
                          )
                        }
                      />
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
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No matching customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-white p-1 rounded-full shadow hover:bg-red-100"
            >
              <X size={20} className="text-black" />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged"
              className="max-w-full max-h-screen rounded-lg border-4 border-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
