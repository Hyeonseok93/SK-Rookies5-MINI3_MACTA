import { api } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  UserAuctionItem,
  UserBidItem,
  UserInfoResponse,
  PasswordUpdateRequest,
  UserSummaryResponse,
  UserUpdateRequest,
  UserLikeListResponse,
} from './types';

interface UserLikesResponseData {
  data: UserLikeListResponse[];
  pageInfo: PaginatedResponse<UserAuctionItem[]>['pageInfo'];
}

const toUserAuctionItem = (item: UserLikeListResponse): UserAuctionItem => ({
  auctionId: item.auctionId,
  title: item.title,
  currentPrice: item.currentPrice,
  status: item.status,
  viewCount: 0,
  createdAt: '',
  previewUrl: item.mainPictureUrl,
  likeCount: item.likeCount,
});

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
  getMyAuctions: async (params: { page?: number; size?: number; status?: string } = {}): Promise<PaginatedResponse<UserAuctionItem[]>> => {
    const { data } = await api.get<PaginatedResponse<UserAuctionItem[]>>('/users/me/auctions', { params });
    return data;
  },

  // GET /api/v1/users/me/bids
  getMyBids: async (params: { page?: number; size?: number; status?: string } = {}): Promise<PaginatedResponse<UserBidItem[]>> => {
    const { data } = await api.get<PaginatedResponse<UserBidItem[]>>('/users/me/bids', { params });
    return data;
  },

  // GET /api/v1/users/me/likes
  getMyWatchlist: async (params: { page?: number; size?: number; status?: string } = {}): Promise<PaginatedResponse<UserAuctionItem[]>> => {
    const { data } = await api.get<ApiResponse<UserLikesResponseData>>('/users/me/likes', { params });
    return {
      success: data.success,
      data: data.data.data.map(toUserAuctionItem),
      message: data.message,
      timestamp: data.timestamp,
      pageInfo: data.data.pageInfo,
    };
  },
};
