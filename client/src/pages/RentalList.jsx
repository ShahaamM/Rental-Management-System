// RentalList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RentalList = () => {
  const [rentals, setRentals] = useState([]);
  const navigate = useNavigate();

  const fetchRentals = async () => {
    try {
      const res = await fetch('/api/rentals');
      const data = await res.json();
      setRentals(data);
    } catch (err) {
      alert('Failed to fetch rentals');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await fetch(`/api/rentals/${id}`, { method: 'DELETE' });
      fetchRentals();
    } catch (err) {
      alert('Delete failed');
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Rental Records</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate('/rental/add')}
        >
          Add Rental
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Start</th>
              <th className="px-4 py-2 text-left">End</th>
              <th className="px-4 py-2 text-left">Items</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => (
              <tr key={rental._id} className="border-t">
                <td className="px-4 py-2">{rental.customerName}</td>
                <td className="px-4 py-2">{rental.startDate?.split('T')[0]}</td>
                <td className="px-4 py-2">{rental.endDate?.split('T')[0]}</td>
                <td className="px-4 py-2">
                  {rental.items.map((item, i) => (
                    <div key={i}>{item.itemName} ({item.quantity})</div>
                  ))}
                </td>
                <td className="px-4 py-2">
                  <button
                    className="text-blue-600 hover:underline mr-3"
                    onClick={() => navigate(`/rental/edit/${rental._id}`)}
                  >Edit</button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(rental._id)}
                  >Delete</button>
                </td>
              </tr>
            ))}
            {rentals.length === 0 && (
              <tr><td colSpan="5" className="text-center text-gray-500 py-4">No rentals found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentalList;