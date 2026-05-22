import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiCoffee, FiZap, FiActivity } from 'react-icons/fi';
import { AppContext } from '../../context/AppContext';
import { formatTime } from '../../utils/helpers';

function IdleBreakModal() {
  const { 
    isIdleModalOpen, 
    setIsIdleModalOpen, 
    breakSeconds, 
    handleBreakEnd,
    idleSettings
  } = useContext(AppContext);

  const handleResume = () => {
    handleBreakEnd();
    setIsIdleModalOpen(false);
  };

  const handleKeepBreak = () => {
    setIsIdleModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isIdleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur & fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleKeepBreak}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl p-6 shadow-2xl text-center"
          >
            {/* Glowing Radial Background */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Coffee Animated Icon */}
            <div className="relative w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center text-white text-3.5xl">
              <motion.div
                animate={{ 
                  y: [0, -3, 0],
                  rotate: [0, -3, 3, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4, 
                  ease: "easeInOut" 
                }}
              >
                <FiCoffee className="w-10 h-10" />
              </motion.div>
              <div className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
              </div>
            </div>

            {/* Title & Info */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Auto-Break Started ☕
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 px-2">
              We noticed you've been away for more than <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {Math.round(idleSettings.idleTimeout / 60000)} min
              </span>. Your work session has been paused to keep your hours accurate.
            </p>

            {/* Inactive break clock */}
            <div className="bg-gray-50 dark:bg-gray-700/40 rounded-2xl p-4 mb-6 border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-center gap-1.5 font-medium">
                <FiClock className="w-3.5 h-3.5 text-amber-500" /> Break Duration
              </p>
              <p className="text-3xl font-bold font-mono text-amber-500 tabular-nums">
                {formatTime(breakSeconds)}
              </p>
            </div>

            {/* Interactive Notice */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 flex items-center justify-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 py-2 px-3 rounded-lg text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">
              <FiActivity className="animate-pulse" />
              Moving your mouse or typing will auto-resume!
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleResume}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-sm"
              >
                <FiZap className="w-4 h-4 fill-white" /> Resume Work
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleKeepBreak}
                className="flex-1 px-5 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors text-sm border border-gray-200/50 dark:border-gray-600/50"
              >
                Keep on Break
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default IdleBreakModal;
