export const shouldBypassNextImageOptimization = (src: string) => {
  const normalizedSrc = src.trim();

  if (!normalizedSrc) {
    return false;
  }

  return (
    normalizedSrc.startsWith('http://') ||
    normalizedSrc.startsWith('https://') ||
    normalizedSrc.startsWith('/uploads/')
  );
};
