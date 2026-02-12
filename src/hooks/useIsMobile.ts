import { useEffect, useMemo, useState } from 'react';

export const useIsMobile = (maxWidth = 992) => {
  const query = useMemo(() => `(max-width: ${maxWidth}px)`, [maxWidth]);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    const byWidth = window.matchMedia(query).matches;
    // 只有在窄屏下才考虑 pointer: coarse，防止 PC 触摸屏误判
    if (!byWidth) return false;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    return coarse || byWidth;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mqWidth = window.matchMedia(query);
    const mqCoarse = window.matchMedia('(pointer: coarse)');

    const update = () => {
      const byWidth = mqWidth.matches;
      // 只有在窄屏下才判断是否为移动端
      setIsMobile(byWidth && (mqCoarse.matches || byWidth));
    };

    update();

    const add = (mq: MediaQueryList) => {
      if (mq.addEventListener) mq.addEventListener('change', update);
      else mq.addListener(update);
    };

    const remove = (mq: MediaQueryList) => {
      if (mq.removeEventListener) mq.removeEventListener('change', update);
      else mq.removeListener(update);
    };

    add(mqWidth);
    add(mqCoarse);

    return () => {
      remove(mqWidth);
      remove(mqCoarse);
    };
  }, [query]);

  return isMobile;
};

