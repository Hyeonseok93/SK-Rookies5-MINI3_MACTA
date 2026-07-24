import { Clock, Heart, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CountdownTimer } from '../common/CountdownTimer';
import type { AuctionDetail, Bid } from '../../api/types';
import { formatPrice, sanitizeNumeric, parseDate } from '../../utils/format';
import { formatCategoryDisplay } from '../../utils/category';

interface BidPanelProps {
  item: AuctionDetail;
  biddingHistory: Bid[];
  user: { id: number | string; nickname: string } | null;
  isLoggedIn: boolean;
  isSeller: boolean;
  isEnded: boolean;
  isFinished: boolean;
  flash: boolean;
  bidAmount: string;
  isBidding: boolean;
  onBidAmountChange: (value: string) => void;
  onPlaceBid: () => void;
  onToggleLike: () => void;
}

export function BidPanel({
  item,
  biddingHistory,
  user,
  isLoggedIn,
  isSeller,
  isEnded,
  isFinished,
  flash,
  bidAmount,
  isBidding,
  onBidAmountChange,
  onPlaceBid,
  onToggleLike,
}: BidPanelProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6 sticky top-24">
      <div className="flex justify-between items-start mb-2 gap-4">
        <h1 className="text-2xl font-bold text-white leading-tight">{item.title}</h1>
        {(!isLoggedIn || !isSeller) && (
          <button
            onClick={onToggleLike}
            className={`p-3 rounded-xl transition-all shadow-lg flex-shrink-0 ${
              item.isLiked
                ? 'bg-red-500 text-white'
                : 'bg-[#1e3a5f]/50 text-gray-400 hover:text-red-400'
            }`}
          >
            <Heart className={`w-6 h-6 ${item.isLiked ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 mb-6">
        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm">
          {formatCategoryDisplay(item.category)}
        </span>
      </div>

      {isFinished ? (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-6 text-center">
          <div className="text-white text-sm font-bold uppercase tracking-wider mb-2">Auction Ended</div>
          {item.winnerNickname ? (
            <>
              <div className="text-3xl font-black text-white mb-1">Winner: {item.winnerNickname}</div>
              <div className="text-blue-200 text-sm mb-4">Final Price: ₩{formatPrice(item.currentPrice)}</div>
              {user && item.winnerId === user.id && (
                <button
                  onClick={() => navigate(`/checkout/${item.id}`)}
                  className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
                >
                  축하합니다! 지금 바로 결제하세요
                </button>
              )}
            </>
          ) : (
            <div className="text-2xl font-bold text-white">No winning bids</div>
          )}
        </div>
      ) : (
        <div className={`bg-gradient-to-r ${isEnded ? 'from-gray-600 to-gray-700' : 'from-red-600 to-red-700'} rounded-lg p-6 mb-6`}>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-white" />
            <span className="text-white text-sm font-medium">
              {isEnded ? 'Auction Ended' : 'Time Remaining'}
            </span>
          </div>
          <div className="text-4xl font-bold text-white">
            <CountdownTimer endTime={parseDate(item.endTime)} showSeconds />
          </div>
        </div>
      )}

      <div className={`bg-[#1e3a5f]/30 rounded-lg p-6 mb-6 transition-all duration-500 ${flash ? 'ring-4 ring-red-500 bg-red-500/20' : ''}`}>
        <div className="text-sm text-gray-400 mb-2">
          {isFinished ? 'Final Price' : 'Current Highest Bid'}
        </div>
        <div className="text-4xl font-bold text-blue-400 mb-1">
          ₩{formatPrice(item.currentPrice)}
        </div>
        <div className="text-xs text-gray-500">
          {biddingHistory.length > 0
            ? `by ${isLoggedIn && user?.nickname === biddingHistory[0].bidderNickname ? 'You' : biddingHistory[0].bidderNickname}`
            : 'Initial Bid'}
        </div>
      </div>

      {!isFinished && !isEnded && (
        isSeller ? (
          <div className="mb-6 bg-blue-600/10 p-4 rounded-lg border border-blue-500/30 text-center">
            <p className="text-blue-400 text-sm">본인 상품에는 입찰할 수 없습니다</p>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Your Bid Amount (KRW)</label>
            <input
              type="text"
              inputMode="numeric"
              value={formatPrice(bidAmount)}
              onChange={(e) => onBidAmountChange(sanitizeNumeric(e.target.value))}
              placeholder={`Minimum: ₩${formatPrice(item.currentPrice + 1000)}`}
              className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 mb-3"
            />
            <button
              onClick={onPlaceBid}
              disabled={isBidding}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/10 disabled:opacity-50"
            >
              {isBidding ? 'Placing Bid...' : 'Place Bid'}
            </button>
          </div>
        )
      )}

      {isEnded && !isFinished && (
        <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-center mb-6">
          <p className="text-gray-400 text-sm">Processing final results...</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-[#1e3a5f]/20 px-4 py-3 rounded-lg border border-[#1e3a5f]">
        <Shield className="w-4 h-4 text-green-400" />
        <span>Secured by AWS WAF - Network Protection Active</span>
      </div>
    </div>
  );
}
