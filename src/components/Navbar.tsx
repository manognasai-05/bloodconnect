import React, { useState } from 'react';
import { Heart, Bell, Menu, X, User, LogOut, Shield, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { NotificationDropdown } from './NotificationDropdown.js';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenCompatibility: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenCompatibility }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getDashboardTarget = () => {
    if (!user) return 'login';
    if (user.role === 'admin') return 'admin-dashboard';
    if (user.role === 'donor') return 'donor-dashboard';
    return 'requester-dashboard';
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'donors', label: 'Find Donors' },
    { id: 'requests', label: 'Blood Requests' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand Wordmark Element */}
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 text-slate-900 font-extrabold text-xl tracking-tight whitespace-nowrap shrink-0 group text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs group-hover:bg-red-700 transition-colors">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <span>BloodConnect</span>
          </button>

          {/* Zone 2: 4-5 Clean Single-Line Text Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
                    isActive ? 'text-red-600 font-semibold' : 'hover:text-slate-950'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Quick blood compatibility guide modal trigger */}
            <button
              onClick={onOpenCompatibility}
              className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 py-1"
            >
              <Activity className="w-3.5 h-3.5 text-red-500" />
              <span>Compatibility Guide</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & User Zone */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 border-2 border-white rounded-full" />
                    )}
                  </button>
                  <NotificationDropdown
                    isOpen={notificationsOpen}
                    onClose={() => setNotificationsOpen(false)}
                    onNavigate={(p) => onNavigate(p)}
                  />
                </div>

                {/* Dashboard CTA */}
                <button
                  onClick={() => onNavigate(getDashboardTarget())}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
                >
                  {user.role === 'admin' ? (
                    <>
                      <Shield className="w-3.5 h-3.5" />
                      Admin Console
                    </>
                  ) : (
                    <>
                      <Activity className="w-3.5 h-3.5" />
                      Dashboard
                    </>
                  )}
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 uppercase text-[10px] tracking-wider font-bold text-red-600">
                          {user.role}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onNavigate(getDashboardTarget());
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Activity className="w-4 h-4 text-slate-400" />
                        My Dashboard
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        User Profile & QR
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('history');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Heart className="w-4 h-4 text-slate-400" />
                        Donation History
                      </button>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          onNavigate('home');
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
                >
                  Become a Donor
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-lg ${
                currentPage === link.id
                  ? 'bg-red-50 text-red-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => {
              onOpenCompatibility();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-red-500" />
            Compatibility Guide
          </button>
          {user && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <button
                onClick={() => {
                  onNavigate(getDashboardTarget());
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  onNavigate('profile');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Profile & QR ID Card
              </button>
              <button
                onClick={() => {
                  onNavigate('history');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Donation History
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  onNavigate('home');
                }}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
