import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Basic Sidebar placeholder */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Smart Leads</h1>
        </div>
        <nav className="p-4 space-y-2">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-md font-medium cursor-pointer">
            Dashboard
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Basic Header placeholder */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.firstName} {user?.lastName} ({user?.role})
            </span>
            <button 
              onClick={logout}
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
