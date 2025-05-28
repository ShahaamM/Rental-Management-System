// src/App.jsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CustomerList from './pages/CustomerList';
import CustomerAddEdit from './pages/CustomerAddEdit';
import MaterialList from './pages/MaterialList';
import MaterialAddEdit from './pages/MaterialAddEdit';
import RentalList from './pages/RentalList';
import RentalAddEdit from './pages/RentalAddEdit';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import Settings from './pages/Setting';

const App = () => {
  const location = useLocation();
  const hideSidebar = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex min-h-screen">
      {!hideSidebar && <Sidebar />}
      <div className="flex-1 p-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <CustomerList />
              </PrivateRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <PrivateRoute>
                <CustomerList />
              </PrivateRoute>
            }
          />
          <Route
            path="/customers/add"
            element={
              <PrivateRoute>
                <CustomerAddEdit />
              </PrivateRoute>
            }
          />
          <Route
            path="/customers/edit/:id"
            element={
              <PrivateRoute>
                <CustomerAddEdit />
              </PrivateRoute>
            }
          />
          <Route
            path="/materials"
            element={
              <PrivateRoute>
                <MaterialList />
              </PrivateRoute>
            }
          />
          <Route
            path="/materials/add"
            element={
              <PrivateRoute>
                <MaterialAddEdit />
              </PrivateRoute>
            }
          />
          <Route
            path="/materials/edit/:id"
            element={
              <PrivateRoute>
                <MaterialAddEdit />
              </PrivateRoute>
            }
          />
          <Route
            path="/rentals"
            element={
              <PrivateRoute>
                <RentalList />
              </PrivateRoute>
            }
          />
          <Route
            path="/rental/add"
            element={
              <PrivateRoute>
                <RentalAddEdit />
              </PrivateRoute>
            }
          />
          <Route
            path="/rental/edit/:id"
            element={
              <PrivateRoute>
                <RentalAddEdit />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
