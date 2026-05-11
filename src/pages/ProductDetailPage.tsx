import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Package, User, MessageCircle, CheckCircle, Shield, Loader2, Heart } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { auctionApi } from '../api/auction';
import type { AuctionDetail, Bid, Comment } from '../api/types';
import { useToast } from '../components/common/Toast';
import { formatPrice, sanitizeNumeric } from '../utils/format';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [item, setItem] = useState<AuctionDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [bidAmount, setBidAmount] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [flash, setFlash] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [detailRes, commentsRes] = await Promise.all([
          auctionApi.getAuctionDetail(id),
          auctionApi.getComments(id)
        ]);

        if (detailRes.success) setItem(detailRes.data);
        if (commentsRes.success) setComments(commentsRes.data);
      } catch {
        setError('Failed to load auction details');
        showToast('Failed to load auction details', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, showToast]);

  const handlePlaceBid = async () => {
    const amount = parseInt(bidAmount.replace(/,/g, ''));
    if (!item || !amount || amount <= item.current_price) {
      showToast('Bid must be higher than current bid', 'error');
      return;
    }

    setIsBidding(true);
    try {
      const res = await auctionApi.placeBid(item.id.toString(), amount);
      if (res.success) {
        const newBid: Bid = {
          id: res.data.bid_id,
          bidder_id: 999,
          bidder_nickname: 'You',
          price: res.data.current_price,
          updated_at: new Date().toISOString()
        };
        setItem(prev => prev ? {
          ...prev,
          current_price: res.data.current_price,
          bid_count: prev.bid_count + 1,
          bids: [newBid, ...prev.bids]
        } : null);
        setBidAmount('');
        setFlash(true);
        showToast('Bid placed successfully!', 'success');
        setTimeout(() => setFlash(false), 500);
      }
    } catch {
      showToast('Failed to place bid', 'error');
    } finally {
      setIsBidding(false);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newQuestion.trim()) return;

    setIsSubmittingQuestion(true);
    try {
      const res = await auctionApi.postComment(id, newQuestion);
      if (res.success) {
        const newComment: Comment = {
          id: res.data.id,
          user_id: 999, // Current user
          nickname: 'You',
          content: newQuestion,
          created_at: new Date().toISOString()
        };
        setComments(prev => [newComment, ...prev]);
        setNewQuestion('');
        showToast('Question submitted!', 'success');
      }
    } catch {
      showToast('Failed to submit question', 'error');
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleToggleLike = async () => {
    if (!item) return;
    try {
      const res = await auctionApi.toggleLike(item.id);
      if (res.success) {
        setItem(prev => prev ? { ...prev, is_liked: res.data.is_liked, like_count: res.data.like_count } : null);
        showToast(res.data.is_liked ? 'Added to watchlist' : 'Removed from watchlist', 'success');
      }
    } catch {
      showToast('Failed to update watchlist', 'error');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32 text-blue-400">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-gray-400">Loading auction details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !item) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-white">
          <p className="text-xl">{error || 'Item not found'}</p>
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
          {/* Left: Images & Seller Info */}
          <div>
            <div className="aspect-square rounded-lg overflow-hidden bg-[#0d1b2e] border border-[#1e3a5f] mb-4">
              <img
                src={item.pictures[selectedImage]?.url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {item.pictures.map((pic, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-blue-500' : 'border-[#1e3a5f]'
                  }`}
                >
                  <img src={pic.url} alt={`${item.title} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Seller Info */}
            <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold">{item.seller_nickname}</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-xs text-gray-400">
                    Member since {new Date(item.seller_joined_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bidding Panel */}
          <div>
            <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6 sticky top-24">
              <div className="flex justify-between items-start mb-2 gap-4">
                <h1 className="text-2xl font-bold text-white leading-tight">{item.title}</h1>
                <button 
                  onClick={handleToggleLike}
                  className={`p-3 rounded-xl transition-all shadow-lg flex-shrink-0 ${
                    item.is_liked 
                      ? 'bg-red-500 text-white' 
                      : 'bg-[#1e3a5f]/50 text-gray-400 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${item.is_liked ? 'fill-current' : ''}`} />
                </button>
              </div>
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
                  <CountdownTimer endTime={new Date(item.end_time)} showSeconds />
                </div>
              </div>

              <div className={`bg-[#1e3a5f]/30 rounded-lg p-6 mb-6 transition-all duration-500 ${flash ? 'ring-4 ring-red-500 bg-red-500/20' : ''}`}>
                <div className="text-sm text-gray-400 mb-2">Current Highest Bid</div>
                <div className="text-4xl font-bold text-blue-400 mb-1">
                  ₩{formatPrice(item.current_price)}
                </div>
                <div className="text-xs text-gray-500">by {item.bids[0]?.bidder_nickname || 'Initial Bid'}</div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Your Bid Amount (KRW)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatPrice(bidAmount)}
                  onChange={(e) => setBidAmount(sanitizeNumeric(e.target.value))}
                  placeholder={`Minimum: ₩${formatPrice(item.current_price + 1000)}`}
                  className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 mb-3"
                />
                <button
                  onClick={handlePlaceBid}
                  disabled={isBidding}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isBidding ? 'Placing Bid...' : 'Place Bid'}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-[#1e3a5f]/20 px-4 py-3 rounded-lg border border-[#1e3a5f]">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Secured by AWS WAF - Network Protection Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Bidders List */}
        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6 mb-12">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Bidding Activity
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {item.bids.slice(0, 5).map((bid, index) => (
              <div
                key={bid.id}
                className={`p-4 rounded-lg border ${
                  index === 0
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-[#1e3a5f]/20 border-[#1e3a5f]/50'
                }`}
              >
                <div className="text-white font-medium mb-1">{bid.bidder_nickname}</div>
                <div className="text-blue-400 font-bold text-lg mb-1">₩{bid.price.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{new Date(bid.updated_at).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Description */}
        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6 mb-12">
          <h3 className="text-white font-semibold text-xl mb-4">Product Description</h3>
          <div className="text-gray-300 leading-relaxed space-y-4">
            <p>{item.description}</p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-[#1e3a5f]/20 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Specifications</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Condition: Brand New</li>
                  <li>• Shipping: Free Standard Shipping</li>
                  <li>• Returns: 14-day return policy</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Q&A Section */}
        <div className="mb-12">
          <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6">
            <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-400" />
              Questions & Answers
            </h3>

            {/* Existing Q&As */}
            <div className="space-y-6 mb-8">
              {comments.map(comment => (
                <div key={comment.id} className="border-b border-[#1e3a5f] pb-6 last:border-0">
                  <div className="mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">Q: {comment.content}</div>
                        <div className="text-gray-400 text-sm">
                          Asked by {comment.nickname} • {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-gray-500 text-center py-8">No questions asked yet.</p>
              )}
            </div>

            {/* Ask Question Form */}
            <form onSubmit={handleSubmitQuestion} className="bg-[#1e3a5f]/20 p-6 rounded-lg border border-[#1e3a5f]/50">
              <label className="block text-white font-medium mb-3">Ask a Question</label>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your question here..."
                rows={4}
                className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 mb-3"
              ></textarea>
              <button
                type="submit"
                disabled={isSubmittingQuestion}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {isSubmittingQuestion ? 'Submitting...' : 'Submit Question'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
