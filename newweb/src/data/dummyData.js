// Dummy data for the Productivity Tracker Dashboard

export const currentUser = {
  id: 1,
  name: 'Alex Johnson',
  email: 'alex.johnson@company.com',
  role: 'Senior Developer',
  department: 'Engineering',
  avatar: null,
  joinDate: '2023-01-15',
  phone: '+1 (555) 234-5678',
  location: 'New York, USA',
  notifications: {
    email: true,
    push: true,
    taskReminders: true,
    weeklyReport: false,
    teamUpdates: true,
  },
};

export const tasks = [
  {
    id: 1,
    title: 'Design new landing page',
    description: 'Create a modern landing page design for the Q3 product launch',
    status: 'completed',
    priority: 'high',
    dueDate: '2026-05-10',
    createdAt: '2026-05-01',
    assignee: 'Alex Johnson',
    tags: ['design', 'frontend'],
  },
  {
    id: 2,
    title: 'Implement authentication module',
    description: 'Build JWT-based authentication with refresh token support',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-05-20',
    createdAt: '2026-05-05',
    assignee: 'Alex Johnson',
    tags: ['backend', 'security'],
  },
  {
    id: 3,
    title: 'Write unit tests for API endpoints',
    description: 'Achieve 80% test coverage for all REST API endpoints',
    status: 'pending',
    priority: 'medium',
    dueDate: '2026-05-25',
    createdAt: '2026-05-06',
    assignee: 'Alex Johnson',
    tags: ['testing', 'backend'],
  },
  {
    id: 4,
    title: 'Database optimization',
    description: 'Optimize slow queries and add proper indexing',
    status: 'pending',
    priority: 'medium',
    dueDate: '2026-05-28',
    createdAt: '2026-05-07',
    assignee: 'Alex Johnson',
    tags: ['database', 'performance'],
  },
  {
    id: 5,
    title: 'Code review - Sprint 12',
    description: 'Review and merge pending pull requests from sprint 12',
    status: 'completed',
    priority: 'low',
    dueDate: '2026-05-12',
    createdAt: '2026-05-08',
    assignee: 'Alex Johnson',
    tags: ['review'],
  },
  {
    id: 6,
    title: 'Deploy staging environment',
    description: 'Set up and configure staging environment on AWS',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-05-18',
    createdAt: '2026-05-09',
    assignee: 'Alex Johnson',
    tags: ['devops', 'cloud'],
  },
  {
    id: 7,
    title: 'Update API documentation',
    description: 'Update Swagger docs with new endpoints and deprecate old ones',
    status: 'pending',
    priority: 'low',
    dueDate: '2026-05-30',
    createdAt: '2026-05-10',
    assignee: 'Alex Johnson',
    tags: ['documentation'],
  },
  {
    id: 8,
    title: 'Performance audit',
    description: 'Run Lighthouse audit and fix performance bottlenecks',
    status: 'completed',
    priority: 'medium',
    dueDate: '2026-05-14',
    createdAt: '2026-05-11',
    assignee: 'Alex Johnson',
    tags: ['performance', 'frontend'],
  },
];

export const attendanceHistory = [];

export const weeklyProductivityData = [
  { day: 'Mon', tasks: 4, hours: 8.5, productivity: 92 },
  { day: 'Tue', tasks: 3, hours: 7.8, productivity: 78 },
  { day: 'Wed', tasks: 5, hours: 9.0, productivity: 95 },
  { day: 'Thu', tasks: 2, hours: 6.5, productivity: 65 },
  { day: 'Fri', tasks: 4, hours: 8.0, productivity: 88 },
  { day: 'Sat', tasks: 1, hours: 4.0, productivity: 45 },
  { day: 'Sun', tasks: 0, hours: 0, productivity: 0 },
];

export const monthlyAttendanceData = [
  { week: 'Week 1', present: 5, absent: 0, late: 0 },
  { week: 'Week 2', present: 4, absent: 1, late: 0 },
  { week: 'Week 3', present: 4, absent: 0, late: 1 },
  { week: 'Week 4', present: 5, absent: 0, late: 0 },
];

export const taskStatusData = [
  { name: 'Completed', value: 3, color: '#10b981' },
  { name: 'In Progress', value: 2, color: '#6366f1' },
  { name: 'Pending', value: 3, color: '#f59e0b' },
];

export const recentActivities = [
  {
    id: 1,
    type: 'task_completed',
    message: 'Completed "Design new landing page"',
    time: '2 hours ago',
    icon: 'check',
    color: 'green',
  },
  {
    id: 2,
    type: 'punch_in',
    message: 'Punched in at 09:02 AM',
    time: '5 hours ago',
    icon: 'clock',
    color: 'blue',
  },
  {
    id: 3,
    type: 'task_added',
    message: 'Added task "Update API documentation"',
    time: '1 day ago',
    icon: 'plus',
    color: 'indigo',
  },
  {
    id: 4,
    type: 'task_completed',
    message: 'Completed "Performance audit"',
    time: '2 days ago',
    icon: 'check',
    color: 'green',
  },
  {
    id: 5,
    type: 'punch_out',
    message: 'Punched out at 06:15 PM',
    time: '2 days ago',
    icon: 'clock',
    color: 'purple',
  },
];
