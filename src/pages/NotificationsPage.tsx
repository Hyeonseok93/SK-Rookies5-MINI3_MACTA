import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Clock, Check, ExternalLink, Trash2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { auctionApi } from '../api/auction';
import type { Notification } from '../api/types';
import { useToast } from '../components/common/Toast';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await auctionApi.getNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch {
      showToast('Failed to load notifications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    const res = await auctionApi.markNotificationAsRead(id);
    if (res.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
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
      showToast('Notification deleted', 'info');
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    
    await Promise.all(unreadIds.map(id => auctionApi.markNotificationAsRead(id)));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    showToast('All notifications marked as read', 'success');
  };

  const handleDeleteRead = async () => {
    const readIds = notifications.filter(n => n.is_read).map(n => n.id);
    if (readIds.length === 0) {
      showToast('No read notifications to delete', 'info');
      return;
    }

    const res = await auctionApi.deleteReadNotifications();
    if (res.success) {
      setNotifications(prev => prev.filter(n => !n.is_read));
      showToast('Read notifications cleared', 'success');
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
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
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
          </div>
          
          <div className="flex gap-3">
            {notifications.some(n => !n.is_read) && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs bg-blue-600/10 text-blue-400 border border-blue-600/30 px-3 py-1.5 rounded-lg hover:bg-blue-600/20 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Mark all as read
              </button>
            )}
            {notifications.some(n => n.is_read) && (
              <button 
                onClick={handleDeleteRead}
                className="text-xs bg-red-600/10 text-red-400 border border-red-600/30 px-3 py-1.5 rounded-lg hover:bg-red-600/20 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear read messages
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#1e3a5f]/30'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#1e3a5f]/30'
            }`}
          >
            Unread ({notifications.filter(n => !n.is_read).length})
          </button>
        </div>

        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-blue-400">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Loading your notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-[#1e3a5f]">
              {filteredNotifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-6 flex items-center gap-4 transition-all cursor-pointer hover:bg-[#1e3a5f]/10 ${!n.is_read ? 'bg-blue-600/5' : 'opacity-70'}`}
                  onClick={() => handleMarkAsRead(n.id)}
                >
                  <div className={`p-3 rounded-xl flex-shrink-0 ${!n.is_read ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                    <Bell className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-lg leading-snug ${!n.is_read ? 'text-white font-semibold' : 'text-gray-300'}`}>
                        {n.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-[#1e3a5f]/50 text-[10px] uppercase font-bold tracking-wider">
                        {n.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleNavigate(e, n.target_url, n.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-500/10"
                    >
                      <span>View</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, n.id)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete"
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
              <h2 className="text-xl font-semibold text-white mb-2">No notifications found</h2>
              <p className="text-gray-500">When you receive updates about your auctions, they will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
