// components/SidebarPathologist.tsx
"use client";
import React from 'react';
import { 
  Home, 
  Activity, 
  TrendingUp, 
  FileText, 
  Upload, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  HelpCircle,
  Microscope,
  Shield,
  ClipboardCheck,
  BarChart3
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface SidebarPathologistProps {
  userName?: string;
  userRole?: string;
}

const SidebarPathologist: React.FC<SidebarPathologistProps> = ({ 
  userName = "Dr. Johnson", 
  userRole = "Chief Pathologist" 
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: <Home className="w-5 h-5" />, 
      path: '/pathologist/dashboard',
      active: pathname?.includes('dashboard')
    },
    { 
      id: 'risk', 
      name: 'Recurrence Risk', 
      icon: <Activity className="w-5 h-5" />, 
      path: '/risk',
      active: pathname === '/risk'
    },
    
  ];

  const secondaryItems = [
    { id: 'cases', name: 'Active Cases', icon: <Users className="w-5 h-5" /> },
    { id: 'notifications', name: 'Alerts', icon: <Bell className="w-5 h-5" /> },
    { id: 'help', name: 'Protocols', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'settings', name: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    // Clear session/local auth state and redirect to login
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('redirectAfterLogin');
      localStorage.removeItem('preferredRole');
    } catch (e) {
      // ignore if localStorage is unavailable
    }
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white w-64">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-600 p-2 rounded-lg">
            <Microscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">ENA HEALTHY</h1>
            <p className="text-xs text-gray-400">Pathology Suite</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
            <span className="font-bold text-lg">{userName.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold">{userName}</h3>
            <p className="text-sm text-gray-400">{userRole}</p>
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
              <span className="text-xs text-green-400">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-8">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
            Pathology Tools
          </h4>
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all ${
                  item.active
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className={`${item.active ? 'text-white' : 'text-gray-400'}`}>
                  {item.icon}
                </div>
                <span className="font-medium">{item.name}</span>
                {item.active && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
            Quick Actions
          </h4>
          <nav className="space-y-1">
            {secondaryItems.map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <div className="text-gray-400">{item.icon}</div>
                <span className="text-sm">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Risk Statistics */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-4 h-4 text-amber-400" />
            <h5 className="text-sm font-semibold">Risk Assessment</h5>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">High Risk Cases</span>
              <span className="font-semibold text-red-400">5</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Moderate Risk</span>
              <span className="font-semibold text-yellow-400">12</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Low Risk</span>
              <span className="font-semibold text-green-400">23</span>
            </div>
            <div className="pt-2 border-t border-gray-700 mt-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Pending Review</span>
                <span className="font-semibold text-blue-400">8</span>
              </div>
            </div>
          </div>
        </div>

        
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 px-3 py-3 rounded-lg bg-gradient-to-r from-red-600/20 to-red-800/20 text-red-300 hover:bg-red-600/30 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarPathologist;