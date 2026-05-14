import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, TrendingUp, Heart, ShoppingBag, 
  Settings, ChevronRight, Clock, Eye, Loader2, Trash2, X, Save, Mail, UserRound, KeyRound, Lock
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { auctionApi } from '../api/auction';
import { userApi } from '../api/user';
import type { UserSummaryResponse, UserAuctionItem, UserBidItem, UserInfoResponse, PageInfo } from '../api/types';
import { ErrorState } from '../components/common/ErrorState';
import { formatPrice, formatDate } from '../utils/format';
import { useToast } from '../components/common/Toast';
import { AUTH_STATE_CHANGED_EVENT } from '../api/auth';
import { Pagination } from '../components/common/Pagination';
import { getRenderableImageUrl } from '../utils/image';

type MyPageTab = 'auctions' | 'bids' | 'likes';
type MyPageStatusFilter = 'ALL' | 'LIVE' | 'FINISHED' | 'PAID' | 'SHIPPING' | 'COMPLETED' | 'WON' | 'OUTBID';

interface StoredUser {
  id?: number | string;
  email?: string;
  nickname?: string;
  role?: string;
}

interface ApiErrorBody {
  message?: string;
  error?: {
    message?: string;
  };
}

const STATUS_FILTERS: { value: MyPageStatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'LIVE', label: 'Live' },
  { value: 'FINISHED', label: 'Finished' },
  { value: 'PAID', label: 'Paid' },
  { value: 'SHIPPING', label: 'Shipping' },
  { value: 'COMPLETED', label: 'Completed' },
];

const BID_STATUS_FILTERS: { value: MyPageStatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'LIVE', label: 'Live' },
  { value: 'FINISHED', label: 'Finished' },
  { value: 'WON', label: 'Won' },
  { value: 'OUTBID', label: 'Outbid' },
];

const TAB_TITLES: Record<MyPageTab, string> = {
  auctions: 'My Auctions',
  bids: 'Bidding History',
  likes: 'Watchlist',
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'LIVE':
      return 'bg-green-600/20 text-green-400';
    case 'OUTBID':
      return 'bg-amber-500/20 text-amber-300';
    case 'WON':
      return 'bg-blue-600/20 text-blue-300';
    case 'SOLD':
      return 'bg-purple-600/20 text-purple-300';
    case 'FINISHED':
      return 'bg-blue-600/20 text-blue-300';
    case 'PAID':
      return 'bg-cyan-600/20 text-cyan-300';
    case 'SHIPPING':
      return 'bg-indigo-600/20 text-indigo-300';
    case 'COMPLETED':
      return 'bg-emerald-600/20 text-emerald-300';
    default:
      return 'bg-gray-700 text-gray-400';
  }
};

const getStoredUser = (): StoredUser | null => {
  const storedUser = localStorage.getItem('macta_user');
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as StoredUser;
  } catch {
    return null;
  }
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as {
    response?: {
      data?: ApiErrorBody;
    };
    message?: string;
  };

  return apiError.response?.data?.message
    || apiError.response?.data?.error?.message
    || apiError.message
    || fallback;
};

