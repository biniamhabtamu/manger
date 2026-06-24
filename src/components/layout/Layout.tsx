import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={24} className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Layout */}
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            width: isSidebarCollapsed ? 72 : 256,
            transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
          }}
          className="hidden lg:block fixed left-0 top-0 h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 shadow-lg z-30 overflow-hidden"
        >
          <div className="h-full flex flex-col">
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-gray-200/50 dark:border-gray-800/50`}>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    T
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">TaskFlow</span>
                </motion.div>
              )}
              {isSidebarCollapsed && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  T
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <Sidebar collapsed={isSidebarCollapsed} />
            </div>
            <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
              <button
                onClick={toggleSidebar}
                className={`w-full p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400`}
                aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isSidebarCollapsed ? (
                  <ChevronRight size={18} />
                ) : (
                  <>
                    <ChevronLeft size={18} />
                    <span className="text-xs font-medium">Collapse</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${!isSidebarCollapsed ? 'lg:ml-64' : 'lg:ml-[72px]'}`}>
          {/* Header */}
          <Header onMenuClick={toggleSidebar} isMobileMenuOpen={isMobileMenuOpen} />

          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 min-h-0 overflow-auto p-4 md:p-6 lg:p-8"
          >
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </motion.main>

          {/* Mobile Bottom Safe Area */}
          <div className="h-4 lg:hidden" />
        </div>
      </div>
    </div>
  );
};

// IMPORTANT: Add default export at the bottom
export default Layout;