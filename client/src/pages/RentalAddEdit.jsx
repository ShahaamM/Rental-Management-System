// src/pages/RentalAddEdit.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormInput from '../components/FormInput';

const RentalAddEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([{ itemName: '', model: '', quantity: '', price: '', total: '' }]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [daysRented, setDaysRented] = useState(1);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [modelSuggestions, setModelSuggestions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetch(`/api/rentals/${id}`)
        .then(res => res.json())
        .then(data => {
          setCustomerName(data.customerName);
          setStartDate(data.startDate?.split('T')[0]);
          setEndDate(data.endDate?.split('T')[0]);
          setItems(data.items);
        });
    }
  }, [id]);

  useEffect(() => {
    const totalPerDay = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)));
    setDaysRented(days);
    setGrandTotal(totalPerDay * days);
  }, [items, startDate, endDate]);

  const fetchSuggestions = async (type, value) => {
    if (value.length < 2) return;
    try {
      const res = await fetch(`/api/suggestions?field=${type}&query=${value}`);
      const data = await res.json();
      if (type === 'customerName') setCustomerSuggestions(data);
      if (type === 'itemName') setItemSuggestions(data);
      if (type === 'model') setModelSuggestions(data);
    } catch (err) {
      console.error('Suggestion fetch failed');
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (['quantity', 'price'].includes(field)) {
      const qty = parseFloat(newItems[index].quantity) || 0;
      const price = parseFloat(newItems[index].price) || 0;
      newItems[index].total = (qty * price).toFixed(2);
    }
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { itemName: '', model: '', quantity: '', price: '', total: '' }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerName || items.length === 0 || items.some(i => !i.itemName || !i.quantity || !i.price)) {
      setError('Please complete all required fields.');
      return;
    }

    const payload = { customerName, startDate, endDate, items };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/rentals/${id}` : '/api/rentals';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert(id ? 'Rental updated!' : 'Rental added!');
        navigate('/rentals');
      } else {
        const error = await res.json();
        setError(error.message || 'Failed to save rental');
      }
    } catch {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{id ? 'Edit Rental' : 'Add Rental'}</h2>
        <button onClick={() => navigate('/rentals')} className="text-sm bg-gray-100 border px-4 py-1 rounded hover:bg-gray-200">← Back</button>
      </div>
      {error && <p className="text-red-600 mb-2 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FormInput label="Customer Name" value={customerName} onChange={(e) => {
            setCustomerName(e.target.value);
            fetchSuggestions('customerName', e.target.value);
          }} />
          {customerSuggestions.length > 0 && (
            <ul className="bg-white border rounded mt-1 text-sm shadow">
              {customerSuggestions.map((s, i) => (
                <li key={i} onClick={() => { setCustomerName(s); setCustomerSuggestions([]); }} className="p-2 hover:bg-gray-100 cursor-pointer">{s}</li>
              ))}
            </ul>
          )}
        </div>

        {items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
            <div>
              <FormInput
                label="Item Name"
                value={item.itemName}
                onChange={(e) => {
                  handleItemChange(idx, 'itemName', e.target.value);
                  fetchSuggestions('itemName', e.target.value);
                }}
              />
              {itemSuggestions.length > 0 && (
                <ul className="bg-white border rounded mt-1 text-sm shadow">
                  {itemSuggestions.map((s, i) => (
                    <li key={i} onClick={() => { handleItemChange(idx, 'itemName', s); setItemSuggestions([]); }} className="p-2 hover:bg-gray-100 cursor-pointer">{s}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <FormInput
                label="Model"
                value={item.model}
                onChange={(e) => {
                  handleItemChange(idx, 'model', e.target.value);
                  fetchSuggestions('model', e.target.value);
                }}
              />
              {modelSuggestions.length > 0 && (
                <ul className="bg-white border rounded mt-1 text-sm shadow">
                  {modelSuggestions.map((s, i) => (
                    <li key={i} onClick={() => { handleItemChange(idx, 'model', s); setModelSuggestions([]); }} className="p-2 hover:bg-gray-100 cursor-pointer">{s}</li>
                  ))}
                </ul>
              )}
            </div>
            <FormInput label="Qty" type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} />
            <FormInput label="Price" type="number" value={item.price} onChange={(e) => handleItemChange(idx, 'price', e.target.value)} />
            <FormInput label="Total" value={item.total} disabled />
            <div className="flex justify-center items-center">
              <button type="button" onClick={() => handleRemoveItem(idx)} className="bg-red-500 text-white text-sm font-bold rounded-full px-2 h-6 w-6 flex items-center justify-center">×</button>
            </div>
          </div>
        ))}

        <button type="button" onClick={handleAddItem} className="bg-green-500 text-white px-4 py-1 rounded">+ Add Item</button>

        <div className="mt-4 font-semibold">
          Number of Days: {daysRented} <br />
          Grand Total: Rs. {grandTotal.toFixed(2)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <FormInput label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded">{id ? 'Update' : 'Submit'}</button>
        </div>
      </form>
    </div>
  );
};

export default RentalAddEdit;
