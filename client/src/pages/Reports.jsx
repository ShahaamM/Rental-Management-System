// src/pages/Reports.jsx
import React, { useState } from 'react';
import FormInput from '../components/FormInput';

const Reports = () => {
const [filters, setFilters] = useState({
customerName: '',
date: '',
type: 'daily',
});
const [results, setResults] = useState([]);

const handleChange = (e) => {
setFilters({ ...filters, [e.target.name]: e.target.value });
};

const fetchReports = async () => {
const params = new URLSearchParams(filters);
const res = await fetch(`/api/reports?${params.toString()}`);
const data = await res.json();
setResults(data);
};

return (
<div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md">
<h2 className="text-2xl font-bold mb-4">Generate Report</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <FormInput label="Customer Name" name="customerName" value={filters.customerName} onChange={handleChange} />
    <FormInput label="Date" type="date" name="date" value={filters.date} onChange={handleChange} />
    <div>
      <label className="block font-medium mb-1 text-sm">Type</label>
      <select
        name="type"
        value={filters.type}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2 text-sm"
      >
        <option value="daily">Daily</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
    </div>
  </div>

  <button
    onClick={fetchReports}
    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm mb-6"
  >
    Generate
  </button>

  {results.length > 0 && (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Customer</th>
            <th className="px-4 py-2 text-left">Item</th>
            <th className="px-4 py-2 text-left">Model</th>
            <th className="px-4 py-2 text-left">Qty</th>
            <th className="px-4 py-2 text-left">Price</th>
            <th className="px-4 py-2 text-left">Total</th>
            <th className="px-4 py-2 text-left">Start</th>
            <th className="px-4 py-2 text-left">End</th>
          </tr>
        </thead>
        <tbody>
  {results.flatMap((entry, index) =>
    entry.items.map((item, idx) => (
      <tr key={`${index}-${idx}`} className="border-t hover:bg-gray-50">
        <td className="px-4 py-2">{entry.customerName}</td>
        <td className="px-4 py-2">{item.itemName}</td>
        <td className="px-4 py-2">{item.model}</td>
        <td className="px-4 py-2">{item.quantity}</td>
        <td className="px-4 py-2">{item.price}</td>
        <td className="px-4 py-2">{item.total}</td>
        <td className="px-4 py-2">{entry.startDate?.split('T')[0]}</td>
        <td className="px-4 py-2">{entry.endDate?.split('T')[0]}</td>
      </tr>
    ))
  )}
</tbody>

      </table>
    </div>
  )}

  {results.length === 0 && (
    <p className="text-gray-500 text-sm">No report data found.</p>
  )}
</div>
);
};

export default Reports;