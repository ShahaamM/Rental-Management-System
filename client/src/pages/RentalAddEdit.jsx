// src/pages/RentalAddEdit.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';

const RentalAddEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    items: [{ itemName: '', model: '', quantity: '', price: '', total: '' }]
  });
  const [grandTotal, setGrandTotal] = useState(0);
  const [daysRented, setDaysRented] = useState(1);
  const [suggestions, setSuggestions] = useState({
    customer: [],
    item: [],
    model: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`/api/rentals/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            ...data,
            startDate: data.startDate?.split('T')[0],
            endDate: data.endDate?.split('T')[0]
          });
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    const totalPerDay = formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.total) || 0);
    }, 0);

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    setDaysRented(days);
    setGrandTotal(parseFloat((totalPerDay * days).toFixed(2)));
  }, [formData.items, formData.startDate, formData.endDate]);

  const fetchSuggestions = async (type, value) => {
    if (value.length < 2) {
      setSuggestions(prev => ({ ...prev, [type]: [] }));
      return;
    }
    try {
      const res = await fetch(`/api/suggestions?field=${type}&query=${value}`);
      const data = await res.json();
      setSuggestions(prev => ({ ...prev, [type]: data }));
    } catch {
      console.error('Suggestion fetch failed');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'customerName') fetchSuggestions('customer', value);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    if (['quantity', 'price'].includes(field)) {
      const qty = parseFloat(newItems[index].quantity) || 0;
      const price = parseFloat(newItems[index].price) || 0;
      newItems[index].total = qty && price ? (qty * price).toFixed(2) : '';
    }

    if (field === 'itemName') fetchSuggestions('item', value);
    if (field === 'model') fetchSuggestions('model', value);

    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { itemName: '', model: '', quantity: '', price: '', total: '' }]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (
      !formData.customerName ||
      formData.items.length === 0 ||
      formData.items.some(i =>
        !i.itemName || !i.quantity || isNaN(i.quantity) || !i.price || isNaN(i.price)
      )
    ) {
      setError('Please complete all required fields correctly.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        customerName: formData.customerName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        items: formData.items
      };

      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/rentals/${id}` : '/api/rentals';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save rental');
      }

      alert(id ? 'Rental updated successfully!' : 'Rental added successfully!');
      navigate('/rentals');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          {id ? 'Edit Rental' : 'Create New Rental'}
        </h2>
        <button
          onClick={() => navigate('/rentals')}
          className="text-gray-600 hover:text-gray-800 bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to List
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
          <div className="relative">
            <input
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Enter customer name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={loading}
            />
            {suggestions.customer.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {suggestions.customer.map((s, i) => (
                  <li 
                    key={i} 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, customerName: s }));
                      setSuggestions(prev => ({ ...prev, customer: [] }));
                    }}
                    className="p-2 hover:bg-purple-50 cursor-pointer"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Items */}
        {formData.items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <input value={item.itemName} onChange={e => handleItemChange(idx, 'itemName', e.target.value)} placeholder="Item Name" className="md:col-span-2 border px-3 py-2 rounded-lg text-sm" required />
            <input value={item.model} onChange={e => handleItemChange(idx, 'model', e.target.value)} placeholder="Model" className="border px-3 py-2 rounded-lg text-sm" />
            <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} placeholder="Qty" className="border px-3 py-2 rounded-lg text-sm" required />
            <input type="number" min="0" value={item.price} onChange={e => handleItemChange(idx, 'price', e.target.value)} placeholder="Price" className="border px-3 py-2 rounded-lg text-sm" required />
            <div className="flex items-center gap-2">
              <div className="flex-1 border px-3 py-2 rounded-lg text-sm bg-gray-100">Rs. {item.total || '0.00'}</div>
              {formData.items.length > 1 && (
                <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-100 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        ))}

        <button type="button" onClick={handleAddItem} className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1 text-sm" disabled={loading}>
          <Plus size={16} />
          Add Another Item
        </button>

        {/* Summary */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-700">Number of Days: <strong>{daysRented}</strong></div>
            </div>
            <div className="text-lg font-bold text-purple-700 text-right">
              Grand Total: Rs. {grandTotal.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2" disabled={loading}>
            <Save size={18} />
            {id ? 'Update Rental' : 'Create Rental'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RentalAddEdit;
