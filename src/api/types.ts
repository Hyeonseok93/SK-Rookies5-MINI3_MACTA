import type { CategoryType } from '../data/mockData';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PageInfo {
  current_page: number;
  page_size: number;
  total_pages: number;
  total_elements: number;
  is_first: boolean;
  is_last: boolean;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  page_info: PageInfo;
}

export interface AuctionSummary {
  id: number;
  title: string;
  current_price: number;
  status: 'READY' | 'LIVE' | 'FINISHED' | 'CANCEL';
  main_picture_url: string;
  category: CategoryType;
  end_time: string;
  bid_count: number;
}

export interface Category {
  id: number;
  code: string;
  name: string;
}

export interface AuctionStats {
  total_active: number;
  ending_soon: number;
}

export interface Bid {
  id: string;
  bidder_id: number;
  bidder_nickname: string;
  price: number;
  updated_at: string;
}

export interface Comment {
  id: number;
  user_id: number;
  nickname: string;
  content: string;
  created_at: string;
}

export interface AuctionDetail extends AuctionSummary {
  seller_id: number;
  seller_nickname: string;
  seller_joined_at: string;
  description: string;
  start_price: number;
  start_time: string;
  view_count: number;
  like_count: number;
  pictures: { url: string; main: boolean }[];
  bids: Bid[];
}

export interface CreateAuctionRequest {
  title: string;
  description: string;
  category: CategoryType;
  start_price: number;
  end_time: string;
  pictures: { url: string; main: boolean }[];
}
