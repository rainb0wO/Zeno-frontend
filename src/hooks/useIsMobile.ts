import { useEffect, useMemo, useState } from 'react';

export const useIsMobile = (maxWidth = 992) => {
  const query = useMemo(() => `(max-width: ${maxWidth}px)`, [maxWidth]);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const byWidth = window.matchMedia(query).matches;
    return coarse || byWidth;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mqWidth = window.matchMedia(query);
    const mqCoarse = window.matchMedia('(pointer: coarse)');

    const update = () => {
      setIsMobile(mqCoarse.matches || mqWidth.matches);
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

