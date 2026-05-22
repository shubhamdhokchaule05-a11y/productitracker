import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import IdleBreakModal from '../components/ui/IdleBreakModal';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((p) => !p)} />

      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 240 : 72 }}
      >
        <Navbar onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Global Inactivity Alert Modal */}
      <IdleBreakModal />
    </div>
  );
}

export default DashboardLayout;
