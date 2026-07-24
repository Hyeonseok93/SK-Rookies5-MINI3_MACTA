import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/layout/Layout';
import { auctionApi } from '../api/auction';
import { paymentApi } from '../api/payment';
import { getApiErrorMessage } from '../utils/apiError';
import { userApi } from '../api/user';
import type { UserAuctionItem, UserBidItem, UserInfoResponse } from '../api/types';
import { useToast } from '../components/common/Toast';
import { AUTH_STATE_CHANGED_EVENT } from '../api/auth';
import { Pagination } from '../components/common/Pagination';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EditProfileModal } from '../components/mypage/EditProfileModal';
import { ChangePasswordModal } from '../components/mypage/ChangePasswordModal';
import { MyPageHeader } from '../components/mypage/MyPageHeader';
import { MyPageSidebar } from '../components/mypage/MyPageSidebar';
import { MyPageItemList } from '../components/mypage/MyPageItemList';
import { getStoredUser, type StoredUser } from './myPageConstants';
import type { MyPageStatusFilter, MyPageTab } from './myPageTypes';

export function MyPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MyPageTab>('auctions');
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<MyPageStatusFilter>('ALL');
  const PAGE_SIZE = 10;
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

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const invalidateMy = () => queryClient.invalidateQueries({ queryKey: ['my'] });

  const { data: stats } = useQuery({
    queryKey: ['my', 'summary'],
    queryFn: async () => {
      const res = await userApi.getUserSummary();
      if (!res.success) throw new Error('Failed to load summary');
      return res.data;
    },
  });

  const tabQueryKey = ['my', activeTab, { page: currentPage, status: statusFilter, size: PAGE_SIZE }] as const;

  const {
    data: tabData,
    isLoading,
    error,
    refetch: refetchTab,
  } = useQuery({
    queryKey: tabQueryKey,
    queryFn: async () => {
      const params = {
        page: currentPage,
        size: PAGE_SIZE,
        ...((activeTab === 'auctions' || activeTab === 'bids') && statusFilter !== 'ALL'
          ? { status: statusFilter }
          : {}),
      };
      let res;
      if (activeTab === 'auctions') res = await userApi.getMyAuctions(params);
      else if (activeTab === 'bids') res = await userApi.getMyBids(params);
      else res = await userApi.getMyWatchlist(params);

      if (!res.success) throw new Error('Failed to load your items.');
      return {
        items: res.data.content as (UserAuctionItem | UserBidItem)[],
        pageInfo: res.data.pageInfo,
      };
    },
  });

  const items = tabData?.items ?? [];
  const pageInfo = tabData?.pageInfo ?? null;

  const setItems = (
    updater: (UserAuctionItem | UserBidItem)[] | ((prev: (UserAuctionItem | UserBidItem)[]) => (UserAuctionItem | UserBidItem)[]),
  ) => {
    queryClient.setQueryData<{ items: (UserAuctionItem | UserBidItem)[]; pageInfo: typeof pageInfo }>(
      tabQueryKey,
      (prev) => {
        if (!prev) return prev;
        const next = typeof updater === 'function' ? updater(prev.items) : updater;
        return { ...prev, items: next };
      },
    );
  };

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
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to load profile.');
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
        setProfile(prev => (prev ? { ...prev, nickname: nextNickname } : prev));
        setIsProfileOpen(false);
        showToast(res.message || 'Profile updated.', 'success');
      }
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to update profile.');
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
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to change password.'), 'error');
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
        invalidateMy();
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
      invalidateMy();
      showToast('Watchlist cleared', 'success');
    } catch {
      showToast('Failed to clear watchlist', 'error');
    }
  };

  const handleStartShipping = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: '배송 시작',
      message: '배송을 시작하시겠습니까?',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await paymentApi.startShipping(id.toString());
          if (res.success) {
            showToast('배송이 시작되었습니다.', 'success');
            invalidateMy();
          }
        } catch (err) {
          showToast(getApiErrorMessage(err, '배송 시작에 실패했습니다.'), 'error');
        }
      },
    });
  };

  const handleCompleteTransaction = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: '거래 확정',
      message: '물품을 수령하셨습니까? 거래를 확정합니다.',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await paymentApi.completeTransaction(id.toString());
          if (res.success) {
            showToast('거래가 확정되었습니다.', 'success');
            invalidateMy();
          }
        } catch (err) {
          showToast(getApiErrorMessage(err, '거래 확정에 실패했습니다.'), 'error');
        }
      },
    });
  };

  const itemCount = pageInfo?.totalElements ?? items.length;
  const totalPages = pageInfo?.totalPages ?? 1;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <MyPageHeader
          user={user}
          stats={stats}
          onEditProfile={handleOpenProfile}
          onChangePassword={handleOpenPassword}
        />

        <div className="flex flex-col lg:flex-row gap-8">
          <MyPageSidebar activeTab={activeTab} onTabChange={handleTabChange} />

          <div className="flex-1">
            <MyPageItemList
              activeTab={activeTab}
              statusFilter={statusFilter}
              items={items}
              itemCount={itemCount}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
              onStatusFilterChange={handleStatusFilterChange}
              onClearWatchlist={handleClearWatchlist}
              onRetry={() => refetchTab()}
              onItemClick={(id) => navigate(`/product/${id}`)}
              onCheckout={(id) => navigate(`/checkout/${id}`)}
              onStartShipping={handleStartShipping}
              onCompleteTransaction={handleCompleteTransaction}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
            />

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

      <EditProfileModal
        isOpen={isProfileOpen}
        isLoading={isProfileLoading}
        isSaving={isSavingProfile}
        profile={profile}
        emailFallback={user?.email}
        nickname={nickname}
        error={profileError}
        onNicknameChange={setNickname}
        onClose={handleCloseProfile}
        onSubmit={handleSubmitProfile}
      />

      <ChangePasswordModal
        isOpen={isPasswordOpen}
        isChanging={isChangingPassword}
        form={passwordForm}
        onChange={handlePasswordChange}
        onClose={handleClosePassword}
        onSubmit={handleSubmitPassword}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </Layout>
  );
}
