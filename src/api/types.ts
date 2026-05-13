export type CategoryType = 
  | 'Digital Devices' 
  | 'Home Appliances' 
  | 'Furniture/Interior' 
  | 'Clothing' 
  | 'Beauty/Personal Care' 
  | 'Sports/Leisure' 
  | 'Games/Hobbies' 
  | 'Books/Tickets' 
  | 'Other';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
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

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pageInfo: PageInfo;
}

export interface AuctionListResponse extends ApiResponse<{
  content: AuctionSummary[];
}> {
  pageInfo: PageInfo;
}

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
  id: number;
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

export interface UserAuctionItem {
  auctionId: number;
  title: string;
  currentPrice: number;
  status: 'READY' | 'LIVE' | 'FINISHED' | 'CANCEL';
  viewCount: number;
  createdAt: string;
  previewUrl: string;
  likeCount?: number;
}

export interface UserBidItem extends UserAuctionItem {
  myBidPrice: number;
}

export interface UserLikeListResponse {
  auctionId: number;
  title: string;
  currentPrice: number;
  status: 'READY' | 'LIVE' | 'FINISHED' | 'CANCEL';
  likeCount: number;
  mainPictureUrl: string;
}

export interface LikeToggleResponse {
  auctionId: number;
  likeCount: number;
  isLiked: boolean;
}

export interface Bid {
  id: string;
  bidderId: number;
  bidderNickname: string;
  price: number;
  updatedAt: string;
}

export interface Comment {
  id: number;
  userId: number;
  nickname: string;
  content: string;
  createdAt: string;
}

export interface AuctionDetail extends AuctionSummary {
  sellerId: number;
  sellerNickname: string;
  sellerJoinedAt: string;
  description: string;
  startPrice: number;
  startTime: string;
  viewCount: number;
  likeCount: number;
  pictures: { url: string; main: boolean }[];
  bids: Bid[];
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
  pictures: { url: string; main: boolean }[];
}
