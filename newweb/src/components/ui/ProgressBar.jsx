import React from 'react';
import { motion } from 'framer-motion';

function ProgressBar({ value, max = 100, color = 'indigo', label, showPercent = true, size = 'md', animated = true }) {
  const percent = Math.min(Math.round((value / max) * 100), 100);

  const colorMap = {
    indigo: 'from-indigo-500 to-indigo-400',
    emerald: 'from-emerald-500 to-emerald-400',
    amber: 'from-amber-500 to-amber-400',
    blue: 'from-blue-500 to-blue-400',
    purple: 'from-purple-500 to-purple-400',
    rose: 'from-rose-500 to-rose-400',
    red: 'from-red-500 to-red-400',
  };

  const sizeMap = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const gradient = colorMap[color] || colorMap.indigo;
  const height = sizeMap[size] || sizeMap.md;

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>}
          {showPercent && <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{percent}%</span>}
        </div>
      )}
      <div className={`w-full ${height} bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden`}>
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percent}%` }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className={`h-full bg-gradient-to-r ${gradient} rounded-full relative`}
        >
          {size === 'lg' && (
            <div className="absolute inset-0 bg-white/20 rounded-full" />
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default ProgressBar;
