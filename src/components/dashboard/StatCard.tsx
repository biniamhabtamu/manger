import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorVariants = {
  blue: 'from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  green: 'from-green-500 to-green-600 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  yellow: 'from-yellow-500 to-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  red: 'from-red-500 to-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  purple: 'from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  const colorClass = colorVariants[color];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                trend.isPositive 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                from last week
              </span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} rounded-lg flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
};