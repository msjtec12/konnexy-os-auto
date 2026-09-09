import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12 animate-in fade-in-50 duration-150">
          <Outlet />
        </main>

        {/* Bottom Navigation for Mobile */}
        <BottomNav />
      </div>
    </div>
  );
};
