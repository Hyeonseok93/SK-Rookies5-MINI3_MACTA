import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, User, Menu } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-[#0d1b2e] border-b border-[#1e3a5f] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
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
                type="text"
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            <Link
              to="/login"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="text-sm">Login</span>
            </Link>

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
              type="text"
              placeholder="Search auctions..."
              value={searchQuery}
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
            <Link
              to="/login"
              className="block px-4 py-2 text-gray-300 hover:bg-[#1e3a5f]/30 rounded"
              onClick={() => setShowMobileMenu(false)}
            >
              Login
            </Link>
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
