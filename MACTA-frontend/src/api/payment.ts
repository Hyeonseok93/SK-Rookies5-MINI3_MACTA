import { api } from './client';
import type { ApiResponse } from './types';

export const paymentApi = {
  processPayment: async (auctionId: number, amount: number): Promise<ApiResponse<void>> => {
    const { data } = await api.post<ApiResponse<void>>('/payments', { auctionId, amount });
    return data;
  },

  startShipping: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.patch<ApiResponse<void>>(`/auctions/${id}/shipping`);
    return data;
  },

  completeTransaction: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.patch<ApiResponse<void>>(`/auctions/${id}/complete`);
    return data;
  },
};
