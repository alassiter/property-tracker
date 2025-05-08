import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Home, Upload, BarChart, LogOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { signOut } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-900">Dashboard</h1>
        </div>
        <ul className="space-y-2 px-4">
          <li>
            <Link
              to="/"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-900 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/upload"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-900 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>Upload</span>
            </Link>
          </li>
          <li>
            <Link
              to="/results"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-900 transition-colors"
            >
              <BarChart className="w-5 h-5" />
              <span>Results</span>
            </Link>
          </li>
          <li>
            <Link
              to="/database"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-900 transition-colors"
            >
              <Database className="w-5 h-5" />
              <span>Database</span>
            </Link>
          </li>
          <li className="mt-auto">
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;