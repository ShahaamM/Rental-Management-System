// src/pages/Reports.jsx
import React, { useState } from 'react';
import { BarChart2, Filter, Download } from 'lucide-react';

const Reports = () => {
  const [filters, setFilters] = useState({
    customerName: '',
    date: '',
    type: 'daily',
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch report data');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Customer', 'NIC', 'Mobile', 'Item', 'Model', 'Qty', 'Price', 'Total', 'Start Date', 'End Date'],
      ...results.flatMap(entry =>
        entry.items.map(item => [
          entry.customerName,
          entry.nicOrLicense,
          entry.mobile,
          item.itemName,
          item.model,
          item.quantity,
          item.price,
          item.total,
          entry.startDate?.split('T')[0],
          entry.endDate?.split('T')[0],
        ])
      ),
    ]
      .map(e => e.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'rental_report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Rental Reports
        </h2>
        <button
          onClick={handleExport}
          className="text-gray-600 hover:text-gray-800 bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-purple-600" />
          <h3 className="font-medium text-purple-800">Filter Options</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="customerName" value={filters.customerName} onChange={handleChange} placeholder="Customer Name"
            className="border px-4 py-2 rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-purple-500" />
          <input type="date" name="date" value={filters.date} onChange={handleChange}
            className="border px-4 py-2 rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-purple-500" />
          <select name="type" value={filters.type} onChange={handleChange}
            className="border px-4 py-2 rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-purple-500">
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button onClick={fetchReports} disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full">
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r">{error}</div>
      )}

      {/* Results Table */}
      {results.length > 0 ? (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-100">
              <tr>
                {['Customer', 'NIC', 'Mobile', 'Item', 'Model', 'Qty', 'Price', 'Total', 'Period'].map(col => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.flatMap((entry, i) =>
                entry.items.map((item, j) => (
                  <tr key={`${i}-${j}`}>
                    <td className="px-6 py-4">{entry.customerName}</td>
                    <td className="px-6 py-4">{entry.nicOrLicense}</td>
                    <td className="px-6 py-4">{entry.mobile}</td>
                    <td className="px-6 py-4">{item.itemName}</td>
                    <td className="px-6 py-4">{item.model}</td>
                    <td className="px-6 py-4">{item.quantity}</td>
                    <td className="px-6 py-4">Rs. {item.price}</td>
                    <td className="px-6 py-4 text-purple-700 font-semibold">Rs. {item.total}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>{entry.startDate?.split('T')[0]}</div>
                      <div className="text-xs text-gray-500">to</div>
                      <div>{entry.endDate?.split('T')[0]}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center text-gray-400">
          <BarChart2 size={48} className="mx-auto mb-2" />
          {loading ? 'Generating report...' : 'No report data available'}
        </div>
      )}
    </div>
  );
};

export default Reports;
