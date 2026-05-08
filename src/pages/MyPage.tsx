import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Gavel,
  TrendingUp,
  Heart,
  Package,
  CheckCircle,
  XCircle,
  CreditCard
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { auctionItems } from '../data/mockData';

type MenuSection = 'won' | 'lost' | 'sales' | 'wishlist' | 'registered' | 'password';

export function MyPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<MenuSection>('won');

  const menuItems = [
    { id: 'won' as MenuSection, label: 'Won Auctions', icon: CheckCircle, count: 2 },
    { id: 'lost' as MenuSection, label: 'Lost Auctions', icon: XCircle, count: 1 },
    { id: 'sales' as MenuSection, label: 'My Sales', icon: TrendingUp, count: 0 },
    { id: 'wishlist' as MenuSection, label: 'Wishlist', icon: Heart, count: 3 },
    { id: 'registered' as MenuSection, label: 'Registered Auctions', icon: Package, count: 0 },
    { id: 'password' as MenuSection, label: 'Change Password', icon: Lock, count: null },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
          <p className="text-gray-400">Manage your auctions and account settings</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Menu */}
          <aside className="lg:col-span-1">
            <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-4 sticky top-24">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#1e3a5f]">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">user_demo</div>
                  <div className="text-xs text-gray-400">Member</div>
                </div>
              </div>

              <nav className="space-y-1">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-[#1e3a5f]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.count !== null && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activeSection === item.id ? 'bg-white/20' : 'bg-[#1e3a5f]'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-8 min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Gavel className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No items to show</h3>
                <p className="text-gray-400">This section is currently empty</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Browse Auctions
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}
