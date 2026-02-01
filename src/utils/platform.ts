export const isMobileRuntime = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  if (mobileRegex.test(ua)) return true;

  if (typeof window !== 'undefined') {
    try {
      if (window.matchMedia('(pointer: coarse)').matches) return true;
      if (window.innerWidth && window.innerWidth <= 992) return true;
    } catch (e) {
      // ignore
    }
  }
  return false;
};

