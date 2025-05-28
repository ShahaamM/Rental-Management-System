// src/pages/RentalAddEdit.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus } from 'lucide-react';

const RentalAddEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    customerName: '',
    startDate: '',
    endDate: '',
    items: [{ itemName: '', model: '', quantity: '', price: '', total: '' }]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState({});

  const fetchSuggestions = async (field, query) => {
  if (query.length < 1) return;

  try {
    const token = localStorage.getItem('token'); // ✅ Make sure token exists

    const res = await fetch(`/api/suggestions?field=${field}&query=${query}`, {
      headers: {
        'Authorization': `Bearer ${token}` // ✅ Add token in request
      }
    });

    if (!res.ok) throw new Error('Unauthorized');

    const data = await res.json();
    setSuggestions(prev => ({ ...prev, [field]: data }));
  } catch (err) {
    console.error('Suggestion fetch failed:', err.message);
  }
};


  const handleChange = async (e, index = null, field = null) => {
    const { name, value } = e.target;
    if (index !== null && field) {
      const updatedItems = [...formData.items];
      updatedItems[index][field] = value;
      fetchSuggestions(field, value, index);

      const { itemName, model } = updatedItems[index];
      if (itemName && model && (field === 'itemName' || field === 'model')) {
        try {
          const res = await fetch(`/api/rentals/price?itemName=${encodeURIComponent(itemName)}&model=${encodeURIComponent(model)}`);
          const data = await res.json();
          updatedItems[index].price = data.price || '';
        } catch {
          updatedItems[index].price = '';
        }
      }

      const qty = parseFloat(updatedItems[index].quantity || 0);
      const price = parseFloat(updatedItems[index].price || 0);
      updatedItems[index].total = (qty * price).toFixed(2);

      setFormData({ ...formData, items: updatedItems });
    } else {
      setFormData({ ...formData, [name]: value });
      fetchSuggestions(name, value, 0);
    }
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemName: '', model: '', quantity: '', price: '', total: '' }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
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
      setFormData(data);
    } catch (err) {
      setError('Failed to load rental');
    }
  };

  useEffect(() => {
    if (isEditMode) fetchRental();
  }, [id]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate('/rentals')} className="mb-4 flex items-center gap-2 text-sm text-blue-600 hover:underline">
        <ArrowLeft size={16} /> Back to Rentals
      </button>
      <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit Rental' : 'Add Rental'}</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md border">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700">Customer Name</label>
          <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          {suggestions[`customerName_0`]?.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border rounded shadow">
              {suggestions[`customerName_0`].map((s, i) => (
                <li key={i} onClick={() => {
                  setFormData(prev => ({ ...prev, customerName: s }));
                  setSuggestions(prev => ({ ...prev, customerName_0: [] }));
                }} className="px-2 py-1 hover:bg-blue-100 cursor-pointer">
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input type="date" name="startDate" value={formData.startDate?.split('T')[0]} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input type="date" name="endDate" value={formData.endDate?.split('T')[0]} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Items</h3>
          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 mb-2 relative">
              <div className="relative">
                <input type="text" placeholder="Item Name" value={item.itemName} onChange={(e) => handleChange(e, index, 'itemName')} className="border rounded px-2 py-1 w-full" />
                {suggestions[`itemName_${index}`]?.length > 0 && (
                  <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto shadow rounded text-sm">
                    {suggestions[`itemName_${index}`].map((s, i) => (
                      <li key={i} onClick={() => {
                        const updated = [...formData.items];
                        updated[index].itemName = s;
                        setFormData({ ...formData, items: updated });
                        setSuggestions(prev => ({ ...prev, [`itemName_${index}`]: [] }));
                      }} className="px-2 py-1 hover:bg-blue-100 cursor-pointer">{s}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative">
                <input type="text" placeholder="Model" value={item.model} onChange={(e) => handleChange(e, index, 'model')} className="border rounded px-2 py-1 w-full" />
                {suggestions[`model_${index}`]?.length > 0 && (
                  <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto shadow rounded text-sm">
                    {suggestions[`model_${index}`].map((s, i) => (
                      <li key={i} onClick={() => {
                        const updated = [...formData.items];
                        updated[index].model = s;
                        setFormData({ ...formData, items: updated });
                        setSuggestions(prev => ({ ...prev, [`model_${index}`]: [] }));
                      }} className="px-2 py-1 hover:bg-blue-100 cursor-pointer">{s}</li>
                    ))}
                  </ul>
                )}
              </div>
              <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleChange(e, index, 'quantity')} className="border rounded px-2 py-1" />
              <input type="number" placeholder="Price" value={item.price} onChange={(e) => handleChange(e, index, 'price')} className="border rounded px-2 py-1" />
              <input type="text" placeholder="Total" value={item.total} readOnly className="bg-gray-100 border rounded px-2 py-1" />
            </div>
          ))}

          <button type="button" onClick={addItemRow} className="mt-2 text-blue-600 flex items-center gap-1 text-sm hover:underline">
            <Plus size={14} /> Add Item
          </button>
        </div>

        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2">
          <Save size={16} /> {isEditMode ? 'Update Rental' : 'Save Rental'}
        </button>
      </form>
    </div>
  );
};

export default RentalAddEdit;
