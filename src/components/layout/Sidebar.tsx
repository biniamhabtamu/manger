import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  User,
  Wrench,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/categories', icon: Code, label: 'Categories' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
];

const categoryItems = [
  { path: '/tasks/code-tasks', icon: Code, label: 'Code Tasks', category: 'code-tasks' },
  { path: '/tasks/learning', icon: BookOpen, label: 'Learning', category: 'learning' },
  { path: '/tasks/relationship', icon: Heart, label: 'Relationships', category: 'relationship' },
  { path: '/tasks/self-development', icon: User, label: 'Self Development', category: 'self-development' },
  { path: '/tasks/project-improvement', icon: Wrench, label: 'Project Improvement', category: 'project-improvement' },
];

export const Sidebar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { userProfile } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
      >
        <Menu size={20} className="text-gray-600 dark:text-gray-300" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar - Always visible */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:dark:bg-gray-800 lg:border-r lg:border-gray-200 lg:dark:border-gray-700">
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <div className="p-6">
            {/* Logo */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                TaskManager
              </h2>
            </div>

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
                >
                  <Settings size={18} className="mr-3" />
                  Settings
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar - Slide in overlay */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isMobileOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto"
      >
        <div className="p-6">
          {/* Mobile header with close button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              TaskManager
            </h2>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Premium Badge */}
          {userProfile?.isPremium && (
            <div className="mb-6 p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
              <div className="flex items-center text-white">
                <Crown size={20} className="mr-2" />
                <span className="font-medium">Premium User</span>
              </div>
            </div>
          )}

          {/* Mobile Navigation */}
          <nav className="space-y-2">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Main
              </h3>
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
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
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon size={18} className="mr-3" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/premium"
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/premium')
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200'
                    : 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                }`}
              >
                <Crown size={18} className="mr-3" />
                Premium
              </Link>
              
              <Link
                to="/settings"
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/settings')
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <Settings size={18} className="mr-3" />
                Settings
              </Link>
            </div>
          </nav>
        </div>
      </motion.div>
    </>
  );
};