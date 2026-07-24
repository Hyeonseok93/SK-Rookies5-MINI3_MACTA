import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bell, Clock, Check, ExternalLink, Trash2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { notificationApi } from '../api/notification';
import type { Notification } from '../api/types';
import { useToast } from '../components/common/Toast';
import { Pagination } from '../components/common/Pagination';
import { ErrorState } from '../components/common/ErrorState';
import { formatDateTime } from '../utils/format';
import { normalizeProductDetailUrl } from '../utils/routes';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 20;

  const queryKey = ['notifications', currentPage, PAGE_SIZE] as const;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await notificationApi.getNotifications({
        page: currentPage,
        size: PAGE_SIZE,
      });
      if (!res.success || !res.data) {
        throw new Error('알림을 불러오는데 실패했습니다.');
      }
      return {
        notifications: res.data.content || ([] as Notification[]),
        pageInfo: res.data.pageInfo,
      };
    },
  });

  const notifications = data?.notifications ?? [];
  const pageInfo = data?.pageInfo ?? null;

  const setNotifications = (
    updater: Notification[] | ((prev: Notification[]) => Notification[]),
  ) => {
    queryClient.setQueryData<{ notifications: Notification[]; pageInfo: typeof pageInfo }>(
      queryKey,
      (prev) => {
        if (!prev) return prev;
        const next = typeof updater === 'function' ? updater(prev.notifications) : updater;
        return { ...prev, notifications: next };
      },
    );
  };

  const handleFilterChange = (newFilter: 'all' | 'unread') => {
    setFilter(newFilter);
    setCurrentPage(0);
  };

  const handleMarkAsRead = async (id: number) => {
    const res = await notificationApi.markNotificationAsRead(id);
    if (res.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleNavigate = (e: React.MouseEvent, targetUrl: string, id: number) => {
    e.stopPropagation();
    handleMarkAsRead(id);
    navigate(normalizeProductDetailUrl(targetUrl));
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const res = await notificationApi.deleteNotification(id);
    if (res.success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      showToast('알림이 삭제되었습니다.', 'info');
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) return;

    await Promise.all(unreadIds.map(id => notificationApi.markNotificationAsRead(id)));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('모든 알림을 읽음 처리했습니다.', 'success');
  };

  const handleDeleteRead = async () => {
    const readIds = notifications.filter(n => n.isRead).map(n => n.id);
    if (readIds.length === 0) {
      showToast('삭제할 읽은 알림이 없습니다.', 'info');
      return;
    }

    const res = await notificationApi.deleteReadNotifications();
    if (res.success) {
      setNotifications(prev => prev.filter(n => !n.isRead));
      showToast('읽은 알림을 모두 삭제했습니다.', 'success');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#1e3a5f]/30 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-white">알림함</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-[#1e3a5f]/50 text-gray-400 hover:text-white'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => handleFilterChange('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-[#1e3a5f]/50 text-gray-400 hover:text-white'
              }`}
            >
              읽지 않음
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" /> 모두 읽음
          </button>
          <button
            onClick={handleDeleteRead}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" /> 읽은 알림 삭제
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-gray-500">알림을 불러오는 중...</div>
        ) : error ? (
          <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 text-center">
            <Bell className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">알림이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkAsRead(n.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  n.isRead
                    ? 'bg-[#0d1b2e]/50 border-[#1e3a5f]/50 opacity-70'
                    : 'bg-[#0d1b2e] border-blue-500/30 shadow-lg shadow-blue-900/10'
                }`}
              >
                <div className="flex justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                        {n.type === 'OUTBID' ? '입찰 상회'
                          : n.type === 'NEW_BID' ? '신규 입찰'
                          : n.type === 'AUCTION_ENDED' ? '경매 종료'
                          : n.type === 'PAYMENT_COMPLETED' ? '결제 완료'
                          : n.type === 'SHIPPING_STARTED' ? '배송 시작'
                          : n.type === 'TRADE_COMPLETED' ? '거래 완료'
                          : n.type.replace('_', ' ')}
                      </span>
                      {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    </div>
                    <p className={`text-sm mb-2 ${n.isRead ? 'text-gray-400' : 'text-white font-medium'}`}>
                      {n.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(n.createdAt)}
                      </span>
                      {n.targetUrl && (
                        <button
                          onClick={(e) => handleNavigate(e, n.targetUrl, n.id)}
                          className="flex items-center gap-1 text-blue-400 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> 바로가기
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, n.id)}
                    className="p-2 text-gray-600 hover:text-red-400 transition-colors self-start"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pageInfo && (
          <Pagination
            currentPage={currentPage}
            totalPages={pageInfo.totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </Layout>
  );
}
