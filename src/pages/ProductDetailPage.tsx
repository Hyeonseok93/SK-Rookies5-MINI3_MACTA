import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, Clock, Package } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { auctionItems } from '../data/mockData';
import type { Bid } from '../data/mockData';

import { CountdownTimer } from '../components/common/CountdownTimer';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = auctionItems.find(i => i.id === id);

  const [bidAmount, setBidAmount] = useState('');
  const [currentBids, setCurrentBids] = useState<Bid[]>(item?.bids || []);
  const [flash, setFlash] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const images = item ? [item.imageUrl, item.imageUrl, item.imageUrl] : [];

  useEffect(() => {
    if (!item) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newBid: Bid = {
          id: `b${Date.now()}`,
          bidder: `user_${Math.floor(Math.random() * 9000) + 1000}`,
          amount: (currentBids[0]?.amount || item.currentBid) + Math.floor(Math.random() * 20000) + 5000,
          timestamp: new Date(),
        };
        setCurrentBids(prev => [newBid, ...prev.slice(0, 4)]);
        setFlash(true);
        setTimeout(() => setFlash(false), 500);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [item, currentBids]);

  const handlePlaceBid = () => {
    const amount = parseInt(bidAmount);
    if (!item || !amount || amount <= (currentBids[0]?.amount || item.currentBid)) {
      alert('Bid must be higher than current bid');
      return;
    }

    const newBid: Bid = {
      id: `b${Date.now()}`,
      bidder: 'You',
      amount: amount,
      timestamp: new Date(),
    };

    setCurrentBids(prev => [newBid, ...prev.slice(0, 4)]);
    setBidAmount('');
    setFlash(true);
    setTimeout(() => setFlash(false), 500);
  };

  if (!item) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-white">
          <p className="text-xl">Item not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Auctions</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Images */}
          <div>
            <div className="aspect-square rounded-lg overflow-hidden bg-[#0d1b2e] border border-[#1e3a5f] mb-4">
              <img
                src={images[selectedImage]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-blue-500' : 'border-[#1e3a5f]'
                  }`}
                >
                  <img src={img} alt={`${item.title} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Bidding Panel */}
          <div>
            <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6 sticky top-24">
              <h1 className="text-2xl font-bold text-white mb-2">{item.title}</h1>
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm">{item.category}</span>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Package className="w-4 h-4" />
                  <span>Free Shipping</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-white" />
                  <span className="text-white text-sm font-medium">Time Remaining</span>
                </div>
                <div className="text-4xl font-bold text-white">
                  <CountdownTimer endTime={item.endTime} showSeconds />
                </div>
              </div>

              <div className={`bg-[#1e3a5f]/30 rounded-lg p-6 mb-6 transition-all duration-500 ${flash ? 'ring-4 ring-red-500 bg-red-500/20' : ''}`}>
                <div className="text-sm text-gray-400 mb-2">Current Highest Bid</div>
                <div className="text-4xl font-bold text-blue-400 mb-1">
                  ₩{(currentBids[0]?.amount || item.currentBid).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">by {currentBids[0]?.bidder || 'Initial Bid'}</div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Your Bid Amount (KRW)</label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Minimum: ₩${((currentBids[0]?.amount || item.currentBid) + 1000).toLocaleString()}`}
                  className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 mb-3"
                />
                <button
                  onClick={handlePlaceBid}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20"
                >
                  Place Bid
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-[#1e3a5f]/20 px-4 py-3 rounded-lg border border-[#1e3a5f]">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Secured by AWS WAF Protection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bidding Activity */}
        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6 mb-12">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Bidding Activity
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {currentBids.slice(0, 5).map((bid, index) => (
              <div
                key={bid.id}
                className={`p-4 rounded-lg border ${
                  index === 0
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-[#1e3a5f]/20 border-[#1e3a5f]/50'
                }`}
              >
                <div className="text-white font-medium mb-1">{bid.bidder}</div>
                <div className="text-blue-400 font-bold text-lg mb-1">₩{bid.amount.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{bid.timestamp.toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Button */}
        <button
          onClick={() => navigate(`/checkout/${item.id}`)}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Simulate Win & Go to Checkout
        </button>
      </div>
    </Layout>
  );
}
