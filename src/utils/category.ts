const CATEGORY_CODE_MAP: Record<string, string> = {
  'Digital Devices': 'DIGITAL_DEVICES',
  'Home Appliances': 'HOME_APPLIANCES',
  'Furniture/Interior': 'FURNITURE_INTERIOR',
  Clothing: 'CLOTHING',
  'Beauty/Personal Care': 'BEAUTY_PERSONAL_CARE',
  'Sports/Leisure': 'SPORTS_LEISURE',
  'Games/Hobbies': 'GAMES_HOBBIES',
  'Books/Tickets': 'BOOKS_TICKETS',
  Other: 'OTHER',
};

export const toAuctionCategoryCode = (category: string) => {
  const trimmed = category.trim();
  const mapped = CATEGORY_CODE_MAP[trimmed];
  if (mapped) return mapped;

  return trimmed
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .toUpperCase();
};
