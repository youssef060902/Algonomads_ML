// components/SidebarOncologist.tsx
"use client";
import React from 'react';
import { 
  Home, 
  Activity, 
  Target, 
  TrendingUp, 
  FileText, 
  Upload, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  HelpCircle,
  Stethoscope,
  Shield
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface SidebarOncologistProps {
  userName?: string;
  userRole?: string;
}

const SidebarOncologist: React.FC<SidebarOncologistProps> = ({ 
  userName = "Dr. Smith", 
  userRole = "Senior Oncologist" 
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: <Home className="w-5 h-5" />, 
      path: '/oncologist/dashboard',
      active: pathname?.includes('dashboard')
    },
    { 
      id: 'predict', 
      name: 'Cancer Prediction', 
      icon: <Activity className="w-5 h-5" />, 
      path: '/predict',
      active: pathname === '/predict'
    },
    { 
      id: 'stage', 
      name: 'Tumor Staging', 
      icon: <Target className="w-5 h-5" />, 
      path: '/stage',
      active: pathname === '/stage'
    },
    
  ];

  const secondaryItems = [
    { id: 'patients', name: 'My Patients', icon: <Users className="w-5 h-5" /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'help', name: 'Help & Support', icon: <HelpCircle className="w-5 h-5" /> },
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
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">ENA HEALTHY</h1>
            <p className="text-xs text-gray-400">Oncology Suite</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="font-bold text-lg">{userName.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold">{userName}</h3>
            <p className="text-sm text-gray-400">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-8">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
            Clinical Tools
          </h4>
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all ${
                  item.active
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
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
            Quick Access
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

        {/* Clinical Stats */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-4 h-4 text-green-400" />
            <h5 className="text-sm font-semibold">Today's Stats</h5>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Predictions</span>
              <span className="font-semibold text-green-400">12</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Staging Cases</span>
              <span className="font-semibold text-yellow-400">8</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Batch Analysis</span>
              <span className="font-semibold text-blue-400">3</span>
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

export default SidebarOncologist;