// layouts/OncologistLayout.tsx
"use client";
import React, { useState } from 'react';
import SidebarOncologist from '../components/SidebarOncologist';
import { Menu, X } from 'lucide-react';

interface OncologistLayoutProps {
  children: React.ReactNode;
}

const OncologistLayout: React.FC<OncologistLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-md text-gray-700"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop */}
      <div className="hidden lg:flex">
        <SidebarOncologist />
      </div>

      {/* Sidebar for Mobile */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-64">
          <SidebarOncologist />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
};

export default OncologistLayout;