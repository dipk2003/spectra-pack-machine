export const shouldBypassNextImageOptimization = (src: string) => {
  const normalizedSrc = src.trim();

  if (!normalizedSrc) {
    return false;
  }

  if (normalizedSrc.startsWith('/uploads/')) {
    return true;
  }

  if (
    normalizedSrc.startsWith('http://') ||
    normalizedSrc.startsWith('https://')
  ) {
    try {
      const imageUrl = new URL(normalizedSrc);

      // The public CMS bucket is allow-listed in next.config.js, so these large
      // PNGs can use Next's sized WebP cache instead of loading at source size.
      return imageUrl.hostname !== 'brtzazvawofpdyzahhda.supabase.co';
    } catch {
      return true;
    }
  }

  return false;
};
