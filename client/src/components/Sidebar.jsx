// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const current = location.pathname;

  const linkClass = (path) =>
    `block py-2 px-4 rounded hover:bg-blue-100 ${
      current.startsWith(path) ? 'bg-blue-200 font-semibold' : ''
    }`;

  return (
    <div className="w-60 bg-white border-r shadow-sm">
      <div className="p-4 font-bold text-lg border-b">Rental Dashboard</div>
      <nav className="p-4 space-y-2 text-sm">
        <Link to="/customers" className={linkClass('/customers')}>Customers</Link>
        <Link to="/materials" className={linkClass('/materials')}>Materials</Link>
        <Link to="/rentals" className={linkClass('/rentals')}>Rental Entry</Link>
        <Link to="/reports" className={linkClass('/reports')}>Reports</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
