export interface AuctionItem {
  id: string;
  title: string;
  category: 'Electronics' | 'Fashion' | 'Collectibles';
  currentBid: number;
  imageUrl: string;
  endTime: Date;
  description: string;
  bids: Bid[];
}

export interface Bid {
  id: string;
  bidder: string;
  amount: number;
  timestamp: Date;
}

const now = new Date();

export const auctionItems: AuctionItem[] = [
  {
    id: '1',
    title: 'Premium Wireless Headphones',
    category: 'Electronics',
    currentBid: 285000,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours
    description: 'High-fidelity wireless headphones with active noise cancellation and premium sound quality.',
    bids: [
      { id: 'b1', bidder: 'user_7821', amount: 285000, timestamp: new Date(now.getTime() - 5 * 60 * 1000) },
      { id: 'b2', bidder: 'bidder_pro', amount: 280000, timestamp: new Date(now.getTime() - 15 * 60 * 1000) },
      { id: 'b3', bidder: 'collector99', amount: 275000, timestamp: new Date(now.getTime() - 25 * 60 * 1000) },
      { id: 'b4', bidder: 'user_4521', amount: 270000, timestamp: new Date(now.getTime() - 35 * 60 * 1000) },
      { id: 'b5', bidder: 'tech_buyer', amount: 265000, timestamp: new Date(now.getTime() - 45 * 60 * 1000) },
    ],
  },
  {
    id: '2',
    title: 'Vintage Leather Jacket',
    category: 'Fashion',
    currentBid: 420000,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    endTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours
    description: 'Authentic vintage leather jacket in excellent condition. Rare find from the 1980s.',
    bids: [
      { id: 'b6', bidder: 'fashion_lover', amount: 420000, timestamp: new Date(now.getTime() - 10 * 60 * 1000) },
      { id: 'b7', bidder: 'vintage_hunter', amount: 410000, timestamp: new Date(now.getTime() - 20 * 60 * 1000) },
      { id: 'b8', bidder: 'style_icon', amount: 400000, timestamp: new Date(now.getTime() - 30 * 60 * 1000) },
    ],
  },
  {
    id: '3',
    title: 'Smart Watch Series X',
    category: 'Electronics',
    currentBid: 350000,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    endTime: new Date(now.getTime() + 1.5 * 60 * 60 * 1000), // 1.5 hours
    description: 'Latest generation smart watch with health tracking and fitness features.',
    bids: [
      { id: 'b9', bidder: 'tech_enthusiast', amount: 350000, timestamp: new Date(now.getTime() - 8 * 60 * 1000) },
      { id: 'b10', bidder: 'gadget_lover', amount: 340000, timestamp: new Date(now.getTime() - 18 * 60 * 1000) },
    ],
  },
  {
    id: '4',
    title: 'Limited Edition Sneakers',
    category: 'Fashion',
    currentBid: 580000,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    endTime: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 hours
    description: 'Limited edition sneakers from exclusive collaboration. Never worn, with original box.',
    bids: [
      { id: 'b11', bidder: 'sneaker_head', amount: 580000, timestamp: new Date(now.getTime() - 12 * 60 * 1000) },
      { id: 'b12', bidder: 'collector_king', amount: 570000, timestamp: new Date(now.getTime() - 22 * 60 * 1000) },
    ],
  },
  {
    id: '5',
    title: 'Rare Trading Card',
    category: 'Collectibles',
    currentBid: 1250000,
    imageUrl: 'https://images.unsplash.com/photo-1611419010196-a360678887e8?w=800&q=80',
    endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000), // 3 hours
    description: 'Extremely rare trading card in mint condition. Professionally graded and authenticated.',
    bids: [
      { id: 'b13', bidder: 'card_master', amount: 1250000, timestamp: new Date(now.getTime() - 6 * 60 * 1000) },
      { id: 'b14', bidder: 'rare_finds', amount: 1200000, timestamp: new Date(now.getTime() - 16 * 60 * 1000) },
    ],
  },
  {
    id: '6',
    title: '4K Professional Camera',
    category: 'Electronics',
    currentBid: 890000,
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    endTime: new Date(now.getTime() + 5 * 60 * 60 * 1000), // 5 hours
    description: 'Professional-grade 4K camera with multiple lenses and accessories included.',
    bids: [
      { id: 'b15', bidder: 'photo_pro', amount: 890000, timestamp: new Date(now.getTime() - 7 * 60 * 1000) },
      { id: 'b16', bidder: 'filmmaker_99', amount: 870000, timestamp: new Date(now.getTime() - 17 * 60 * 1000) },
    ],
  },
  {
    id: '7',
    title: 'Designer Handbag',
    category: 'Fashion',
    currentBid: 1450000,
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    endTime: new Date(now.getTime() + 7 * 60 * 60 * 1000), // 7 hours
    description: 'Authentic designer handbag from latest collection. Comes with certificate of authenticity.',
    bids: [
      { id: 'b17', bidder: 'luxury_buyer', amount: 1450000, timestamp: new Date(now.getTime() - 9 * 60 * 1000) },
      { id: 'b18', bidder: 'fashion_elite', amount: 1400000, timestamp: new Date(now.getTime() - 19 * 60 * 1000) },
    ],
  },
  {
    id: '8',
    title: 'Vintage Vinyl Collection',
    category: 'Collectibles',
    currentBid: 320000,
    imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80',
    endTime: new Date(now.getTime() + 8 * 60 * 60 * 1000), // 8 hours
    description: 'Curated collection of rare vinyl records from the 1960s-1980s. Excellent condition.',
    bids: [
      { id: 'b19', bidder: 'music_collector', amount: 320000, timestamp: new Date(now.getTime() - 11 * 60 * 1000) },
      { id: 'b20', bidder: 'vinyl_lover', amount: 310000, timestamp: new Date(now.getTime() - 21 * 60 * 1000) },
    ],
  },
];