export function MyPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [stats, setStats] = useState<UserSummaryResponse | null>(null);
  const [activeTab, setActiveTab] = useState<MyPageTab>('auctions');
  const [items, setItems] = useState<(UserAuctionItem | UserBidItem)[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<MyPageStatusFilter>('ALL');
  const PAGE_SIZE = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());
  const [profile, setProfile] = useState<UserInfoResponse | null>(null);
  const [nickname, setNickname] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const fetchStats = useCallback(() => {
    userApi.getUserSummary().then(res => {
      if (res.success) setStats(res.data);
    });
  }, []);

  useEffect(() => {
    let ignore = false;
    userApi.getUserSummary().then(res => {
      if (!ignore && res.success) setStats(res.data);
    });
    return () => { ignore = true; };
  }, [refreshKey]);

  useEffect(() => {
    let ignore = false;
    const fetchTabContent = async () => {
      await Promise.resolve();
      setIsLoading(true);
      setError(null);
      try {
        let res;
        const params = {
          page: currentPage,
          size: PAGE_SIZE,
          ...((activeTab === 'auctions' || activeTab === 'bids') && statusFilter !== 'ALL' ? { status: statusFilter } : {}),
        };
        if (activeTab === 'auctions') res = await userApi.getMyAuctions(params);
        else if (activeTab === 'bids') res = await userApi.getMyBids(params);
        else res = await userApi.getMyWatchlist(params);

        if (!ignore && res.success) {
          setItems(res.data.content);
          setPageInfo(res.data.pageInfo);
        }
      } catch {
        if (!ignore) setError('Failed to load your items.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchTabContent();
    }, 0);
    return () => { 
      ignore = true; 
      clearTimeout(timer);
    };
  }, [activeTab, currentPage, statusFilter, refreshKey]);

  const handleTabChange = (tab: MyPageTab) => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  const handleStatusFilterChange = (status: MyPageStatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(0);
  };

  const handleOpenProfile = async () => {
    setIsProfileOpen(true);
    setProfileError('');
    setIsProfileLoading(true);

    try {
      const res = await userApi.getUserInfo();
      if (res.success) {
        setProfile(res.data);
        setNickname(res.data.nickname);
      }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to load profile.');
      setProfileError(message);
      showToast(message, 'error');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleCloseProfile = () => {
    if (isSavingProfile) return;
    setIsProfileOpen(false);
    setProfileError('');
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextNickname = nickname.trim();

    if (!nextNickname) {
      setProfileError('Please enter a nickname.');
      return;
    }

    setProfileError('');
    setIsSavingProfile(true);

    try {
      const res = await userApi.updateUserInfo({ nickname: nextNickname });
      if (res.success) {
        const nextUser = {
          ...getStoredUser(),
          id: profile?.id,
          email: profile?.email,
          nickname: nextNickname,
        };

        localStorage.setItem('macta_user', JSON.stringify(nextUser));
        window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
        setUser(nextUser);
        setProfile(prev => prev ? { ...prev, nickname: nextNickname } : prev);
        setIsProfileOpen(false);
        showToast(res.message || 'Profile updated.', 'success');
      }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to update profile.');
      setProfileError(message);
      showToast(message, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleOpenPassword = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsPasswordOpen(true);
  };

  const handleClosePassword = () => {
    if (isChangingPassword) return;
    setIsPasswordOpen(false);
  };

  const handlePasswordChange = (field: keyof typeof passwordForm, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);

    try {
      const res = await userApi.updatePassword(passwordForm);
      if (res.success) {
        setIsPasswordOpen(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        showToast(res.message || 'Password changed.', 'success');
      }
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to change password.'), 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRemoveFromWatchlist = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      const res = await auctionApi.toggleLike(id);
      if (res.success) {
        setItems(prev => prev.filter(item => item.auctionId !== id));
        fetchStats();
        showToast('Removed from watchlist', 'info');
      }
    } catch {
      showToast('Failed to update watchlist', 'error');
    }
  };

  const handleClearWatchlist = async () => {
    try {
      await Promise.all(items.map(item => auctionApi.toggleLike(item.auctionId)));
      setItems([]);
      fetchStats();
      showToast('Watchlist cleared', 'success');
    } catch {
      showToast('Failed to clear watchlist', 'error');
    }
  };

  const handleStartShipping = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('배송을 시작하시겠습니까?')) return;
    
    try {
      const res = await auctionApi.startShipping(id.toString());
      if (res.success) {
        showToast('배송이 시작되었습니다.', 'success');
        triggerRefresh();
        fetchStats();
      }
    } catch (error) {
      showToast(getApiErrorMessage(error, '배송 시작에 실패했습니다.'), 'error');
    }
  };

  const handleCompleteTransaction = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('물품을 수령하셨습니까? 거래를 확정합니다.')) return;

    try {
      const res = await auctionApi.completeTransaction(id.toString());
      if (res.success) {
        showToast('거래가 확정되었습니다.', 'success');
        triggerRefresh();
        fetchStats();
      }
    } catch (error) {
      showToast(getApiErrorMessage(error, '거래 확정에 실패했습니다.'), 'error');
    }
  };

  const itemCount = pageInfo?.totalElements ?? items.length;
  const totalPages = pageInfo?.totalPages ?? 1;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{user?.nickname || 'User'}</h1>
              <p className="text-gray-400 font-medium">{user?.role || 'Active Member'}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleOpenProfile}
                  className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#2e4a6f] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Edit Profile
                </button>
                <button
                  type="button"
                  onClick={handleOpenPassword}
                  className="px-4 py-2 bg-[#0a1628] hover:bg-[#1e3a5f] border border-[#1e3a5f] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4" /> Change Password
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
              {[
                { label: 'Bidding', value: stats?.biddingCount, icon: TrendingUp, color: 'text-blue-400' },
                { label: 'Won', value: stats?.wonCount, icon: ShoppingBag, color: 'text-green-400' },
                { label: 'Hosted', value: stats?.hostedCount, icon: Package, color: 'text-purple-400' },
                { label: 'Likes', value: stats?.watchlistCount, icon: Heart, color: 'text-red-400' },
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
                  onClick={() => handleTabChange(tab.id as MyPageTab)}
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
            <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl overflow-hidden min-h-[500px] mb-6">
              <div className="p-6 border-b border-[#1e3a5f] flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{TAB_TITLES[activeTab]}</h2>
                  {(activeTab === 'auctions' || activeTab === 'bids') && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(activeTab === 'auctions' ? STATUS_FILTERS : BID_STATUS_FILTERS).map((filter) => (
                        <button
                          key={filter.value}
                          type="button"
                          onClick={() => handleStatusFilterChange(filter.value)}
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
                  <div className="text-sm text-gray-500">
                    {itemCount} items found
                  </div>
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
                ) : error ? (
                  <div className="p-8">
                    <ErrorState message={error} onRetry={() => setCurrentPage(0)} />
                  </div>
                ) : items.length > 0 ? (
                  <div className="divide-y divide-[#1e3a5f]">
                    {items.map((item, idx) => (
                      <div
                        key={`${activeTab}-${item.auctionId}-${idx}`}
                        onClick={() => navigate(`/product/${item.auctionId}`)}
                        className="p-6 hover:bg-[#1e3a5f]/10 transition-colors cursor-pointer flex items-center gap-6 group"
                      >
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#0a1628] border border-[#1e3a5f] group-hover:border-blue-500 transition-colors">
                          <img src={getRenderableImageUrl(item.previewUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-lg mb-1 truncate">{item.title}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                            {item.createdAt && (
                              <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDate(item.createdAt)}</div>
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
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                                      My Price
                                    </div>
                                    <div className="text-xl font-black text-blue-400">
                                      &#8361;{formatPrice((item as UserBidItem).myPrice)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                                      Current Price
                                    </div>
                                    <div className="text-xl font-black text-green-400">
                                      &#8361;{formatPrice(item.currentPrice)}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                                    Current Price
                                  </div>
                                  <div className="text-xl font-black text-blue-400">
                                    &#8361;{formatPrice(item.currentPrice)}
                                  </div>
                                </div>
                              )}
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(item.status)}`}>
                                {item.status}
                              </span>
                            </div>
                            
                            {activeTab === 'bids' && item.status === 'FINISHED' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/checkout/${item.auctionId}`);
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg"
                              >
                                결제하기
                              </button>
                            )}

                            {activeTab === 'auctions' && item.status === 'PAID' && (
                              <button
                              onClick={(e) => handleStartShipping(e, item.auctionId)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg"
                              >
                                배송 시작
                              </button>
                            )}

                            {activeTab === 'bids' && item.status === 'SHIPPING' && (
                              <button
                                onClick={(e) => handleCompleteTransaction(e, item.auctionId)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg"
                              >
                                수령 확인
                              </button>
                            )}
                          </div>
                        </div>
                        {activeTab === 'likes' && (
                          <button
                            onClick={(e) => handleRemoveFromWatchlist(e, item.auctionId)}
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

            {!isLoading && pageInfo && (
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            )}
          </div>
        </div>
      </div>

      {isProfileOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-xl border border-[#1e3a5f] bg-[#0d1b2e] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e3a5f] px-6 py-4">
              <h2 className="text-lg font-bold text-white">Edit Profile</h2>
              <button
                type="button"
                onClick={handleCloseProfile}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#1e3a5f]/50 hover:text-white"
                disabled={isSavingProfile}
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isProfileLoading ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-blue-400">
                <Loader2 className="mb-3 h-8 w-8 animate-spin" />
                <p className="text-sm text-gray-500">Loading profile...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitProfile} className="space-y-5 px-6 py-5">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Email
                  </label>
                  <div className="flex h-11 items-center gap-3 rounded-lg border border-[#1e3a5f] bg-[#0a1628] px-3 text-gray-300">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="truncate text-sm">{profile?.email || user?.email || '-'}</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="profile-nickname" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Nickname
                  </label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                      id="profile-nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="h-11 w-full rounded-lg border border-[#1e3a5f] bg-[#0a1628] pl-10 pr-3 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-blue-500"
                      placeholder="Enter nickname"
                      disabled={isSavingProfile}
                    />
                  </div>
                </div>

                {profileError && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {profileError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseProfile}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#1e3a5f]/50 hover:text-white"
                    disabled={isSavingProfile}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {isPasswordOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-xl border border-[#1e3a5f] bg-[#0d1b2e] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e3a5f] px-6 py-4">
              <h2 className="text-lg font-bold text-white">Change Password</h2>
              <button
                type="button"
                onClick={handleClosePassword}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#1e3a5f]/50 hover:text-white"
                disabled={isChangingPassword}
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPassword} className="space-y-5 px-6 py-5">
              {[
                { id: 'currentPassword', label: 'Current Password', value: passwordForm.currentPassword },
                { id: 'newPassword', label: 'New Password', value: passwordForm.newPassword },
                { id: 'confirmPassword', label: 'Confirm Password', value: passwordForm.confirmPassword },
              ].map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id} className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    {field.label}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                      id={field.id}
                      type="password"
                      value={field.value}
                      onChange={(e) => handlePasswordChange(field.id as keyof typeof passwordForm, e.target.value)}
                      className="h-11 w-full rounded-lg border border-[#1e3a5f] bg-[#0a1628] pl-10 pr-3 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-blue-500"
                      placeholder={field.label}
                      disabled={isChangingPassword}
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClosePassword}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#1e3a5f]/50 hover:text-white"
                  disabled={isChangingPassword}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}