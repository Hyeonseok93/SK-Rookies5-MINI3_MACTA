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
  UserItemStatus,
} from './types';

/**
 * 백엔드 DTO 인터페이스 정의 (any 제거용)
 */
interface UserAuctionResponseItem {
  auctionId: number;
  title: string;
  currentPrice: number;
  status: UserItemStatus;
  viewCount?: number;
  createdAt?: string;
  mainPictureUrl?: string;
  likeCount?: number;
  myBidPrice?: number;
}

/**
 * 백엔드 DTO를 프론트엔드 UI용 객체로 변환하는 공통 매퍼
 */
const toUserAuctionItem = (item: UserAuctionResponseItem | UserLikeListResponse): UserAuctionItem => ({
  auctionId: item.auctionId,
  title: item.title,
  currentPrice: item.currentPrice,
  status: item.status,
  viewCount: 'viewCount' in item ? item.viewCount || 0 : 0,
  createdAt: 'createdAt' in item ? item.createdAt || '' : '',
  previewUrl: item.mainPictureUrl || '', 
  likeCount: item.likeCount,
});

/**
 * 사용자 관련 API (마이페이지 등)
 */
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
    const { data } = await api.get<PaginatedResponse<UserAuctionResponseItem[]>>('/users/me/auctions', { params });
    return {
      ...data,
      data: {
        content: data.data.content.map(toUserAuctionItem),
        pageInfo: data.data.pageInfo
      }
    };
  },

  // GET /api/v1/users/me/bids
  getMyBids: async (params: { page?: number; size?: number; status?: string } = {}): Promise<PaginatedResponse<UserBidItem[]>> => {
    const { data } = await api.get<PaginatedResponse<UserAuctionResponseItem[]>>('/users/me/bids', { params });
    return {
      ...data,
      data: {
        content: data.data.content.map(item => ({
          ...toUserAuctionItem(item),
          myBidPrice: item.myBidPrice || 0
        })),
        pageInfo: data.data.pageInfo
      }
    };
  },

  // GET /api/v1/users/me/likes
  getMyWatchlist: async (params: { page?: number; size?: number; status?: string } = {}): Promise<PaginatedResponse<UserAuctionItem[]>> => {
    const { data } = await api.get<PaginatedResponse<UserLikeListResponse[]>>('/users/me/likes', { params });
    return {
      ...data,
      data: {
        content: data.data.content.map(toUserAuctionItem),
        pageInfo: data.data.pageInfo
      }
    };
  },
};
