import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Code, 
  Calendar, 
  Plus, 
  Bell, 
  User, 
  Settings, 
  BarChart3,
  X,
  Sparkles,
  Moon,
  Sun,
  LogOut,
  HelpCircle,
  FileText
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
  const [darkMode, setDarkMode] = useState(false);
  
  // Mock user data since we don't have AuthContext
  const user = {
    name: "User Name",
    email: "user@example.com"
  };

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/categories', icon: Code, label: 'Categories' },
    { path: '/calendarpage', icon: Calendar, label: 'Calendar' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const actionItems = [
    { icon: Bell, label: 'Reminders', action: () => navigate('/reminders'), color: 'text-yellow-500' },
    { icon: User, label: 'Profile', action: () => navigate('/profile'), color: 'text-blue-500' },
    { icon: Settings, label: 'Settings', action: () => navigate('/settings'), color: 'text-gray-500' },
    { icon: FileText, label: 'Docs', action: () => navigate('/docs'), color: 'text-green-500' },
    { icon: HelpCircle, label: 'Help', action: () => navigate('/help'), color: 'text-purple-500' },
  ];

  const isActive = (path: string) => activeItem === path;

  // Update active item when route changes
  React.useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const toggleActionMenu = () => {
    setShowActionMenu(!showActionMenu);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    // Mock logout function
    console.log("User logged out");
    navigate('/login');
  };

  const handleCreateTask = () => {
    onTaskFormOpen();
    setShowActionMenu(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        {/* Background blur effect */}
        <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/60 dark:border-gray-700/60"></div>
        
        {/* Main navigation */}
        <div className="relative flex items-center justify-around px-1 py-2">
          {menuItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center w-14"
                onClick={() => {
                  setActiveItem(item.path);
                  setShowActionMenu(false);
                }}
              >
                <motion.div
                  className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    active 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
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
          
          {/* Centered Create Task button */}
          <div className="relative flex flex-col items-center justify-center">
            <motion.button
              className="flex items-center justify-center w-16 h-16 -mt-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCreateTask}
            >
              <Plus size={28} />
            </motion.button>
            <span className="text-xs mt-1 text-blue-600 dark:text-blue-400 font-medium">
              Create
            </span>
          </div>

          {menuItems.slice(2).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center w-14"
                onClick={() => {
                  setActiveItem(item.path);
                  setShowActionMenu(false);
                }}
              >
                <motion.div
                  className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    active 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
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
          
          {/* Menu button for additional actions */}
          <div className="relative flex flex-col items-center justify-center">
            <motion.button
              className="flex items-center justify-center w-14"
              onClick={toggleActionMenu}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                  showActionMenu 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                animate={{ rotate: showActionMenu ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {showActionMenu ? <X size={20} /> : <Settings size={20} />}
              </motion.div>
            </motion.button>
            <span className={`text-xs mt-1 transition-colors ${
              showActionMenu 
                ? 'text-blue-600 dark:text-blue-400 font-medium' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              Menu
            </span>

            {/* Action menu that appears when menu button is clicked */}
            <AnimatePresence>
              {showActionMenu && (
                <motion.div
                  className="absolute bottom-full right-0 mb-4 flex flex-col items-end space-y-2 p-2"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* User info */}
                  <motion.div 
                    className="flex items-center p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md mb-2 w-full"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white mr-2">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                  </motion.div>

                  {/* Action items */}
                  {actionItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.label}
                        className="flex items-center justify-end w-full p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => {
                          item.action();
                          setShowActionMenu(false);
                        }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                        whileHover={{ x: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                        <div className={`p-2 rounded-full ${item.color} bg-opacity-10`}>
                          <Icon size={18} className={item.color} />
                        </div>
                      </motion.button>
                    );
                  })}

                  {/* Theme toggle and logout */}
                  <motion.div 
                    className="flex space-x-2 w-full mt-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.button
                      className="flex-1 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center"
                      onClick={toggleDarkMode}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {darkMode ? (
                        <Sun size={18} className="text-yellow-500" />
                      ) : (
                        <Moon size={18} className="text-gray-500" />
                      )}
                    </motion.button>
                    <motion.button
                      className="flex-1 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center"
                      onClick={handleLogout}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogOut size={18} className="text-red-500" />
                    </motion.button>
                  </motion.div>
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
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowActionMenu(false)}
          ></motion.div>
        )}
      </AnimatePresence>

      {/* Mobile tips floating button */}
      <AnimatePresence>
        {!showActionMenu && (
          <motion.div
            className="fixed left-4 bottom-24 z-30 lg:hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <motion.button
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tips')}
            >
              <Sparkles size={20} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};