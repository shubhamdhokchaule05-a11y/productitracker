// Format seconds into HH:MM:SS display
export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Format date to readable string
export function formatDate(dateStr) {
  if (!dateStr) return 'No due date';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'No due date';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Get current date as YYYY-MM-DD
export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// Get current time as HH:MM
export function getCurrentTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Calculate productivity percentage
export function calcProductivity(completed, total) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Priority color mapping
export function getPriorityColor(priority) {
  const map = {
    high: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
    medium: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
    low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  };
  return map[priority] || map.low;
}

// Status color mapping
export function getStatusColor(status) {
  const map = {
    completed: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
    'in-progress': { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400' },
    pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
    present: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
    absent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    late: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  };
  return map[status] || map.pending;
}

// Generate unique ID
export function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Truncate text
export function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + '...' : str;
}
