// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  FileText,
  ClipboardList,
  Menu,
  LogOut,
  Settings,
  BarChart2
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname;
  const [collapsed, setCollapsed] = useState(false);

  const linkClass = (path) =>
    `flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all duration-200 group
     ${
       current.startsWith(path)
         ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 font-semibold shadow-inner border-l-4 border-purple-500'
         : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700'
     }`;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/customers',
      icon: <Users size={18} />,
      label: 'Customers',
      iconBg: 'from-blue-400 to-blue-500',
      section: 'Management'
    },
    {
      path: '/materials',
      icon: <Package size={18} />,
      label: 'Materials',
      iconBg: 'from-amber-400 to-amber-500',
      section: 'Management'
    },
    {
      path: '/rentals',
      icon: <ClipboardList size={18} />,
      label: 'Rental Entry',
      iconBg: 'from-green-400 to-green-500',
      section: 'Management'
    },
    {
      path: '/reports',
      icon: <BarChart2 size={18} />,
      label: 'Reports',
      iconBg: 'from-pink-400 to-pink-500',
      section: 'Analytics'
    },
    {
      path: '/settings',
      icon: <Settings size={18} />,
      label: 'Settings',
      iconBg: 'from-gray-400 to-gray-500',
      section: 'Analytics'
    }
  ];

  const sections = [...new Set(navItems.map(item => item.section))];

  return (
    <div 
      className={`flex flex-col justify-between bg-gradient-to-b from-white to-purple-50 border-r shadow-xl ${
        collapsed ? 'w-20' : 'w-64'
      } min-h-screen transition-all duration-300 ease-in-out`}
      aria-label="Sidebar navigation"
    >
      {/* Top Section */}
      <div>
        <header className="flex items-center justify-between px-4 py-5 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
          {!collapsed && (
            <h1 className="text-lg font-bold tracking-wide">Rental Pro</h1>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="text-white hover:bg-white/20 p-1 rounded-lg transition"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Navigation */}
        <nav className="px-2 py-5 space-y-1">
          {sections.map((section, index) => (
            <React.Fragment key={section}>
              {!collapsed && (
                <p className="px-4 text-xs text-purple-500 uppercase font-semibold mb-2 flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    index === 0 ? 'bg-purple-500' : 'bg-pink-500'
                  }`}></span>
                  {section}
                </p>
              )}
              {navItems
                .filter(item => item.section === section)
                .map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    className={linkClass(item.path)}
                    aria-current={current.startsWith(item.path) ? 'page' : undefined}
                  >
                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${item.iconBg} text-white flex items-center justify-center`}>
                      {item.icon}
                    </div>
                    {!collapsed && (
                      <>
                        <span>{item.label}</span>
                        {current.startsWith(item.path) && (
                          <span className="ml-auto w-2 h-2 bg-purple-500 rounded-full"></span>
                        )}
                      </>
                    )}
                  </Link>
                ))}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Bottom Logout Button */}
      <div className="p-4 border-t border-purple-100">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full py-2.5 px-4 rounded-lg text-white bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 transition-all duration-200 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
          aria-label="Logout"
        >
          <div className="flex items-center gap-3">
            <LogOut size={18} />
            {!collapsed && 'Logout'}
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
