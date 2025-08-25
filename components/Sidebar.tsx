
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Stethoscope, LogOut, X } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/appointments', icon: Calendar, label: 'المواعيد' },
  { to: '/patients', icon: Users, label: 'المرضى' },
  { to: '/services', icon: Stethoscope, label: 'الخدمات والتسعير' },
];

const Sidebar: React.FC<SidebarProps> = ({ onLogout, isOpen, onClose }) => {
  const baseLinkClasses = "flex items-center px-4 py-3 text-gray-200 hover:bg-sky-700 transition-colors duration-200 rounded-lg";
  const activeLinkClasses = "bg-sky-700 font-semibold";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 right-0 z-50
        flex flex-col w-64 bg-sky-800 text-white h-full shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-20 px-4 border-b border-sky-700">
          <h1 className="text-xl lg:text-2xl font-bold">المركب كلينك</h1>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-sky-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
              <item.icon className="h-5 w-5 ml-3" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-sky-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-gray-200 hover:bg-red-600 hover:text-white transition-colors duration-200 rounded-lg"
          >
            <LogOut className="h-5 w-5 ml-3" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
