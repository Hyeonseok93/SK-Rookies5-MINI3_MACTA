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

export interface Bid {
  id: string;
  bidder_id: number;
  bidder_nickname: string;
  price: number;
  updated_at: Date;
}

export interface Comment {
  id: number;
  user_id: number;
  nickname: string;
  content: string;
  created_at: Date;
}

export interface AuctionItem {
  id: string;
  seller_id: number;
  seller_nickname: string;
  seller_joined_at: Date;
  title: string;
  description: string;
  category: CategoryType;
  start_price: number;
  current_price: number;
  status: 'READY' | 'LIVE' | 'FINISHED' | 'CANCEL';
  start_time: Date;
  end_time: Date;
  view_count: number;
  like_count: number;
  imageUrl: string; // Main picture
  pictures: string[];
  bids: Bid[];
  comments: Comment[];
  created_at: Date;
  updated_at: Date;
}

const now = new Date();
const ONE_HOUR = 60 * 60 * 1000;

export const auctionDatabase: AuctionItem[] = [
  {
    id: '1',
    seller_id: 101,
    seller_nickname: 'TechEnthusiast',
    seller_joined_at: new Date('2024-01-15'),
    title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
    description: 'Selling my iPhone 15 Pro Max. Used for 3 months with a screen protector and case from day one. Battery health is 100%. Comes with the original box and unused USB-C cable.',
    category: 'Digital Devices',
    start_price: 1000000,
    current_price: 1450000,
    status: 'LIVE',
    start_time: new Date(now.getTime() - 24 * ONE_HOUR),
    end_time: new Date(now.getTime() + 1.5 * ONE_HOUR),
    view_count: 1240,
    like_count: 85,
    imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80',
    pictures: [
      'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80',
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'
    ],
    bids: [
      { id: 'b1_1', bidder_id: 205, bidder_nickname: 'GadgetLover', price: 1450000, updated_at: new Date(now.getTime() - 10 * 60 * 1000) },
      { id: 'b1_2', bidder_id: 206, bidder_nickname: 'AppleFan88', price: 1420000, updated_at: new Date(now.getTime() - 30 * 60 * 1000) }
    ],
    comments: [
      { id: 1001, user_id: 201, nickname: 'User_442', content: 'Is the warranty still active?', created_at: new Date(now.getTime() - 5 * ONE_HOUR) },
      { id: 1002, user_id: 202, nickname: 'Buyer_King', content: 'Can we meet at Gangnam Station?', created_at: new Date(now.getTime() - 2 * ONE_HOUR) }
    ],
    created_at: new Date(now.getTime() - 25 * ONE_HOUR),
    updated_at: new Date(now.getTime() - 10 * 60 * 1000)
  },
  {
    id: '2',
    seller_id: 102,
    seller_nickname: 'MovieBuff_Seoul',
    seller_joined_at: new Date('2024-02-10'),
    title: 'LG OLED TV 65-inch (C3 Series)',
    description: 'Purchased last year for 3.2M KRW. Upgrading to a larger size. The picture quality is amazing for gaming and movies. No burn-in issues.',
    category: 'Home Appliances',
    start_price: 1500000,
    current_price: 1850000,
    status: 'LIVE',
    start_time: new Date(now.getTime() - 12 * ONE_HOUR),
    end_time: new Date(now.getTime() + 24 * ONE_HOUR),
    view_count: 850,
    like_count: 42,
    imageUrl: 'https://images.unsplash.com/photo-1593359677771-40488661665e?w=800&q=80',
    pictures: [
      'https://images.unsplash.com/photo-1593359677771-40488661665e?w=800&q=80',
      'https://images.unsplash.com/photo-1558941753-a62116565af7?w=800&q=80'
    ],
    bids: [
      { id: 'b2_1', bidder_id: 207, bidder_nickname: 'CinemaAddict', price: 1850000, updated_at: new Date(now.getTime() - 15 * 60 * 1000) }
    ],
    comments: [
      { id: 1003, user_id: 203, nickname: 'GamerX', content: 'Does it support 120Hz 4K?', created_at: new Date(now.getTime() - 8 * ONE_HOUR) }
    ],
    created_at: new Date(now.getTime() - 13 * ONE_HOUR),
    updated_at: new Date(now.getTime() - 15 * 60 * 1000)
  },
  {
    id: '3',
    seller_id: 103,
    seller_nickname: 'OfficeSetup',
    seller_joined_at: new Date('2023-11-05'),
    title: 'Vintage Herman Miller Aeron Chair (Size B)',
    description: 'The ultimate ergonomic chair. Fully loaded model with posture fit and adjustable arms. In excellent condition, just a few minor scratches on the base.',
    category: 'Furniture/Interior',
    start_price: 400000,
    current_price: 650000,
    status: 'LIVE',
    start_time: new Date(now.getTime() - 48 * ONE_HOUR),
    end_time: new Date(now.getTime() + 0.5 * ONE_HOUR),
    view_count: 2100,
    like_count: 156,
    imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80',
    pictures: ['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80'],
    bids: [
      { id: 'b3_1', bidder_id: 208, bidder_nickname: 'DevLife', price: 650000, updated_at: new Date(now.getTime() - 5 * 60 * 1000) }
    ],
    comments: [],
    created_at: new Date(now.getTime() - 49 * ONE_HOUR),
    updated_at: new Date(now.getTime() - 5 * 60 * 1000)
  },
  {
    id: '4',
    seller_id: 104,
    seller_nickname: 'SneakerHead_KR',
    seller_joined_at: new Date('2024-03-20'),
    title: 'Limited Edition Nike x Travis Scott AJ1',
    description: 'Deadstock condition, never worn. Size US 10. Authenticated by KREAM. Shipping in double box.',
    category: 'Clothing',
    start_price: 800000,
    current_price: 1200000,
    status: 'LIVE',
    start_time: new Date(now.getTime() - 2 * ONE_HOUR),
    end_time: new Date(now.getTime() + 48 * ONE_HOUR),
    view_count: 5600,
    like_count: 420,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    pictures: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
    bids: [
      { id: 'b4_1', bidder_id: 209, bidder_nickname: 'HypeBeast', price: 1200000, updated_at: new Date(now.getTime() - 30 * 60 * 1000) }
    ],
    comments: [],
    created_at: new Date(now.getTime() - 3 * ONE_HOUR),
    updated_at: new Date(now.getTime() - 30 * 60 * 1000)
  }
];

export const auctionItems = auctionDatabase;
