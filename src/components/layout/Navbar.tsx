import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Shield, 
  Ticket, 
  BarChart3, 
  LayoutDashboard, 
  CalendarDays,
  Database,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredSupabaseConfig } from '../../lib/supabaseClient';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: { eventId?: string }) => void;
  onOpenDbModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenDbModal }) => {
  const { user, role, logout, switchRole, quickLoginAdmin, quickLoginAttendee } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dbConfig = getStoredSupabaseConfig();

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-purple-100/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand / Logo */}
          <div 
            id="brand-logo"
            onClick={() => handleNav('home')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6D28D9] to-[#A78BFA] flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
              <Calendar className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-gray-900 tracking-tight font-heading flex items-center gap-1.5">
                Nowshera <span className="text-[#6D28D9]">Events Co.</span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                Workshops • Seminars • Conferences
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-home-btn"
              onClick={() => handleNav('home')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors ${
                currentView === 'home'
                  ? 'bg-[#F5F3FF] text-[#6D28D9]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Home
            </button>

            <button
              id="nav-events-btn"
              onClick={() => handleNav('events')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors ${
                currentView === 'events'
                  ? 'bg-[#F5F3FF] text-[#6D28D9]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Upcoming Events
            </button>

            {/* Attendee Links */}
            {user && role === 'ATTENDEE' && (
              <>
                <button
                  id="nav-my-registrations-btn"
                  onClick={() => handleNav('my-registrations')}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                    currentView === 'my-registrations'
                      ? 'bg-[#F5F3FF] text-[#6D28D9]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  My Registrations
                </button>

                <button
                  id="nav-attendee-dash-btn"
                  onClick={() => handleNav('attendee-dashboard')}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors ${
                    currentView === 'attendee-dashboard'
                      ? 'bg-[#F5F3FF] text-[#6D28D9]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </button>
              </>
            )}

            {/* Admin Links */}
            {user && role === 'ADMIN' && (
              <>
                <button
                  id="nav-admin-dash-btn"
                  onClick={() => handleNav('admin-dashboard')}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                    currentView === 'admin-dashboard'
                      ? 'bg-[#F5F3FF] text-[#6D28D9]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[#6D28D9]" />
                  Dashboard
                </button>

                <button
                  id="nav-admin-events-btn"
                  onClick={() => handleNav('admin-events')}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                    currentView === 'admin-events'
                      ? 'bg-[#F5F3FF] text-[#6D28D9]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <CalendarDays className="w-4 h-4 text-[#6D28D9]" />
                  Event Management
                </button>

                <button
                  id="nav-admin-reports-btn"
                  onClick={() => handleNav('admin-reports')}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                    currentView === 'admin-reports'
                      ? 'bg-[#F5F3FF] text-[#6D28D9]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-[#6D28D9]" />
                  Reports
                </button>
              </>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Database pill */}
            <button
              id="top-database-badge-btn"
              onClick={onOpenDbModal}
              title="Click to view Supabase SQL schema or credentials"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-200 bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#6D28D9] text-xs font-semibold transition-all cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{dbConfig.isConfigured ? 'Supabase Live' : 'Supabase (Schema Ready)'}</span>
              <span className={`w-2 h-2 rounded-full ${dbConfig.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-purple-500'}`}></span>
            </button>

            {/* Quick Role Switcher for Hackathon Evaluation */}
            {user && (
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs">
                <button
                  id="quick-role-attendee-btn"
                  onClick={() => switchRole('ATTENDEE')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    role === 'ATTENDEE'
                      ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Attendee
                </button>
                <button
                  id="quick-role-admin-btn"
                  onClick={() => switchRole('ADMIN')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                    role === 'ADMIN'
                      ? 'bg-[#6D28D9] text-white shadow-2xs font-semibold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  Admin
                </button>
              </div>
            )}

            {/* User Profile / Auth Action */}
            {user ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-gray-200 hover:border-purple-200 hover:bg-purple-50/30 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-200 to-indigo-100 text-[#6D28D9] flex items-center justify-center font-bold text-xs uppercase overflow-hidden border border-purple-200">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.full_name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      user.full_name.substring(0, 2)
                    )}
                  </div>
                  <div className="leading-tight">
                    <div className="text-xs font-bold text-gray-800 line-clamp-1 max-w-[120px]">
                      {user.full_name}
                    </div>
                    <div className="text-[10px] text-[#6D28D9] font-semibold tracking-wider uppercase">
                      {role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    id="user-dropdown-panel"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-purple-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <div className="text-xs font-bold text-gray-900">{user.full_name}</div>
                      <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
                      <div className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#6D28D9]">
                        {role === 'ADMIN' ? 'Administrator' : 'Verified Attendee'}
                      </div>
                    </div>

                    <button
                      id="dropdown-switch-admin"
                      onClick={() => {
                        switchRole('ADMIN');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-[#6D28D9] rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#6D28D9]" />
                      Switch to Admin Mode
                    </button>

                    <button
                      id="dropdown-switch-attendee"
                      onClick={() => {
                        switchRole('ATTENDEE');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-[#6D28D9] rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Ticket className="w-3.5 h-3.5 text-purple-600" />
                      Switch to Attendee Mode
                    </button>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      id="dropdown-logout-btn"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-login-btn"
                  onClick={() => handleNav('login')}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-[#6D28D9] transition-colors"
                >
                  Log In
                </button>
                <button
                  id="nav-register-btn"
                  onClick={() => handleNav('register')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] rounded-xl shadow-md transition-all"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              id="mobile-db-modal-btn"
              onClick={onOpenDbModal}
              className="p-2 text-[#6D28D9] bg-[#F5F3FF] rounded-lg text-xs"
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="lg:hidden border-t border-purple-100 bg-white px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-gray-100">
            <button
              onClick={() => handleNav('home')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg text-left ${
                currentView === 'home' ? 'bg-[#F5F3FF] text-[#6D28D9]' : 'text-gray-700'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('events')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg text-left ${
                currentView === 'events' ? 'bg-[#F5F3FF] text-[#6D28D9]' : 'text-gray-700'
              }`}
            >
              Upcoming Events
            </button>
            {user && role === 'ATTENDEE' && (
              <>
                <button
                  onClick={() => handleNav('my-registrations')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg text-left ${
                    currentView === 'my-registrations' ? 'bg-[#F5F3FF] text-[#6D28D9]' : 'text-gray-700'
                  }`}
                >
                  My Registrations
                </button>
                <button
                  onClick={() => handleNav('attendee-dashboard')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg text-left ${
                    currentView === 'attendee-dashboard' ? 'bg-[#F5F3FF] text-[#6D28D9]' : 'text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
              </>
            )}
            {user && role === 'ADMIN' && (
              <>
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg text-left ${
                    currentView === 'admin-dashboard' ? 'bg-[#F5F3FF] text-[#6D28D9]' : 'text-gray-700'
                  }`}
                >
                  Admin Dashboard
                </button>
                <button
                  onClick={() => handleNav('admin-events')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg text-left ${
                    currentView === 'admin-events' ? 'bg-[#F5F3FF] text-[#6D28D9]' : 'text-gray-700'
                  }`}
                >
                  Event Management
                </button>
                <button
                  onClick={() => handleNav('admin-reports')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg text-left ${
                    currentView === 'admin-reports' ? 'bg-[#F5F3FF] text-[#6D28D9]' : 'text-gray-700'
                  }`}
                >
                  Reports
                </button>
              </>
            )}
          </div>

          {/* Quick login / role helpers in mobile */}
          <div className="pt-2">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Quick Role Switch (Demo Mode)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  quickLoginAttendee();
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border ${
                  role === 'ATTENDEE' ? 'bg-[#F5F3FF] border-[#A78BFA] text-[#6D28D9]' : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                Attendee (Irum Naaz)
              </button>
              <button
                onClick={() => {
                  quickLoginAdmin();
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border ${
                  role === 'ADMIN' ? 'bg-[#6D28D9] border-[#6D28D9] text-white' : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                Admin (Tariq Khattak)
              </button>
            </div>
          </div>

          {user ? (
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="text-xs">
                <div className="font-bold text-gray-800">{user.full_name}</div>
                <div className="text-[10px] text-gray-500">{user.email}</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleNav('login')}
                className="w-full py-2 text-center text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl"
              >
                Log In
              </button>
              <button
                onClick={() => handleNav('register')}
                className="w-full py-2 text-center text-xs font-semibold text-white bg-[#6D28D9] rounded-xl"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
