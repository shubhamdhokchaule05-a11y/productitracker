import React from 'react';
import { motion } from 'framer-motion';

function StatCard({ title, value, subtitle, icon: Icon, color, trend, delay = 0 }) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500',
      light: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      glow: 'shadow-indigo-200 dark:shadow-indigo-900/50',
    },
    emerald: {
      bg: 'bg-emerald-500',
      light: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      glow: 'shadow-emerald-200 dark:shadow-emerald-900/50',
    },
    amber: {
      bg: 'bg-amber-500',
      light: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600 dark:text-amber-400',
      glow: 'shadow-amber-200 dark:shadow-amber-900/50',
    },
    blue: {
      bg: 'bg-blue-500',
      light: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      glow: 'shadow-blue-200 dark:shadow-blue-900/50',
    },
    purple: {
      bg: 'bg-purple-500',
      light: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      glow: 'shadow-purple-200 dark:shadow-purple-900/50',
    },
    rose: {
      bg: 'bg-rose-500',
      light: 'bg-rose-50 dark:bg-rose-900/20',
      text: 'text-rose-600 dark:text-rose-400',
      glow: 'shadow-rose-200 dark:shadow-rose-900/50',
    },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg ${c.glow} border border-gray-100 dark:border-gray-700 cursor-default`}
    >
      <div className={`absolute -top-4 -right-4 w-24 h-24 ${c.bg} opacity-10 rounded-full`} />
      <div className={`absolute -bottom-6 -right-6 w-32 h-32 ${c.bg} opacity-5 rounded-full`} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.1 }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-1"
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className={`text-xs font-medium ${c.text}`}>{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% from last week</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${c.light} rounded-xl flex items-center justify-center flex-shrink-0`}>
          {Icon && <Icon className={`w-6 h-6 ${c.text}`} />}
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;
