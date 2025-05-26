// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CustomerList from './pages/CustomerList';
import CustomerAddEdit from './pages/CustomerAddEdit';
import MaterialList from './pages/MaterialList';
import MaterialAddEdit from './pages/MaterialAddEdit';
import RentalList from './pages/RentalList';
import RentalAddEdit from './pages/RentalAddEdit';
import Reports from './pages/Reports';

const App = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<CustomerList />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/add" element={<CustomerAddEdit />} />
          <Route path="/customers/edit/:id" element={<CustomerAddEdit />} />

          <Route path="/materials" element={<MaterialList />} />
          <Route path="/materials/add" element={<MaterialAddEdit />} />
          <Route path="/materials/edit/:id" element={<MaterialAddEdit />} />

          <Route path="/rentals" element={<RentalList />} />
          <Route path="/rental/add" element={<RentalAddEdit />} />
          <Route path="/rental/edit/:id" element={<RentalAddEdit />} />

          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;