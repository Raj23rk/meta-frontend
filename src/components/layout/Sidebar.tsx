import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlugZap,
  FileCode2,
  Users2,
  SendHorizontal,
  MessagesSquare,
  Users,
  CreditCard,
  X,
  MessageSquare,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  desktopCollapsed: boolean;
  setDesktopCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  desktopCollapsed,
  setDesktopCollapsed,
}) => {
  const navItems = [
    { label: 'Overview', to: '/app', icon: LayoutDashboard, end: true },
    { label: 'WhatsApp Connection', to: '/app/connect', icon: PlugZap },
    { label: 'Meta Templates', to: '/app/templates', icon: FileCode2 },
    { label: 'Contacts & Audiences', to: '/app/contacts', icon: Users2 },
    { label: 'Broadcast Campaigns', to: '/app/campaigns', icon: SendHorizontal },
    { label: 'Live Chat Inbox', to: '/app/inbox', icon: MessagesSquare },
    { label: 'Team Members', to: '/app/team', icon: Users },
    { label: 'Billing & Usage', to: '/app/billing', icon: CreditCard },
  ];

  const renderNavLinks = (isMobile = false) => (
    <div className="space-y-1.5 px-3">
      {(!desktopCollapsed || isMobile) && (
        <div className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400 px-3 py-2.5 flex items-center justify-between">
          <span className="text-sky-300/80">WORKSPACE MAIN</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#30AFFF] shadow-[0_0_8px_#30AFFF] animate-pulse"></span>
        </div>
      )}

      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => {
              if (isMobile) setMobileMenuOpen(false);
            }}
            title={desktopCollapsed && !isMobile ? item.label : undefined}
            className={({ isActive }) =>
              `group relative flex items-center ${
                desktopCollapsed && !isMobile ? 'justify-center px-2 py-3' : 'space-x-3 px-3.5 py-2.5'
              } rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#30AFFF] text-white shadow-lg shadow-sky-500/35 font-bold ring-1 ring-sky-300/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#30AFFF]'
                  }`}
                />
                {(!desktopCollapsed || isMobile) && (
                  <span className="truncate tracking-wide">{item.label}</span>
                )}
                {isActive && (!desktopCollapsed || isMobile) && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-sky-100 opacity-90 shrink-0" />
                )}

                {/* Desktop Collapsed Tooltip */}
                {desktopCollapsed && !isMobile && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-slate-100 text-xs rounded-lg shadow-xl border border-slate-700 whitespace-nowrap hidden group-hover:block z-50 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <>
      {/* 1. Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 2. Mobile Slide-out Drawer in #0F172A */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-[#0F172A] text-slate-300 flex flex-col z-50 md:hidden border-r border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Drawer Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#30AFFF] flex items-center justify-center text-white shadow-md shadow-sky-500/25">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-white text-base">WhatsApp</span>
              <span className="font-extrabold text-[#30AFFF] bg-sky-500/10 border border-sky-400/30 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                SAAS
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items in Drawer */}
        <div className="py-4 flex-1 overflow-y-auto">{renderNavLinks(true)}</div>

        {/* Footer Meta Badge in Drawer */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span>Meta Cloud API</span>
              <span className="w-2 h-2 rounded-full bg-[#30AFFF] shadow-[0_0_8px_#30AFFF] animate-pulse"></span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">v20.0 • Verified Connection</div>
          </div>
        </div>
      </aside>

      {/* 3. Desktop Permanent Sidebar - Fixed Top-to-Bottom in #0F172A */}
      <aside
        className={`hidden md:flex flex-col shrink-0 h-full bg-[#0F172A] text-slate-300 border-r border-slate-800/90 transition-all duration-300 shadow-xl overflow-hidden ${
          desktopCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Desktop Brand Header at top of Sidebar */}
        <div
          className={`h-16 px-4 border-b border-slate-800/80 flex items-center ${
            desktopCollapsed ? 'justify-center' : 'justify-between'
          } shrink-0`}
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#30AFFF] flex items-center justify-center text-white shadow-md shadow-sky-500/25 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            {!desktopCollapsed && (
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-white tracking-tight text-lg">WhatsApp</span>
                <span className="font-extrabold text-[#30AFFF] bg-sky-500/10 border border-sky-400/30 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  SAAS
                </span>
              </div>
            )}
          </div>

          {!desktopCollapsed && (
            <button
              onClick={() => setDesktopCollapsed(true)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}

          {desktopCollapsed && (
            <button
              onClick={() => setDesktopCollapsed(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Area */}
        <div className="py-4 flex-1 overflow-y-auto overflow-x-hidden">{renderNavLinks(false)}</div>

        {/* Desktop Sidebar Footer Pinned */}
        <div className="p-3 border-t border-slate-800/80 shrink-0">
          {!desktopCollapsed ? (
            <div className="bg-gradient-to-b from-slate-900 to-[#0B132B] rounded-2xl p-3 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                <span>Meta API Status</span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#30AFFF] shadow-[0_0_8px_#30AFFF] animate-pulse"></span>
                  <span className="text-[10px] text-[#30AFFF] font-bold uppercase">Live</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Cloud API v20.0 • Connected</div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div
                className="w-3.5 h-3.5 rounded-full bg-[#30AFFF] shadow-[0_0_8px_#30AFFF] animate-pulse"
                title="Meta Cloud API Connected"
              ></div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
