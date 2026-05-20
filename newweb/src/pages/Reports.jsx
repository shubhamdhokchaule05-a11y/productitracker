import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { AppContext } from '../context/AppContext';
import { weeklyProductivityData, monthlyAttendanceData, taskStatusData } from '../data/dummyData';
import { calcProductivity } from '../utils/helpers';

const COLORS = ['#10b981', '#6366f1', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-gray-700">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}{p.name === 'productivity' ? '%' : ''}</p>
        ))}
      </div>
    );
  }
  return null;
};

function Reports() {
  const { tasks } = useContext(AppContext);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const productivity = calcProductivity(completedTasks, totalTasks);

  const taskStatusChartData = [
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#6366f1' },
    { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#f59e0b' },
  ];

  const cardClass = "bg-white dark:bg-gray-800 rounded-2xl p-5 shadow border border-gray-100 dark:border-gray-700";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your productivity insights at a glance</p>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg. Productivity', value: `${productivity}%`, color: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Tasks This Week', value: weeklyProductivityData.reduce((a, d) => a + d.tasks, 0), color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Days Present', value: '22 / 30', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Avg. Hours/Day', value: '8.2h', color: 'text-purple-600 dark:text-purple-400' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={cardClass + ' text-center'}
          >
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Productivity Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cardClass}
        >
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Weekly Productivity (%)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyProductivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-700" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="productivity"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6, fill: '#4f46e5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Task Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={cardClass}
        >
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Task Status Distribution</h3>
          <div className="flex items-center justify-center gap-6">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={taskStatusChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {taskStatusChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {taskStatusChartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 ml-auto pl-4">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly Task Completion Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cardClass}
        >
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Daily Tasks & Hours</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyProductivityData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-700" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Bar dataKey="tasks" fill="#6366f1" radius={[6, 6, 0, 0]} name="tasks" />
              <Bar dataKey="hours" fill="#10b981" radius={[6, 6, 0, 0]} name="hours" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Attendance Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={cardClass}
        >
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Monthly Attendance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyAttendanceData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-700" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="present" stackId="a" />
              <Bar dataKey="absent" fill="#f43f5e" radius={[4, 4, 0, 0]} name="absent" stackId="a" />
              <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} name="late" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

export default Reports;
