import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, User, CheckCircle, Loader2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { BidPanel } from '../components/auction/BidPanel';
import { QaSection } from '../components/auction/QaSection';
import { auctionApi } from '../api/auction';
import type { AuctionDetail, Bid } from '../api/types';
import { useToast } from '../components/common/Toast';
import { formatDate, parseDate, formatTime, getServerNow } from '../utils/format';
import { ErrorPage } from './ErrorPage';
import { getRenderableImageUrl } from '../utils/image';
import { useAuthStore } from '../store/useAuthStore';
import { useAuctionSocket } from '../hooks/useAuctionSocket';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { user, isLoggedIn } = useAuthStore();

  const [bidAmount, setBidAmount] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [flash, setFlash] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const {
    data: item,
    isLoading,
    error: detailError,
  } = useQuery({
    queryKey: ['auction', id],
    queryFn: async () => {
      const res = await auctionApi.getAuctionDetail(id!);
      if (!res.success) {
        throw new Error('Failed to load auction details');
      }
      return res.data;
    },
    enabled: Boolean(id),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['auction-comments', id],
    queryFn: async () => {
      const res = await auctionApi.getComments(id!);
      return res.success ? res.data : [];
    },
    enabled: Boolean(id),
  });

  const isSeller = Boolean(user && item && user.id === item.sellerId);
  const isEnded = item ? parseDate(item.endTime).getTime() <= getServerNow().getTime() : false;
  const isFinished = item?.status === 'FINISHED';

  const handleSocketMessage = useCallback(
    (payload: {
      currentPrice: number;
      bidCount: number;
      bidderNickname: string;
      bidTime: string;
      status: string;
    }) => {
      queryClient.setQueryData<AuctionDetail>(['auction', id], (prev) => {
        if (!prev) return prev;

        const newBid: Bid = {
          bidderNickname: payload.bidderNickname,
          price: payload.currentPrice,
          bidTime: payload.bidTime,
        };

        return {
          ...prev,
          currentPrice: payload.currentPrice,
          bidCount: payload.bidCount,
          status: payload.status as AuctionDetail['status'],
          biddingHistory: [newBid, ...(prev.biddingHistory ?? [])],
        };
      });

      setFlash(true);
      setTimeout(() => setFlash(false), 500);
    },
    [id, queryClient],
  );

  useAuctionSocket(id, isFinished, handleSocketMessage);

  const handlePlaceBid = async () => {
    if (isSeller) {
      showToast('본인 상품에는 입찰할 수 없습니다.', 'error');
      return;
    }

    if (!isLoggedIn) {
      showToast('로그인이 필요합니다.', 'error');
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
      return;
    }

    const amount = parseInt(bidAmount.replace(/,/g, ''));
    if (!item || !amount || amount <= item.currentPrice) {
      showToast('현재 입찰가보다 높은 금액을 입력해야 합니다.', 'error');
      return;
    }

    if (item.status !== 'LIVE' || isEnded) {
      showToast('이미 종료된 경매입니다.', 'error');
      return;
    }

    setIsBidding(true);
    try {
      const res = await auctionApi.placeBid(item.id.toString(), amount);
      if (res.success) {
        const { currentPrice } = res.data;

        queryClient.setQueryData<AuctionDetail>(['auction', id], (prev) => {
          if (!prev) return prev;

          const newBid: Bid = {
            bidderNickname: 'You',
            price: currentPrice,
            bidTime: getServerNow().toISOString(),
          };

          return {
            ...prev,
            currentPrice,
            bidCount: (prev.bidCount ?? 0) + 1,
            biddingHistory: [newBid, ...(prev.biddingHistory ?? [])],
          };
        });

        setBidAmount('');
        setFlash(true);
        showToast('입찰이 성공적으로 완료되었습니다!', 'success');
        setTimeout(() => setFlash(false), 500);
      }
    } catch (err) {
      const error = err as { message?: string };
      showToast(error.message || '입찰에 실패했습니다.', 'error');
    } finally {
      setIsBidding(false);
    }
  };

  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      showToast('로그인이 필요합니다.', 'error');
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
      return;
    }

    if (!item) return;
    try {
      const res = await auctionApi.toggleLike(item.id);
      if (res.success) {
        queryClient.setQueryData<AuctionDetail>(['auction', id], (prev) =>
          prev ? { ...prev, isLiked: res.data.isLiked, likeCount: res.data.likeCount } : prev,
        );
        showToast(res.data.isLiked ? 'Added to watchlist' : 'Removed from watchlist', 'success');
      }
    } catch {
      showToast('Failed to update watchlist', 'error');
    }
  };

  const handleCommentsChange = (updatedComments: typeof comments) => {
    queryClient.setQueryData(['auction-comments', id], updatedComments);
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

  if (detailError || !item) {
    return (
      <ErrorPage
        code="404"
        title="Auction Not Found"
        message="요청하신 경매 상품을 찾을 수 없거나 이미 종료되었습니다."
      />
    );
  }

  const pictures = Array.isArray(item.pictures) ? item.pictures : [];
  const biddingHistory = Array.isArray(item.biddingHistory) ? item.biddingHistory : [];
  const selectedPicture = pictures[selectedImage];
  const sellerJoinedDate = item.sellerJoinedAt ? formatDate(item.sellerJoinedAt) : '-';

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
          <div>
            <div className="aspect-square rounded-lg overflow-hidden bg-[#0d1b2e] border border-[#1e3a5f] mb-4">
              <img
                src={getRenderableImageUrl(selectedPicture?.url, item.mainPictureUrl)}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {pictures.map((pic, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-blue-500' : 'border-[#1e3a5f]'
                  }`}
                >
                  <img
                    src={getRenderableImageUrl(pic.url, item.mainPictureUrl)}
                    alt={`${item.title} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold">{item.sellerNickname}</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-xs text-gray-400">Member since {sellerJoinedDate}</div>
                </div>
              </div>
            </div>
          </div>

          <BidPanel
            item={item}
            biddingHistory={biddingHistory}
            user={user}
            isLoggedIn={isLoggedIn}
            isSeller={isSeller}
            isEnded={isEnded}
            isFinished={isFinished}
            flash={flash}
            bidAmount={bidAmount}
            isBidding={isBidding}
            onBidAmountChange={setBidAmount}
            onPlaceBid={handlePlaceBid}
            onToggleLike={handleToggleLike}
          />
        </div>

        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6 mb-12">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Bidding Activity
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {biddingHistory.slice(0, 5).map((bid, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  index === 0
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-[#1e3a5f]/20 border-[#1e3a5f]/50'
                }`}
              >
                <div className="text-white font-medium mb-1">
                  {isLoggedIn && user?.nickname === bid.bidderNickname ? 'You' : bid.bidderNickname}
                </div>
                <div className="text-blue-400 font-bold text-lg mb-1">₩{bid.price.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{formatTime(bid.bidTime)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6 mb-12">
          <h3 className="text-white font-semibold text-xl mb-4">Product Description</h3>
          <div className="text-gray-300 leading-relaxed space-y-4">
            <p>{item.description}</p>
          </div>
        </div>

        <QaSection
          auctionId={id!}
          comments={comments}
          isLoggedIn={isLoggedIn}
          isSeller={isSeller}
          user={user}
          onCommentsChange={handleCommentsChange}
          showToast={showToast}
        />
      </div>
    </Layout>
  );
}
