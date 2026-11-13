import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Shield,
  Building2,
  ChevronDown,
  LogOut,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  desktopCollapsed: boolean;
  setDesktopCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Navbar: React.FC<NavbarProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { user, currentOrg, organizations, switchOrganization, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between transition-colors shadow-2xs">
      {/* Left section: Mobile hamburger + Mobile Brand OR Desktop Workspace Switcher */}
      <div className="flex items-center space-x-2.5 sm:space-x-4">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-[#30AFFF]" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile-only Brand (Desktop already displays Brand at top of Sidebar) */}
        <div className="md:hidden flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#30AFFF] flex items-center justify-center text-white shadow-sm">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-900 text-sm">WhatsApp</span>
          <span className="font-extrabold text-[#30AFFF] bg-sky-50 border border-sky-200 text-[9px] px-1.5 py-0.5 rounded-full uppercase">
            SAAS
          </span>
        </div>

        {/* Tenant / Organization Switcher Dropdown */}
        {organizations && organizations.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 transition-all text-xs sm:text-sm text-slate-800 font-semibold shadow-2xs max-w-[140px] sm:max-w-[220px]"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{currentOrg?.name || 'Workspace'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    Switch Workspace ({organizations.length})
                  </div>
                  <div className="mt-1 divide-y divide-slate-50 max-h-64 overflow-y-auto">
                    {organizations.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => {
                          switchOrganization(org.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-xs sm:text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          currentOrg?.id === org.id
                            ? 'font-bold text-emerald-700 bg-emerald-50/70'
                            : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{org.name}</span>
                        </div>
                        {currentOrg?.id === org.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right section: Super Admin Badge + User Profile + Logout */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Super Admin Switcher Link */}
        {user?.isSuperAdmin && (
          <Link
            to="/admin"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] sm:text-xs font-bold hover:bg-indigo-100 transition-all shadow-2xs"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Super Admin Center</span>
            <span className="sm:hidden">Admin</span>
          </Link>
        )}

        <div className="hidden sm:block h-6 w-px bg-slate-200"></div>

        {/* User Info */}
        <div className="flex items-center space-x-2.5">
          <div className="text-right hidden sm:block">
            <div className="text-xs sm:text-sm font-bold text-slate-900">{user?.name}</div>
            <div className="text-[10px] text-emerald-700 font-semibold capitalize">
              {currentOrg?.role?.replace('_', ' ') || (user?.isSuperAdmin ? 'Super Admin' : 'User')}
            </div>
          </div>

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0F172A] text-emerald-400 flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm ring-2 ring-slate-100 shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Sign Out"
            className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
