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

type UserPageResponse<T> = ApiResponse<T[] | {
  content?: T[];
  data?: T[];
  pageInfo?: PaginatedResponse<T[]>['pageInfo'];
}> & {
  pageInfo?: PaginatedResponse<T[]>['pageInfo'];
};

const getPageData = <T>(response: UserPageResponse<T>): T[] => {
  if (Array.isArray(response.data)) return response.data;
  return response.data.content ?? response.data.data ?? [];
};

const getPageInfo = <T>(response: UserPageResponse<T>, items: T[]) => {
  const pageInfo = response.pageInfo ?? (!Array.isArray(response.data) ? response.data.pageInfo : undefined);

  return {
    currentPage: pageInfo?.currentPage ?? 0,
    pageSize: pageInfo?.pageSize ?? items.length,
    totalPages: pageInfo?.totalPages ?? 1,
    totalElements: pageInfo?.totalElements ?? items.length,
    isFirst: pageInfo?.isFirst ?? true,
    isLast: pageInfo?.isLast ?? true,
    hasNext: pageInfo?.hasNext ?? false,
    hasPrevious: pageInfo?.hasPrevious ?? false,
  };
};

const normalizeUserPageResponse = <T, R = T>(
  response: UserPageResponse<T>,
  mapItem: (item: T) => R = item => item as unknown as R
): PaginatedResponse<R[]> => {
  const rawItems = getPageData(response);
  const items = rawItems.map(mapItem);

  return {
    success: response.success,
    data: items,
    message: response.message,
    timestamp: response.timestamp,
    pageInfo: getPageInfo(response, rawItems),
  };
};

type UserAuctionImageFields = UserAuctionItem & {
  mainPictureUrl?: string;
};

const toUserAuctionItem = (item: UserAuctionImageFields | UserLikeListResponse): UserAuctionItem => ({
  auctionId: item.auctionId,
  title: item.title,
  currentPrice: item.currentPrice,
  status: item.status,
  viewCount: 'viewCount' in item ? item.viewCount : 0,
  createdAt: 'createdAt' in item ? item.createdAt : '',
  previewUrl: ('previewUrl' in item ? item.previewUrl : undefined) || item.mainPictureUrl || '',
  mainPictureUrl: item.mainPictureUrl,
  likeCount: item.likeCount,
});

const toUserBidItem = (item: UserBidItem & { mainPictureUrl?: string }): UserBidItem => ({
  ...toUserAuctionItem(item),
  myBidPrice: item.myBidPrice,
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
    const { data } = await api.get<UserPageResponse<UserAuctionImageFields>>('/users/me/auctions', { params });
    return normalizeUserPageResponse(data, toUserAuctionItem);
  },

  // GET /api/v1/users/me/bids
  getMyBids: async (params: { page?: number; size?: number; status?: string } = {}): Promise<PaginatedResponse<UserBidItem[]>> => {
    const { data } = await api.get<UserPageResponse<UserBidItem & { mainPictureUrl?: string }>>('/users/me/bids', { params });
    return normalizeUserPageResponse(data, toUserBidItem);
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
