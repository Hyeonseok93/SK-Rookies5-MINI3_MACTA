import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, TrendingUp, Heart, ShoppingBag, 
  Settings, ChevronRight, Clock, Eye, Loader2, Trash2 
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { auctionApi } from '../api/auction';
import type { UserDashboardStats } from '../api/types';
import { formatPrice } from '../utils/format';
import { useToast } from '../components/common/Toast';

type MyPageTab = 'auctions' | 'bids' | 'likes';

interface StoredUser {
  nickname?: string;
  role?: string;
}

export function MyPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<MyPageTab>('auctions');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const user = useMemo<StoredUser | null>(() => {
    const storedUser = localStorage.getItem('macta_user');
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser) as StoredUser;
    } catch {
      return null;
    }
  }, []);

  const fetchStats = useCallback(() => {
    auctionApi.getUserStats().then(res => {
      if (res.success) setStats(res.data);
    });
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const fetchTabContent = useCallback(async () => {
    setIsLoading(true);
    let res;
    if (activeTab === 'auctions') res = await auctionApi.getMyAuctions();
    else if (activeTab === 'bids') res = await auctionApi.getMyBids();
    else res = await auctionApi.getMyWatchlist();

    if (res.success) setItems(res.data);
    setIsLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchTabContent();
  }, [fetchTabContent]);

  const handleRemoveFromWatchlist = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      const res = await auctionApi.toggleLike(id);
      if (res.success) {
        setItems(prev => prev.filter(item => item.auction_id !== id));
        fetchStats();
        showToast('Removed from watchlist', 'info');
      }
    } catch {
      showToast('Failed to update watchlist', 'error');
    }
  };

  const handleClearWatchlist = async () => {
    try {
      await Promise.all(items.map(item => auctionApi.toggleLike(item.auction_id)));
      setItems([]);
      fetchStats();
      showToast('Watchlist cleared', 'success');
    } catch {
      showToast('Failed to clear watchlist', 'error');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{user?.nickname || 'User'}!</h1>
              <p className="text-gray-400 font-medium">{user?.role || 'Active Member'}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                <button
                  className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#2e4a6f] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Edit Profile
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
              {[
                { label: 'Bidding', value: stats?.bidding_count, icon: TrendingUp, color: 'text-blue-400' },
                { label: 'Won', value: stats?.won_count, icon: ShoppingBag, color: 'text-green-400' },
                { label: 'Hosted', value: stats?.hosted_count, icon: Package, color: 'text-purple-400' },
                { label: 'Likes', value: stats?.watchlist_count, icon: Heart, color: 'text-red-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-[#0a1628] border border-[#1e3a5f] rounded-xl p-4 text-center min-w-[100px]">
                  <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-xl font-bold text-white">{stat.value ?? '...'}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {[
                { id: 'auctions', label: 'My Auctions', icon: Package },
                { id: 'bids', label: 'Bidding History', icon: TrendingUp },
                { id: 'likes', label: 'Watchlist', icon: Heart },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as MyPageTab)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-gray-400 hover:bg-[#1e3a5f]/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === tab.id ? 'translate-x-1' : ''}`} />
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl overflow-hidden min-h-[500px]">
              <div className="p-6 border-b border-[#1e3a5f] flex justify-between items-center">
                <h2 className="text-xl font-bold text-white capitalize">{activeTab === 'likes' ? 'Watchlist' : activeTab}</h2>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">{items.length} items found</div>
                  {activeTab === 'likes' && items.length > 0 && (
                    <button
                      onClick={handleClearWatchlist}
                      className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2 font-bold uppercase tracking-wider"
                    >
                      <Trash2 className="w-4 h-4" /> Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="p-0">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 text-blue-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="text-gray-500">Loading details...</p>
                  </div>
                ) : items.length > 0 ? (
                  <div className="divide-y divide-[#1e3a5f]">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate(`/product/${item.auction_id}`)}
                        className="p-6 hover:bg-[#1e3a5f]/10 transition-colors cursor-pointer flex items-center gap-6 group"
                      >
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#0a1628] border border-[#1e3a5f] group-hover:border-blue-500 transition-colors">
                          <img src={item.preview_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-lg mb-1 truncate">{item.title}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(item.created_at).toLocaleDateString()}</div>
                            <div className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {item.view_count} views</div>
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                                {activeTab === 'bids' ? 'Your Bid' : 'Current Price'}
                              </div>
                              <div className="text-xl font-black text-blue-400">
                                ₩{formatPrice(activeTab === 'bids' ? item.my_bid_price : item.current_price)}
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.status === 'LIVE' ? 'bg-green-600/20 text-green-400' : 'bg-gray-700 text-gray-400'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                        {activeTab === 'likes' && (
                          <button
                            onClick={(e) => handleRemoveFromWatchlist(e, item.auction_id)}
                            className="p-3 text-gray-500 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10 flex-shrink-0"        
                            title="Remove from Watchlist"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-32 px-4 text-center">
                    <Package className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-20" />
                    <p className="text-gray-500">No items found in this category.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
