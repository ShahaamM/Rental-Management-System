// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddCustomer from './pages/AddCustomer';
import AddMaterials from './pages/AddMaterials';
import RentalEntry from './pages/RentalEntry';
import ReportPage from './pages/ReportPage';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 bg-gray-100 min-h-screen">
          <Routes>
            <Route path="/customers" element={<AddCustomer />} />
            <Route path="/materials" element={<AddMaterials />} />
            <Route path="/rentals" element={<RentalEntry />} />
            <Route path="/reports" element={<ReportPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
