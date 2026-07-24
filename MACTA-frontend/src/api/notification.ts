import { api } from './client';
import type { ApiResponse, NotificationListResponse } from './types';

export const notificationApi = {
  getNotifications: async (params: { page?: number; size?: number } = {}): Promise<NotificationListResponse> => {
    const { data } = await api.get<NotificationListResponse>('/notifications', { params });
    return data;
  },

  markNotificationAsRead: async (id: number): Promise<ApiResponse<void>> => {
    const { data } = await api.patch<ApiResponse<void>>(`/notifications/${id}`);
    return data;
  },

  deleteNotification: async (id: number): Promise<ApiResponse<void>> => {
    const { data } = await api.delete<ApiResponse<void>>(`/notifications/${id}`);
    return data;
  },

  deleteReadNotifications: async (): Promise<ApiResponse<void>> => {
    const { data } = await api.delete<ApiResponse<void>>('/notifications/read');
    return data;
  },

  markAllNotificationsAsRead: async (): Promise<ApiResponse<void>> => {
    const { data } = await api.patch<ApiResponse<void>>('/notifications/read');
    return data;
  },
};
