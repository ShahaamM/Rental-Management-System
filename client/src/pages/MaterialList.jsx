// MaterialList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MaterialList = () => {
  const [materials, setMaterials] = useState([]);
  const navigate = useNavigate();

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/materials');
      const data = await res.json();
      setMaterials(data);
    } catch (err) {
      alert('Failed to fetch materials');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await fetch(`/api/materials/${id}`, { method: 'DELETE' });
      fetchMaterials();
    } catch (err) {
      alert('Delete failed');
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Materials</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate('/materials/add')}
        >
          Add Material
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Item</th>
              <th className="px-4 py-2 text-left">Model</th>
              <th className="px-4 py-2 text-left">Qty</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Notes</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((mat) => (
              <tr key={mat._id} className="border-t">
                <td className="px-4 py-2">{mat.itemName}</td>
                <td className="px-4 py-2">{mat.model}</td>
                <td className="px-4 py-2">{mat.quantity}</td>
                <td className="px-4 py-2">${mat.price}</td>
                <td className="px-4 py-2">{mat.notes}</td>
                <td className="px-4 py-2">
                  <button
                    className="text-blue-600 hover:underline mr-3"
                    onClick={() => navigate(`/materials/edit/${mat._id}`)}
                  >Edit</button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(mat._id)}
                  >Delete</button>
                </td>
              </tr>
            ))}
            {materials.length === 0 && (
              <tr><td colSpan="6" className="text-center text-gray-500 py-4">No materials found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialList;