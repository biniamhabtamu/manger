import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  content, 
  position = 'top',
  delay = 0.3 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45',
    left: 'left-full top-1/2 transform -translate-y-1/2 -translate-x-1/2 rotate-45',
    right: 'right-full top-1/2 transform -translate-y-1/2 translate-x-1/2 rotate-45'
  };

  return (
    <div className="relative inline-flex">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: position === 'top' ? -5 : position === 'bottom' ? 5 : 0, 
                      x: position === 'left' ? -5 : position === 'right' ? 5 : 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: position === 'top' ? -5 : position === 'bottom' ? 5 : 0, 
                   x: position === 'left' ? -5 : position === 'right' ? 5 : 0 }}
            transition={{ duration: 0.2, delay }}
            className={`absolute z-50 ${positionClasses[position]} px-3 py-1.5 text-sm bg-gray-800 text-white rounded-md shadow-lg whitespace-nowrap`}
          >
            {content}
            <div className={`absolute w-2 h-2 bg-gray-800 ${arrowClasses[position]}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};