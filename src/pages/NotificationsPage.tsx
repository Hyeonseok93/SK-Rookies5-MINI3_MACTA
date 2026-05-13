import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Clock, Check, ExternalLink, Trash2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { auctionApi } from '../api/auction';
import type { Notification, PageInfo } from '../api/types';
import { useToast } from '../components/common/Toast';
import { Pagination } from '../components/common/Pagination';
import { ErrorState } from '../components/common/ErrorState';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 20;

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await auctionApi.getNotifications({ 
        page: currentPage, 
        size: PAGE_SIZE 
      });
      if (res.success && res.data) {
        // res.data is { content: Notification[] }
        setNotifications(res.data.content || []);
        setPageInfo(res.pageInfo);
      }
    } catch {
      setError('알림을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchNotifications]);

  const handleFilterChange = (newFilter: 'all' | 'unread') => {
    setFilter(newFilter);
    setCurrentPage(0);
  };

  const handleMarkAsRead = async (id: number) => {
    const res = await auctionApi.markNotificationAsRead(id);
    if (res.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleNavigate = (e: React.MouseEvent, targetUrl: string, id: number) => {
    e.stopPropagation();
    handleMarkAsRead(id);
    navigate(targetUrl);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const res = await auctionApi.deleteNotification(id);
    if (res.success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      showToast('알림이 삭제되었습니다.', 'info');
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) return;
    
    await Promise.all(unreadIds.map(id => auctionApi.markNotificationAsRead(id)));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('모든 알림을 읽음 처리했습니다.', 'success');
  };

  const handleDeleteRead = async () => {
    const readIds = notifications.filter(n => n.isRead).map(n => n.id);
    if (readIds.length === 0) {
      showToast('삭제할 읽은 알림이 없습니다.', 'info');
      return;
    }

    const res = await auctionApi.deleteReadNotifications();
    if (res.success) {
      setNotifications(prev => prev.filter(n => !n.isRead));
      showToast('읽은 알림을 모두 삭제했습니다.', 'success');
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
          
          <div className="flex gap-3">
            {notifications.some(n => !n.isRead) && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs bg-blue-600/10 text-blue-400 border border-blue-600/30 px-3 py-1.5 rounded-lg hover:bg-blue-600/20 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                모두 읽음 처리
              </button>
            )}
            {notifications.some(n => n.isRead) && (
              <button 
                onClick={handleDeleteRead}
                className="text-xs bg-red-600/10 text-red-400 border border-red-600/30 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                읽은 메시지 삭제
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#1e3a5f]/30'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => handleFilterChange('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#1e3a5f]/30'
            }`}
          >
            읽지 않음 ({notifications.filter(n => !n.isRead).length})
          </button>
        </div>

        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-blue-400">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400">알림을 불러오는 중입니다...</p>
            </div>
          ) : error ? (
            <div className="p-8">
              <ErrorState message={error} onRetry={fetchNotifications} />
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-[#1e3a5f]">
              {filteredNotifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-6 flex items-center gap-4 transition-all cursor-pointer hover:bg-[#1e3a5f]/10 ${!n.isRead ? 'bg-blue-600/5' : 'opacity-70'}`}
                  onClick={() => handleMarkAsRead(n.id)}
                >
                  <div className={`p-3 rounded-xl flex-shrink-0 ${!n.isRead ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                    <Bell className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-lg leading-snug ${!n.isRead ? 'text-white font-semibold' : 'text-gray-300'}`}>
                        {n.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-[#1e3a5f]/50 text-[10px] uppercase font-bold tracking-wider">
                        {n.type === 'OUTBID' ? '입찰 상회' : n.type === 'AUCTION_ENDED' ? '경매 종료' : n.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleNavigate(e, n.targetUrl, n.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-500/10"
                    >
                      <span>보기</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, n.id)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 px-4 text-center">
              <div className="w-20 h-20 bg-[#1e3a5f]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-gray-600 opacity-30" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">새로운 알림이 없습니다.</h2>
              <p className="text-gray-500">경매와 관련된 새로운 소식이 있으면 여기에 표시됩니다.</p>
            </div>
          )}
        </div>

        {!isLoading && pageInfo && (
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
