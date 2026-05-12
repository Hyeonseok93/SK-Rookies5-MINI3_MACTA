import { auctionDatabase } from '../data/mockData';
import type { 
  AuctionSummary, PaginatedResponse, ApiResponse, Category, 
  AuctionDetail, Comment, AuctionStats, CreateAuctionRequest, 
  Notification, UserDashboardStats, UserAuctionItem, UserBidItem, 
  LikeToggleResponse 
} from './types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulating session storage for likes and user data
const sessionData = {
  likedAuctionIds: new Set<number>([1, 4]), // Initial likes
  myBids: [
    { auction_id: 1, bid_price: 1450000, timestamp: new Date().toISOString() }
  ]
};

export const auctionApi = {
  // GET /api/v1/auctions
  getAuctions: async (params: {
    page?: number;
    size?: number;
    category?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }): Promise<PaginatedResponse<AuctionSummary[]>> => {
    await delay(500);

    let filtered = auctionDatabase.map(item => ({
      id: parseInt(item.id),
      title: item.title,
      current_price: item.current_price,
      status: item.status,
      main_picture_url: item.imageUrl,
      category: item.category,
      end_time: item.end_time.toISOString(),
      bid_count: item.bids.length,
      is_liked: sessionData.likedAuctionIds.has(parseInt(item.id))
    }));

    if (params.category && params.category !== 'All') {
      filtered = filtered.filter(item => item.category === params.category);
    }
    if (params.q) {
      const q = params.q.toLowerCase();
      filtered = filtered.filter(item => item.title.toLowerCase().includes(q));
    }
    if (params.minPrice) {
      filtered = filtered.filter(item => item.current_price >= parseInt(params.minPrice!));
    }
    if (params.maxPrice) {
      filtered = filtered.filter(item => item.current_price <= parseInt(params.maxPrice!));
    }

    switch (params.sort) {
      case 'closing-soon':
        filtered.sort((a, b) => new Date(a.end_time).getTime() - new Date(b.end_time).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.current_price - b.current_price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.current_price - a.current_price);
        break;
      default:
        filtered.sort((a, b) => b.id - a.id);
    }

    return {
      success: true,
      data: filtered,
      page_info: {
        current_page: params.page || 0,
        page_size: params.size || 10,
        total_pages: 1,
        total_elements: filtered.length,
        is_first: true,
        is_last: true,
        has_next: false,
        has_previous: false
      },
      timestamp: new Date().toISOString()
    };
  },

  // POST /api/v1/auctions
  createAuction: async (data: CreateAuctionRequest): Promise<ApiResponse<{ auction_id: number }>> => {
    await delay(800);
    const newId = auctionDatabase.length + 1;

    auctionDatabase.push({
      id: newId.toString(),
      seller_id: 999,
      seller_nickname: 'You',
      seller_joined_at: new Date(),
      title: data.title,
      description: data.description,
      category: data.category,
      start_price: data.start_price,
      current_price: data.start_price,
      status: 'LIVE',
      start_time: new Date(),
      end_time: new Date(data.end_time),
      view_count: 0,
      like_count: 0,
      imageUrl: data.pictures.find(p => p.main)?.url || data.pictures[0]?.url || '',
      pictures: data.pictures.map(p => p.url),
      bids: [],
      comments: [],
      created_at: new Date(),
      updated_at: new Date()
    });

    return {
      success: true,
      data: { auction_id: newId },
      timestamp: new Date().toISOString()
    };
  },

  // GET /api/v1/categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    await delay(300);
    return {
      success: true,
      data: [
        { id: 1, code: 'DIGITAL', name: 'Digital Devices' },
        { id: 2, code: 'APPLIANCES', name: 'Home Appliances' },
        { id: 3, code: 'FURNITURE', name: 'Furniture/Interior' },
        { id: 4, code: 'CLOTHING', name: 'Clothing' },
        { id: 5, code: 'BEAUTY', name: 'Beauty/Personal Care' },
        { id: 6, code: 'SPORTS', name: 'Sports/Leisure' },
        { id: 7, code: 'GAMES', name: 'Games/Hobbies' },
        { id: 8, code: 'BOOKS', name: 'Books/Tickets' },
        { id: 9, code: 'OTHER', name: 'Other' },
      ],
      timestamp: new Date().toISOString()
    };
  },

  // GET /api/v1/auctions/stats
  getAuctionStats: async (): Promise<ApiResponse<AuctionStats>> => {
    await delay(200);
    const total = auctionDatabase.length;
    const soon = auctionDatabase.filter(item =>
      item.end_time.getTime() - Date.now() < 2 * 60 * 60 * 1000
    ).length;

    return {
      success: true,
      data: {
        total_active: total,
        ending_soon: soon
      },
      timestamp: new Date().toISOString()
    };
  },

  // GET /api/v1/auctions/{id}
  getAuctionDetail: async (id: string): Promise<ApiResponse<AuctionDetail>> => {
    await delay(500);
    const item = auctionDatabase.find(i => i.id === id);
    if (!item) throw new Error('Auction not found');

    return {
      success: true,
      data: {
        id: parseInt(item.id),
        title: item.title,
        current_price: item.current_price,
        status: item.status,
        main_picture_url: item.imageUrl,
        category: item.category,
        end_time: item.end_time.toISOString(),
        bid_count: item.bids.length,
        is_liked: sessionData.likedAuctionIds.has(parseInt(item.id)),
        seller_id: item.seller_id,
        seller_nickname: item.seller_nickname,
        seller_joined_at: item.seller_joined_at.toISOString(),
        description: item.description,
        start_price: item.start_price,
        start_time: item.start_time.toISOString(),
        view_count: item.view_count,
        like_count: item.like_count,
        pictures: item.pictures.map((url, i) => ({ url, main: i === 0 })),
        bids: item.bids.map(b => ({
          id: b.id,
          bidder_id: b.bidder_id,
          bidder_nickname: b.bidder_nickname,
          price: b.price,
          updated_at: b.updated_at.toISOString()
        }))
      },
      timestamp: new Date().toISOString()
    };
  },

  // POST /api/v1/auctions/{id}/bids
  placeBid: async (id: string, amount: number): Promise<ApiResponse<{ bid_id: string; current_price: number }>> => {
    await delay(300);
    const item = auctionDatabase.find(i => i.id === id);
    if (item) {
      item.current_price = amount;
      item.bids.unshift({
        id: `b${Date.now()}`,
        bidder_id: 999,
        bidder_nickname: 'You',
        price: amount,
        updated_at: new Date()
      });
      sessionData.myBids.unshift({
        auction_id: parseInt(id),
        bid_price: amount,
        timestamp: new Date().toISOString()
      });
    }

    return {
      success: true,
      data: {
        bid_id: `b${Date.now()}`,
        current_price: amount
      },
      timestamp: new Date().toISOString()
    };
  },

  // POST /api/v1/auctions/{id}/likes
  toggleLike: async (id: number): Promise<ApiResponse<LikeToggleResponse>> => {
    await delay(200);
    const item = auctionDatabase.find(i => parseInt(i.id) === id);
    if (!item) throw new Error('Auction not found');

    const isLiked = sessionData.likedAuctionIds.has(id);
    if (isLiked) {
      sessionData.likedAuctionIds.delete(id);
      item.like_count--;
    } else {
      sessionData.likedAuctionIds.add(id);
      item.like_count++;
    }

    return {
      success: true,
      data: {
        auction_id: id,
        like_count: item.like_count,
        is_liked: !isLiked
      },
      timestamp: new Date().toISOString()
    };
  },

  // GET /api/v1/users/me/stats
  getUserStats: async (): Promise<ApiResponse<UserDashboardStats>> => {
    await delay(300);
    return {
      success: true,
      data: {
        bidding_count: sessionData.myBids.length,
        won_count: 1,
        hosted_count: auctionDatabase.filter(a => a.seller_id === 999).length,
        watchlist_count: sessionData.likedAuctionIds.size
      },
      timestamp: new Date().toISOString()
    };
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

  // GET /api/v1/auctions/{id}/comments
  getComments: async (id: string): Promise<ApiResponse<Comment[]>> => {
    await delay(300);
    const item = auctionDatabase.find(i => i.id === id);
    if (!item) return { success: true, data: [], timestamp: new Date().toISOString() };

    return {
      success: true,
      data: item.comments.map(c => ({
        ...c,
        created_at: c.created_at.toISOString()
      })),
      timestamp: new Date().toISOString()
    };
  },

  // POST /api/v1/auctions/{id}/comments
  postComment: async (id: string, content: string): Promise<ApiResponse<{ id: number }>> => {
    await delay(300);
    const idNum = Math.floor(Math.random() * 10000);
    const item = auctionDatabase.find(i => i.id === id);
    if (item) {
      item.comments.push({
        id: idNum,
        user_id: 999,
        nickname: 'You',
        content,
        created_at: new Date()
      });
    }

    return {
      success: true,
      data: { id: idNum },
      timestamp: new Date().toISOString()
    };
  },

  // GET /api/v1/notifications
  getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    await delay(300);
    return {
      success: true,
      data: [
        {
          id: 101,
          type: 'OUTBID',
          content: "[Price Update] Someone placed a higher bid on iPhone 15 Pro Max!",
          target_url: "/product/1",
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        },
        {
          id: 102,
          type: 'NEW_ANSWER',
          content: "[Q&A] Seller replied to your question about the LG OLED TV.",
          target_url: "/product/2",
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: 103,
          type: 'CLOSING_SOON',
          content: "[Closing Soon] The auction for \"Vintage Herman Miller Chair\" has only 1 hour left!",
          target_url: "/product/3",
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
        }
      ],
      timestamp: new Date().toISOString()
    };
  },

  // PATCH /api/v1/notifications/{id}
  markNotificationAsRead: async (_: number): Promise<ApiResponse<void>> => {
    await delay(100);
    return { success: true, data: undefined, timestamp: new Date().toISOString() };
  },

  // DELETE /api/v1/notifications/{id}
  deleteNotification: async (_: number): Promise<ApiResponse<void>> => {
    await delay(100);
    return { success: true, data: undefined, timestamp: new Date().toISOString() };
  },

  // DELETE /api/v1/notifications/read
  deleteReadNotifications: async (): Promise<ApiResponse<void>> => {
    await delay(200);
    return { success: true, data: undefined, timestamp: new Date().toISOString() };
  },

  // POST /payments
  processPayment: async (auctionId: number): Promise<ApiResponse<void>> => {
    await delay(1000);
    const item = auctionDatabase.find(i => parseInt(i.id) === auctionId);
    if (item) item.status = 'FINISHED'; // In real app, maybe 'PAID'
    return { success: true, data: undefined, timestamp: new Date().toISOString() };
  }
};
