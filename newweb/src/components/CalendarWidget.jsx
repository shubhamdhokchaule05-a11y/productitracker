import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { AppContext } from '../context/AppContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function CalendarWidget() {
  const today = new Date();
  const [current, setCurrent] = useState({ month: today.getMonth(), year: today.getFullYear() });
  const { attendance, tasks } = useContext(AppContext);

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const prevMonth = () =>
    setCurrent(({ month, year }) =>
      month === 0 ? { month: 11, year: year - 1 } : { month: month - 1, year }
    );

  const nextMonth = () =>
    setCurrent(({ month, year }) =>
      month === 11 ? { month: 0, year: year + 1 } : { month: month + 1, year }
    );

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {MONTHS[current.month]} {current.year}
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer">
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer">
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const isToday =
            day === today.getDate() &&
            current.month === today.getMonth() &&
            current.year === today.getFullYear();

          // Construct YYYY-MM-DD key for matching this day
          const yearStr = current.year;
          const monthStr = String(current.month + 1).padStart(2, '0');
          const dayStr = String(day).padStart(2, '0');
          const dateKey = `${yearStr}-${monthStr}-${dayStr}`;

          // Live task due date match
          const hasTask = tasks && tasks.some(t => t.dueDate === dateKey || (t.due_date && t.due_date === dateKey));
          
          // Live attendance record match
          const attRecord = attendance && attendance.find(a => a.date === dateKey);
          const isPresent = attRecord ? (attRecord.status === 'present' || attRecord.status === 'Present') : false;
          const isAbsent = attRecord ? (attRecord.status === 'absent' || attRecord.status === 'Absent') : false;
          const isOnLeave = attRecord ? (attRecord.status === 'leave' || attRecord.status === 'Leave' || attRecord.status === 'Approved') : false;

          let ringStyle = '';
          if (isPresent) ringStyle = 'ring-1 ring-emerald-400 dark:ring-emerald-500';
          else if (isAbsent) ringStyle = 'ring-1 ring-rose-400 dark:ring-rose-500';
          else if (isOnLeave) ringStyle = 'ring-1 ring-amber-400 dark:ring-amber-500';

          return (
            <motion.div
              key={day}
              whileHover={{ scale: 1.15 }}
              className={`
                relative flex items-center justify-center h-8 w-8 mx-auto rounded-full text-xs font-medium cursor-pointer transition-all
                ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-400/40' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                ${!isToday ? ringStyle : ''}
              `}
              title={attRecord ? `Status: ${attRecord.status}` : ''}
            >
              {day}
              {hasTask && !isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full" />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />Today
        </div>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />Task due
        </div>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          <span className="w-2 h-2 rounded-full border border-emerald-400" />Present
        </div>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          <span className="w-2 h-2 rounded-full border border-rose-400" />Absent
        </div>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          <span className="w-2 h-2 rounded-full border border-amber-400" />Leave
        </div>
      </div>
    </div>
  );
}

export default CalendarWidget;
