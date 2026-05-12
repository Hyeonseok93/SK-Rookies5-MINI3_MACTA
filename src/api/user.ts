import { auctionDatabase } from '../data/mockData';
import { api } from './client';
import { sessionData } from './mockSession';
import type {
  ApiResponse,
  PaginatedResponse,
  UserAuctionItem,
  UserBidItem,
  UserInfoResponse,
  PasswordUpdateRequest,
  UserSummaryResponse,
  UserUpdateRequest,
} from './types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const userApi = {
  // GET /api/v1/users/me/summary
  getUserSummary: async (): Promise<ApiResponse<UserSummaryResponse>> => {
    const { data } = await api.get<ApiResponse<UserSummaryResponse>>('/users/me/summary');
    return data;
  },

  // GET /api/v1/users/me
  getUserInfo: async (): Promise<ApiResponse<UserInfoResponse>> => {
    const { data } = await api.get<ApiResponse<UserInfoResponse>>('/users/me');
    return data;
  },

  // PUT /api/v1/users/me
  updateUserInfo: async (payload: UserUpdateRequest): Promise<ApiResponse<null>> => {
    const { data } = await api.put<ApiResponse<null>>('/users/me', payload);
    return data;
  },

  // PATCH /api/v1/users/password
  updatePassword: async (payload: PasswordUpdateRequest): Promise<ApiResponse<null>> => {
    const { data } = await api.patch<ApiResponse<null>>('/users/password', payload);
    return data;
  },

  // GET /api/v1/users/me/auctions
  getMyAuctions: async (): Promise<PaginatedResponse<UserAuctionItem[]>> => {
    await delay(400);
    const myItems = auctionDatabase.filter(a => a.seller_id === 999).map(a => ({
      auction_id: parseInt(a.id),
      title: a.title,
      current_price: a.current_price,
      status: a.status,
      view_count: a.view_count,
      created_at: a.created_at.toISOString(),
      preview_url: a.imageUrl
    }));
    return {
      success: true,
      data: myItems,
      page_info: { current_page: 0, page_size: 10, total_pages: 1, total_elements: myItems.length, is_first: true, is_last: true, has_next: false, has_previous: false },
      timestamp: new Date().toISOString()
    };
  },

  // GET /api/v1/users/me/bids
  getMyBids: async (): Promise<PaginatedResponse<UserBidItem[]>> => {
    await delay(400);
    const myBidItems: UserBidItem[] = sessionData.myBids.map(mb => {
      const auction = auctionDatabase.find(a => parseInt(a.id) === mb.auction_id)!;
      return {
        auction_id: parseInt(auction.id),
        title: auction.title,
        my_bid_price: mb.bid_price,
        current_price: auction.current_price,
        status: auction.status,
        view_count: auction.view_count,
        created_at: mb.timestamp,
        preview_url: auction.imageUrl
      };
    });
    return {
      success: true,
      data: myBidItems,
      page_info: { current_page: 0, page_size: 10, total_pages: 1, total_elements: myBidItems.length, is_first: true, is_last: true, has_next: false, has_previous: false },
      timestamp: new Date().toISOString()
    };
  },

  // GET /api/v1/users/me/likes
  getMyWatchlist: async (): Promise<PaginatedResponse<UserAuctionItem[]>> => {
    await delay(400);
    const watchlist = auctionDatabase
      .filter(a => sessionData.likedAuctionIds.has(parseInt(a.id)))
      .map(a => ({
        auction_id: parseInt(a.id),
        title: a.title,
        current_price: a.current_price,
        status: a.status,
        view_count: a.view_count,
        created_at: a.created_at.toISOString(),
        preview_url: a.imageUrl
      }));
    return {
      success: true,
      data: watchlist,
      page_info: { current_page: 0, page_size: 10, total_pages: 1, total_elements: watchlist.length, is_first: true, is_last: true, has_next: false, has_previous: false },
      timestamp: new Date().toISOString()
    };
  },
};
