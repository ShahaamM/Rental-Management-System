// src/pages/CustomerAddEdit.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CustomerAddEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    nicOrLicense: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
    photo: null,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetch(`/api/customers/${id}`)
        .then(res => res.json())
        .then(data => setFormData({ ...data, date: data.date.split('T')[0], photo: null }));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setFormData({ ...formData, photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.mobile || !formData.nicOrLicense) {
      setError('Please fill all required fields.');
      return;
    }

    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) form.append(key, formData[key]);
    });

    const res = await fetch(id ? `/api/customers/${id}` : '/api/customers', {
      method: id ? 'PUT' : 'POST',
      body: form,
    });

    if (res.ok) {
      alert(id ? 'Customer updated!' : 'Customer added!');
      navigate('/customers');
    } else {
      const err = await res.json();
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{id ? 'Edit Customer' : 'Add Customer'}</h2>
        <button
          onClick={() => navigate('/customers')}
          className="text-sm bg-gray-100 border px-4 py-1 rounded hover:bg-gray-200"
        >
          ← Back
        </button>
      </div>

      {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        encType="multipart/form-data"
      >
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className="border p-2 rounded"
          required
        />
        <input
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          placeholder="Mobile"
          className="border p-2 rounded"
          required
        />
        <input
          name="nicOrLicense"
          value={formData.nicOrLicense}
          onChange={handleChange}
          placeholder="NIC or License"
          className="border p-2 rounded"
          required
        />
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          className="border p-2 rounded"
        />
        <input
          name="date"
          value={formData.date}
          type="date"
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          name="photo"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <div className="md:col-span-2 flex justify-end">
          <button className="bg-indigo-600 text-white px-6 py-2 rounded">
            {id ? 'Update' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerAddEdit;
