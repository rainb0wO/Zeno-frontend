import { Button, Divider } from 'antd';
import { WechatOutlined } from '@ant-design/icons';

interface Props {
  enabled: boolean;
  onLogin: () => void;
}

/** 只有后端报告微信登录已配置时才渲染。未配置时不占位、不发请求。 */
export default function WeChatLoginEntry({ enabled, onLogin }: Props) {
  if (!enabled) return null;
  return (
    <>
      <Divider plain>或</Divider>
      <Button block icon={<WechatOutlined />} onClick={onLogin}>
        微信登录
      </Button>
    </>
  );
}
