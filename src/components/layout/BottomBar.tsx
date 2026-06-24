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
  Moon,
  Sun,
  LogOut,
  HelpCircle,
  BarChart3,
  ChevronRight,
  UserCircle,
  Award,
  ClipboardList,
  FolderKanban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Try different import paths - use one that matches your project structure
// Option 1: If AuthContext is in contexts folder at root
import { useAuth } from '../../contexts/AuthContext';
// Option 2: If AuthContext is in context folder (without 's')
// import { useAuth } from '../../context/AuthContext';
// Option 3: If AuthContext is in src folder directly
// import { useAuth } from '../AuthContext';

interface BottomBarProps {
  onTaskFormOpen: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ onTaskFormOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Main navigation items
  const mainNavItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/tasks', icon: ListTodo, label: 'Tasks' },
    { path: '/calendarpage', icon: Calendar, label: 'Calendar' },
  ];

  // User actions with proper navigation
  const userActions = [
    {
      icon: UserCircle,
      label: 'Profile',
      action: () => navigate('/profile'),
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: ClipboardList,
      label: 'My Tasks',
      action: () => navigate('/tasks'),
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      icon: FolderKanban,
      label: 'Categories',
      action: () => navigate('/categories'),
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: Award,
      label: 'Analytics',
      action: () => navigate('/analytics'),
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      icon: Settings,
      label: 'Settings',
      action: () => navigate('/settings'),
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-700/20'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => navigate('/help'),
      color: 'text-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-900/20'
    },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    setShowActionMenu(false);
  }, [location.pathname]);

  // Close menu when pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showActionMenu) {
        setShowActionMenu(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showActionMenu]);

  const toggleActionMenu = () => {
    setShowActionMenu(!showActionMenu);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowActionMenu(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCreateTask = () => {
    onTaskFormOpen();
    setShowActionMenu(false);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (userProfile?.name) {
      return userProfile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getUserName = () => {
    return userProfile?.name || user?.displayName || 'Guest User';
  };

  const getUserEmail = () => {
    return userProfile?.email || user?.email || 'guest@example.com';
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        {/* Glassmorphism background with gradient border */}
        <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50"></div>

        {/* Subtle top glow */}
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

        {/* Navigation items */}
        <div className="relative flex items-center justify-around px-2 py-1.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 py-1 relative"
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
                      className="absolute inset-0 bg-blue-500/15 dark:bg-blue-400/15 rounded-xl"
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
                {/* Glow effect */}
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center">
                  <Plus size={26} className="text-white" strokeWidth={2.5} />
                </div>
                {/* Ring decoration */}
                <div className="absolute inset-0 rounded-full border-2 border-white/20 dark:border-white/10"></div>
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
              <div className={`relative p-2 rounded-xl transition-all ${showActionMenu
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
                }`}>
                {showActionMenu ? (
                  <X size={24} />
                ) : (
                  <div className="relative">
                    <User size={24} />
                    {userProfile?.name && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                    )}
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-medium mt-0.5 transition-colors ${showActionMenu
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
                }`}>
                {showActionMenu ? 'Close' : 'Menu'}
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
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowActionMenu(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              className="fixed bottom-20 left-3 right-3 z-50 lg:hidden max-w-md mx-auto"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                {/* User Header - Clickable to navigate to profile */}
                <motion.button
                  className="w-full p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => {
                    navigate('/profile');
                    setShowActionMenu(false);
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                      {getUserInitials()}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {getUserName()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {getUserEmail()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-500 font-medium">View Profile</span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </motion.button>

                {/* Quick Actions Grid */}
                <div className="p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 mb-2">
                    Quick Actions
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: Plus, label: 'New Task', action: handleCreateTask, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
                      { icon: Calendar, label: 'Calendar', action: () => { navigate('/calendarpage'); setShowActionMenu(false); }, color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
                      { icon: BarChart3, label: 'Analytics', action: () => { navigate('/analytics'); setShowActionMenu(false); }, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
                      { icon: Settings, label: 'Settings', action: () => { navigate('/settings'); setShowActionMenu(false); }, color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-700/20' },
                    ].map((item, index) => (
                      <motion.button
                        key={item.label}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={item.action}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <div className={`p-2 rounded-xl ${item.bgColor}`}>
                          <item.icon size={18} className={item.color} />
                        </div>
                        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                          {item.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200/50 dark:bg-gray-700/50 mx-3"></div>

                {/* Action Items */}
                <div className="p-2">
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
                        transition={{ delay: index * 0.03 + 0.1 }}
                        whileHover={{ x: 5 }}
                      >
                        <div className={`p-2 rounded-xl ${item.bgColor}`}>
                          <Icon size={18} className={item.color} />
                        </div>
                        <span className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                          {item.label}
                        </span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </motion.button>
                    );
                  })}
                </div>

                {/* Bottom Actions */}
                <div className="p-2 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                  <motion.button
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={toggleDarkMode}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isDarkMode ? (
                      <>
                        <Sun size={18} className="text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Light</span>
                      </>
                    ) : (
                      <>
                        <Moon size={18} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    onClick={handleLogout}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut size={18} className="text-red-500" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Logout</span>
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