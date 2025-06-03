// MaterialList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';

const MaterialList = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

const fetchMaterials = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');

    const res = await fetch('/api/materials', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch materials');
    const data = await res.json();
    setMaterials(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this material?')) return;

  try {
    const token = localStorage.getItem('token');

    const res = await fetch(`/api/materials/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Failed to delete material');
    fetchMaterials();
  } catch (err) {
    alert(err.message);
  }
};


  useEffect(() => {
    fetchMaterials();
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
              Error loading materials: {error}
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
            Material Inventory
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {materials.length} {materials.length === 1 ? 'item' : 'items'} in stock
          </p>
        </div>
        <button 
          onClick={() => navigate('/materials/add')} 
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Material
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((mat) => (
                <tr key={mat._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{mat.itemName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{mat.model}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded">
                      {mat.quantity ?? mat.stock}
                      </div>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">${mat.price}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 line-clamp-2">{mat.notes}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/materials/edit/${mat._id}`)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(mat._id)}
                        className="text-red-600 hover:text-red-800 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-400 flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="text-lg font-medium text-gray-500">No materials found</span>
                      <button
                        onClick={() => navigate('/materials/add')}
                        className="mt-4 text-white bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-lg shadow hover:shadow-md transition-all"
                      >
                        Add First Material
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

export default MaterialList;