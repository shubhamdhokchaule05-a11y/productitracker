import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon, FiBell, FiSearch, FiMenu, FiUser, FiClock, FiCheck, FiX, FiAlertCircle, FiBellOff } from 'react-icons/fi';
import { ThemeContext } from '../context/ThemeContext';
import { AppContext } from '../context/AppContext';
import { currentUser } from '../data/dummyData';
import { formatTime } from '../utils/helpers';

function Navbar({ onMenuToggle }) {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { user, status, seconds, breakSeconds, notifications, markNotificationRead, markAllNotificationsRead } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications ? notifications.filter(n => !n.is_read).length : 0;

  const displayUser = user || currentUser;

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6 gap-4 shadow-sm z-10 relative">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuToggle}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-all lg:hidden"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        <div className="relative flex-1 max-w-sm hidden sm:block">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks, reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Real-time Global Active Timer Widget */}
        {(status === 'working' || status === 'break') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold font-mono shadow-sm tabular-nums transition-colors duration-300 ${
              status === 'working' 
                ? 'bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' 
                : 'bg-amber-50/80 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${status === 'working' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{status === 'working' ? 'Working: ' : 'On Break: '}</span>
            <span>{status === 'working' ? formatTime(seconds) : formatTime(breakSeconds)}</span>
          </motion.div>
        )}

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <motion.div
            key={isDark ? 'moon' : 'sun'}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {isDark ? <FiSun className="w-5 h-5 text-amber-400" /> : <FiMoon className="w-5 h-5" />}
          </motion.div>
        </motion.button>

        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all relative"
            title="Notifications"
          >
            <FiBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        markAllNotificationsRead();
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-500 font-medium dark:text-indigo-400 dark:hover:text-indigo-300 bg-transparent border-0 cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
                  {!notifications || notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                      <FiBellOff className="w-8 h-8 mx-auto mb-2 opacity-50 text-gray-400" />
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.is_read) markNotificationRead(notif.id);
                        }}
                        className={`px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer flex gap-3 items-start ${
                          !notif.is_read ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                        }`}
                      >
                        <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                          notif.title.includes('Approved') ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' :
                          notif.title.includes('Rejected') ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400' :
                          'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                        }`}>
                          {notif.title.includes('Approved') ? <FiCheck className="w-3.5 h-3.5" /> :
                           notif.title.includes('Rejected') ? <FiX className="w-3.5 h-3.5" /> :
                           <FiAlertCircle className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold text-gray-800 dark:text-gray-200 leading-normal flex items-center justify-between ${
                            !notif.is_read ? 'text-indigo-600 dark:text-indigo-400' : ''
                          }`}>
                            <span>{notif.title}</span>
                            {!notif.is_read && <span className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-mono">{notif.created_at || 'Just now'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow">
              {displayUser.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800 dark:text-white leading-none">{displayUser.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{displayUser.role}</p>
            </div>
          </button>

          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50"
            >
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{displayUser.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{displayUser.email}</p>
              </div>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                <FiUser className="w-4 h-4" /> My Profile
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
