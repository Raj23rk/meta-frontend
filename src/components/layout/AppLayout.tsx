import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#F8FAFC]">
      {/* 1. Desktop & Mobile Pinned Sidebar (Fixed Top-to-Bottom in Professional Office Slate #0F172A) */}
      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        desktopCollapsed={desktopCollapsed}
        setDesktopCollapsed={setDesktopCollapsed}
      />

      {/* 2. Entire Screen Viewport on the Right in Clean Office Cloud #F8FAFC */}
      <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#F8FAFC] min-w-0">
        {/* Crisp Office Top Navbar */}
        <Navbar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          desktopCollapsed={desktopCollapsed}
          setDesktopCollapsed={setDesktopCollapsed}
        />

        {/* Independently Scrollable Main Viewport */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 lg:p-8 transition-all duration-300 min-w-0 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
