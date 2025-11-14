import { Button, Space } from 'antd';
import { SyncOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';

interface TopBarProps {
  onApiKeyClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onApiKeyClick }) => {
  const queryClient = useQueryClient();

  return (
    <Space>
      <Button
        type="text"
        icon={<SyncOutlined />}
        onClick={() => {
          queryClient.invalidateQueries({ queryKey: ['projects'] });
          queryClient.invalidateQueries({ queryKey: ['projectFiles'] });
        }}
      >
        刷新
      </Button>
      {onApiKeyClick && (
        <Button
          type="text"
          icon={<KeyOutlined />}
          onClick={onApiKeyClick}
        >
          API Key
        </Button>
      )}
      <Button
        type="text"
        icon={<SettingOutlined />}
        onClick={() => {
          // TODO: 打开设置
        }}
      >
        设置
      </Button>
    </Space>
  );
};

export default TopBar;

