"use client";
import { useState, useEffect } from 'react';
import { FiMenu, FiChevronDown, FiChevronRight, FiLogOut, FiUser, FiSettings, FiUsers, FiCalendar, FiHome, FiMonitor } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setSidebarOpen(false);
      } else {
        setIsMobile(false);
        setSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && isSidebarOpen && !e.target.closest('.sidebar')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  // Handle profile dropdown close when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-dropdown') && isProfileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen]);

  // Check if a menu item is active
  const isActive = (path) => {
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    if (path !== '/dashboard' && pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  // Menu items configuration
  const menuItems = [
    {
      name: 'Dashboard',
      icon: <FiHome className="w-5 h-5" />,
      path: '/dashboard',
    },
    {
      name: 'Data Guru',
      icon: <FiUsers className="w-5 h-5" />,
      path: '/admin/teacher',
    },
    {
      name: 'Data Kehadiran',
      icon: <FiCalendar className="w-5 h-5" />,
      path: '/dashboard/kehadiran',
    },
    {
      name: 'Pengaturan',
      icon: <FiSettings className="w-5 h-5" />,
      isAccordion: true,
      isOpen: isSettingsOpen,
      toggle: () => setSettingsOpen(!isSettingsOpen),
      children: [
        {
          name: 'Laporan Kehadiran',
          path: '/dashboard/pengaturan/laporan',
        },
        {
          name: 'Anjungan',
          path: '/dashboard/pengaturan/anjungan',
        },
        {
          name: 'Akses Admin',
          path: '/dashboard/pengaturan/admin',
        },
      ],
    },
  ];

  // Profile actions
  const profileActions = [
    {
      name: 'Profile',
      icon: <FiUser className="w-5 h-5" />,
      action: () => {/* Navigate to profile */},
    },
    {
      name: 'Logout',
      icon: <FiLogOut className="w-5 h-5" />,
      action: () => {/* Handle logout */},
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm h-16">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle sidebar"
            >
              <FiMenu className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="flex items-center">
              <span className="text-lg font-bold text-blue-600">SIGAP ADMIN</span>
            </div>
          </div>
          
          <div className="relative profile-dropdown">
            <button
              onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-3 group focus:outline-none"
            >
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Admin Sekolah</span>
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white uppercase">
                A
              </div>
            </button>
            
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm leading-5 font-medium text-gray-900">Admin Sekolah</p>
                  <p className="text-xs leading-4 font-medium text-gray-500 truncate">admin@example.com</p>
                </div>
                
                {profileActions.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 z-20 pt-16 flex flex-col w-64 transition-all duration-300 ease-in-out bg-white border-r border-gray-200 sidebar ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.isAccordion ? (
                  <div className="space-y-1">
                    <button
                      onClick={item.toggle}
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md group transition-colors ${
                        isActive(item.path)
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                      </div>
                      {item.isOpen ? (
                        <FiChevronDown className="w-4 h-4" />
                      ) : (
                        <FiChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    
                    {item.isOpen && (
                      <div className="ml-6 pl-3 border-l border-gray-200 space-y-1">
                        {item.children.map((child, childIndex) => (
                          <Link
                            key={childIndex}
                            href={child.path}
                            className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                              isActive(child.path)
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 mr-3 bg-gray-300 rounded-full"></span>
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.path}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center">
                  <FiMonitor className="text-gray-500" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">SIGAP v1.0</p>
                <p className="text-xs text-gray-500">© 2023 SIGAP</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out pt-16 ${
          isSidebarOpen ? 'md:ml-64' : ''
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}