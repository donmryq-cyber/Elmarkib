
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Stethoscope, LogOut } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/appointments', icon: Calendar, label: 'المواعيد' },
  { to: '/patients', icon: Users, label: 'المرضى' },
  { to: '/services', icon: Stethoscope, label: 'الخدمات والتسعير' },
];

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const baseLinkClasses = "flex items-center px-4 py-3 text-gray-200 hover:bg-sky-700 transition-colors duration-200 rounded-lg";
  const activeLinkClasses = "bg-sky-700 font-semibold";

  return (
    <div className="flex flex-col w-64 bg-sky-800 text-white h-full shadow-lg">
      <div className="flex items-center justify-center h-20 border-b border-sky-700">
        <h1 className="text-2xl font-bold">المركب كلينك</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
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
  );
};

export default Sidebar;
