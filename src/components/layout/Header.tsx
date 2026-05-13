import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Search, Bell, User, Menu, Clock, ExternalLink, LogOut } from 'lucide-react';
import { auctionApi } from '../../api/auction';
import type { Notification } from '../../api/types';
import { AUTH_STATE_CHANGED_EVENT, logout } from '../../api/auth';
import { getAccessTokenCookie } from '../../api/tokenCookie';
import { useToast } from '../common/Toast';

const isAuthenticated = () => Boolean(getAccessTokenCookie() && localStorage.getItem('macta_user'));

export function Header() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const initializeNotifications = async () => {
      if (!isLoggedIn) {
        setNotifications([]);
        setShowNotifications(false);
        return;
      }

      const res = await auctionApi.getNotifications();
      if (res.success) {
        const data = res.data as unknown;
        const notificationList = Array.isArray(data) 
          ? data 
          : (data as { content?: Notification[] })?.content || [];
        setNotifications(notificationList as Notification[]);
      }
    };

    initializeNotifications();
  }, [isLoggedIn]);

  useEffect(() => {
    const handleAuthStateChanged = () => {
      setIsLoggedIn(isAuthenticated());
    };

    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
    window.addEventListener('storage', handleAuthStateChanged);

    return () => {
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
      window.removeEventListener('storage', handleAuthStateChanged);
    };
  }, []);

  // Sync internal input state with URL changes (e.g., when clearing filters on HomePage)
  const urlQuery = searchParams.get('q') || '';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/');
    }
  };

  const markAsRead = async (id: number) => {
    const res = await auctionApi.markNotificationAsRead(id);
    if (res.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleNavigate = (e: React.MouseEvent, targetUrl: string, id: number) => {
    e.stopPropagation();
    markAsRead(id);
    setShowNotifications(false);
    navigate(targetUrl);
  };

  const handleLogout = () => {
    logout();
    showToast('로그아웃 되었습니다.', 'success');
    setShowMobileMenu(false);
    navigate('/');
  };

  return (
    <header className="bg-[#0d1b2e] border-b border-[#1e3a5f] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 flex-shrink-0 group">
            <img src="/icons.png" alt="MACTA Logo" className="w-10 h-10 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300" />
            <div className="flex flex-col">
              <div className="text-2xl font-black text-white tracking-tighter leading-none flex items-baseline gap-0.5">
                MACTA
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
              </div>
              <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-300"></div>
            </div>
          </Link>

          {/* Center Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                key={urlQuery}
                type="text"
                placeholder="Search auctions..."
                defaultValue={urlQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {isLoggedIn && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg ${showNotifications ? 'bg-[#1e3a5f]/50 text-white' : ''}`}
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0d1b2e]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#0d1b2e] border border-[#1e3a5f] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-[#1e3a5f] flex justify-between items-center bg-[#0a1628]/50">
                      <h3 className="text-white font-semibold">Notifications</h3>
                      <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase">Live</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="divide-y border-[#1e3a5f]">
                          {notifications.slice(0, 5).map((n) => (
                            <div 
                              key={n.id} 
                              className={`p-4 hover:bg-[#1e3a5f]/20 transition-colors cursor-pointer group flex items-start gap-3 ${!n.isRead ? 'bg-blue-600/5' : ''}`}
                              onClick={() => markAsRead(n.id)}
                            >
                              <div className={`mt-1 p-2 rounded-lg flex-shrink-0 ${!n.isRead ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                                <Bell className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-snug mb-1 ${!n.isRead ? 'text-white font-medium' : 'text-gray-400'}`}>
                                  {n.content}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              <button
                                onClick={(e) => handleNavigate(e, n.targetUrl, n.id)}
                                className="mt-1 p-1.5 rounded-md hover:bg-blue-600 hover:text-white text-gray-500 transition-all"
                                title="Go to Auction"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 px-4 text-center">
                          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-20" />
                          <p className="text-gray-500 text-sm">No new notifications</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <Link 
                        to="/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="block w-full py-3 bg-[#0a1628]/50 text-gray-400 hover:text-white text-xs font-medium border-t border-[#1e3a5f] transition-colors text-center"
                      >
                        View All Notifications
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Login</span>
              </Link>
            )}

            <Link
              to="/my-page"
              className="hidden sm:block px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2e4a6f] transition-colors text-sm font-medium"
            >
              My Page
            </Link>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              key={urlQuery}
              type="text"
              placeholder="Search auctions..."
              defaultValue={urlQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-[#1e3a5f] bg-[#0d1b2e]">
          <nav className="px-4 py-3 space-y-2">
            {isLoggedIn ? (
              <button
                type="button"
                className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-[#1e3a5f]/30 rounded"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="block px-4 py-2 text-gray-300 hover:bg-[#1e3a5f]/30 rounded"
                onClick={() => setShowMobileMenu(false)}
              >
                Login
              </Link>
            )}
            <Link
              to="/my-page"
              className="block px-4 py-2 text-gray-300 hover:bg-[#1e3a5f]/30 rounded"
              onClick={() => setShowMobileMenu(false)}
            >
              My Page
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
