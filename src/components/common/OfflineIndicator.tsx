import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOfflineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-2 text-center text-sm font-medium"
        >
          <div className="flex items-center justify-center space-x-2">
            <WifiOff size={16} />
            <span>You're offline. Changes will sync when connection is restored.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};