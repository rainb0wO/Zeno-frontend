import React, { useCallback } from 'react';
import { Button, message } from 'antd';
import type { ButtonProps } from 'antd';
import { useReadonly } from '../contexts/ReadonlyContext';

export interface BizActionProps extends ButtonProps {
  allowInReadonly?: boolean;
  tip?: string;
}

const BizAction: React.FC<BizActionProps> = ({
  allowInReadonly = false,
  tip = '该业务操作请在电脑端网页完成',
  disabled,
  onClick,
  ...rest
}) => {
  const { isReadonly, showTip } = useReadonly();

  const blocked = isReadonly && !allowInReadonly;
  const finalDisabled = disabled || blocked;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (blocked) {
        if (tip) message.warning(tip);
        else showTip();
        return;
      }
      onClick?.(e as any);
    },
    [blocked, onClick, showTip, tip]
  );

  return <Button {...rest} disabled={finalDisabled} onClick={handleClick} />;
};

export default BizAction;

