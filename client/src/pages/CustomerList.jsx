// src/pages/CustomerList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    const res = await fetch('/api/customers');
    const data = await res.json();
    setCustomers(data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    fetchCustomers();
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Customers</h2>
        <button onClick={() => navigate('/customers/add')} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Customer
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Photo</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Mobile</th>
              <th className="px-4 py-2 text-left">NIC/License</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((cust) => (
              <tr key={cust._id} className="border-t">
                <td className="px-4 py-2">
                <img
                    src={`http://localhost:5000${cust.photo}`}  
                    alt={cust.name}
                    className="w-10 h-10 object-cover rounded-full"
                />
                </td>
                <td className="px-4 py-2">{cust.name}</td>
                <td className="px-4 py-2">{cust.mobile}</td>
                <td className="px-4 py-2">{cust.nicOrLicense}</td>
                <td className="px-4 py-2">
                  <button className="text-blue-600 mr-2" onClick={() => navigate(`/customers/edit/${cust._id}`)}>Edit</button>
                  <button className="text-red-600" onClick={() => handleDelete(cust._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan="5" className="text-center text-gray-500 py-4">No customers available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerList;