import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, Plus, Clock, TrendingUp } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { auctionItems } from '../data/mockData';
import { CountdownTimer } from '../components/common/CountdownTimer';

type SortOption = 'newest' | 'closing-soon' | 'price-low' | 'price-high';

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const categories = ['All', 'Electronics', 'Fashion', 'Collectibles'];

  const filteredAndSortedItems = auctionItems
    .filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'closing-soon':
          return a.endTime.getTime() - b.endTime.getTime();
        case 'price-low':
          return a.currentBid - b.currentBid;
        case 'price-high':
          return b.currentBid - a.currentBid;
        case 'newest':
        default:
          return 0;
      }
    });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Category Filter */}
              <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-semibold">Categories</h3>
                </div>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-[#1e3a5f]/30'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-semibold">Sort By</h3>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setSortBy('newest')}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === 'newest'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-[#1e3a5f]/30'
                    }`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => setSortBy('closing-soon')}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === 'closing-soon'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-[#1e3a5f]/30'
                    }`}
                  >
                    Closing Soon
                  </button>
                  <button
                    onClick={() => setSortBy('price-low')}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === 'price-low'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-[#1e3a5f]/30'
                    }`}
                  >
                    Price: Low to High
                  </button>
                  <button
                    onClick={() => setSortBy('price-high')}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === 'price-high'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-[#1e3a5f]/30'
                    }`}
                  >
                    Price: High to Low
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Active Auctions</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total</span>
                    <span className="text-white font-bold">{auctionItems.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Ending Soon</span>
                    <span className="text-red-400 font-bold">
                      {auctionItems.filter(item => item.endTime.getTime() - Date.now() < 2 * 60 * 60 * 1000).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters */}
            <div className="lg:hidden mb-6 flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-4 py-2 bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg text-white text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="flex-1 px-4 py-2 bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg text-white text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="closing-soon">Closing Soon</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Results Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Live Auctions</h1>
              <p className="text-gray-400 text-sm">
                {filteredAndSortedItems.length} items available
              </p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/product/${item.id}`)}
                  className="bg-[#0d1b2e] rounded-lg overflow-hidden border border-[#1e3a5f] hover:border-blue-500 transition-all cursor-pointer group"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#1e3a5f]/20">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-lg">
                      <Clock className="w-4 h-4" />
                      <CountdownTimer endTime={item.endTime} />
                    </div>
                    <div className="absolute top-3 left-3 bg-blue-600/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {item.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-white font-semibold mb-3 line-clamp-2 min-h-[3rem]">{item.title}</h3>
                    <div className="mb-2">
                      <span className="text-xs text-gray-400">Current Bid</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold text-blue-400">
                        ₩{item.currentBid.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.bids.length} bids
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredAndSortedItems.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">No auction items found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Register Auction Button */}
      <button
        onClick={() => navigate('/register-auction')}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-full shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-3 group z-40"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
        <span className="font-semibold">Register Auction</span>
      </button>
    </Layout>
  );
}
