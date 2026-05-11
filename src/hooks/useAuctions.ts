import { useState, useEffect } from 'react';
import { auctionApi } from '../api/auction';
import type { AuctionSummary, PageInfo } from '../api/types';

export function useAuctions(params: {
  category?: string;
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}) {
  const [auctions, setAuctions] = useState<AuctionSummary[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctions = async () => {
    setIsLoading(true);
    try {
      const response = await auctionApi.getAuctions(params);
      if (response.success) {
        setAuctions(response.data);
        setPageInfo(response.page_info);
      } else {
        setError(response.message || 'Failed to fetch auctions');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [params.category, params.q, params.minPrice, params.maxPrice, params.sort]);

  return { auctions, setAuctions, pageInfo, isLoading, error, refetch: fetchAuctions };
}
