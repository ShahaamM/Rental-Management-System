// src/pages/RentalAddEdit.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';

const RentalAddEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    customerName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    items: [{ itemName: '', model: '', quantity: '', price: '', total: '' }]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e, index = null, field = null) => {
    const { name, value } = e.target;

    if (index !== null && field) {
      const updatedItems = [...formData.items];
      updatedItems[index][field] = value;

      const qty = parseFloat(updatedItems[index].quantity || 0);
      const price = parseFloat(updatedItems[index].price || 0);
      updatedItems[index].total = (qty * price).toFixed(2);

      setFormData({ ...formData, items: updatedItems });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemName: '', model: '', quantity: '', price: '', total: '' }]
    });
  };

  const removeItemRow = (index) => {
    if (formData.items.length <= 1) {
      alert('At least one rental item is required.');
      return;
    }
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.customerName.trim()) {
      setError('Customer name is required.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(isEditMode ? `/api/rentals/${id}` : '/api/rentals', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save rental');
      navigate('/rentals');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRental = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/rentals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFormData({
        ...data,
        startDate: data.startDate?.split('T')[0],
        endDate: data.endDate?.split('T')[0]
      });
    } catch (err) {
      setError('Failed to load rental');
    }
  };

  useEffect(() => {
    if (isEditMode) fetchRental();
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          {isEditMode ? 'Edit Rental' : 'Add New Rental'}
        </h2>
        <button onClick={() => navigate('/rentals')} className="text-gray-600 hover:text-gray-800 bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
          <ArrowLeft size={18} />
          Back to List
        </button>
      </div>

      {error && <div className="mb-4 text-red-600 bg-red-50 border border-red-200 p-3 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Customer Name</label>
            <input name="customerName" value={formData.customerName} onChange={handleChange} className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 border-gray-300" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Start Date</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 border-gray-300" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">End Date</label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 border-gray-300" required />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Rental Items</h3>
          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 items-end">
              <input type="text" placeholder="Item Name" value={item.itemName} onChange={(e) => handleChange(e, index, 'itemName')} className="border px-3 py-2 rounded-lg text-sm border-gray-300" required />
              <input type="text" placeholder="Model" value={item.model} onChange={(e) => handleChange(e, index, 'model')} className="border px-3 py-2 rounded-lg text-sm border-gray-300" />
              <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleChange(e, index, 'quantity')} className="border px-3 py-2 rounded-lg text-sm border-gray-300" required />
              <input type="number" placeholder="Price" value={item.price} onChange={(e) => handleChange(e, index, 'price')} className="border px-3 py-2 rounded-lg text-sm border-gray-300" required />
              <input type="text" placeholder="Total" value={item.total} readOnly className="bg-gray-100 border px-3 py-2 rounded-lg text-sm border-gray-300" />
              <button type="button" onClick={() => removeItemRow(index)} className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded-lg">
                <X size={18} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addItemRow} className="text-blue-600 flex items-center gap-2 text-sm hover:underline">
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className="mt-6 text-right">
          <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2">
            <Save size={18} /> {isEditMode ? 'Update Rental' : 'Save Rental'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RentalAddEdit;
