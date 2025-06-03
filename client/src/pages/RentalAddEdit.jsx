import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RentalAddEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    nicOrLicense: '',
    startDate: '',
    endDate: '',
    items: [{ itemName: '', model: '', quantity: '', price: '', total: '' }],
    amountPaid: 0,
    grandTotal: 0,
    numberOfDays: 0,
    remainingAmount: 0
  });

  const [originalItems, setOriginalItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState({});

  const fetchSuggestions = async (field, query, index = 0) => {
    if (query.length < 1 || ['amountPaid', 'startDate', 'endDate'].includes(field)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/suggestions?field=${field}&query=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setSuggestions(prev => ({ ...prev, [`${field}_${index}`]: data }));

      if (field === 'customerName' && data.length > 0) {
        const selected = data[0];
        setFormData(prev => ({
          ...prev,
          mobile: selected.mobile || '',
          nicOrLicense: selected.nicOrLicense || ''
        }));
      }
    } catch (err) {
      console.error('Suggestion fetch failed:', err.message);
    }
  };

  const fetchPrice = async (itemName, model) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/suggestions/price?itemName=${encodeURIComponent(itemName)}&model=${encodeURIComponent(model)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      return data.price || '';
    } catch {
      return '';
    }
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
    const diff = endDate.getTime() - startDate.getTime();
    return diff >= 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) + 1 : 0;
  };

  const handleChange = async (e, index = null, field = null) => {
    const { name, value } = e.target;
    if (index !== null && field) {
      const updatedItems = [...formData.items];
      updatedItems[index][field] = value;
      await fetchSuggestions(field, value, index);

      const { itemName, model, quantity } = updatedItems[index];
      if (itemName && model && (field === 'itemName' || field === 'model')) {
        const fetchedPrice = await fetchPrice(itemName, model);
        updatedItems[index].price = fetchedPrice;
      }

      const qty = parseFloat(updatedItems[index].quantity || 0);
      const price = parseFloat(updatedItems[index].price || 0);
      updatedItems[index].total = (qty * price).toFixed(2);

      const numberOfDays = calculateDays(formData.startDate, formData.endDate);
      const baseTotal = updatedItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
      const grandTotal = baseTotal * numberOfDays;
      const remaining = grandTotal - parseFloat(formData.amountPaid || 0);

      setFormData({
        ...formData,
        items: updatedItems,
        grandTotal: grandTotal.toFixed(2),
        remainingAmount: remaining.toFixed(2),
        numberOfDays
      });
    } else {
      const newForm = { ...formData, [name]: value };
      const updatedStart = name === 'startDate' ? value : formData.startDate;
      const updatedEnd = name === 'endDate' ? value : formData.endDate;
      const numberOfDays = calculateDays(updatedStart, updatedEnd);
      const baseTotal = formData.items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
      const grandTotal = baseTotal * numberOfDays;
      const remaining = grandTotal - parseFloat(name === 'amountPaid' ? value : formData.amountPaid || 0);

      newForm.numberOfDays = numberOfDays;
      newForm.grandTotal = grandTotal.toFixed(2);
      newForm.remainingAmount = remaining.toFixed(2);

      setFormData(newForm);
      await fetchSuggestions(name, value, 0);
    }
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemName: '', model: '', quantity: '', price: '', total: '' }]
    });
  };

  const removeItemRow = (index) => {
    const updated = [...formData.items];
    updated.splice(index, 1);
    const numberOfDays = calculateDays(formData.startDate, formData.endDate);
    const baseTotal = updated.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const grandTotal = baseTotal * numberOfDays;
    const remaining = grandTotal - parseFloat(formData.amountPaid || 0);

    setFormData({
      ...formData,
      items: updated,
      grandTotal: grandTotal.toFixed(2),
      remainingAmount: remaining.toFixed(2),
      numberOfDays
    });
  };

  const restoreStock = async (originalItems) => {
    const token = localStorage.getItem('token');
    await Promise.all(originalItems.map(async (item) => {
      await fetch('/api/materials/restore-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemName: item.itemName, model: item.model, quantity: item.quantity })
      });
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      if (isEditMode && originalItems.length > 0) {
        await restoreStock(originalItems);
      }

      const res = await fetch(isEditMode ? `/api/rentals/${id}` : '/api/rentals', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to save rental');

      await Promise.all(formData.items.map(async (item) => {
        await fetch('/api/materials/update-stock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ itemName: item.itemName, model: item.model, quantity: item.quantity })
        });
      }));

      toast.success(`Rental ${isEditMode ? 'updated' : 'created'} and stock updated.`);
      navigate('/rentals');
    } catch (err) {
      setError(err.message);
      toast.error('Error saving rental: ' + err.message);
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
      data.startDate = new Date(data.startDate).toISOString().split('T')[0];
      data.endDate = new Date(data.endDate).toISOString().split('T')[0];
      setFormData(data);
      setOriginalItems(data.items);
    } catch (err) {
      setError('Failed to load rental');
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchRental();
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, startDate: today }));
    }
  }, [id]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate('/rentals')} className="mb-4 flex items-center gap-2 text-sm text-blue-600 hover:underline">
        <ArrowLeft size={16} /> Back to Rentals
      </button>
      <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit Rental' : 'Add Rental'}</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md border">
        <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Customer Name" className="w-full p-2 border rounded" list="customerName_suggest" />
        <datalist id="customerName_suggest">
          {(suggestions['customerName_0'] || []).map((s, i) => <option key={i} value={s.name} />)}
        </datalist>
        <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile" className="w-full p-2 border rounded" />
        <input type="text" name="nicOrLicense" value={formData.nicOrLicense} onChange={handleChange} placeholder="NIC or License" className="w-full p-2 border rounded" />
        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full p-2 border rounded" readOnly />
        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full p-2 border rounded" />

        {formData.items.map((item, index) => (
          <div key={index} className="grid grid-cols-6 gap-2 items-center">
            <input type="text" value={item.itemName} onChange={(e) => handleChange(e, index, 'itemName')} placeholder="Item Name" className="col-span-1 p-2 border rounded" list={`itemName_suggest_${index}`} />
            <datalist id={`itemName_suggest_${index}`}>
              {(suggestions[`itemName_${index}`] || []).map((s, i) => <option key={i} value={s} />)}
            </datalist>
            <input type="text" value={item.model} onChange={(e) => handleChange(e, index, 'model')} placeholder="Model" className="col-span-1 p-2 border rounded" list={`model_suggest_${index}`} />
            <datalist id={`model_suggest_${index}`}>
              {(suggestions[`model_${index}`] || []).map((s, i) => <option key={i} value={s} />)}
            </datalist>
            <input type="number" value={item.quantity} onChange={(e) => handleChange(e, index, 'quantity')} placeholder="Qty" className="col-span-1 p-2 border rounded" />
            <input type="text" value={item.price} readOnly placeholder="Price" className="col-span-1 p-2 border rounded bg-gray-100" />
            <input type="text" value={item.total} readOnly placeholder="Total" className="col-span-1 p-2 border rounded bg-gray-100" />
            <button type="button" onClick={() => removeItemRow(index)} className="col-span-1 text-red-600"><Trash size={18} /></button>
          </div>
        ))}
        <button type="button" onClick={addItemRow} className="text-blue-600 flex items-center gap-1 text-sm"><Plus size={16} /> Add Item</button>

        <input type="number" name="amountPaid" value={formData.amountPaid} onChange={handleChange} placeholder="Amount Paid" className="w-full p-2 border rounded" />

        <div className="text-sm text-gray-600 mt-4 bg-gray-50 p-4 rounded border">
          <p><strong>Number of Days:</strong> {formData.numberOfDays}</p>
          <p><strong>Grand Total:</strong> Rs. {formData.grandTotal}</p>
          <p><strong>Amount Paid:</strong> Rs. {formData.amountPaid || 0}</p>
          <p><strong>Remaining:</strong> Rs. {formData.remainingAmount}</p>
        </div>

        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2">
          <Save size={16} /> {isEditMode ? 'Update Rental' : 'Save Rental'}
        </button>
      </form>
    </div>
  );
};

export default RentalAddEdit;
