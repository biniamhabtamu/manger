import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, CheckSquare, Code, Calendar, Plus, Bell, User, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BottomBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/categories', icon: Code, label: 'Categories' },
    { path: '/calendarpage', icon: Calendar, label: 'Calendar' },
  ];

  const actionItems = [
    { icon: Bell, label: 'Reminder', action: () => navigate('/reminders') },
    { icon: User, label: 'Profile', action: () => navigate('/profile') },
    { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
  ];

  const isActive = (path: string) => activeItem === path;

  // Update active item when route changes
  React.useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const toggleActionMenu = () => {
    setShowActionMenu(!showActionMenu);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        {/* Background blur effect */}
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700"></div>
        
        {/* Main navigation */}
        <div className="relative flex items-center justify-around px-2 py-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center w-16"
                onClick={() => {
                  setActiveItem(item.path);
                  setShowActionMenu(false);
                }}
              >
                <motion.div
                  className={`p-2 rounded-full flex items-center justify-center transition-all ${
                    active 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={20} />
                </motion.div>
                <span className={`text-xs mt-1 transition-colors ${
                  active 
                    ? 'text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Floating action button */}
          <div className="relative">
            <motion.button
              className="flex items-center justify-center w-14 h-14 -mt-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleActionMenu}
            >
              <motion.div
                animate={{ rotate: showActionMenu ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus size={24} />
              </motion.div>
            </motion.button>

            {/* Action menu that appears when FAB is clicked */}
            <AnimatePresence>
              {showActionMenu && (
                <motion.div
                  className="absolute bottom-full right-0 mb-4 flex flex-col items-end space-y-3"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  {actionItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.label}
                        className="flex items-center justify-end w-full p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => {
                          item.action();
                          setShowActionMenu(false);
                        }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="mr-2 text-sm text-gray-700 dark:text-gray-200">{item.label}</span>
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                          <Icon size={16} />
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Add padding to the bottom of the page to prevent content from being hidden */}
      <div className="h-20 lg:hidden"></div>

      {/* Overlay when action menu is open */}
      <AnimatePresence>
        {showActionMenu && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-10 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowActionMenu(false)}
          ></motion.div>
        )}
      </AnimatePresence>
    </>
  );
};