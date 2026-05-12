import { useState, useEffect, useCallback } from 'react';
import { auctionApi } from '../api/auction';
import type { AuctionSummary, PageInfo } from '../api/types';

export function useAuctions({
  category,
  q,
  minPrice,
  maxPrice,
  sort,
  page,
  size
}: {
  category?: string;
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number;
  size?: number;
}) {
  const [auctions, setAuctions] = useState<AuctionSummary[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctions = useCallback(async () => {
    // Ensure the loading state update is asynchronous to avoid cascading renders warning
    await Promise.resolve();
    setIsLoading(true);
    
    try {
      const response = await auctionApi.getAuctions({
        category,
        q,
        minPrice,
        maxPrice,
        sort,
        page,
        size
      });
      
      if (response.success) {
        setAuctions(response.data.content);
        setPageInfo(response.page_info);
      } else {
        setError(response.message || 'Failed to fetch auctions');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [category, q, minPrice, maxPrice, sort, page, size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAuctions();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAuctions]);

  return { auctions, setAuctions, pageInfo, isLoading, error, refetch: fetchAuctions };
}
