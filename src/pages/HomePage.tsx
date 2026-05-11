import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, Plus, Clock, TrendingUp, ChevronDown, ChevronUp, Search, Coins } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { auctionItems } from '../data/mockData';
import { CountdownTimer } from '../components/common/CountdownTimer';

type SortOption = 'newest' | 'closing-soon' | 'price-low' | 'price-high';

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL-based states
  const selectedCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('q') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [now, setNow] = useState(() => Date.now());
  
  // Collapsible states
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
  const [isSortExpanded, setIsSortExpanded] = useState(true);
  const [isPriceExpanded, setIsPriceExpanded] = useState(true);

  // Local input states for price (to avoid immediate URL updates on every keystroke)
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const updateFilters = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const handlePriceApply = () => {
    updateFilters({ minPrice: minPriceInput, maxPrice: maxPriceInput });
  };

  const categories = [
    'All', 
    'Digital Devices', 
    'Home Appliances', 
    'Furniture/Interior', 
    'Clothing', 
    'Beauty/Personal Care', 
    'Sports/Leisure', 
    'Games/Hobbies', 
    'Books/Tickets',
    'Other'
  ];

  const filteredAndSortedItems = auctionItems
    .filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const price = item.currentBid;
      const matchesMinPrice = !minPrice || price >= parseInt(minPrice);
      const matchesMaxPrice = !maxPrice || price <= parseInt(maxPrice);
      
      return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
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
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            {/* Category Filter */}
            <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg overflow-hidden">
              <button 
                onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#1e3a5f]/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-semibold">Categories</h3>
                </div>
                {isCategoryExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {isCategoryExpanded && (
                <div className="px-4 pb-4 space-y-1">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => updateFilters({ category: category === 'All' ? '' : category })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-[#1e3a5f]/30'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Filter */}
            <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg overflow-hidden">
              <button 
                onClick={() => setIsPriceExpanded(!isPriceExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#1e3a5f]/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-semibold">Price Range</h3>
                </div>
                {isPriceExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {isPriceExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Min"
                      value={minPriceInput}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setMinPriceInput(value);
                      }}
                      className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Max"
                      value={maxPriceInput}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setMaxPriceInput(value);
                      }}
                      className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handlePriceApply}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                  >
                    Apply Range
                  </button>
                </div>
              )}
            </div>

            {/* Sort Options */}
            <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg overflow-hidden">
              <button 
                onClick={() => setIsSortExpanded(!isSortExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#1e3a5f]/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-semibold">Sort By</h3>
                </div>
                {isSortExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {isSortExpanded && (
                <div className="px-4 pb-4 space-y-1">
                  {[
                    { id: 'newest', label: 'Newest First' },
                    { id: 'closing-soon', label: 'Closing Soon' },
                    { id: 'price-low', label: 'Price: Low to High' },
                    { id: 'price-high', label: 'Price: High to Low' }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id as SortOption)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === option.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-[#1e3a5f]/30'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
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
                    {auctionItems.filter(item => item.endTime.getTime() - now < 2 * 60 * 60 * 1000).length}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Live Auctions</h1>
                <p className="text-gray-400 text-sm">
                  {filteredAndSortedItems.length} items found
                  {searchQuery && <span> for "{searchQuery}"</span>}
                </p>
              </div>
              
              {/* Mobile View Toggle Buttons could go here */}
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
              <div className="text-center py-24 bg-[#0d1b2e] rounded-xl border border-dashed border-[#1e3a5f]">
                <div className="bg-[#1e3a5f]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 text-lg mb-2">No matching auctions found</p>
                <button 
                  onClick={() => {
                    setMinPriceInput('');
                    setMaxPriceInput('');
                    setSearchParams(new URLSearchParams());
                  }}
                  className="text-blue-400 hover:underline"
                >
                  Clear all filters
                </button>
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
