import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiPause, FiSquare, FiClock, FiCalendar, FiTrash2 } from 'react-icons/fi';
import { AppContext } from '../context/AppContext';
import Badge from '../components/ui/Badge';
import { formatTime, getCurrentTime, getTodayDate, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const STATUS = { IDLE: 'idle', WORKING: 'working', BREAK: 'break', DONE: 'done' };

function Attendance() {
  const { attendance, addAttendance, updateAttendance, deleteAttendance } = useContext(AppContext);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [seconds, setSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [punchInTime, setPunchInTime] = useState(null);
  const [punchOutTime, setPunchOutTime] = useState(null);
  const [todayId, setTodayId] = useState(null);
  const [isOnBreak, setIsOnBreak] = useState(false);

  useEffect(() => {
    let interval;
    if (status === STATUS.WORKING) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (status === STATUS.BREAK) {
      interval = setInterval(() => setBreakSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handlePunchIn = async () => {
    const now = getCurrentTime();
    setPunchInTime(now);
    setStatus(STATUS.WORKING);
    setSeconds(0);
    setBreakSeconds(0);
    const dbId = await addAttendance({ date: getTodayDate(), punchIn: now, punchOut: '-', breakTime: '0 min', totalHours: '-', status: 'present' });
    if (dbId) {
      setTodayId(dbId);
    }
    toast.success(`Punched in at ${now} 🎉`);
  };

  const handleBreakStart = () => {
    const now = getCurrentTime();
    setIsOnBreak(true);
    setStatus(STATUS.BREAK);
    if (todayId) {
      updateAttendance(todayId, { breakStart: now });
    }
    toast('Break started ☕', { icon: '⏸' });
  };

  const handleBreakEnd = () => {
    const now = getCurrentTime();
    setIsOnBreak(false);
    setStatus(STATUS.WORKING);
    if (todayId) {
      updateAttendance(todayId, { breakEnd: now });
    }
    toast.success('Break ended, back to work!');
  };

  const handlePunchOut = () => {
    const now = getCurrentTime();
    setPunchOutTime(now);
    setStatus(STATUS.DONE);
    const totalMins = Math.floor(seconds / 60);
    const breakMins = Math.floor(breakSeconds / 60);
    const netMins = totalMins - breakMins;
    const h = Math.floor(netMins / 60);
    const m = netMins % 60;
    const totalStr = `${h}h ${m}m`;
    if (todayId) {
      updateAttendance(todayId, { punchOut: now, breakTime: `${breakMins} min`, totalHours: totalStr });
    }
    toast.success(`Punched out at ${now}. Total: ${totalStr}`);
  };

  const ringColor = status === STATUS.WORKING ? 'from-indigo-500 to-purple-500'
    : status === STATUS.BREAK ? 'from-amber-400 to-orange-500'
    : status === STATUS.DONE ? 'from-emerald-500 to-teal-500'
    : 'from-gray-300 to-gray-400';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Attendance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(getTodayDate())}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow border border-gray-100 dark:border-gray-700 text-center"
        >
          <div className="mb-4">
            <Badge variant={status === STATUS.WORKING ? 'in-progress' : status === STATUS.BREAK ? 'pending' : status === STATUS.DONE ? 'completed' : 'default'} size="md">
              {status === STATUS.IDLE ? 'Not Started' : status === STATUS.WORKING ? '● Working' : status === STATUS.BREAK ? '⏸ On Break' : '✓ Done'}
            </Badge>
          </div>

          <div className={`relative w-40 h-40 rounded-full mx-auto mb-6 bg-gradient-to-br ${ringColor} p-1 shadow-xl`}>
            <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-mono text-gray-900 dark:text-white tabular-nums">
                {formatTime(seconds)}
              </span>
              {status === STATUS.BREAK && (
                <span className="text-xs text-amber-500 font-medium mt-0.5">+{formatTime(breakSeconds)} break</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {status === STATUS.IDLE && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePunchIn}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
              >
                <FiPlay className="w-4 h-4" /> Punch In
              </motion.button>
            )}
            {status === STATUS.WORKING && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBreakStart}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all"
                >
                  <FiPause className="w-4 h-4" /> Break Start
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePunchOut}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all"
                >
                  <FiSquare className="w-4 h-4" /> Punch Out
                </motion.button>
              </>
            )}
            {status === STATUS.BREAK && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBreakEnd}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
                >
                  <FiPlay className="w-4 h-4" /> Break End
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePunchOut}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all"
                >
                  <FiSquare className="w-4 h-4" /> Punch Out
                </motion.button>
              </>
            )}
            {status === STATUS.DONE && (
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">Attendance marked for today ✓</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <FiClock className="w-5 h-5 text-indigo-500" /> Today's Summary
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Punch In', value: punchInTime || '--:--', icon: '🟢' },
              { label: 'Punch Out', value: punchOutTime || '--:--', icon: '🔴' },
              { label: 'Break Time', value: `${Math.floor(breakSeconds / 60)} min`, icon: '⏸' },
              { label: 'Net Working', value: formatTime(Math.max(0, seconds - breakSeconds)), icon: '⏱' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <FiCalendar className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Attendance History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                {['Date', 'Punch In', 'Punch Out', 'Break', 'Total Hours', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No attendance logs found. Punch in to start tracking.
                  </td>
                </tr>
              ) : (
                attendance.map((record, i) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                  >
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">{formatDate(record.date)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono">{record.punchIn}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono">{record.punchOut}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{record.breakTime}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">{record.totalHours}</td>
                    <td className="px-4 py-3 flex items-center justify-between">
                      <Badge variant={record.status}>{record.status}</Badge>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this record?')) {
                            deleteAttendance(record.id);
                            toast.success('Record deleted');
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-500 transition-all"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

export default Attendance;
