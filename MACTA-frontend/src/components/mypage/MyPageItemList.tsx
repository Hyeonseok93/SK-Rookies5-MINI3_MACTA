import { Clock, Eye, Heart, Loader2, Package, Trash2 } from 'lucide-react';
import type { UserAuctionItem, UserBidItem } from '../../api/types';
import { ErrorState } from '../common/ErrorState';
import { formatDate, formatPrice } from '../../utils/format';
import { getRenderableImageUrl } from '../../utils/image';
import {
  BID_STATUS_FILTERS,
  STATUS_FILTERS,
  TAB_TITLES,
  getStatusBadgeClass,
} from '../../pages/myPageConstants';
import type { MyPageStatusFilter, MyPageTab } from '../../pages/myPageTypes';

type Item = UserAuctionItem | UserBidItem;

function displayStatus(activeTab: MyPageTab, item: Item): string {
  if (
    activeTab === 'bids' &&
    ['WON', 'PAID', 'SHIPPING', 'COMPLETED', 'FINISHED', 'SOLD'].includes(item.status) &&
    (item as UserBidItem).myPrice < item.currentPrice
  ) {
    return 'LOST';
  }
  return item.status;
}

interface MyPageItemListProps {
  activeTab: MyPageTab;
  statusFilter: MyPageStatusFilter;
  items: Item[];
  itemCount: number;
  isLoading: boolean;
  error: Error | null;
  onStatusFilterChange: (status: MyPageStatusFilter) => void;
  onClearWatchlist: () => void;
  onRetry: () => void;
  onItemClick: (auctionId: number) => void;
  onCheckout: (auctionId: number) => void;
  onStartShipping: (e: React.MouseEvent, auctionId: number) => void;
  onCompleteTransaction: (e: React.MouseEvent, auctionId: number) => void;
  onRemoveFromWatchlist: (e: React.MouseEvent, auctionId: number) => void;
}

export function MyPageItemList({
  activeTab,
  statusFilter,
  items,
  itemCount,
  isLoading,
  error,
  onStatusFilterChange,
  onClearWatchlist,
  onRetry,
  onItemClick,
  onCheckout,
  onStartShipping,
  onCompleteTransaction,
  onRemoveFromWatchlist,
}: MyPageItemListProps) {
  const filters = activeTab === 'auctions' ? STATUS_FILTERS : BID_STATUS_FILTERS;

  return (
    <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl overflow-hidden min-h-[500px] mb-6">
      <div className="p-6 border-b border-[#1e3a5f] flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{TAB_TITLES[activeTab]}</h2>
          {(activeTab === 'auctions' || activeTab === 'bids') && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => onStatusFilterChange(filter.value)}
                  className={`h-9 rounded-lg border px-3 text-sm font-semibold transition-colors ${
                    statusFilter === filter.value
                      ? 'border-blue-500 bg-blue-600 text-white'
                      : 'border-[#1e3a5f] bg-[#0a1628] text-gray-400 hover:border-blue-500/60 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">{itemCount} items found</div>
          {activeTab === 'likes' && items.length > 0 && (
            <button
              onClick={onClearWatchlist}
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
        ) : error ? (
          <div className="p-8">
            <ErrorState
              message={error.message || 'Failed to load your items.'}
              onRetry={onRetry}
            />
          </div>
        ) : items.length > 0 ? (
          <div className="divide-y divide-[#1e3a5f]">
            {items.map((item, idx) => {
              const status = displayStatus(activeTab, item);
              const imageUrl = item.previewUrl || item.mainPictureUrl;
              return (
                <div
                  key={`${activeTab}-${item.auctionId}-${idx}`}
                  onClick={() => onItemClick(item.auctionId)}
                  className="p-6 hover:bg-[#1e3a5f]/10 transition-colors cursor-pointer flex items-center gap-6 group"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#0a1628] border border-[#1e3a5f] group-hover:border-blue-500 transition-colors">
                    <img
                      src={getRenderableImageUrl(imageUrl)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt=""
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg mb-1 truncate">{item.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      {item.createdAt && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> {formatDate(item.createdAt)}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        {activeTab === 'likes' ? <Heart className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {activeTab === 'likes' ? `${item.likeCount ?? 0} likes` : `${item.viewCount} views`}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div className="flex items-end gap-6">
                        {activeTab === 'bids' ? (
                          <div className="flex flex-wrap gap-6">
                            <div>
                              <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">My Price</div>
                              <div className="text-xl font-black text-blue-400">
                                &#8361;{formatPrice((item as UserBidItem).myPrice)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Current Price</div>
                              <div className="text-xl font-black text-green-400">
                                &#8361;{formatPrice(item.currentPrice)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Current Price</div>
                            <div className="text-xl font-black text-blue-400">
                              &#8361;{formatPrice(item.currentPrice)}
                            </div>
                          </div>
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(status)}`}
                        >
                          {status}
                        </span>
                      </div>

                      {activeTab === 'bids' &&
                        item.status === 'WON' &&
                        (item as UserBidItem).myPrice === item.currentPrice && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCheckout(item.auctionId);
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg"
                          >
                            결제하기
                          </button>
                        )}

                      {activeTab === 'auctions' && item.status === 'PAID' && (
                        <button
                          onClick={(e) => onStartShipping(e, item.auctionId)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg"
                        >
                          배송 시작
                        </button>
                      )}

                      {activeTab === 'bids' &&
                        item.status === 'SHIPPING' &&
                        (item as UserBidItem).myPrice === item.currentPrice && (
                          <button
                            onClick={(e) => onCompleteTransaction(e, item.auctionId)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg"
                          >
                            수령 확인
                          </button>
                        )}
                    </div>
                  </div>
                  {activeTab === 'likes' && (
                    <button
                      onClick={(e) => onRemoveFromWatchlist(e, item.auctionId)}
                      className="p-3 text-gray-500 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10 flex-shrink-0"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-32 px-4 text-center">
            <Package className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-20" />
            <p className="text-gray-500">No items found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
