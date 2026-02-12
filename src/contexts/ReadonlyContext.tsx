import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { message } from 'antd';

interface ReadonlyContextValue {
  isReadonly: boolean;
  showTip: () => void;
}

const ReadonlyContext = createContext<ReadonlyContextValue | null>(null);

export const ReadonlyProvider: React.FC<{
  isReadonly: boolean;
  children: React.ReactNode;
}> = ({ isReadonly, children }) => {
  const showTip = useCallback(() => {
    message.warning('该业务操作请在电脑端网页完成');
  }, []);

  const value = useMemo(() => ({ isReadonly, showTip }), [isReadonly, showTip]);

  return <ReadonlyContext.Provider value={value}>{children}</ReadonlyContext.Provider>;
};

export const useReadonly = () => {
  const ctx = useContext(ReadonlyContext);
  if (!ctx) {
    return {
      isReadonly: false,
      showTip: () => {
        message.warning('该业务操作请在电脑端网页完成');
      }
    } as ReadonlyContextValue;
  }
  return ctx;
};

