const RENDERABLE_IMAGE_URL_PROTOCOLS = ['http://', 'https://', 'blob:', 'data:'];

export const isRenderableImageUrl = (url?: string | null) => {
  if (!url) return false;
  return RENDERABLE_IMAGE_URL_PROTOCOLS.some(protocol => url.startsWith(protocol));
};

export const getRenderableImageUrl = (...urls: Array<string | null | undefined>) => {
  return urls.find(isRenderableImageUrl) || '';
};
