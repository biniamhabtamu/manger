import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  ListTodo,
  Calendar,
  Plus,
  User,
  Settings,
  X,
  Sparkles,
  Moon,
  Sun,
  LogOut,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomBarProps {
  onTaskFormOpen: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ onTaskFormOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Main navigation items - simplified
  const mainNavItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/tasks', icon: ListTodo, label: 'Tasks' },
    { path: '/calendarpage', icon: Calendar, label: 'Calendar' },
  ];

  // User actions
  const userActions = [
    { icon: User, label: 'Profile', action: () => navigate('/profile'), color: 'text-blue-500' },
    { icon: Settings, label: 'Settings', action: () => navigate('/settings'), color: 'text-gray-500' },
    { icon: BarChart3, label: 'Analytics', action: () => navigate('/analytics'), color: 'text-purple-500' },
    { icon: HelpCircle, label: 'Help', action: () => navigate('/help'), color: 'text-green-500' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  // Update active item when route changes
  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  // Close menu on route change
  useEffect(() => {
    setShowActionMenu(false);
  }, [location.pathname]);

  const toggleActionMenu = () => {
    setShowActionMenu(!showActionMenu);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    // Mock logout - replace with actual auth
    console.log("User logged out");
    navigate('/login');
  };

  const handleCreateTask = () => {
    onTaskFormOpen();
    setShowActionMenu(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50"></div>

        {/* Navigation items */}
        <div className="relative flex items-center justify-around px-2 py-1.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 py-1"
              >
                <motion.div
                  className={`relative p-2 rounded-xl transition-all ${active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                    }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                >
                  {active && (
                    <motion.div
                      layoutId="bottomBarActive"
                      className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 rounded-xl"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                  <Icon size={24} className="relative z-10" />
                </motion.div>
                <span className={`text-[10px] font-medium mt-0.5 transition-colors ${active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
                  }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Center FAB - Create Task */}
          <div className="flex flex-col items-center justify-center flex-1 relative">
            <motion.button
              className="flex flex-col items-center justify-center"
              onClick={handleCreateTask}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <div className="relative -mt-4">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-30"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center">
                  <Plus size={26} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                New
              </span>
            </motion.button>
          </div>

          {/* Menu / Profile button */}
          <div className="flex flex-col items-center justify-center flex-1">
            <motion.button
              className="flex flex-col items-center justify-center"
              onClick={toggleActionMenu}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.92 }}
            >
              <div className={`p-2 rounded-xl transition-all ${showActionMenu
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
                }`}>
                {showActionMenu ? (
                  <X size={24} />
                ) : (
                  <User size={24} />
                )}
              </div>
              <span className={`text-[10px] font-medium mt-0.5 transition-colors ${showActionMenu
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
                }`}>
                Menu
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Action Menu - Native bottom sheet style */}
      <AnimatePresence>
        {showActionMenu && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowActionMenu(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              className="fixed bottom-20 left-4 right-4 z-50 lg:hidden"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                {/* User Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                      U
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Guest User
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        guest@example.com
                      </p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {isDarkMode ? (
                        <Sun size={20} className="text-yellow-500" />
                      ) : (
                        <Moon size={20} className="text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Action Items */}
                <div className="p-2 space-y-1">
                  {userActions.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.label}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => {
                          item.action();
                          setShowActionMenu(false);
                        }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className={`p-2 rounded-xl bg-gray-100 dark:bg-gray-700 ${item.color}`}>
                          <Icon size={18} />
                        </div>
                        <span className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                          {item.label}
                        </span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </motion.button>
                    );
                  })}
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                  <motion.button
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    onClick={handleLogout}
                    whileHover={{ x: 5 }}
                  >
                    <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500">
                      <LogOut size={18} />
                    </div>
                    <span className="flex-1 text-left text-sm font-medium text-red-600 dark:text-red-400">
                      Logout
                    </span>
                    <ChevronRight size={16} className="text-red-400" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for bottom bar */}
      <div className="h-20 lg:hidden" />
    </>
  );
};

// ChevronRight icon component
const ChevronRight = (props: any) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);