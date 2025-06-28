import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';

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
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`/api/customers/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.photo) {
            setExistingPhotoUrl(`https://tnt.carte.one${data.photo}`);
          }
          setFormData({
            name: data.name || '',
            mobile: data.mobile || '',
            nicOrLicense: data.nicOrLicense || '',
            address: data.address || '',
            date: data.date ? data.date.split('T')[0] : new Date().toISOString().split('T')[0],
            photo: null,
          });
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      const file = files[0];
      setFormData({ ...formData, photo: file });
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          form.append(key, formData[key]);
        }
      });

      const res = await fetch(id ? `/api/customers/${id}` : '/api/customers', {
        method: id ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: form,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Something went wrong');
      }

      alert(id ? 'Customer updated successfully!' : 'Customer added successfully!');
      navigate('/customers');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          {id ? 'Edit Customer' : 'Add New Customer'}
        </h2>
        <button
          onClick={() => navigate('/customers')}
          className="text-gray-600 hover:text-gray-800 bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to List
        </button>
      </div>

      {(id && (previewUrl || existingPhotoUrl)) && (
        <div className="flex flex-col items-center mb-6">
          <img
            src={previewUrl || existingPhotoUrl}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-purple-300 object-cover shadow-md cursor-pointer"
            onClick={() => setEnlargedImage(previewUrl || existingPhotoUrl)}
          />
          <p className="mt-2 text-sm text-gray-500">Current Profile Picture</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
          <div className="flex items-center text-red-700">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Customer name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <input
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Mobile number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIC/License</label>
            <input
              name="nicOrLicense"
              value={formData.nicOrLicense}
              onChange={handleChange}
              placeholder="NIC or License number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Customer address"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="cursor-pointer">
                <div className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
                  <span className="text-sm">Choose File</span>
                  <input
                    name="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    disabled={loading}
                  />
                </div>
              </label>

              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded border border-gray-300 cursor-pointer"
                  onClick={() => setEnlargedImage(previewUrl)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 w-full md:w-auto"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Save size={18} />
                {id ? 'Update Customer' : 'Add Customer'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Image Modal */}
      {enlargedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setEnlargedImage(null)}>
          <div className="relative">
            <img src={enlargedImage} alt="Enlarged" className="max-w-full max-h-[90vh] rounded-lg border-4 border-white shadow-xl" onClick={(e) => e.stopPropagation()} />
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute top-0 right-0 mt-2 mr-2 bg-white text-gray-800 rounded-full p-1 shadow-md hover:bg-red-500 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAddEdit;
