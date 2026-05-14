export const normalizeProductDetailUrl = (targetUrl: string) => {
  const auctionDetailMatch = targetUrl.match(/^\/auctions\/([^/?#]+)(.*)?$/);
  if (auctionDetailMatch) {
    return `/product/${auctionDetailMatch[1]}${auctionDetailMatch[2] ?? ''}`;
  }

  const productsDetailMatch = targetUrl.match(/^\/products\/([^/?#]+)(.*)?$/);
  if (productsDetailMatch) {
    return `/product/${productsDetailMatch[1]}${productsDetailMatch[2] ?? ''}`;
  }

  return targetUrl;
};
