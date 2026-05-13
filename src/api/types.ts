export type CategoryType = string;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface PageInfo {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedData<T> {
  content: T;
  pageInfo: PageInfo;
}

/**
 * 백엔드 표준 페이지네이션 응답 규격
 */
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

export type AuctionListResponse = PaginatedResponse<AuctionSummary[]>;

export type NotificationListResponse = PaginatedResponse<Notification[]>;

export interface AuctionSummary {
  id: number;
  title: string;
  currentPrice: number;
  status: 'READY' | 'LIVE' | 'FINISHED' | 'CANCEL';
  mainPictureUrl: string;
  category: CategoryType;
  endTime: string;
  bidCount: number;
  isLiked: boolean;
  sellerId: number | string;
}

export interface Category {
  id: number;
  code: string;
  name: string;
}

export interface AuctionStats {
  totalActive: number;
  endingSoon: number;
}

export interface UserSummaryResponse {
  biddingCount: number;
  wonCount: number;
  hostedCount: number;
  watchlistCount: number;
}

export interface UserInfoResponse {
  id: number | string;
  email: string;
  nickname: string;
}

export interface UserUpdateRequest {
  nickname: string;
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type UserItemStatus = 'READY' | 'LIVE' | 'FINISHED' | 'CANCEL' | 'OUTBID' | 'WON' | 'SOLD';

export interface UserAuctionItem {
  auctionId: number;
  title: string;
  currentPrice: number;
  status: UserItemStatus;
  viewCount: number;
  createdAt: string;
  previewUrl: string;
  mainPictureUrl?: string;
  likeCount?: number;
}

export interface UserBidItem extends UserAuctionItem {
  myBidPrice: number;
}

export interface UserLikeListResponse {
  auctionId: number;
  title: string;
  currentPrice: number;
  status: UserItemStatus;
  likeCount: number;
  mainPictureUrl: string;
}

export interface LikeToggleResponse {
  auctionId: number;
  likeCount: number;
  isLiked: boolean;
}

export interface Bid {
  bidderNickname: string;
  price: number;
  bidTime: string;
}

export interface Comment {
  id: number;
  userId: number | string;
  nickname: string;
  content: string;
  createdAt: string;
  children?: Comment[]; // 답변(대댓글) 목록
}

export interface AuctionDetail extends AuctionSummary {
  sellerId: number | string;
  sellerNickname: string;
  sellerJoinedAt: string;
  description: string;
  startPrice: number;
  startTime: string;
  viewCount: number;
  likeCount: number;
  pictures: { url: string; main: boolean }[];
  biddingHistory: Bid[];
}

export interface Notification {
  id: number;
  type: 'OUTBID' | 'AUCTION_WON' | 'AUCTION_ENDED' | 'NEW_QUESTION' | 'NEW_ANSWER' | 'CLOSING_SOON';
  content: string;
  targetUrl: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateAuctionRequest {
  title: string;
  description: string;
  category: CategoryType;
  startPrice: number;
  endTime: string;
  pictures: {
    url: string;
    imageKey: string;
    isMain: boolean;
    sortOrder: number;
  }[];
}
