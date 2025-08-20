import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Sun, Moon, User, LogOut, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Home, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Settings, 
  Crown,
  Code,
  BookOpen,
  Heart,
  Wrench
} from 'lucide-react';

// Menu items data
const menuItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/categories', icon: Code, label: 'Categories' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/calendarpage', icon: Calendar, label: 'Calendar' },
];

const categoryItems = [
  { path: '/tasks/code-tasks', icon: Code, label: 'Code Tasks', category: 'code-tasks' },
  { path: '/tasks/learning', icon: BookOpen, label: 'Learning', category: 'learning' },
  { path: '/tasks/relationship', icon: Heart, label: 'Relationships', category: 'relationship' },
  { path: '/tasks/self-development', icon: User, label: 'Self Development', category: 'self-development' },
  { path: '/tasks/project-improvement', icon: Wrench, label: 'Project Improvement', category: 'project-improvement' },
];

export const Header: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    
    // Dispatch event to communicate with sidebar component
    const event = new CustomEvent('sidebarToggle', { detail: { isOpen: newState } });
    window.dispatchEvent(event);
    
    // Update body class to prevent scrolling when sidebar is open (mobile)
    if (window.innerWidth < 1024) {
      if (newState) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    }
  };

  // Close sidebar when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
        document.body.classList.remove('sidebar-open');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
      document.body.classList.remove('sidebar-open');
      
      // Also dispatch event to ensure sidebar knows it should close
      const event = new CustomEvent('sidebarToggle', { detail: { isOpen: false } });
      window.dispatchEvent(event);
    }
  }, [location.pathname]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          {/* Menu Icon and Logo/Title */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
            
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">TaskManager</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Bell size={20} />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </motion.button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userProfile?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userProfile?.isPremium ? 'Premium' : 'Free'}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link to="/profile">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium cursor-pointer"
                  >
                    {userProfile?.name?.charAt(0).toUpperCase() || <User size={20} />}
                  </motion.div>
                </Link>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Add padding to the main content to account for fixed header */}
      <div className="h-20"></div>
      
      {/* Sidebar Component */}
      <Sidebar />
      
      <style jsx>{`
        body.sidebar-open {
          overflow: hidden;
        }
        
        @media (min-width: 1024px) {
          body.sidebar-open {
            overflow: auto;
          }
        }
      `}</style>
    </>
  );
};

// Sidebar Component
const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { userProfile } = useAuth();

  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setIsOpen(event.detail.isOpen);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => {
            const event = new CustomEvent('sidebarToggle', { detail: { isOpen: false } });
            window.dispatchEvent(event);
          }}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-20 left-0 h-[calc(100vh-5rem)] w-64 bg-white dark:bg-gray-800 
        shadow-xl transform transition-transform duration-300 ease-in-out z-40
        lg:top-20 lg:transform-none lg:shadow-none lg:border-r lg:border-gray-200 lg:dark:border-gray-700
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-6">
          {/* Premium Badge */}
          {userProfile?.isPremium && (
            <div className="mb-6 p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
              <div className="flex items-center text-white">
                <Crown size={20} className="mr-2" />
                <span className="font-medium">Premium User</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-2">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Main
              </h3>
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      const event = new CustomEvent('sidebarToggle', { detail: { isOpen: false } });
                      window.dispatchEvent(event);
                    }
                  }}
                >
                  <item.icon size={18} className="mr-3" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Categories
              </h3>
              {categoryItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      const event = new CustomEvent('sidebarToggle', { detail: { isOpen: false } });
                      window.dispatchEvent(event);
                    }
                  }}
                >
                  <item.icon size={18} className="mr-3" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/premium"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/premium')
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200'
                    : 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                }`}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    const event = new CustomEvent('sidebarToggle', { detail: { isOpen: false } });
                    window.dispatchEvent(event);
                  }
                }}
              >
                <Crown size={18} className="mr-3" />
                Premium
              </Link>
              
              <Link
                to="/settings"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/settings')
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    const event = new CustomEvent('sidebarToggle', { detail: { isOpen: false } });
                    window.dispatchEvent(event);
                  }
                }}
              >
                <Settings size={18} className="mr-3" />
                Settings
              </Link>
            </div>
          </nav>
        </div>
      </div>
      
      {/* Main content adjustment for sidebar */}
      <div className={`
        transition-all duration-300 ease-in-out
        lg:ml-64
      `}>
        {/* Your main content here */}
      </div>
    </>
  );
};