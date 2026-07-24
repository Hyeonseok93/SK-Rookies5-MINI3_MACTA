import type { MyPageStatusFilter, MyPageTab } from './myPageTypes';

export type { MyPageStatusFilter, MyPageTab } from './myPageTypes';

export const STATUS_FILTERS: { value: MyPageStatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'LIVE', label: 'Live' },
  { value: 'FINISHED', label: 'Finished' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'PAID', label: 'Paid' },
  { value: 'SHIPPING', label: 'Shipping' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const BID_STATUS_FILTERS: { value: MyPageStatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'LIVE', label: 'Live' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
  { value: 'PAID', label: 'Paid' },
  { value: 'SHIPPING', label: 'Shipping' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'OUTBID', label: 'Outbid' },
];

export const TAB_TITLES: Record<MyPageTab, string> = {
  auctions: 'My Auctions',
  bids: 'Bidding History',
  likes: 'Watchlist',
};

export function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'LIVE':
      return 'bg-green-600/20 text-green-400';
    case 'OUTBID':
      return 'bg-amber-500/20 text-amber-300';
    case 'LOST':
      return 'bg-red-500/20 text-red-300';
    case 'WON':
      return 'bg-blue-600/20 text-blue-300';
    case 'SOLD':
      return 'bg-purple-600/20 text-purple-300';
    case 'FINISHED':
      return 'bg-blue-600/20 text-blue-300';
    case 'PAID':
      return 'bg-cyan-600/20 text-cyan-300';
    case 'SHIPPING':
      return 'bg-indigo-600/20 text-indigo-300';
    case 'COMPLETED':
      return 'bg-emerald-600/20 text-emerald-300';
    default:
      return 'bg-gray-700 text-gray-400';
  }
}

export interface StoredUser {
  id?: number | string;
  email?: string;
  nickname?: string;
  role?: string;
}

export function getStoredUser(): StoredUser | null {
  const storedUser = localStorage.getItem('macta_user');
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as StoredUser;
  } catch {
    return null;
  }
}
