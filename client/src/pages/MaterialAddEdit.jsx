// src/pages/MaterialAddEdit.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormInput from '../components/FormInput';

const MaterialAddEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    model: '',
    quantity: '',
    price: '',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      fetch(`/api/materials/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData(data);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/materials/${id}` : '/api/materials';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert(id ? 'Material updated!' : 'Material added!');
        navigate('/materials');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to save material');
      }
    } catch (error) {
      alert('An error occurred while saving material.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{id ? 'Edit Material' : 'Add Material'}</h2>
        <button
          onClick={() => navigate('/materials')}
          className="text-sm bg-gray-100 border px-4 py-1 rounded hover:bg-gray-200"
        >
          ← Back
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput label="Item Name" name="itemName" value={formData.itemName} onChange={handleChange} />
        <FormInput label="Model" name="model" value={formData.model} onChange={handleChange} />
        <FormInput label="Quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} />
        <FormInput label="Price" name="price" type="number" value={formData.price} onChange={handleChange} />
        <div className="md:col-span-2">
          <label className="block font-medium mb-1 text-sm">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          />
        </div>
        <div className="md:col-span-2 flex justify-end mt-4">
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md">
            {id ? 'Update' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaterialAddEdit;
