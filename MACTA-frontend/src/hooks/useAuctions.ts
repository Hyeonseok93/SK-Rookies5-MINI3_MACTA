import { useQuery, useQueryClient } from '@tanstack/react-query';
import { auctionApi } from '../api/auction';
import type { AuctionListResponse, AuctionSummary, PageInfo } from '../api/types';

const getAuctionItems = (response: AuctionListResponse): AuctionSummary[] => {
  return response.data?.content || [];
};

export type AuctionFilters = {
  category?: string;
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number;
  size?: number;
};

export function auctionsQueryKey(filters: AuctionFilters) {
  return ['auctions', filters] as const;
}

export function useAuctions(filters: AuctionFilters) {
  const queryClient = useQueryClient();
  const queryKey = auctionsQueryKey(filters);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await auctionApi.getAuctions(filters);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch auctions');
      }
      return {
        auctions: getAuctionItems(response),
        pageInfo: (response.data?.pageInfo ?? null) as PageInfo | null,
      };
    },
  });

  const setAuctions = (
    updater: AuctionSummary[] | ((prev: AuctionSummary[]) => AuctionSummary[]),
  ) => {
    queryClient.setQueryData<{ auctions: AuctionSummary[]; pageInfo: PageInfo | null }>(
      queryKey,
      (prev) => {
        if (!prev) return prev;
        const next = typeof updater === 'function' ? updater(prev.auctions) : updater;
        return { ...prev, auctions: next };
      },
    );
  };

  return {
    auctions: query.data?.auctions ?? [],
    setAuctions,
    pageInfo: query.data?.pageInfo ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}
