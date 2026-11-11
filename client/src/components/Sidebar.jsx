import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  BookMarked,
  Users,
  CalendarCheck,
  BookOpen,
  UserCheck,
  LogOut,
  Clock,
  ShieldCheck,
  BarChart3,
  Sparkles,
  MapPin
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, mobileOpen, setMobileOpen, onOpenMap }) => {
  const { role, logout, user } = useAuth();

  const handleNav = (tabId) => {
    setActiveTab(tabId);
    if (setMobileOpen) setMobileOpen(false);
  };

  // Student Navigation items matching specification exactly
  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'my-units', label: 'My Units', icon: BookMarked },
    { id: 'lecturers', label: 'Lecturers', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: CalendarCheck },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: UserCheck },
  ];

  // Lecturer Navigation items
  const lecturerNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: CalendarCheck },
    { id: 'availability', label: 'Office Availability', icon: Clock },
    { id: 'teaching-history', label: 'Teaching History', icon: BookMarked },
    { id: 'lecturers', label: 'Lecturer Directory', icon: Users },
    { id: 'courses', label: 'Courses & Units', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: UserCheck },
  ];

  // Admin Navigation items
  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-lecturers', label: 'Manage Lecturers', icon: Users },
    { id: 'admin-students', label: 'Manage Students', icon: UserCheck },
    { id: 'admin-academic', label: 'Courses & Units', icon: BookOpen },
    { id: 'appointments', label: 'All Appointments', icon: CalendarCheck },
    { id: 'admin-reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'search', label: 'Smart Search', icon: Search },
    { id: 'profile', label: 'Settings', icon: ShieldCheck },
  ];

  let navItems = studentNavItems;
  if (role === 'lecturer') navItems = lecturerNavItems;
  if (role === 'admin') navItems = adminNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header Tag / Role display */}
          <div className="mb-4 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Role: <strong className="text-blue-600 dark:text-blue-400 capitalize">{role}</strong>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Map Promo & Logout */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button
            onClick={onOpenMap}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 rounded-xl transition"
          >
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Interactive Campus Map</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
